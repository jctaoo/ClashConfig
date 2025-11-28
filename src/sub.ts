import { env } from "cloudflare:workers";
import { convertClashConfig } from "./convert/convert";
import { extractGeoDomains } from "./geo/geoHelper";
import { ClientCoreType, clientCoreType, ClientType } from "./client";
import { DNSPolicy } from "./convert/dns";
import { formatDateTime, parseYAML, dumpYAML } from "./utils";
import { AnyJson } from "./convert/type";
import {
  parseSubHeaders,
  getSubContent,
  SubHeaders,
  CachedSubContent,
} from "./subShared";

// Re-export shared types and functions for backward compatibility
export { parseSubHeaders, getSubContent, SubHeaders, CachedSubContent };

/**
 * Token 配置的 metadata
 */
interface TokenConfigMetadata {
  updatedAt?: number;
}

/**
 * 缓存上游订阅的 metadata
 */
interface CacheMetadata {
  /** 缓存时，token 配置的更新时间 */
  kvUpdatedAt?: number;
}

/**
 * Union type for bulk KV metadata
 */
type BulkKvMetadata = TokenConfigMetadata | CacheMetadata;

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

export interface SubContentWithInfo extends CachedSubContent {
  /** 订阅信息 */
  subInfo: ClashSubInformation;
}

/**
 * @param configOrYaml Subscription config (can be YAML string or parsed object)
 * @param profile Profile name
 * @param clientType Proxy client type
 * @param filter Filter configuration
 */
export async function convertSub(
  configOrYaml: string | AnyJson,
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
  const startTime = performance.now();

  try {
    console.log(`Converting subscription for profile: ${profile}`, options);

    // 根据类型自适应：如果是字符串则解析，否则直接使用
    let cfg: AnyJson;
    if (typeof configOrYaml === "string") {
      const parseStartTime = performance.now();
      cfg = parseYAML(configOrYaml) as AnyJson;
      const parseDuration = performance.now() - parseStartTime;
      console.log(`[Sub] Parse YAML: ${parseDuration.toFixed(2)}ms`);
    } else {
      cfg = configOrYaml;
    }

    let geoDomainMap: Record<string, string[]> = {};

    const { clientType, clientPlatform, filter, dnsPolicy, disableQuic, logLevel } = options;

    // get fake-ip-filter for premium core
    const isPremium = clientCoreType(clientType) === ClientCoreType.ClashPremium;
    if (isPremium) {
      const geoStartTime = performance.now();
      geoDomainMap = await extractGeoDomains(env.geosite, ["private", "connectivity-check"]);
      const geoDuration = performance.now() - geoStartTime;
      console.log(`[Sub] Extract geo domains: ${geoDuration.toFixed(2)}ms`);
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

    const stringifyStartTime = performance.now();
    const convertedYaml = dumpYAML(converted);
    const stringifyDuration = performance.now() - stringifyStartTime;
    console.log(`[Sub] Stringify YAML: ${stringifyDuration.toFixed(2)}ms`);

    return convertedYaml;
  } finally {
    const duration = performance.now() - startTime;
    console.log(`[Sub] Convert subscription: ${profile}: ${duration.toFixed(2)}ms`);
  }
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
 * 获取订阅内容并缓存到 KV
 * @param token 用户 token (sk-xxxx 格式)
 * @param userAgent User-Agent 字符串
 * @param subInfo 订阅信息（避免重复从 KV 读取）
 * @param tokenConfigUpdatedAt Token 配置更新时间（用于缓存失效判断）
 * @param cacheTTL 缓存 TTL（秒），默认 1 小时
 * @returns 订阅信息、内容和 headers
 */
export async function fetchAndCacheSubContent(
  token: string,
  userAgent: string,
  subInfo: ClashSubInformation,
  tokenConfigUpdatedAt: number | undefined,
  cacheTTL: number = 3600,
): Promise<SubContentWithInfo> {
  const hashedToken = await hashToken(token);
  const startTime = performance.now();

  try {
    // 上游订阅配置缓存 key
    const subCacheKey = `sub:${hashedToken}`;

    // 1. 获取订阅内容
    console.log(`Fetching subscription from: ${subInfo.url}`);
    const [yamlContent, headers] = await getSubContent(subInfo.url, userAgent);

    // 2. 解析 YAML 为 JSON 对象
    const parseStartTime = performance.now();
    const parsedContent = parseYAML(yamlContent) as AnyJson;
    const parseDuration = performance.now() - parseStartTime;
    console.log(`[Sub] Parse YAML for caching: ${parseDuration.toFixed(2)}ms`);

    // 3. 缓存解析后的对象到 KV，将 tokenConfigUpdatedAt 保存到 metadata 用于缓存失效判断
    const cachedData: CachedSubContent = {
      content: parsedContent,
      headers,
    };

    await env.KV.put(subCacheKey, JSON.stringify(cachedData), {
      expirationTtl: cacheTTL,
      metadata: { kvUpdatedAt: tokenConfigUpdatedAt },
    });

    console.log(
      `Cached parsed subscription content to ${subCacheKey} with TTL ${cacheTTL}s (token updatedAt ${
        tokenConfigUpdatedAt ? formatDateTime(tokenConfigUpdatedAt) : "unknown"
      })`,
    );

    return {
      ...cachedData,
      subInfo,
    };
  } finally {
    const duration = performance.now() - startTime;
    console.log(`[Sub] Fetch and cache: ${hashedToken}: ${duration.toFixed(2)}ms`);
  }
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
  const startTime = performance.now();

  try {
    // Token 配置 key
    const tokenConfigKey = `kv:${hashedToken}`;
    // 上游订阅配置缓存 key
    const subCacheKey = `sub:${hashedToken}`;

    // 优化：批量获取两个 KV 值，减少一次 KV 读取操作
    const bulkResult = await env.KV.getWithMetadata<BulkKvMetadata>([tokenConfigKey, subCacheKey], { type: "text" });

    // 解析订阅配置
    const tokenConfig = bulkResult.get(tokenConfigKey);
    if (!tokenConfig?.value) {
      throw new TokenNotFoundError(token);
    }

    let subInfo: ClashSubInformation;
    try {
      subInfo = JSON.parse(tokenConfig.value);
    } catch (error) {
      throw new JSONParseError(error instanceof Error ? error.message : "Unknown error");
    }

    const curTokenConfigUpdatedAt = (tokenConfig.metadata as TokenConfigMetadata | null)?.updatedAt;

    // 解析缓存内容
    const subCache = bulkResult.get(subCacheKey);
    if (subCache?.value) {
      try {
        const parseCachedStartTime = performance.now();
        const cached = JSON.parse(subCache.value) as CachedSubContent;
        const parseCachedDuration = performance.now() - parseCachedStartTime;
        console.log(`[Sub] Parse cached content: ${parseCachedDuration.toFixed(2)}ms`);
        
        const curSubCacheUpdatedAt = (subCache.metadata as CacheMetadata | null)?.kvUpdatedAt;

        // Check if the subscription info is updated
        // If the token info is updated after the subscription content is cached, fetch the fresh content
        if (curTokenConfigUpdatedAt && curSubCacheUpdatedAt && curTokenConfigUpdatedAt > curSubCacheUpdatedAt) {
          console.log(
            `Cache Miss: Subscription info updated (token updatedAt: ${formatDateTime(curTokenConfigUpdatedAt)} ` +
              `> sub cached updatedAt: ${formatDateTime(curSubCacheUpdatedAt)}), invalidating cache`,
          );
        } else {
          // Cache hit
          const kvUpdatedAtStr = curSubCacheUpdatedAt
            ? ` (sub cached updatedAt ${formatDateTime(curSubCacheUpdatedAt)})`
            : "";
          console.log(`Cache Hit: Subscription content from ${subCacheKey}${kvUpdatedAtStr}`);
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
    return await fetchAndCacheSubContent(token, userAgent, subInfo, curTokenConfigUpdatedAt, cacheTTL);
  } finally {
    const duration = performance.now() - startTime;
    console.log(`[Sub] Get or fetch: ${hashedToken}: ${duration.toFixed(2)}ms`);
  }
}
