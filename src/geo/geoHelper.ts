import protobuf from "protobufjs/light";
import { mihomo } from "./geo";

const {
  GeoSiteList,
  Domain: { Type: DomainType },
} = mihomo.component.geodata.router;

const url = "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat";

const res = await fetch(url);
const data = await res.arrayBuffer();

const bytes = new Uint8Array(data);

const geoSiteList = GeoSiteList.decode(bytes);
const filtered = geoSiteList.entry.filter((i) => {
  return ["private", "connectivity-check"].includes(i.countryCode?.toLowerCase() ?? "");
});

const domainList = filtered.flatMap((i) => {
  if (!i.domain) return [];

  const filteredDomain = i.domain.filter(
    (d) => d.type && [DomainType.Plain, DomainType.Domain, DomainType.Full].includes(d.type)
  );

  return filteredDomain.map((d) => d.value);
});

console.log(domainList);
