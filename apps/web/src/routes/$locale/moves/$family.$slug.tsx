import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";

import { MoveOverlay, useMovesGrid } from "@/components/moves";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import { loadMove, moveHead } from "@/lib/move-route";
import { MOVES, moveNeighbours } from "@/lib/moves";

const layoutApi = getRouteApi("/$locale/moves");

const MoveRoute = () => {
  const { move, prompt, examples, related } = Route.useLoaderData();
  const { signedIn } = layoutApi.useLoaderData();
  const navigate = useLocalizedNavigate();
  // The grid behind the overlay: the one it was opened from.
  const grid = useMovesGrid();
  const { previous, next } = moveNeighbours(move.slug, grid);
  // Stepping replaces the entry, so Back still leaves the overlay.
  const open = (slug: string) => {
    const target = MOVES.find((item) => item.slug === slug);
    if (target) {
      void navigate({
        to: ROUTES.MOVE,
        params: { family: target.family, slug: target.slug },
        replace: true,
        resetScroll: false,
      });
    }
  };
  return (
    <MoveOverlay
      move={move}
      examples={examples}
      related={related}
      prompt={prompt}
      signedIn={signedIn}
      previous={previous ? () => open(previous) : undefined}
      next={next ? () => open(next) : undefined}
      onClose={() =>
        grid
          ? navigate({
              to: ROUTES.MOVE_FAMILY,
              params: { family: grid },
              resetScroll: false,
            })
          : navigate({ to: ROUTES.MOVES, resetScroll: false })
      }
    />
  );
};

// A move: `/moves/<family>/<slug>`, over the grid it was opened from (every
// move, or a family). A slug under another family's path is not a page.
export const Route = createFileRoute("/$locale/moves/$family/$slug")({
  component: MoveRoute,
  loader: async ({ params }) => {
    const data = await loadMove({ params });
    if (data.move.family !== params.family) {
      throw notFound();
    }
    return data;
  },
  head: moveHead,
});
