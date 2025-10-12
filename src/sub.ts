import { env } from "cloudflare:workers";
import YAML from "yaml";
import { convertClashConfig } from "./convert/convert";
import { extractGeoDomains } from "./geo/geoHelper";
import { ClientCoreType, clientCoreType, ClientType } from "./client";
import { DNSPolicy } from "./convert/dns";

/**
 * 自定义错误类：Token 未找到
 */
export class TokenNotFoundError extends Error {
  constructor(token: string) {
    super(`Subscription not found for token: ${token}`);
    this.name = "TokenNotFoundError";
  }
}

/**
 * 自定义错误类：JSON 解析失败
 */
export class JSONParseError extends Error {
  constructor(message: string) {
    super(`Failed to parse subscription data: ${message}`);
    this.name = "JSONParseError";
  }
}

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
  };

  /** DNS 策略 */
  dnsPolicy?: DNSPolicy;
  /** 禁用 QUIC */
  disableQuic?: boolean;
  /** 日志等级 */
  logLevel?: "debug" | "info" | "warning" | "error" | "silent";
}

export interface CachedSubContent {
  /** 订阅内容 */
  content: string;
  /** 订阅 Headers */
  headers: SubHeaders;
}

export interface SubContentWithInfo extends CachedSubContent {
  /** 订阅信息 */
  subInfo: ClashSubInformation;
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
 * @param yaml Subscription content
 * @param profile Profile name
 * @param clientType Proxy client type
 * @param filter Filter configuration
 */
export async function convertSub(
  yaml: string,
  profile: string,
  options: {
    clientType: ClientType;
    clientPlatform: string | null;
    filter?: ClashSubInformation["filter"];
    dnsPolicy: DNSPolicy;
    disableQuic: boolean;
    logLevel: "debug" | "info" | "warning" | "error" | "silent";
  },
): Promise<string> {
  console.log(`Converting subscription for profile: ${profile}`, options);

  const cfg = YAML.parse(yaml);

  let geoDomainMap: Record<string, string[]> = {};

  const { clientType, clientPlatform, filter, dnsPolicy, disableQuic, logLevel } = options;

  // get fake-ip-filter for premium core
  const isPremium = clientCoreType(clientType) === ClientCoreType.ClashPremium;
  if (isPremium) {
    geoDomainMap = await extractGeoDomains(env.geosite, ["private", "connectivity-check"]);
  }

  function lookupGeoSite(code: string): string[] {
    return geoDomainMap[code] ?? [];
  }

  const converted = convertClashConfig({
    config: cfg,
    profile,
    clientType,
    clientPlatform,
    extra: {
      lookupGeoSite,
    },
    disableQuic,
    dnsPolicy,
    logLevel,
    filter,
  });

  const convertedYaml = YAML.stringify(converted, { aliasDuplicateObjects: false });

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
 * @returns 订阅信息、内容和 headers
 */
export async function fetchAndCacheSubContent(
  token: string,
  userAgent: string,
  cacheTTL: number = 3600,
): Promise<SubContentWithInfo> {
  const hashedToken = await hashToken(token);
  const kvKey = `kv:${hashedToken}`;
  const cacheKey = `sub:${hashedToken}`;

  // 1. 从 KV 中获取订阅配置，同时获取 metadata 中的 updatedAt
  const kvValue = await env.KV.getWithMetadata<{ updatedAt?: number }>(kvKey);
  if (!kvValue.value) {
    throw new TokenNotFoundError(token);
  }

  let subInfo: ClashSubInformation;
  try {
    subInfo = JSON.parse(kvValue.value);
  } catch (error) {
    throw new JSONParseError(error instanceof Error ? error.message : "Unknown error");
  }

  const kvUpdatedAt = kvValue.metadata?.updatedAt;

  // 2. 获取订阅内容
  console.log(`Fetching subscription from: ${subInfo.url}`);
  const [content, headers] = await getSubContent(subInfo.url, userAgent);

  // 3. 缓存到 KV，将 kvUpdatedAt 保存到 metadata 用于缓存失效判断
  const cachedData: CachedSubContent = {
    content,
    headers,
  };

  await env.KV.put(cacheKey, JSON.stringify(cachedData), {
    expirationTtl: cacheTTL,
    metadata: { kvUpdatedAt },
  });

  console.log(
    `Cached subscription content to ${cacheKey} with TTL ${cacheTTL}s (kv updated at ${
      kvUpdatedAt ? new Date(kvUpdatedAt).toISOString() : "unknown"
    })`,
  );

  return {
    ...cachedData,
    subInfo,
  };
}

/**
 * 从 KV 缓存中获取订阅内容，如果不存在或订阅信息已更新则从源获取并缓存
 * @param token 用户 token (sk-xxxx 格式)
 * @param userAgent User-Agent 字符串
 * @param cacheTTL 缓存 TTL（秒），默认 1 小时
 * @returns 订阅信息、内容和 headers
 */
export async function getOrFetchSubContent(
  token: string,
  userAgent: string,
  cacheTTL: number = 3600,
): Promise<SubContentWithInfo> {
  const hashedToken = await hashToken(token);
  const kvKey = `kv:${hashedToken}`;
  const cacheKey = `sub:${hashedToken}`;

  // 获取 kv:xxx 的 metadata，检查 updatedAt
  const kvValue = await env.KV.getWithMetadata<{ updatedAt?: number }>(kvKey);
  if (!kvValue.value) {
    throw new TokenNotFoundError(token);
  }

  let subInfo: ClashSubInformation;
  try {
    subInfo = JSON.parse(kvValue.value);
  } catch (error) {
    throw new JSONParseError(error instanceof Error ? error.message : "Unknown error");
  }

  const currentKvUpdatedAt = kvValue.metadata?.updatedAt;

  // 尝试从缓存获取，同时获取 metadata
  const cacheValue = await env.KV.getWithMetadata<{ kvUpdatedAt?: number }>(cacheKey);
  if (cacheValue.value) {
    try {
      const cached = JSON.parse(cacheValue.value) as CachedSubContent;
      const cachedKvUpdatedAt = cacheValue.metadata?.kvUpdatedAt;

      // 检查订阅信息是否已更新：如果 kv 的 updatedAt 不同于缓存时的 kvUpdatedAt，则使缓存失效
      if (currentKvUpdatedAt && cachedKvUpdatedAt && currentKvUpdatedAt > cachedKvUpdatedAt) {
        console.log(
          `Subscription info updated (kv updatedAt: ${new Date(
            currentKvUpdatedAt,
          ).toISOString()} > cached kvUpdatedAt: ${new Date(cachedKvUpdatedAt).toISOString()}), invalidating cache`,
        );
      } else {
        const kvUpdatedAtStr = cachedKvUpdatedAt ? ` (kv updated at ${new Date(cachedKvUpdatedAt).toISOString()})` : "";
        console.log(`Using cached subscription content from ${cacheKey}${kvUpdatedAtStr}`);
        return {
          ...cached,
          subInfo,
        };
      }
    } catch (error) {
      console.warn(`Failed to parse cached data, fetching fresh content: ${error}`);
    }
  }

  // 缓存不存在、解析失败或订阅信息已更新，重新获取
  return await fetchAndCacheSubContent(token, userAgent, cacheTTL);
}
