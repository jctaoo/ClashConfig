// prettier-ignore

import { env } from "cloudflare:workers";
import { ClashSubInformation } from "../sub";
import { dnsConfig, DNSPolicy, DNSPolicySchema } from "./dns";
import type { AnyJson } from "./type";
import { generalConfig } from "./general";
import { ClientCoreType, clientCoreType, ClientType, isBareCore } from "../client";
import { rules } from "./rules";

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

function proxyGroups(proxies: AnyJson[], usingSvgIcon: boolean) {
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

  if (!usingSvgIcon) {
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
    });
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
  clientType: ClientType;
  clientPlatform: string | null;
  dnsPolicy: DNSPolicy;
  disableQuic: boolean;
  logLevel: "debug" | "info" | "warning" | "error" | "silent";
  extra: {
    lookupGeoSite: (code: string) => string[];
  };
  filter?: ClashSubInformation["filter"];
}): AnyJson {
  const { config, profile, dnsPolicy, disableQuic, logLevel, clientPlatform, clientType, extra, filter } = options;

  const bareCore = isBareCore(clientType);

  // do filter
  if (filter) {
    const { label, ...rest } = filter;
    console.log("Do filter by label", filter.label, rest);
    filterNodes(config, filter);
  }

  // General Config
  mergeConfig(config, generalConfig(bareCore, logLevel));

  // Config DNS
  config.dns = dnsConfig(
    dnsPolicy.nameserver,
    {
      clientType,
      proxies: config["proxies"],
    },
    extra.lookupGeoSite,
  );

  // Config Proxy Groups and rules
  replaceConfig(config, rules({ dnsRules: dnsPolicy.rules, disableQuic }));
  replaceConfig(config, proxyGroups(config["proxies"], clientType !== ClientType.Stash)); // stash not support svg icon

  // remove hosts
  delete config["hosts"];

  // fix port settings
  delete config["port"];
  delete config["socks-port"];
  delete config["redir-port"];
  delete config["tproxy-port"];
  config["mixed-port"] = 7890;

  // add tun if needed

  // https://github.com/MetaCubeX/ClashX.Meta/issues/58
  const includeTun = clientType === ClientType.ClashXMeta || bareCore;

  if (includeTun) {
    // clashX is macOS
    if (clientType === ClientType.ClashXMeta) {
      config["tun"] = {
        enable: true,
        device: "utun6",
        stack: "gVisor",
        "dns-hijack": ["0.0.0.0:53"],
        "auto-route": true,
        "auto-detect-interface": true,
      };
    }

    if (bareCore && clientPlatform === "windows") {
      config["tun"] = {
        "auto-detect-interface": true,
        "auto-route": true,
        device: "Mihomo",
        "dns-hijack": ["any:53"],
        mtu: 1500,
        stack: "gvisor",
        "strict-route": true,
        enable: true,
      };
    }

    // TODO: more platform
  }

  return config;
}
