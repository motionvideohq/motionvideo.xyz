import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// Bookmarks moved under /dashboard.
export const Route = createFileRoute("/{-$locale}/bookmarks")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_BOOKMARKS, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
