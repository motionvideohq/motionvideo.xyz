import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// The brand guidelines moved under the design hub, to /design/brand.
export const Route = createFileRoute("/{-$locale}/brand")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(ROUTES.DESIGN_BRAND, params.locale, {
      statusCode: 301,
    });
  },
});
