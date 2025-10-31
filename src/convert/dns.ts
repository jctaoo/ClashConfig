import { ClientCoreType, clientCoreType, ClientType } from "../client";
import type { AnyJson } from "./type";
import { z } from "zod";

export const DNSPolicySchema = z.object({
  nameserver: z.enum(["direct", "strict"]).default("strict").describe("DNS nameserver 组"),
  rules: z.enum(["always-resolve", "remote"]).default("remote").describe("未命中规则流量 DNS 解析策略"),
});

export type DNSPolicy = z.infer<typeof DNSPolicySchema>;

const extraFakeIpFilters = [
  // stun
  "+.stun.*.*",
  "+.stun.*.*.*",
  "+.stun.*.*.*.*",
  "+.stun.*.*.*.*.*",
  // ntp
  "time.*.com",
  "time.*.gov",
  "time.*.edu.cn",
  "time.*.apple.com",
  "time-ios.apple.com",
  "time1.*.com",
  "time2.*.com",
  "time3.*.com",
  "time4.*.com",
  "time5.*.com",
  "time6.*.com",
  "time7.*.com",
  "ntp.*.com",
  "ntp1.*.com",
  "ntp2.*.com",
  "ntp3.*.com",
  "ntp4.*.com",
  "ntp5.*.com",
  "ntp6.*.com",
  "ntp7.*.com",
  "*.time.edu.cn",
  "*.ntp.org.cn",
  "+.pool.ntp.org",
  "time1.cloud.tencent.com",
  // QQ 系列游戏相关
  "pingfore.qq.com",
  "localhost.weixin.qq.com",
  // 微信快速登录检测失败 (private, 与 connectivity check 不包含)
  "localhost.work.weixin.qq.com",
];

interface DnsNameserver {
  /** 默认 DNS, 用于解析 DNS 服务器 的域名, 必须为 ip */
  defaultDNS: string[];
  /** 可以直连的 DoH */
  directDoH: string[];
  /** 国外 DoH */
  foreignDoH: string[];
}

function dnsNameserver(): DnsNameserver {
  // 默认 DNS, 用于解析 DNS 服务器 的域名
  const defaultDNS = ["tls://223.5.5.5"];

  // 直连 dns on http
  const directDoH = [
    "https://223.5.5.5/dns-query", // 阿里DoH
    "https://doh.pub/dns-query", // 腾讯DoH，因腾讯云即将关闭免费版IP访问，故用域名
  ];

  // TODO: dns 直接添加到规则
  const foreignDoH = [
    "https://cloudflare-dns.com/dns-query", // CloudflareDNS
    "https://77.88.8.8/dns-query", //YandexDNS
    "https://8.8.4.4/dns-query#ecs=1.1.1.1/24&ecs-override=true", // GoogleDNS
    "https://208.67.222.222/dns-query#ecs=1.1.1.1/24&ecs-override=true", // OpenDNS
    "https://9.9.9.9/dns-query", //Quad9DNS
  ];

  return { defaultDNS, directDoH, foreignDoH };
}

function dnsConfigForMihomo(
  policy: DNSPolicy["nameserver"],
  options: { proxies: AnyJson[] },
  lookupGeoSite: (name: string) => string[],
) {
  const { defaultDNS, directDoH, foreignDoH } = dnsNameserver();

  return {
    enable: true,
    listen: ":1053",
    ipv6: true,
    "prefer-h3": false,
    "use-hosts": true,
    "use-system-hosts": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": ["*", "+.lan", "+.local", "geosite:connectivity-check", "geosite:private", ...extraFakeIpFilters],
    "default-nameserver": defaultDNS,
    nameserver: policy === "direct" ? directDoH : foreignDoH,
    // 代理节点域名解析服务器，仅用于解析代理节点的域名
    "proxy-server-nameserver": directDoH,
    "respect-rules": true,
    // 用于 direct 出口域名解析的 DNS 服务器, 不会 respect rules
    ...(policy === "strict"
      ? {
          "direct-nameserver": directDoH,
          "direct-nameserver-follow-policy": false,
        }
      : {}),
    /**
     * 这里对域名解析进行分流
     * 由于默认dns是国外的了，只需要把国内ip和域名分流到国内dns
     * 优先于 nameserver/fallback 查询，会 respect rules
     */
    "nameserver-policy": {
      "geosite:private": "system",
      ...(policy === "strict"
        ? {
            "geosite:cn,steam@cn,category-games@cn,microsoft@cn,apple@cn": directDoH,
          }
        : {}),
    },
  };
}

function dnsConfigForClashPremium(
  policy: DNSPolicy["nameserver"],
  options: { proxies: AnyJson[] },
  lookupGeoSite: (name: string) => string[],
) {
  // clash premium not support strict nameserver policy
  if (policy === "strict") {
    console.warn("[Warning] Clash Premium not support strict nameserver policy, use direct instead.");
  }

  const { defaultDNS, directDoH, foreignDoH } = dnsNameserver();
  const { proxies } = options;

  const domainNameserverPolicy: Record<string, string> = {};

  // extra geosite filters, cause clash premium not support using geosite in fake-ip-filter
  const privateDomains = lookupGeoSite("private");
  const connectivityCheckDomains = lookupGeoSite("connectivity-check");
  const fakeIpFilters = [...privateDomains, ...connectivityCheckDomains];

  // simulate geosite:private in nameserver-policy here.
  // clash premium not support using geosite in nameserver-policy
  // TODO: in future version, support simulate direct-nameserver with domain here.
  for (const domain of privateDomains) {
    domainNameserverPolicy[domain] = "system";
  }

  // simulate proxy-server-nameserver with domain here in nameserver-policy.
  const proxyDnsNameserver = directDoH[0];
  for (const proxy of proxies) {
    const server = proxy.server;
    if (!server || typeof server !== "string") continue;

    // 简单判断是否为域名
    if (!/^[\d.]+$/.test(server)) {
      domainNameserverPolicy[server] = proxyDnsNameserver;
    }
  }

  return {
    enable: true,
    listen: ":1053",
    ipv6: true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": ["*", "+.lan", "+.local", ...fakeIpFilters, ...extraFakeIpFilters],
    "default-nameserver": defaultDNS,
    nameserver: directDoH,
    "nameserver-policy": domainNameserverPolicy,
    // 类似 respect-rules,
    "follow-rule": true,
  };
}

export function dnsConfig(
  policy: DNSPolicy["nameserver"],
  options: {
    clientType: ClientType;
    proxies: AnyJson[];
  },
  lookupGeoSite: (name: string) => string[],
) {
  const { clientType, proxies } = options;
  const coreType = clientCoreType(clientType);

  switch (coreType) {
    case ClientCoreType.Mihomo:
      return dnsConfigForMihomo(policy, { proxies }, lookupGeoSite);
    case ClientCoreType.ClashPremium:
      return dnsConfigForClashPremium(policy, { proxies }, lookupGeoSite);
  }
}

if (import.meta.main) {
  const { extractGeoDomains } = await import("../geo/geoHelper");

  const domains = await extractGeoDomains(
    "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    ["connectivity-check", "private"],
  );
  function lookupGeoSite(code: string): string[] {
    return domains[code] ?? [];
  }

  const config = dnsConfig("strict", { clientType: ClientType.Stash, proxies: [] }, lookupGeoSite);
  console.log(JSON.stringify(config, null, 2));
}
