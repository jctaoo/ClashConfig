import protobuf from "protobufjs/light";
import { mihomo } from "./geo";

const {
  GeoSiteList,
  Domain: { Type: DomainType },
} = mihomo.component.geodata.router;

/**
 * Extract geo domains from given geo site data url and filter by country codes
 *
 * NOTE: This will filtered out the regex domain.
 *
 * @param geoSiteUrl The URL of the geo site data
 * @param countryCodes The list of country codes to filter by
 * @returns A list of geo domains
 */
export async function extractGeoDomains(geoSiteUrl: string, countryCodes: string[]): Promise<Record<string, string[]>> {
  const startTime = performance.now();
  
  try {
    // TODO: 缓存 github 请求来降低 cpu 时间
    const fetchStartTime = performance.now();
    const res = await fetch(geoSiteUrl);
    const data = await res.arrayBuffer();
    const fetchDuration = performance.now() - fetchStartTime;
    console.log(`[Geo] Fetch geosite data: ${fetchDuration.toFixed(2)}ms`);

    const decodeStartTime = performance.now();
    
    const bytes = new Uint8Array(data);

    const geoSiteList = GeoSiteList.decode(bytes);
    const filtered = geoSiteList.entry.filter((i) => {
      return countryCodes.includes(i.countryCode?.toLowerCase() ?? "");
    });

    const domainList = filtered
      .filter((i) => i.countryCode)
      .map((i) => {
        if (!i.domain) return [];

        const filteredDomain = i.domain.filter(
          (d) => d.type && [DomainType.Plain, DomainType.Domain, DomainType.Full].includes(d.type)
        );

        return [i.countryCode!.toLowerCase(), filteredDomain.map((d) => d.value).filter((d) => !!d)];
      });
    const count = domainList.flatMap((i) => i[1]).length;
    const domainMap = Object.fromEntries(domainList);
    
    const decodeDuration = performance.now() - decodeStartTime;
    console.log(`[Geo] Decode and filter domains: ${decodeDuration.toFixed(2)}ms`);

    console.log(`Extracted ${count} geo domains from ${geoSiteUrl} for countries: ${countryCodes.join(", ")}`);

    return domainMap;
  } finally {
    const duration = performance.now() - startTime;
    console.log(`[Geo] Extract geo domains for: ${countryCodes.join(', ')}: ${duration.toFixed(2)}ms`);
  }
}
