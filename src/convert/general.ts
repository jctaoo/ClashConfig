import { env } from "cloudflare:workers";

export function generalConfig(
  bareCore: boolean,
  logLevel: "debug" | "info" | "warning" | "error" | "silent"
) {
  // external controller
  let external = {}

  if (bareCore) {
    external = {
      "external-ui-url": "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip", // 从 GitHub Pages 分支获取
      "external-ui-name": "xd",
      "external-ui": "ui",
      "external-controller": "127.0.0.1:9090",
      "external-controller-cors": {
        "allow-origins": ["*"],
        "allow-private-network": true,
      },
    };
  }

  return {
    ...external,
    "allow-lan": true,
    "bind-address": "*",
    mode: "rule",
    "log-level": logLevel,
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