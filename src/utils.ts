
/**
 * strictly check userAgent is clash
 * - DEMO: stash on iOS: Stash/3.1.1 Clash/1.9.0
 * - DEMO: clash verge rev on Windows: clash-verge/v2.4.2
 * - DEMO: ClashX.meta on Mac: ClashX Meta/v1.4.24 (com.metacubex.ClashX.meta; build:622; macOS 26.0.0) Alamofire/5.10.2
 * - DEMO: Clas Meta on Android: ClashMetaForAndroid/2.11.16.Meta
 * @param userAgent
 * @returns
 */
export function checkUserAgent(userAgent: string) {
  if (!userAgent) {
    return false;
  }

  // check stash
  if (userAgent.toLocaleLowerCase().startsWith("stash/")) {
    return true;
  }

  // check clash verge rev
  if (userAgent.toLocaleLowerCase().startsWith("clash-verge/")) {
    return true;
  }

  // check clashx.meta
  if (userAgent.toLocaleLowerCase().startsWith("clashx")) {
    return true;
  }

  // check clash meta for android
  if (userAgent.toLocaleLowerCase().startsWith("clashmetaforandroid/")) {
    return true;
  }

  return false;
}

/**
 * 当前仅检测 stash，该内核不支持全部 mihomo 内核特性
 */
export function detectClashPremium(userAgent: string): boolean {
  return userAgent.toLowerCase().startsWith("stash/");
}

/** 
 * 检测 clashx.meta
 */
export function detectClashXMeta(userAgent: string): boolean {
  return userAgent.toLowerCase().startsWith("clashx meta/");
}