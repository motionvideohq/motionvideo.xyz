import { notFound } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { MOVES, findMove } from "@/lib/moves";
import type { Move } from "@/lib/moves";
import { breadcrumbJsonLd, moveJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getMoveExamples, getMovePrompt } from "@/server/move-functions";

// Loader and head for a move's page, `/moves/<family>/<slug>`.

export const loadMove = async ({ params }: { params: { slug: string } }) => {
  const move = findMove(params.slug);
  if (!move) {
    throw notFound();
  }
  const [prompt, examples] = await Promise.all([
    getMovePrompt({ data: { slug: move.slug } }),
    getMoveExamples({ data: { slug: move.slug } }),
  ]);
  const related = move.related.flatMap((slug): Move[] => {
    const item = MOVES.find((entry) => entry.slug === slug);
    return item ? [item] : [];
  });
  return { move, prompt, examples, related };
};

// Wherever the overlay opened from, the page is the move's own URL.
export const moveHead = ({
  loaderData,
  params,
}: {
  loaderData?: { move: Move };
  params: { family: string; slug: string };
}) => {
  const path = `${ROUTES.MOVES}/${params.family}/${params.slug}`;
  return {
    ...createMetadata({
      canonical: path,
      title: loaderData
        ? `${loaderData.move.name}: motion design move`
        : "Move",
      description: loaderData?.move.summary ?? "A motion design move.",
    }),
    scripts: loaderData
      ? [
          moveJsonLd(loaderData.move),
          breadcrumbJsonLd(
            { name: "Moves", path: ROUTES.MOVES },
            { name: loaderData.move.name, path }
          ),
        ]
      : [],
  };
};
