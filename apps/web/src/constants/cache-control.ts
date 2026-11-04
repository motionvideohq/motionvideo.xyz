/** `Cache-Control` values the server sends, by kind of response. */
export const CACHE_CONTROL = {
  /** Generated text for crawlers and agents (feeds, sitemap, llms.txt, .md). */
  PUBLIC_HOUR: "public, max-age=3600",
  /** Catalog JSON: browsers keep it 5 minutes, shared caches an hour. */
  CATALOG: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  /** Per-visitor responses (redirects that vary, signed-in data). */
  PRIVATE: "private, no-store",
} as const;
