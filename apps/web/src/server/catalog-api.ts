// Public JSON of the catalog data (`/api/catalog`,
// `/api/catalog/directories`). MCP servers, scripts, and other integrations
// read the repo's data over HTTP, so `src/data` stays the single source of
// truth. Responses carry an ETag of the exact bytes, so frequent pollers
// mostly get cheap 304s.

/** Browsers keep a response 5 minutes, shared caches an hour. */
export const CATALOG_CACHE_CONTROL =
  "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

/** Serves `data` as cached JSON with conditional requests. */
export const jsonEndpoint = <T>(data: T) => {
  // Serialized and hashed once per isolate, on the first request.
  let prepared: Promise<{ body: string; etag: string }> | undefined;
  const prepare = async () => {
    const body = JSON.stringify(data);
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(body)
    );
    const hex = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    return { body, etag: `"${hex}"` };
  };

  return async (request: Request): Promise<Response> => {
    prepared ??= prepare();
    const { body, etag } = await prepared;
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": CATALOG_CACHE_CONTROL,
        ETag: etag,
      },
    });
  };
};
