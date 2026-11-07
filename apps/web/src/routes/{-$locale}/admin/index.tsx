import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

export const Route = createFileRoute("/{-$locale}/admin/")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.ADMIN_SUBMISSIONS, params.locale);
  },
});
