import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// The GTA 6 Clip Pack page moved to /gta-6-clipping; `?clip=` ad links carry over.
export const Route = createFileRoute("/{-$locale}/gta-6")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.GTA_CLIPPING, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
