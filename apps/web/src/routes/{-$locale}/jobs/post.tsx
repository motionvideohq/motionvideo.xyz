import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// Posting a job moved under /dashboard.
export const Route = createFileRoute("/{-$locale}/jobs/post")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_JOBS_POST, params.locale, {
      search: true,
      statusCode: 301,
    });
  },
});
