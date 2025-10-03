/**
 * @see https://www.clashverge.dev/guide/url_schemes.html#_4
 */
export type SubHeaders = {
  rawHeaders: Record<string, string>;
  fileName?: string;
  profileUpdateIntervalHour?: string;
  expireAt?: Date;
  usage?: {
    total: number;
    used: number;
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

  return { rawHeaders: rawHeaders };
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

    return [text, subHeaders];
  } finally {
    clearTimeout(t);
  }
}
