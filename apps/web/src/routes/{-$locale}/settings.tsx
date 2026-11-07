import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// Settings moved under /dashboard.
export const Route = createFileRoute("/{-$locale}/settings")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_SETTINGS, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
