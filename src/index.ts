import { Hono } from "hono";
import {
  convertSub,
  getOrFetchSubContent,
  getSubContent,
  parseSubHeaders,
  TokenNotFoundError,
  JSONParseError,
} from "./sub";
import { checkUserAgent, ClientType } from "./client";
import { logger } from "hono/logger";
import { DNSPolicySchema } from "./convert/dns";
import z, { ZodError } from "zod";
import { validator } from "hono/validator";

const app = new Hono();

app.use(logger());

const SubQuerySchema = z.object({
  sub: z.string().min(1, "sub is required"),
  convert: z
    .enum(["true", "false"])
    .default("true")
    .transform((val) => val === "true"),
  nameserver: DNSPolicySchema.shape.nameserver,
  rules: DNSPolicySchema.shape.rules,
  quic: z
    .enum(["true", "false"])
    .default("true")
    .transform((val) => val === "true"),
  level: z
    .enum(["debug", "info", "warning", "error", "silent"])
    .default("warning"),

  regions: z
    .string("regions code divided by comma")
    .transform((val) => val.split(","))
    .optional(),
  rate: z.coerce.number().int().positive().optional(),
  filter: z.string().optional(),
});



/**
 * Basic clash config converter
 */
app.get(
  "/sub",
  validator("query", (value, c) => {
    const result = SubQuerySchema.safeParse(value);
    if (!result.success) {
      return c.text(result.error.message, 400);
    }
    return result.data;
  }),
  async (c) => {
    const params = c.req.valid("query");

    const userAgent = c.req.header("User-Agent");

    const [clientType, clientPlatform] = checkUserAgent(userAgent ?? "");

    if (!clientType) {
      console.log("Blocked request with User-Agent:", userAgent);
      c.status(400);
      return c.text("Not supported, must request inside clash app");
    }

    const subUrl = atob(params.sub);

    try {
      console.log("Retrieving subscription content", { subUrl, userAgent });
      const [content, subHeaders] = await getSubContent(subUrl, userAgent!);

      let contentFinal = content;

      if (params.convert) {
        const dnsPolicy = DNSPolicySchema.parse({ nameserver: params.nameserver, rules: params.rules });

        contentFinal = await convertSub(content, subHeaders.fileName ?? "Clash-Config-Sub", {
          clientType,
          clientPlatform,
          dnsPolicy,
          disableQuic: params.quic,
          logLevel: params.level,
          filter: {
            label: "custom-filter",
            maxBillingRate: params.rate,
            regions: params.regions,
            excludeRegex: params.filter,
          }
        });
      } else {
        // 不进行配置优化，但是会转化为客户端配置
        // Support this in future version
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
  },
);

app.get(":token", async (c) => {
  const token = c.req.param("token");
  const userAgent = c.req.header("User-Agent");
  const [clientType, clientPlatform] = checkUserAgent(userAgent ?? "");

  if (!clientType) {
    console.log("Blocked request with User-Agent:", userAgent);
    c.status(400);
    return c.text("Not supported, must request inside clash app");
  }

  try {
    console.log("Retrieving subscription content", { userAgent });
    const { content, headers, subInfo } = await getOrFetchSubContent(token, userAgent!);
    
    const dnsPolicy = DNSPolicySchema.parse(subInfo.dnsPolicy ?? {});
    const logLevel = subInfo.logLevel ?? "warning";

    const contentFinal = await convertSub(content, subInfo.label, {
      clientType,
      clientPlatform,
      filter: subInfo.filter,
      dnsPolicy,
      disableQuic: subInfo.disableQuic ?? true,
      logLevel,
    });

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
});

export default {
  port: 8787,
  fetch: app.fetch,
};
