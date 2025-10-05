// prettier-ignore

import { env } from "cloudflare:workers";
import { ClashSubInformation } from "./sub";

type AnyJson = Record<string, any>;
type ConfigVariant = "stash" | "mihomo";

// 额外自定义规则
const customRules: string[] = [
  // extra china site
  "DOMAIN-SUFFIX,aihubmix.com,🇨🇳 国内网站",
];

// prettier-ignore
const REGIONS = [
    { id: "hk", name: "香港", regexes: [/\bHK\b/i, /香港/i, /hong\s*kong/i], emoji: "🇭🇰" },
    { id: "mo", name: "澳门", regexes: [/\bMO\b/i, /澳門|澳门/i, /macao|macau/i], emoji: "🇲🇴" },
    { id: "jp", name: "日本", regexes: [/\bJP\b/i, /日本|japan/i, /tokyo|osaka|nagoya/i], emoji: "🇯🇵" },
    { id: "tw", name: "台湾", regexes: [/\bTW\b/i, /台灣|台湾|taiwan/i, /taipei|taichung|kaohsiung/i], emoji: "🇹🇼" },
    { id: "sg", name: "新加坡", regexes: [/\bSG\b/i, /新加坡|singapore/i], emoji: "🇸🇬" },
    { id: "us", name: "美国", regexes: [/\bUS\b|\bUSA\b/i, /美国|united\s*states|america/i, /los\s*angeles|san\s*francisco|new\s*york|seattle|chicago|dallas|miami/i], emoji: "🇺🇸" },
    { id: "gb", name: "英国", regexes: [/\bUK\b/i, /英国|united\s*kingdom|london/i], emoji: "🇬🇧" },
    { id: "de", name: "德国", regexes: [/\bDE\b/i, /德国|germany|frankfurt|munich|berlin/i], emoji: "🇩🇪" },
    { id: "fr", name: "法国", regexes: [/\bFR\b/i, /法国|france|paris/i], emoji: "🇫🇷" },
    { id: "nl", name: "荷兰", regexes: [/\bNL\b/i, /荷兰|netherlands|amsterdam/i], emoji: "🇳🇱" },
    { id: "kr", name: "韩国", regexes: [/\bKR\b/i, /韩国|korea|seoul/i], emoji: "🇰🇷" },
    { id: "au", name: "澳大利亚", regexes: [/\bAU\b/i, /澳大利亚|australia|sydney|melbourne/i], emoji: "🇦🇺" },
    { id: "ca", name: "加拿大", regexes: [/\bCA\b/i, /加拿大|canada|toronto|vancouver|montreal/i], emoji: "🇨🇦" },

    // { id: "my", name: "马来西亚", regexes: [/\bMY\b/i, /马来西亚|malaysia/i], emoji: "🇲🇾" },
    // { id: "th", name: "泰国", regexes: [/\bTH\b/i, /泰国|thailand/i], emoji: "🇹🇭" },

    // 可继续加入更多国家...
  ];
const UNKNOWN_REGION = {
  name: "未知",
  id: "unknown",
  emoji: "🏳️",
};

function normalizeName(name: string): string {
  if (!name || typeof name !== "string") return "";
  // 删除 emoji（简单方式：剔除高位 unicode，这里做基本处理）
  // NOTE: 这不是 100% 完整的 emoji 移除，但对常见 emoji 有效
  const noEmoji = name.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
  // 把特殊竖线/分隔符/中文标点换成空格，合并多空格，trim，转小写
  return noEmoji
    .replace(/[/｜丨\|·••—–_，,。:：\-]+/g, " ")
    .replace(/[^\w\s\u4e00-\u9fa5\-]/g, " ") // 保留中文字符、字母数字、下划线、短横
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function generalConfig() {
  return {
    "allow-lan": true,
    "bind-address": "*",
    mode: "rule",
    profile: {
      "store-selected": true,
      "store-fake-ip": true,
    },
    // 开启统一延迟时，会计算 RTT，以消除连接握手等带来的不同类型节点的延迟差异
    "unified-delay": true,
    // 启用 TCP 并发连接，将会使用 dns 解析出的所有 IP 地址进行连接，使用第一个成功的连接
    "tcp-concurrent": true,
    // geo
    "geodata-loader": "standard",
    "geo-auto-update": true,
    "geo-update-interval": 24, // 更新间隔，单位为小时
    "geox-url": {
      geoip: env.geoip,
      geosite: env.geosite,
      mmdb: env.mmdb,
      asn: env.asn,
    },
    "geodata-mode": true, // meta
  };
}

/**
 * @param {boolean} conservative 使用保守配置，默认不使用, 保守配置适用于 stash
 * @param {string[]} extraFakeIpFilters 额外的 fake-ip-filter 条目
 */
function dnsConfig(conservative = false, extraFakeIpFilters: string[] = []) {
  // 默认 DNS, 用于解析 DNS 服务器 的域名
  const defaultDNS = ["tls://223.5.5.5"];

  const chinaDNS = ["223.5.5.5", "119.29.29.29"];
  const chinaDoH = [
    "https://223.5.5.5/dns-query", // 阿里DoH
    "https://doh.pub/dns-query", // 腾讯DoH，因腾讯云即将关闭免费版IP访问，故用域名
  ];

  const foreignDNS = [
    "https://cloudflare-dns.com/dns-query", // CloudflareDNS
    "https://77.88.8.8/dns-query", //YandexDNS
    "https://8.8.4.4/dns-query#ecs=1.1.1.1/24&ecs-override=true", // GoogleDNS
    "https://208.67.222.222/dns-query#ecs=1.1.1.1/24&ecs-override=true", // OpenDNS
    "https://9.9.9.9/dns-query", //Quad9DNS
  ];

  /**
   * DNS相关配置
   */
  return {
    enable: true,
    listen: ":1053",
    ipv6: true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": [
      "*",
      "+.lan",
      "+.local",
      // clash premium 不支持 geosite 配置
      ...(conservative ? [] : ["geosite:connectivity-check", "geosite:private"]),
      // 额外: 微信快速登录检测失败 (private, 与 connectivity check 不包含)
      "localhost.work.weixin.qq.com",

      // 额外
      ...extraFakeIpFilters,
    ],
    "default-nameserver": [...defaultDNS],
    nameserver: conservative ? chinaDoH : foreignDNS,
    ...(conservative
      ? {}
      : // prettier-ignore
        {
          "prefer-h3": true,
          "use-hosts": true,
          "use-system-hosts": true,
          // 代理节点域名解析服务器，仅用于解析代理节点的域名
          "proxy-server-nameserver": chinaDoH,
          "respect-rules": true,
          // 用于 direct 出口域名解析的 DNS 服务器
          "direct-nameserver": chinaDNS,
          "direct-nameserver-follow-policy": false,
          /**
           * 这里对域名解析进行分流
           * 由于默认dns是国外的了，只需要把国内ip和域名分流到国内dns
           * 优先于 nameserver/fallback 查询
           */
          "nameserver-policy": {
            "geosite:private": "system",
            "geosite:cn,steam@cn,category-games@cn,microsoft@cn,apple@cn": chinaDNS,
          },
        }),
  };
}

function mergeConfig(config: AnyJson, patch: AnyJson) {
  for (const key in patch) {
    if (config[key] && typeof config[key] === "object") {
      mergeConfig(config[key], patch[key]);
    } else {
      config[key] = patch[key];
    }
  }
}

function replaceConfig(config: AnyJson, patch: AnyJson) {
  for (const key in patch) {
    config[key] = patch[key];
  }
}

function proxyGroups(proxies: AnyJson[], conservative = false) {
  // 代理组通用配置
  const groupBaseOption = {
    interval: 0,
    timeout: 3000,
    url: "https://www.google.com/generate_204",
    lazy: true,
    "max-failed-times": 3,
    hidden: false,
  };

  function generateRuleBasedGroup(name: string, options: AnyJson) {
    return {
      ...groupBaseOption,
      name: name,
      type: "select",
      proxies: ["🔰 模式选择", "⚙️ 节点选择", "🔗 全局直连", ...modeNames],
      ...options,
    };
  }

  const regionsToProxies: Record<string, AnyJson[]> = {};
  const addProxyToRegion = (regionId: string, proxy: AnyJson) => {
    if (!regionsToProxies[regionId]) {
      regionsToProxies[regionId] = [];
    }
    regionsToProxies[regionId].push(proxy);
  };

  // handle original proxy groups
  for (const proxy of proxies) {
    const normalizedName = normalizeName(proxy.name);
    let matched = false;

    for (const region of REGIONS) {
      if (region.regexes.some((regex) => regex.test(normalizedName))) {
        addProxyToRegion(region.id, proxy);

        matched = true;
        break;
      }
    }

    if (!matched) {
      addProxyToRegion(UNKNOWN_REGION.id, proxy);
    }
  }

  const regionBasedGroups = Object.entries(regionsToProxies).map(([regionId, proxies]) => {
    const region = REGIONS.find((r) => r.id === regionId) ?? UNKNOWN_REGION;
    const icon =
      regionId === "unknown"
        ? "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/unknown.svg"
        : `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/1x1/${region.id}.svg`;

    return {
      ...groupBaseOption,
      name: `${region.emoji} ${region.name}节点`,
      type: "select",
      proxies: proxies.map((proxy) => proxy.name),
      icon: icon,
    };
  });

  // 排序 regionBasedGroups，按 alphabetically 排序，未知节点排在最后
  regionBasedGroups.sort((a, b) => {
    if (a.name === "未知节点") {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

  // 通用地区节点组
  const regionGroupNames = regionBasedGroups.map((group) => group.name);

  // declare modes
  const modes = [
    {
      ...groupBaseOption,
      name: "♻️ 延迟选优",
      type: "url-test",
      tolerance: 50,
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg",
    },
    {
      ...groupBaseOption,
      name: "🚑 故障转移",
      type: "fallback",
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg",
    },
    {
      ...groupBaseOption,
      name: "⚖️ 负载均衡(散列)",
      type: "load-balance",
      strategy: "consistent-hashing",
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg",
    },
    {
      ...groupBaseOption,
      name: "☁️ 负载均衡(轮询)",
      type: "load-balance",
      strategy: "round-robin",
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg",
    },
  ];
  const modeNames = modes.map((mode) => mode.name);

  const proxyGroupsConfig = [
    {
      ...groupBaseOption,
      name: "🔰 模式选择",
      type: "select",
      proxies: ["⚙️ 节点选择", ...modeNames, "🔗 全局直连"],
    },
    {
      ...groupBaseOption,
      name: "⚙️ 节点选择",
      type: "select",
      proxies: [...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },

    generateRuleBasedGroup("🌍 国外媒体", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg",
    }),

    generateRuleBasedGroup("💸 AI Services", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg",
    }),

    generateRuleBasedGroup("💸 Google AI Services", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg",
    }),

    generateRuleBasedGroup("🪙 Bybit", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg",
    }),

    generateRuleBasedGroup("🅿️ PikPak", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg",
    }),

    generateRuleBasedGroup("📲 电报消息", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg",
    }),

    generateRuleBasedGroup("📢 谷歌服务", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg",
    }),

    generateRuleBasedGroup("🍎 苹果服务", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg",
    }),

    generateRuleBasedGroup("Ⓜ️ 微软服务", {
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连", ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg",
    }),
    {
      ...groupBaseOption,
      name: "🇨🇳 国内网站",
      type: "select",
      proxies: ["🔗 全局直连", "🔰 模式选择", "⚙️ 节点选择", ...modeNames, ...regionGroupNames],
      icon: "https://fastly.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/1x1/cn.svg",
    },

    ...regionBasedGroups,
    ...modes,

    {
      ...groupBaseOption,
      name: "🔗 全局直连",
      type: "select",
      proxies: ["DIRECT"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg",
    },
    {
      ...groupBaseOption,
      name: "❌ 全局拦截",
      type: "select",
      proxies: ["REJECT", "DIRECT"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg",
    },
    {
      ...groupBaseOption,
      name: "🐟 漏网之鱼",
      type: "select",
      proxies: ["🔰 模式选择", "⚙️ 节点选择", ...modeNames, "🔗 全局直连"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg",
    },
  ];

  if (conservative) {
    // 保守模式不要设置 svg icon
    for (const group of proxyGroupsConfig) {
      if ("icon" in group && group.icon.endsWith(".svg")) {
        // @ts-expect-error
        delete group.icon;
      }
    }
  }

  return {
    "proxy-groups": proxyGroupsConfig,
  };
}

function rules() {
  // 规则集通用配置
  const ruleProviderCommon = {
    type: "http",
    format: "yaml",
    interval: 86400, // 更新间隔，单位为秒 86400秒 = 24小时
  };
  // 规则集配置
  const ruleProviders = {
    reject: {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
      path: "./ruleset/loyalsoldier/reject.yaml",
    },
    icloud: {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
      path: "./ruleset/loyalsoldier/icloud.yaml",
    },
    apple: {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
      path: "./ruleset/loyalsoldier/apple.yaml",
    },
    google: {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
      path: "./ruleset/loyalsoldier/google.yaml",
    },
    proxy: {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
      path: "./ruleset/loyalsoldier/proxy.yaml",
    },
    direct: {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
      path: "./ruleset/loyalsoldier/direct.yaml",
    },
    gfw: {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
      path: "./ruleset/loyalsoldier/gfw.yaml",
    },
    "tld-not-cn": {
      ...ruleProviderCommon,
      behavior: "domain",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
      path: "./ruleset/loyalsoldier/tld-not-cn.yaml",
    },
    telegramcidr: {
      ...ruleProviderCommon,
      behavior: "ipcidr",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
      path: "./ruleset/loyalsoldier/telegramcidr.yaml",
    },
    cncidr: {
      ...ruleProviderCommon,
      behavior: "ipcidr",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
      path: "./ruleset/loyalsoldier/cncidr.yaml",
    },
    lancidr: {
      ...ruleProviderCommon,
      behavior: "ipcidr",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
      path: "./ruleset/loyalsoldier/lancidr.yaml",
    },
    applications: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
      path: "./ruleset/loyalsoldier/applications.yaml",
    },
    openai: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/openai.yaml",
      path: "./ruleset/MetaCubeX/openai.yaml",
    },
    bybit: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/bybit.yaml",
      path: "./ruleset/MetaCubeX/bybit.yaml",
    },
    pikpak: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/pikpak.yaml",
      path: "./ruleset/MetaCubeX/pikpak.yaml",
    },
    anthropic: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/anthropic.yaml",
      path: "./ruleset/MetaCubeX/anthropic.yaml",
    },
    "google-gemini": {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/google-gemini.yaml",
      path: "./ruleset/MetaCubeX/google-gemini.yaml",
    },
    xai: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/xai.yaml",
      path: "./ruleset/MetaCubeX/xai.yaml",
    },
    perplexity: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/perplexity.yaml",
      path: "./ruleset/MetaCubeX/perplexity.yaml",
    },
    microsoft: {
      ...ruleProviderCommon,
      behavior: "classical",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/microsoft.yaml",
      path: "./ruleset/MetaCubeX/microsoft.yaml",
    },
  };
  // 规则
  const rules = [
    // 额外自定义规则
    ...customRules,

    // MetaCubeX 规则集
    "RULE-SET,openai,💸 AI Services",
    "RULE-SET,pikpak,🅿️ PikPak",
    "RULE-SET,bybit,🪙 Bybit",
    "RULE-SET,anthropic,💸 AI Services",
    "RULE-SET,google-gemini,💸 Google AI Services",
    "RULE-SET,xai,💸 AI Services",
    "RULE-SET,perplexity,💸 AI Services",
    // Geo Site 规则集
    "GEOSITE,microsoft@cn,🇨🇳 国内网站",
    "GEOSITE,apple@cn,🇨🇳 国内网站",
    "GEOSITE,category-games@cn,🇨🇳 国内网站",
    // Loyalsoldier 规则集
    "RULE-SET,applications,🔗 全局直连",
    // "RULE-SET,reject,🥰 广告过滤",
    "RULE-SET,microsoft,Ⓜ️ 微软服务",
    "RULE-SET,icloud,🍎 苹果服务",
    "RULE-SET,apple,🍎 苹果服务",
    "RULE-SET,google,📢 谷歌服务",
    "RULE-SET,proxy,🔰 模式选择",
    "RULE-SET,gfw,🔰 模式选择",
    // 非中国大陆使用的顶级域名，比如 .ai
    // "RULE-SET,tld-not-cn,🔰 模式选择",
    // other
    "RULE-SET,direct,🇨🇳 国内网站",
    "GEOSITE,private,🔗 全局直连",
    "RULE-SET,lancidr,🔗 全局直连,no-resolve",
    "RULE-SET,cncidr,🇨🇳 国内网站,no-resolve",
    "RULE-SET,telegramcidr,📲 电报消息,no-resolve",
    // 其他规则
    "GEOIP,private,🔗 全局直连,no-resolve",
    "GEOIP,LAN,🔗 全局直连,no-resolve",
    "GEOIP,CN,🇨🇳 国内网站,no-resolve",
    "MATCH,🐟 漏网之鱼",
  ];

  return {
    rules: rules,
    "rule-providers": ruleProviders,
  };
}

function filterNodes(cfg: AnyJson, filter: ClashSubInformation["filter"]) {
  const { regions = [], maxBillingRate, excludeRegex } = filter;

  const lowerCasedRegions = regions.map((region) => region.toLowerCase());

  // filter by regions
  if (regions.length > 0) {
    cfg.proxies = cfg.proxies.filter((proxy: AnyJson) => {
      const normalizedName = normalizeName(proxy.name);
      const region = REGIONS.find((region) => {
        return region.regexes.some((regex) => regex.test(normalizedName));
      });

      return region && lowerCasedRegions.includes(region.id.toLowerCase());
    });
  }

  // filter by maxBillingRate
  if (maxBillingRate) {
    // E.G. 🇭🇰 香港游戏丨2x HK --> 计费倍率为 2
    cfg.proxies = cfg.proxies.filter((proxy: AnyJson) => {
      const normalizedName = normalizeName(proxy.name);

      // const [m1, m2] = [
      //   /(?<=[xX✕✖⨉倍率])([1-9]+(\.\d+)*|0{1}\.\d+)(?=[xX✕✖⨉倍率])*/i,
      //   /(?<=[xX✕✖⨉倍率]?)([1-9]+(\.\d+)*|0{1}\.\d+)(?=[xX✕✖⨉倍率])/i,
      // ]
      const m1 = /(?:(?<=[xX✕✖⨉倍率])([1-9]\d*(?:\.\d+)?|0\.\d+)|([1-9]\d*(?:\.\d+)?|0\.\d+)(?=[xX✕✖⨉倍率]))/i;
      const match = m1.exec(normalizedName);

      const multiplier = match?.[1] ?? match?.[2] ?? "0";
      return parseFloat(multiplier) <= maxBillingRate;
    })
  }

  // filter by excludeRegex
  if (excludeRegex) {
    cfg.proxies = cfg.proxies.filter((proxy: AnyJson) => {
      const normalizedName = normalizeName(proxy.name);
      const regex = new RegExp(excludeRegex);
      return !regex.test(normalizedName);
    });
  }
}

export function convertClashConfig(options: {
  config: AnyJson;
  profile: string;
  variant: ConfigVariant;
  extra: {
    fakeIpFilters?: string[];
  };
  filter?: ClashSubInformation["filter"];
}): AnyJson {
  const { config, profile, variant = "mihomo", extra, filter } = options;

  const conservative = variant === "stash";

  // do filter
  if (filter) {
    const { label, ...rest } = filter;
    console.log("Do filter by label", filter.label, rest);
    filterNodes(config, filter);
  }

  // General Config
  mergeConfig(config, generalConfig());

  // Config DNS
  config.dns = dnsConfig(conservative, extra.fakeIpFilters ?? []);

  // Config Proxy Groups and rules
  replaceConfig(config, rules());
  replaceConfig(config, proxyGroups(config["proxies"], conservative));

  // remove hosts
  delete config["hosts"];

  // fix port settings
  delete config["port"];
  delete config["socks-port"];
  delete config["redir-port"];
  delete config["tproxy-port"];
  config["mixed-port"] = 7890;

  return config;
}
