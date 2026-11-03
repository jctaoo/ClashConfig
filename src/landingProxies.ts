import { z } from "zod";
import { REGIONS } from "./convert/regions";

export const LandingProxySchema = z.strictObject({
  name: z.string().trim().min(1),
  viaRegion: z
    .string()
    .trim()
    .toLowerCase()
    .refine((id) => REGIONS.some((region) => region.id === id), {
      message: `viaRegion must be one of: ${REGIONS.map((region) => region.id).join(", ")}`,
    }),
  proxy: z.strictObject({
    type: z.literal("socks5"),
    server: z.string().trim().min(1),
    port: z.number().int().min(1).max(65535),
    username: z.string().optional(),
    password: z.string().optional(),
    udp: z.boolean().optional(),
  }),
});

export const LandingProxiesSchema = z
  .array(LandingProxySchema)
  .refine((proxies) => new Set(proxies.map((proxy) => proxy.name)).size === proxies.length, {
    message: "Landing proxy names must be unique",
  });

export type LandingProxy = z.infer<typeof LandingProxySchema>;

export class LandingProxyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LandingProxyConfigError";
  }
}

/** 校验落地配置，错误信息只包含字段路径和校验说明。 */
export function parseLandingProxies(value: unknown): LandingProxy[] {
  const result = LandingProxiesSchema.safeParse(value === undefined ? [] : value);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new LandingProxyConfigError(`Invalid landingProxies: ${details}`);
  }

  return result.data;
}
