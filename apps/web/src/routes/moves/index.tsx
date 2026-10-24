import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { MOVES } from "@/lib/moves";
import { movesJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// The grid renders in the `/moves` layout; this route owns `/moves` itself.
export const Route = createFileRoute("/moves/")({
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.MOVES,
      title: "Motion design moves",
      description: `${MOVES.length} named motion design techniques, from easing and squash and stretch to kinetic type and transitions, each with examples from AI-made videos on ${SITE.NAME}.`,
    }),
    scripts: [movesJsonLd(MOVES)],
  }),
});
