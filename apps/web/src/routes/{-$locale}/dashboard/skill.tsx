import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// The agent skill is part of Pro: its access and install steps moved to the
// plan page.
export const Route = createFileRoute("/{-$locale}/dashboard/skill")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DASHBOARD_BILLING, params.locale, {
      statusCode: 301,
    });
  },
});
