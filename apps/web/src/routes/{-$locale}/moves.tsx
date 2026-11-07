import {
  Outlet,
  createFileRoute,
  getRouteApi,
  useParams,
} from "@tanstack/react-router";
import { useState } from "react";
import { useIntlayer } from "react-intlayer";
import { HelpCircle } from "reicon-react/icons/HelpCircle";

import { CollectionGrid } from "@/components/collection-grid";
import { CollectionIntro } from "@/components/collection-intro";
import {
  CategoryChip,
  CollectionToolbar,
} from "@/components/collection-toolbar";
import { FadeScroller } from "@/components/fade-scroller";
import { LocalizedLink as Link } from "@/components/localized-link";
import { MoveCard, MovesGridContext } from "@/components/moves";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ROUTES } from "@/constants/routes";
import { MOVE_FAMILIES, findMoveFamily } from "@/lib/move-families";
import { movesIn } from "@/lib/moves";
import type { MasonryItem } from "@/registry/components/virtual-masonry";
import { buttonVariants } from "@/registry/ui/button";
import { getLandingData, getSessionFlag } from "@/server/functions";
import { getMoveCards } from "@/server/move-functions";

const routeApi = getRouteApi("/{-$locale}/moves");

/**
 * The moves grid, laid out like the gallery: family pills in the sticky
 * toolbar (each family is its own page; the active pill goes back to every
 * move), an intro tile, then a masonry of moves. A move opens as an overlay
 * route over this grid, which stays mounted with its scroll position.
 */
const Moves = () => {
  const content = useIntlayer("moves");
  const { cards } = routeApi.useLoaderData();
  const params = useParams({ strict: false });
  const openSlug = params.slug;
  // The URL's family is the grid, except under an open move, whose URL names
  // its own family: the grid stays the one it was opened from (on a direct
  // visit, the move's family).
  const urlFamily = findMoveFamily(params.family);
  const [family, setFamily] = useState(urlFamily);
  if (!openSlug && family !== urlFamily) {
    setFamily(urlFamily);
  }

  const intro = (
    <CollectionIntro
      titleId="moves-intro-title"
      title={family ? content.familyTitles[family] : content.title}
      description={family ? content.familyIntros[family] : content.intro}
      actions={
        <>
          {/* ROUTES.DOCS_MOVES, through the docs' catch-all route. */}
          <Link
            to={ROUTES.DOCS_PAGE}
            params={{ _splat: "moves" }}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <HelpCircle aria-hidden="true" />
            {content.howToUse}
          </Link>
          <Link
            to={ROUTES.PRO}
            data-track="moves_unlock"
            data-track-move="grid"
            className={buttonVariants({ variant: "gradient", size: "lg" })}
          >
            {content.unlock}
          </Link>
        </>
      }
    />
  );

  const items: MasonryItem[] = [
    { key: "intro", node: intro },
    ...movesIn(family).map((move) => {
      const media = cards[move.slug];
      return {
        key: move.slug,
        aspectRatio: media ? media.width / media.height : undefined,
        node: <MoveCard move={move} media={media} paused={Boolean(openSlug)} />,
      };
    }),
  ];

  return (
    <>
      <SiteHeader />
      <CollectionToolbar label={content.browse.value}>
        <FadeScroller
          label={content.families.value}
          className="-mx-1 -my-1 min-w-0 flex-1 px-1 py-1"
        >
          <CategoryChip
            to={ROUTES.MOVES}
            active={!family}
            label={content.all}
          />
          {MOVE_FAMILIES.map((id) =>
            family === id ? (
              <CategoryChip
                key={id}
                to={ROUTES.MOVES}
                active
                label={content.familyLabels[id]}
              />
            ) : (
              <CategoryChip
                key={id}
                to={ROUTES.MOVE_FAMILY}
                params={{ family: id }}
                active={false}
                label={content.familyLabels[id]}
              />
            )
          )}
        </FadeScroller>
      </CollectionToolbar>
      <CollectionGrid items={items} />
      <MovesGridContext value={family}>
        <Outlet />
      </MovesGridContext>
      <SiteFooter />
    </>
  );
};

// Layout for `/moves`, `/moves/$family` and the move overlays over them.
export const Route = createFileRoute("/{-$locale}/moves")({
  component: Moves,
  loader: async () => {
    const [landing, cards, signedIn] = await Promise.all([
      getLandingData(),
      getMoveCards(),
      getSessionFlag(),
    ]);
    return { ...landing, cards, signedIn };
  },
});
