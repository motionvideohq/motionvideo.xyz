import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// Sponsorships moved under /dashboard.
export const Route = createFileRoute("/{-$locale}/sponsorships/")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_SPONSORSHIPS, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
