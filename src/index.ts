import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { getSubContent, parseSubHeaders } from "./sub";
import { checkUserAgent } from "./utils";

const app = new Hono();

app.get("/sub", async (c) => {
  const userAgent = c.req.header("User-Agent");
  const subEncoded = c.req.query("sub");

  if (userAgent && !checkUserAgent(userAgent)) {
    c.status(400);
    return c.text("Not supported, must request inside clash app");
  }

  if (!subEncoded) {
    c.status(400);
    return c.text("sub is required");
  }

  const subUrl = atob(subEncoded);

  try {
    const [content, subHeaders] = await getSubContent(subUrl, userAgent!);
    return c.text(content, 200, subHeaders.rawHeaders);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      const msg = `Upstream error: ${error.message}`;
      return c.text(msg, 502);
    }
    c.status(500);
    return c.text("Internal server error");
  }
});

export default app;
