import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { findMotionCreator } from "@/lib/motion-creators";

export const Route = createFileRoute("/$locale/_gallery/creators/$creator")({
  loader: ({ params }) => {
    const creator = findMotionCreator(params.creator);
    if (!creator) {
      throw notFound();
    }
    if (params.creator !== creator.handle) {
      throw redirect({
        to: "/$locale/creators/$creator",
        params: { locale: params.locale, creator: creator.handle },
        statusCode: 301,
      });
    }
    return creator;
  },
});
