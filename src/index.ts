import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { convertSub, getSubContent, parseSubHeaders } from "./sub";
import { checkUserAgent } from "./utils";

const app = new Hono();

/**
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

export default {
  port: 8787,
  fetch: app.fetch,
};
