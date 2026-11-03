export interface KvEntry {
  value: string;
  metadata: { updatedAt?: number; kvUpdatedAt?: number };
}

export const env = {
  geosite: "https://geosite.example.invalid/geosite.dat",
  KV: {
    async getWithMetadata(_keys: string[], _options: { type: string }): Promise<Map<string, KvEntry>> {
      throw new Error("Each subscription test must provide its own in-memory KV entries");
    },
  },
};
