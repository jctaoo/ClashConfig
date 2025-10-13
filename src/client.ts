export enum ClientType {
  Stash = 1,
  ClashXMeta,
  ClashVerge,
  ClashMetaForAndroid,
  ClashParty,
  UnknownClash,

  MihomoBare,
}

export enum ClientCoreType {
  Mihomo = 1,
  ClashPremium,
}

export function clientCoreType(type: ClientType): ClientCoreType {
  switch (type) {
    case ClientType.Stash:
      return ClientCoreType.ClashPremium;
    case ClientType.ClashXMeta:
    case ClientType.ClashVerge:
    case ClientType.ClashMetaForAndroid:
    case ClientType.MihomoBare:
    case ClientType.ClashParty:
    case ClientType.UnknownClash:
      return ClientCoreType.Mihomo;
  }
}

export function isBareCore(type: ClientType): boolean {
  return type === ClientType.MihomoBare;
}

/**
 * strictly check userAgent is clash
 * - DEMO: stash on iOS: Stash/3.1.1 Clash/1.9.0
 * - DEMO: clash verge rev on Windows: clash-verge/v2.4.2
 * - DEMO: ClashX.meta on Mac: ClashX Meta/v1.4.24 (com.metacubex.ClashX.meta; build:622; macOS 26.0.0) Alamofire/5.10.2
 * - DEMO: Clash Meta on Android: ClashMetaForAndroid/2.11.16.Meta
 * - DEMO: Mihomo bare core: Mihomo Meta v1.19.14 windows amd64 with go1.24.7 Wed Sep 24 09:12:02 UTC 2025
 * @param userAgent
 * @returns [ClientType, platform]
 */
export function checkUserAgent(userAgent: string): [ClientType | null, string | null] {
  if (!userAgent) {
    return [null, null];
  }

  // check stash
  if (userAgent.toLocaleLowerCase().startsWith("stash/")) {
    return [ClientType.Stash, null];
  }

  // check clash verge rev
  if (userAgent.toLocaleLowerCase().startsWith("clash-verge/")) {
    return [ClientType.ClashVerge, null];
  }

  // check clash party
  if (userAgent.toLocaleLowerCase().startsWith("mihomo.party/")) {
    return [ClientType.ClashParty, null];
  }

  // check clashx.meta
  if (userAgent.toLocaleLowerCase().startsWith("clashx meta/")) {
    return [ClientType.ClashXMeta, null];
  }
  
  // check clash meta for android
  if (userAgent.toLocaleLowerCase().startsWith("clashmetaforandroid/")) {
    return [ClientType.ClashMetaForAndroid, null];
  }

  // match for mihomo bare core and get platform
  const mihomoBareCoreRegex = /Mihomo Meta v([\d.]+) (\w+) (\w+) with go([\d.]+) .*/;
  const mihomoBareCoreMatch = userAgent.match(mihomoBareCoreRegex);
  if (mihomoBareCoreMatch && mihomoBareCoreMatch.length >= 3) {
    const version = mihomoBareCoreMatch[1];
    const platform = mihomoBareCoreMatch[2].toLowerCase();
    return [ClientType.MihomoBare, platform];
  }

  // Other clash or mihomo client, Like:
  // ClashMi: ClashMeta/1.19.14; mihomo/1.19.14
  if (userAgent.toLocaleLowerCase().startsWith("clash")) {
    return [ClientType.UnknownClash, null];
  }

  return [null, null];
}
