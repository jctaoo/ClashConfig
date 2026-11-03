import { LandingProxyConfigError, type LandingProxy } from "../landingProxies";
import { REGIONS, regionGroupName } from "./regions";
import type { AnyJson } from "./type";

const BUILTIN_PROXIES = new Set(["DIRECT", "REJECT", "REJECT-DROP", "PASS", "COMPATIBLE", "GLOBAL"]);

/** 生成通过机场地区组连接的落地节点及其独立选择组。 */
export function buildLandingProxies(landings: LandingProxy[], airportGroups: AnyJson[]) {
  const availableGroups = new Set(airportGroups.map((group) => group.name));
  const proxies: AnyJson[] = [];
  const groups: AnyJson[] = [];

  for (const landing of landings) {
    const region = REGIONS.find((region) => region.id === landing.viaRegion);
    if (!region) {
      throw new LandingProxyConfigError(`Unknown landing proxy region: ${landing.viaRegion}`);
    }

    const dialer = regionGroupName(region);
    if (!availableGroups.has(dialer)) {
      throw new LandingProxyConfigError(
        `Landing proxy "${landing.name}" has no airport nodes in region ${region.id} after filtering`,
      );
    }

    const nodeName = `${landing.name}节点`;
    proxies.push({
      ...landing.proxy,
      name: nodeName,
      udp: landing.proxy.udp ?? false,
      "dialer-proxy": dialer,
    });
    groups.push({ name: landing.name, type: "select", proxies: [nodeName] });
  }

  return { proxies, groups };
}

/** 检查落地接入后的名称、代理引用和代理链，避免生成悬空引用或循环。 */
export function validateProxyReferences(proxies: AnyJson[], groups: AnyJson[]): void {
  const references = new Map<string, string[]>();

  function addReferences(name: string, targets: string[]) {
    if (BUILTIN_PROXIES.has(name) || references.has(name)) {
      throw new LandingProxyConfigError(`Duplicate or reserved proxy name: ${name}`);
    }

    references.set(name, targets);
  }

  for (const proxy of proxies) {
    const dialer = proxy["dialer-proxy"];
    addReferences(proxy.name, dialer ? [dialer] : []);
  }

  for (const group of groups) {
    const targets = [...(group.proxies ?? [])];
    if (group["include-all"] || group["include-all-proxies"]) {
      targets.push(...proxies.map((proxy) => proxy.name));
    }

    addReferences(group.name, targets);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(name: string): void {
    if (BUILTIN_PROXIES.has(name) || visited.has(name)) {
      return;
    }

    if (visiting.has(name)) {
      throw new LandingProxyConfigError(`Proxy reference cycle detected at: ${name}`);
    }

    const targets = references.get(name);
    if (!targets) {
      throw new LandingProxyConfigError(`Unknown proxy reference: ${name}`);
    }

    visiting.add(name);
    for (const target of targets) {
      visit(target);
    }
    visiting.delete(name);
    visited.add(name);
  }

  for (const name of references.keys()) {
    visit(name);
  }
}
