import { Hono } from "hono";
import { convertSub, getOrFetchSubContent, getSubContent, parseSubHeaders, TokenNotFoundError, JSONParseError } from "./sub";
import { checkUserAgent } from "./utils";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

/**
 * Basic clash config converter
 * - Parameter sub: base64 encoded sub url
 * - Parameter convert: true/false, default true, whether to convert the config
 */
app.get("/sub", async (c) => {
  const userAgent = c.req.header("User-Agent");
  const subEncoded = c.req.query("sub");
  const convert = c.req.query("convert");

  if (userAgent && !checkUserAgent(userAgent)) {
    console.log("Blocked request with User-Agent:", userAgent);
    c.status(400);
    return c.text("Not supported, must request inside clash app");
  }

  if (!subEncoded) {
    console.log("Missing sub parameter");
    c.status(400);
    return c.text("sub is required");
  }

  const subUrl = atob(subEncoded);

  try {
    const [content, subHeaders] = await getSubContent(subUrl, userAgent!);

    const disableConvert = convert === "false";
    let contentFinal = content;

    if (!disableConvert) {
      contentFinal = await convertSub(
        content,
        subHeaders.fileName ?? "Clash-Config-Sub",
        userAgent!
      );
      console.log("Converted config");
    }

    return c.text(contentFinal, 200, {
      ...subHeaders.rawHeaders,
      "Content-Type": "text/yaml; charset=utf-8",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      const msg = `Upstream error: ${error.message}`;
      return c.text(msg, 502);
    }
    if (error instanceof Error) {
      c.status(500);
      return c.text(`Internal server error: ${error.message}`);
    }
    c.status(500);
    return c.text(`Internal server error`);
  }
});

app.get(":token", async (c) => {
  const token = c.req.param("token");
  const userAgent = c.req.header("User-Agent");

  if (userAgent && !checkUserAgent(userAgent)) {
    console.log("Blocked request with User-Agent:", userAgent);
    c.status(400);
    return c.text("Not supported, must request inside clash app");
  }
  
  try {
    const { content, headers, subInfo } = await getOrFetchSubContent(token, userAgent!);
    const contentFinal = await convertSub(content, subInfo.label, userAgent!, subInfo.filter);

    // Use subInfo.label as the filename in Content-Disposition header
    const contentDisposition = `attachment; filename*=UTF-8''${subInfo.label}`;

    return c.text(contentFinal, 200, {
      ...headers.rawHeaders,
      "Content-Disposition": contentDisposition,
      "Content-Type": "text/yaml; charset=utf-8",
    });
  } catch (error) {
    // Token not found or JSON parse error should return 400
    if (error instanceof TokenNotFoundError || error instanceof JSONParseError) {
      console.log(`Bad request: ${error.message}`);
      c.status(400);
      return c.text(error.message);
    }
    
    // Other errors return 500
    if (error instanceof Error) {
      c.status(500);
      return c.text(`Internal server error: ${error.message}`);
    }
    c.status(500);
    return c.text(`Internal server error`);
  }
})

export default {
  port: 8787,
  fetch: app.fetch,
};
