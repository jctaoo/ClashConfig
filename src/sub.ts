import { env } from "cloudflare:workers";
import YAML from "yaml";
import { convertClashConfig } from "./convert";

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
    const filenameStarMatch = subHeaders.contentDisposition.match(
      /filename\*=([^;']+'')?([^;\n]*)/i
    );
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
      const filenameMatch =
        subHeaders.contentDisposition.match(/filename=([^;\n]*)/i);
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
export async function getSubContent(
  subUrl: string,
  userAgent: string
): Promise<[string, SubHeaders]> {
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
      throw new Error(
        `Upstream error: ${response.status} ${response.statusText}`
      );
    }

    const text = await response.text();
    const subHeaders = parseSubHeaders(response);

    console.log(
      `Got subscription content with length ${text.length}`,
      subHeaders
    );

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
  return userAgent.toLowerCase().startsWith("clashx meta/");
}

/**
 * @param yaml Subscription content
 * @param profile Profile name
 * @param userAgent User-Agent string
 */
export function convertSub(
  yaml: string,
  profile: string,
  userAgent: string
): string {
  const cfg = YAML.parse(yaml);

  const isPremium = detectClashPremium(userAgent);
  const converted = convertClashConfig(
    cfg,
    profile,
    isPremium ? "stash" : "mihomo"
  );
  const convertedYaml = YAML.stringify(converted);

  return convertedYaml;
}
