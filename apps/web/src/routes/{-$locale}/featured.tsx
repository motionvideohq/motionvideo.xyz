import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// Featured moved under /dashboard.
export const Route = createFileRoute("/{-$locale}/featured")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_FEATURED, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
