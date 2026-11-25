import { createFileRoute } from "@tanstack/react-router";

import { LAUNCH_VIDEOS_LIVE } from "@/constants/launch-videos";
import { ROUTES } from "@/constants/routes";
import { localizedRedirect } from "@/lib/localized-redirect";

// The launch film template was replaced by Launch Videos; until that section
// is live its old links land on the other templates.
export const Route = createFileRoute("/{-$locale}/templates/launch-film/")({
  beforeLoad: ({ params }) => {
    throw localizedRedirect(
      LAUNCH_VIDEOS_LIVE ? ROUTES.LAUNCH_VIDEOS : ROUTES.TEMPLATES,
      params.locale,
      { statusCode: LAUNCH_VIDEOS_LIVE ? 301 : 302 }
    );
  },
});
