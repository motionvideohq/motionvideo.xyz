import { createFileRoute } from "@tanstack/react-router";

import { LAUNCH_VIDEOS_LIVE } from "@/constants/launch-videos";
import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// The launch film template's customizer became the Launch Videos composer;
// until that section is live its old links land on the other templates.
export const Route = createFileRoute(
  "/{-$locale}/templates/launch-film/customize"
)({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(
      LAUNCH_VIDEOS_LIVE ? ROUTES.LAUNCH_VIDEOS_COMPOSE : ROUTES.TEMPLATES,
      params.locale,
      { statusCode: LAUNCH_VIDEOS_LIVE ? 301 : 302 }
    );
  },
});
