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
export async function extractGeoDomains(geoSiteUrl: string, countryCodes: string[]): Promise<string[]> {
  const res = await fetch(geoSiteUrl);
  const data = await res.arrayBuffer();

  const bytes = new Uint8Array(data);

  const geoSiteList = GeoSiteList.decode(bytes);
  const filtered = geoSiteList.entry.filter((i) => {
    return countryCodes.includes(i.countryCode?.toLowerCase() ?? "");
  });

  const domainList = filtered.flatMap((i) => {
    if (!i.domain) return [];

    const filteredDomain = i.domain.filter(
      (d) => d.type && [DomainType.Plain, DomainType.Domain, DomainType.Full].includes(d.type)
    );

    return filteredDomain.map((d) => d.value).filter((d) => !!d);
  });

  console.log(
    `Extracted ${domainList.length} geo domains from ${geoSiteUrl} for countries: ${countryCodes.join(", ")}`
  );

  return domainList as string[];
}
