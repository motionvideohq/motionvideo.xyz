import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// Submitting work moved under /dashboard.
export const Route = createFileRoute("/{-$locale}/submit")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_SUBMIT, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
