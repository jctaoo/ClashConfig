import { env } from "cloudflare:workers";
import YAML from "yaml";
import { convertClashConfig } from "./convert";
import { extractGeoDomains } from "./geo/geoHelper";

export interface ClashSubInformation {
  /** 用户 Token */
  token: string;
  /** 订阅标签 */
  label: string;
  /** 订阅 URL */
  url: string;
  
  filter: {
    label: string;
    /** 地区 */
    regions?: string[];
    /** 最大计费倍率 */
    maxBillingRate?: number;
    /** 排除正则 */
    excludeRegex?: string;
  }
}

export interface CachedSubContent {
  /** 订阅内容 */
  content: string;
  /** 订阅 Headers */
  headers: SubHeaders;
}

/**
 * @see https://www.clashverge.dev/guide/url_schemes.html#_4
 */
export type SubHeaders = {
  rawHeaders: Record<string, string>;
  fileName?: string;
  profileUpdateIntervalHour?: string;
  expireAt?: Date;
  usage?: {
    totalMiB: number;
    usedMiB: number;
  };
};

export function parseSubHeaders(response: Response): SubHeaders {
  const subHeaders = {
    contentDisposition: response.headers.get("Content-Disposition"),
    profileUpdateInterval: response.headers.get("Profile-Update-Interval"),
    subscriptionUserInfo: response.headers.get("Subscription-Userinfo"),
    profileWebPageUrl: response.headers.get("Profile-Web-Page-Url"),
  };

  const rawHeaders: Record<string, string> = {
    "Content-Disposition": subHeaders.contentDisposition || "",
    "Profile-Update-Interval": subHeaders.profileUpdateInterval || "",
    "Subscription-Userinfo": subHeaders.subscriptionUserInfo || "",
    "Profile-Web-Page-Url": subHeaders.profileWebPageUrl || "",
  };

  // filter empty headers
  Object.keys(rawHeaders).forEach((key) => {
    if (!rawHeaders[key]) {
      delete rawHeaders[key];
    }
  });

  const result: SubHeaders = { rawHeaders };

  // Parse fileName from Content-Disposition header
  // Supports both filename and filename* (RFC 5987) syntax
  // Example: attachment; filename=config.yaml
  // Example: attachment; filename*=UTF-8''config%20file.yaml
  if (subHeaders.contentDisposition) {
    // Try filename* first (RFC 5987 - encoded filename)
    const filenameStarMatch = subHeaders.contentDisposition.match(/filename\*=([^;']+'')?([^;\n]*)/i);
    if (filenameStarMatch && filenameStarMatch[2]) {
      try {
        // Decode the URL-encoded filename
        result.fileName = decodeURIComponent(filenameStarMatch[2]);
      } catch (e) {
        // If decoding fails, use the raw value
        result.fileName = filenameStarMatch[2];
      }
    } else {
      // Fall back to regular filename parameter
      const filenameMatch = subHeaders.contentDisposition.match(/filename=([^;\n]*)/i);
      if (filenameMatch && filenameMatch[1]) {
        // Remove quotes if present
        result.fileName = filenameMatch[1].replace(/^["']|["']$/g, "").trim();
      }
    }
  }

  // Parse Profile-Update-Interval (in hours)
  // Example: 24
  if (subHeaders.profileUpdateInterval) {
    const intervalHours = parseInt(subHeaders.profileUpdateInterval, 10);
    if (!isNaN(intervalHours)) {
      result.profileUpdateIntervalHour = intervalHours.toString();
    }
  }

  // Parse Subscription-Userinfo header
  // Example: upload=0; download=123456789; total=1073741824; expire=1696377600
  if (subHeaders.subscriptionUserInfo) {
    const userInfo = subHeaders.subscriptionUserInfo;

    // Parse usage information (convert bytes to MiB)
    const uploadMatch = userInfo.match(/upload=(\d+)/);
    const downloadMatch = userInfo.match(/download=(\d+)/);
    const totalMatch = userInfo.match(/total=(\d+)/);

    if (totalMatch) {
      const totalBytes = parseInt(totalMatch[1], 10);
      const uploadBytes = uploadMatch ? parseInt(uploadMatch[1], 10) : 0;
      const downloadBytes = downloadMatch ? parseInt(downloadMatch[1], 10) : 0;
      const usedBytes = uploadBytes + downloadBytes;

      result.usage = {
        totalMiB: Math.round(totalBytes / 1024 / 1024),
        usedMiB: Math.round(usedBytes / 1024 / 1024),
      };
    }

    // Parse expire time (Unix timestamp in seconds)
    const expireMatch = userInfo.match(/expire=(\d+)/);
    if (expireMatch) {
      const expireTimestamp = parseInt(expireMatch[1], 10);
      if (!isNaN(expireTimestamp)) {
        result.expireAt = new Date(expireTimestamp * 1000);
      }
    }
  }

  return result;
}

/**
 * get sub content from subUrl
 * @param subUrl
 * @param userAgent
 */
export async function getSubContent(subUrl: string, userAgent: string): Promise<[string, SubHeaders]> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000); // 10 seconds

  try {
    const response = await fetch(subUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": userAgent,
        // no cache content
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const subHeaders = parseSubHeaders(response);

    console.log(`Got subscription content with length ${text.length}`, subHeaders);

    // check is yaml
    // check first line is xxx: xxx
    const firstLine = text.trim().split("\n")[0];
    if (!firstLine.includes(":")) {
      throw new Error("Upstream error: content is not yaml");
    }

    return [text, subHeaders];
  } finally {
    clearTimeout(t);
  }
}

/**
 * 当前仅检测 stash，该内核不支持全部 mihomo 内核特性
 */
export function detectClashPremium(userAgent: string): boolean {
  return userAgent.toLowerCase().startsWith("stash/");
}

/**
 * @param yaml Subscription content
 * @param profile Profile name
 * @param userAgent User-Agent string
 */
export async function convertSub(yaml: string, profile: string, userAgent: string): Promise<string> {
  const cfg = YAML.parse(yaml);

  const isPremium = detectClashPremium(userAgent);
  const extra: { fakeIpFilters?: string[] } = {};

  // get fake-ip-filter for premium core
  if (isPremium) {
    const domainList = await extractGeoDomains(env.geosite, ["private", "connectivity-check"]);
    extra.fakeIpFilters = domainList;
  }

  const converted = convertClashConfig({
    config: cfg,
    profile,
    variant: isPremium ? "stash" : "mihomo",
    extra,
  });
  const convertedYaml = YAML.stringify(converted);

  return convertedYaml;
}

/**
 * Hash token with SHA256 using Web Crypto API
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * 从 KV 中根据 token 获取订阅信息，获取订阅内容并缓存到 KV
 * @param token 用户 token (sk-xxxx 格式)
 * @param userAgent User-Agent 字符串
 * @param cacheTTL 缓存 TTL（秒），默认 1 小时
 * @returns 订阅内容和 headers
 */
export async function fetchAndCacheSubContent(
  token: string, 
  userAgent: string, 
  cacheTTL: number = 3600
): Promise<CachedSubContent> {
  const hashedToken = await hashToken(token);
  const kvKey = `kv:${hashedToken}`;
  const cacheKey = `sub:${hashedToken}`;

  // 1. 从 KV 中获取订阅配置
  const subInfoStr = await env.KV.get(kvKey);
  if (!subInfoStr) {
    throw new Error(`Subscription not found for token: ${token}`);
  }

  let subInfo: ClashSubInformation;
  try {
    subInfo = JSON.parse(subInfoStr);
  } catch (error) {
    throw new Error(`Failed to parse subscription data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // 2. 获取订阅内容
  console.log(`Fetching subscription from: ${subInfo.url}`);
  const [content, headers] = await getSubContent(subInfo.url, userAgent);

  // 3. 缓存到 KV，将 cachedAt 保存到 metadata
  const cachedData: CachedSubContent = {
    content,
    headers,
  };

  const cachedAt = Date.now();
  await env.KV.put(cacheKey, JSON.stringify(cachedData), {
    expirationTtl: cacheTTL,
    metadata: { cachedAt },
  });

  console.log(`Cached subscription content to ${cacheKey} with TTL ${cacheTTL}s at ${new Date(cachedAt).toISOString()}`);

  return cachedData;
}

/**
 * 从 KV 缓存中获取订阅内容，如果不存在则从源获取并缓存
 * @param token 用户 token (sk-xxxx 格式)
 * @param userAgent User-Agent 字符串
 * @param cacheTTL 缓存 TTL（秒），默认 1 小时
 * @returns 订阅内容和 headers
 */
export async function getOrFetchSubContent(
  token: string,
  userAgent: string,
  cacheTTL: number = 3600
): Promise<CachedSubContent> {
  const hashedToken = await hashToken(token);
  const cacheKey = `sub:${hashedToken}`;

  // 尝试从缓存获取，同时获取 metadata
  const kvValue = await env.KV.getWithMetadata<{ cachedAt?: number }>(cacheKey);
  if (kvValue.value) {
    try {
      const cached = JSON.parse(kvValue.value) as CachedSubContent;
      const cachedAt = kvValue.metadata?.cachedAt;
      const cachedAtStr = cachedAt ? ` (cached at ${new Date(cachedAt).toISOString()})` : '';
      console.log(`Using cached subscription content from ${cacheKey}${cachedAtStr}`);
      return cached;
    } catch (error) {
      console.warn(`Failed to parse cached data, fetching fresh content: ${error}`);
    }
  }

  // 缓存不存在或解析失败，重新获取
  return await fetchAndCacheSubContent(token, userAgent, cacheTTL);
}
