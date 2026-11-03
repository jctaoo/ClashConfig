import assert from "node:assert/strict";
import { afterEach, beforeEach, test, vi } from "vitest";
import { ClientType } from "../src/client";
import { convertClashConfig } from "../src/convert/convert";
import { LandingProxyConfigError, parseLandingProxies, type LandingProxy } from "../src/landingProxies";
import worker from "../src/index";
import { parseYAML } from "../src/utils";
import { env, type KvEntry } from "./fixtures/cloudflare-workers";
import { extractGeoDomains } from "../src/geo/geoHelper";

vi.mock("../src/geo/geoHelper", () => ({ extractGeoDomains: vi.fn() }));

type ConversionOptions = Parameters<typeof convertClashConfig>[0];

function landing(overrides: Partial<LandingProxy> = {}): LandingProxy {
  return {
    name: "🇸🇬 新加坡落地",
    viaRegion: "hk",
    proxy: {
      type: "socks5",
      server: "landing.example.invalid",
      port: 443,
      username: "test-user",
      password: "test-secret",
    },
    ...overrides,
  };
}

function airportConfig() {
  return {
    proxies: [
      { name: "HK Low x1", type: "ss", server: "192.0.2.1", port: 443, cipher: "aes-256-gcm", password: "airport" },
      { name: "HK High x3", type: "ss", server: "192.0.2.2", port: 443, cipher: "aes-256-gcm", password: "airport" },
      { name: "JP Low x1", type: "ss", server: "192.0.2.3", port: 443, cipher: "aes-256-gcm", password: "airport" },
    ],
  };
}

function convert(landingProxies?: LandingProxy[], overrides: Partial<ConversionOptions> = {}) {
  return convertClashConfig({
    config: airportConfig(),
    profile: "Test",
    clientType: ClientType.ClashVerge,
    clientPlatform: "windows",
    dnsPolicy: { nameserver: "strict", rules: "remote" },
    disableQuic: true,
    logLevel: "warning",
    extra: { lookupGeoSite: () => [] },
    landingProxies,
    ...overrides,
  });
}

const businessGroups = [
  "🌍 国外媒体",
  "💸 AI Services",
  "💸 Google AI Services",
  "🪙 Bybit",
  "🅿️ PikPak",
  "📲 电报消息",
  "📢 谷歌服务",
  "🍎 苹果服务",
  "Ⓜ️ 微软服务",
];

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Tests must not fetch external resources"));
  vi.mocked(extractGeoDomains).mockReset().mockRejectedValue(new Error("Tests must provide geosite domain fixtures"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("omitted and empty landing configurations preserve the original groups and automatic modes", () => {
  const original = convert();
  assert.deepEqual(convert([]), original);
  assert.deepEqual(original.proxies, airportConfig().proxies);
  const modes = original["proxy-groups"].filter((group: { type: string }) => group.type !== "select");
  assert.equal(modes.length, 4);
  assert.ok(modes.every((group: Record<string, unknown>) => group["include-all"] === true));
  assert.doesNotThrow(() => convert([], { clientType: ClientType.Stash }));
});

test("landing schema normalizes region IDs and rejects invalid or unsupported fields without exposing credentials", () => {
  assert.deepEqual(parseLandingProxies(undefined), []);
  assert.equal(parseLandingProxies([landing({ viaRegion: " HK " })])[0].viaRegion, "hk");

  const invalidValues = [
    null,
    {},
    [landing({ name: " " })],
    [landing({ viaRegion: "missing-region" })],
    [landing(), landing()],
    [{ ...landing(), proxy: { ...landing().proxy, type: "http" } }],
    [{ ...landing(), proxy: { ...landing().proxy, port: 0 } }],
    [{ ...landing(), proxy: { ...landing().proxy, port: 65536 } }],
    [{ ...landing(), proxy: { ...landing().proxy, port: 443.5 } }],
    [{ ...landing(), proxy: { ...landing().proxy, server: " " } }],
    [{ ...landing(), proxy: { ...landing().proxy, "dialer-proxy": "DIRECT" } }],
  ];

  for (const value of invalidValues) {
    assert.throws(
      () => parseLandingProxies(value),
      (error) => {
        assert.ok(error instanceof LandingProxyConfigError);
        assert.ok(!error.message.includes("test-secret"));
        return true;
      },
    );
  }
});

test.each([ClientType.ClashVerge, ClientType.Stash])(
  "multiple landings use regional dialers and all nine business groups for client %i",
  (clientType) => {
    const landings = [landing(), landing({ name: "日本落地", viaRegion: "jp" })];
    const baseline = convert(undefined, { clientType });
    const config = convert(landings, { clientType });

    for (const [index, expectedDialer] of ["🇭🇰 香港节点", "🇯🇵 日本节点"].entries()) {
      const item = landings[index];
      const nodeName = `${item.name}节点`;
      const node = config.proxies.find((proxy: { name: string }) => proxy.name === nodeName);
      assert.deepEqual(node, { ...item.proxy, name: nodeName, udp: false, "dialer-proxy": expectedDialer });
      const group = config["proxy-groups"].find((group: { name: string }) => group.name === item.name);
      assert.deepEqual(group.proxies, [nodeName]);
    }

    for (const name of businessGroups) {
      const group = config["proxy-groups"].find((group: { name: string }) => group.name === name);
      const original = baseline["proxy-groups"].find((group: { name: string }) => group.name === name);
      assert.deepEqual(group.proxies, [...original.proxies, ...landings.map((item) => item.name)]);
    }

    for (const name of ["⚙️ 节点选择", "🇸🇬 新加坡节点", "🇭🇰 香港节点", "🇨🇳 国内网站", "🐟 漏网之鱼"]) {
      const original = baseline["proxy-groups"].find((group: { name: string }) => group.name === name);
      const group = config["proxy-groups"].find((group: { name: string }) => group.name === name);
      assert.deepEqual(group, original);
    }
  },
);

test.each([ClientType.ClashVerge, ClientType.Stash])(
  "automatic modes include landings and regional dialers contain filtered airport nodes for client %i",
  (clientType) => {
    const config = convert([landing()], {
      clientType,
      filter: { label: "HK only", regions: ["HK"], maxBillingRate: 1, excludeRegex: "high" },
    });
    assert.deepEqual(
      config.proxies.map((proxy: { name: string }) => proxy.name),
      ["HK Low x1", "🇸🇬 新加坡落地节点"],
    );

    const modes = config["proxy-groups"].filter((group: { type: string }) => group.type !== "select");
    assert.equal(modes.length, 4);
    for (const group of modes) {
      assert.equal(group["include-all"], true);
      assert.equal(group.proxies, undefined);
    }

    const dialer = config["proxy-groups"].find((group: { name: string }) => group.name === "🇭🇰 香港节点");
    assert.deepEqual(dialer.proxies, ["HK Low x1"]);
    assert.equal(config.proxies.at(-1)["dialer-proxy"], dialer.name);
    assert.ok(!config["proxy-groups"].some((group: { name: string }) => group.name === "🇸🇬 新加坡节点"));
  },
);

test.each([ClientType.ClashVerge, ClientType.Stash])(
  "missing or filtered-out dialer regions fail for client %i",
  (clientType) => {
    assert.throws(
      () => convert([landing({ viaRegion: "us" })], { clientType }),
      /no airport nodes in region us after filtering/,
    );

    const filters = [
      { label: "JP only", regions: ["JP"] },
      { label: "Low rate", maxBillingRate: 0.5 },
      { label: "Exclude HK", excludeRegex: "hk" },
    ];
    for (const filter of filters) {
      assert.throws(
        () => convert([landing()], { clientType, filter }),
        /no airport nodes in region hk after filtering/,
      );
    }
  },
);

test("landing names and generated node names cannot collide with nodes, groups, builtins, or each other", () => {
  for (const name of ["HK Low x1", "🇭🇰 香港节点", "DIRECT", "💸 AI Services"]) {
    assert.throws(() => convert([landing({ name })]), /Duplicate or reserved proxy name/);
  }

  const config = airportConfig();
  config.proxies.push({ ...config.proxies[0], name: "🇸🇬 新加坡落地节点" });
  assert.throws(() => convert([landing()], { config }), /Duplicate or reserved proxy name/);
  assert.throws(() => convert([landing(), landing({ name: "🇸🇬 新加坡落地节点" })]), /Duplicate or reserved proxy name/);
});

test("existing airport dialer references cannot create cycles through the new landing business choices", () => {
  const config = airportConfig();
  Object.assign(config.proxies[0], { "dialer-proxy": "💸 AI Services" });
  assert.throws(() => convert([landing()], { config }), /Proxy reference cycle/);
});

test("cycle checks include implicit node references in automatic groups", () => {
  for (const name of ["♻️ 延迟选优", "🚑 故障转移", "⚖️ 负载均衡(散列)", "☁️ 负载均衡(轮询)"]) {
    const config = airportConfig();
    Object.assign(config.proxies[0], { "dialer-proxy": name });
    assert.throws(() => convert([landing()], { config }), /Proxy reference cycle/);
  }
});

test("dangling airport dialer references are reported when landing proxies are enabled", () => {
  const config = airportConfig();
  Object.assign(config.proxies[0], { "dialer-proxy": "Deleted upstream group" });
  assert.throws(() => convert([landing()], { config }), /Unknown proxy reference: Deleted upstream group/);
});

test("UDP is opt-in and SOCKS5 authentication is optional", () => {
  const config = convert([landing({ proxy: { type: "socks5", server: "192.0.2.10", port: 1080, udp: true } })]);
  const node = config.proxies.at(-1);
  assert.equal(node.udp, true);
  assert.equal(node.username, undefined);
  assert.equal(node.password, undefined);
});

test("Stash landings retain chained proxies, domain DNS policies, and supported group icons", () => {
  const landings = [
    landing(),
    landing({ name: "日本落地", viaRegion: "jp", proxy: { type: "socks5", server: "192.0.2.10", port: 1080 } }),
  ];
  const config = convert(landings, {
    clientType: ClientType.Stash,
    extra: { lookupGeoSite: (code) => (code === "private" ? ["+.lan.example"] : ["connectivity.example"]) },
  });

  assert.equal(config.dns["follow-rule"], true);
  assert.equal(config.dns["respect-rules"], undefined);
  assert.equal(config.dns["nameserver-policy"][landings[0].proxy.server], "https://223.5.5.5/dns-query");
  assert.equal(config.dns["nameserver-policy"]["192.0.2.10"], undefined);
  assert.equal(config.dns["nameserver-policy"]["+.lan.example"], "system");
  assert.ok(config.dns["fake-ip-filter"].includes("connectivity.example"));
  assert.ok(config["proxy-groups"].every((group: { icon?: string }) => !group.icon?.endsWith(".svg")));
});

function tokenRequest(landingProxies: unknown, userAgent = "clash-verge/v2.4.2") {
  const subInfo = {
    token: `sk-${"a".repeat(32)}`,
    label: "Token integration",
    url: "https://subscription.example.invalid",
    filter: { label: "Default" },
    landingProxies,
  };
  const cacheValue = JSON.stringify({ content: airportConfig(), headers: { rawHeaders: {} } });
  vi.spyOn(env.KV, "getWithMetadata").mockImplementation(async (keys: string[]) => {
    return new Map<string, KvEntry>(
      keys.map((key) => [
        key,
        key.startsWith("kv:")
          ? { value: JSON.stringify(subInfo), metadata: { updatedAt: 1 } }
          : { value: cacheValue, metadata: { kvUpdatedAt: 1 } },
      ]),
    );
  });

  return worker.fetch(
    new Request(`https://worker.example.invalid/${subInfo.token}`, { headers: { "User-Agent": userAgent } }),
  );
}

test("Token subscriptions generate landing YAML from KV without leaking credentials into conversion logs", async () => {
  const logs: unknown[][] = [];
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    logs.push(args);
  });
  const response = await tokenRequest([landing()]);
  assert.equal(response.status, 200);
  const content = parseYAML(await response.text()) as ReturnType<typeof convert>;
  assert.equal(content.proxies.at(-1)["dialer-proxy"], "🇭🇰 香港节点");
  assert.equal(content.proxies.at(-1).password, "test-secret");
  assert.ok(!JSON.stringify(logs).includes("test-secret"));
  assert.equal(content["proxy-groups"].filter((group: { name: string }) => group.name === landing().name).length, 1);
});

test("Token subscriptions without landing configuration retain their existing behavior", async () => {
  const response = await tokenRequest(undefined);
  assert.equal(response.status, 200);
  const content = parseYAML(await response.text()) as ReturnType<typeof convert>;
  assert.equal(content.proxies.length, airportConfig().proxies.length);
  assert.ok(content["proxy-groups"].some((group: Record<string, unknown>) => group["include-all"] === true));
});

test("invalid Token landing configuration returns HTTP 400 without credentials", async () => {
  const response = await tokenRequest([{ ...landing(), proxy: { ...landing().proxy, port: 0 } }]);
  assert.equal(response.status, 400);
  const message = await response.text();
  assert.match(message, /Invalid landingProxies/);
  assert.ok(!message.includes("test-secret"));
});

test("a Token landing whose dialer region is unavailable returns HTTP 400", async () => {
  const response = await tokenRequest([landing({ viaRegion: "us" })]);
  assert.equal(response.status, 400);
  assert.match(await response.text(), /no airport nodes in region us after filtering/);
});

test.each(["Stash/3.2.5 Clash/1.9.0", "Stash/4.1.0 Clash/1.9.0"])(
  "Stash Token requests generate chained landing YAML for %s",
  async (userAgent) => {
    vi.mocked(extractGeoDomains).mockResolvedValue({
      private: ["+.lan.example"],
      "connectivity-check": ["connectivity.example"],
    });
    const landings = [landing(), landing({ name: "日本落地", viaRegion: "jp" })];
    const response = await tokenRequest(landings, userAgent);
    assert.equal(response.status, 200);
    const content = parseYAML(await response.text()) as ReturnType<typeof convert>;

    assert.deepEqual(
      content.proxies.slice(-2).map((proxy: Record<string, unknown>) => proxy["dialer-proxy"]),
      ["🇭🇰 香港节点", "🇯🇵 日本节点"],
    );
    assert.equal(content.dns["follow-rule"], true);
    assert.equal(content.dns["nameserver-policy"][landings[0].proxy.server], "https://223.5.5.5/dns-query");
    assert.equal(content.dns["nameserver-policy"]["+.lan.example"], "system");
    assert.ok(content["proxy-groups"].every((group: { icon?: string }) => !group.icon?.endsWith(".svg")));
    assert.ok(
      content["proxy-groups"]
        .filter((group: { type: string }) => group.type !== "select")
        .every((group: Record<string, unknown>) => group["include-all"] === true),
    );
    for (const name of businessGroups) {
      const group = content["proxy-groups"].find((group: { name: string }) => group.name === name);
      assert.deepEqual(
        group.proxies.slice(-2),
        landings.map((item) => item.name),
      );
    }

    assert.equal(vi.mocked(extractGeoDomains).mock.calls.length, 1);
    assert.deepEqual(vi.mocked(extractGeoDomains).mock.calls[0], [env.geosite, ["private", "connectivity-check"]]);
  },
);

test("Stash Token requests still reject invalid landing configurations", async () => {
  const response = await tokenRequest([{ ...landing(), proxy: { ...landing().proxy, port: 0 } }], "Stash/3.2.5");
  assert.equal(response.status, 400);
  assert.match(await response.text(), /Invalid landingProxies/);
  assert.equal(vi.mocked(extractGeoDomains).mock.calls.length, 0);
});
