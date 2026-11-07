import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// Job listings moved under /dashboard.
export const Route = createFileRoute("/{-$locale}/listings")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_LISTINGS, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
