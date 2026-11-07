import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";
import { z } from "zod";

import { CommandMenu } from "@/components/command-menu";
import { LocalizedLink as Link } from "@/components/localized-link";
import { Logo } from "@/components/logo";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/ui/button";
import { createMetadata } from "@/seo/metadata";

// The logo (logomark and name) in each season, the default (no season) first.
// Zoomed from header size so the festive detail reads; hover them on the
// stage.
const LOGO_SEASONS = [
  { season: null, name: "Default" },
  { season: "republic-day-india", name: "Republic Day (India)" },
  { season: "holi", name: "Holi" },
  { season: "independence-day-us", name: "Independence Day (US)" },
  { season: "independence-day-india", name: "Independence Day (India)" },
  { season: "halloween", name: "Halloween" },
  { season: "diwali", name: "Diwali" },
  { season: "thanksgiving", name: "Thanksgiving" },
  { season: "christmas", name: "Christmas" },
] as const;

// Stacked, label over logo, so each logo can take the stage's full width.
const LogoSheet = () => (
  <div className="flex flex-col gap-16 font-semibold tracking-tight">
    {LOGO_SEASONS.map(({ season, name }) => (
      <div key={name} className="flex flex-col items-center gap-6">
        <span className="text-muted-foreground text-base font-medium tracking-normal">
          {name}
        </span>
        <div className="flex [zoom:3]">
          <Logo season={season} />
        </div>
      </div>
    ))}
  </div>
);

// Dev-only gallery of components for recording demos (posts on X). Not
// linked, not in the sitemap, noindex, and a 404 outside `vite dev`.
//
// The grid shows each component live in a square tile (or its `preview`, if
// the stage shows more); a tile opens the component alone on a plain stage
// (`?c=<id>`). Only one view mounts at a time, so components with global
// shortcuts (⌘K) never run twice.
const SHOWCASE: {
  id: string;
  name: string;
  component: ReactNode;
  preview?: ReactNode;
}[] = [
  { id: "command-menu", name: "Command menu", component: <CommandMenu /> },
  {
    id: "logo",
    name: "Logo",
    component: <LogoSheet />,
    preview: (
      <div className="flex [zoom:2] justify-center font-semibold tracking-tight">
        <Logo season={null} />
      </div>
    ),
  },
];

interface ShowcaseSearch {
  c?: string;
}

const Showcase = () => {
  const { c } = Route.useSearch();
  const shown = SHOWCASE.find((item) => item.id === c);

  if (shown) {
    return (
      <main className="bg-background relative flex min-h-svh items-center justify-center p-6">
        <Link
          to={ROUTES.SHOWCASE}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "absolute top-4 left-4"
          )}
        >
          <ArrowLeft data-icon="inline-start" />
          {shown.name}
        </Link>
        {/* Stretched to the stage's column, like in a tile. */}
        <div className="w-full max-w-md *:w-full! *:max-w-none!">
          {shown.component}
        </div>
      </main>
    );
  }

  return (
    // Edge to edge; each tile draws its right and bottom border, so the lines
    // fall between tiles.
    <main className="grid min-h-svh w-full auto-rows-min grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {SHOWCASE.map((item) => (
        <Link
          key={item.id}
          to={ROUTES.SHOWCASE}
          search={{ c: item.id }}
          className="focus-visible:bg-muted hover:bg-muted/50 relative flex aspect-square items-center justify-center border-r border-b px-6 outline-none"
        >
          {/* A preview: the tile is the control, not the component. The
              component spans the tile's width (minus a small inset). */}
          <div
            inert
            className="pointer-events-none w-full *:w-full! *:max-w-none!"
          >
            {item.preview ?? item.component}
          </div>
          <span className="text-muted-foreground absolute bottom-3 left-4 text-xs">
            {item.name}
          </span>
        </Link>
      ))}
    </main>
  );
};

export const Route = createFileRoute("/$locale/showcase")({
  component: Showcase,
  staticData: { noIndex: true },
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  validateSearch: (search): ShowcaseSearch => ({
    c: z.string().safeParse(search.c).data,
  }),
  head: () => createMetadata({ title: "Showcase" }),
});
