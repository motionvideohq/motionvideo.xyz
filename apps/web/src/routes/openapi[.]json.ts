import { createFileRoute } from "@tanstack/react-router";

import { jsonEndpoint } from "@/server/catalog-api";
import { openApiDocument } from "@/server/openapi";

// The OpenAPI 3.1 document of the public API (src/server/openapi.ts), with
// the same ETag caching as the endpoints it describes.
const endpoint = jsonEndpoint(openApiDocument);

export const Route = createFileRoute("/openapi.json")({
  server: {
    handlers: {
      GET: ({ request }) => endpoint(request),
    },
  },
});
