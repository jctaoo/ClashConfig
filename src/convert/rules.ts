import { DNSPolicy } from "./dns";

// 额外自定义规则
const customRules: string[] = [
  // extra china site
];

export function rules({ dnsRules, disableQuic }: { dnsRules: DNSPolicy["rules"]; disableQuic: boolean }) {
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
    ...(disableQuic
      ? [
          "AND,((DST-PORT,443),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
          "AND,((DST-PORT,443),(NETWORK,UDP),(NOT,((GEOIP,cn)))),REJECT",
        ]
      : []),

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
    dnsRules === "always-resolve" ? "GEOIP,CN,🇨🇳 国内网站" : "GEOIP,CN,🇨🇳 国内网站,no-resolve",
    "MATCH,🐟 漏网之鱼",
  ];

  return {
    rules: rules,
    "rule-providers": ruleProviders,
  };
}
