import { createFileRoute, redirect } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";

// The agent skill is part of Pro: its access and install steps moved to the
// plan page.
export const Route = createFileRoute("/dashboard/skill")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.DASHBOARD_BILLING, statusCode: 301 });
  },
});
