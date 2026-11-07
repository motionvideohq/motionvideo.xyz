import { createFileRoute } from "@tanstack/react-router";

import { localizedRedirect } from "@/lib/localized-redirect";

// Studios and designers moved to /creatives.
export const Route = createFileRoute("/{-$locale}/studios")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect("/creatives", params.locale, {
      statusCode: 301,
    });
  },
});
