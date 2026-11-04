import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";
import { z } from "zod";

import { CommandMenu } from "@/components/command-menu";
import { LocalizedLink as Link } from "@/components/localized-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/seo/metadata";

// Dev-only gallery of components for recording demos (posts on X). Not
// linked, not in the sitemap, noindex, and a 404 outside `vite dev`.
//
// The grid shows each component live in a square tile; a tile opens the
// component alone on a plain stage (`?c=<id>`). Only one view mounts at a
// time, so components with global shortcuts (⌘K) never run twice.
const SHOWCASE: { id: string; name: string; component: ReactNode }[] = [
  { id: "command-menu", name: "Command menu", component: <CommandMenu /> },
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
          to="/showcase"
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
          to="/showcase"
          search={{ c: item.id }}
          className="focus-visible:bg-muted hover:bg-muted/50 relative flex aspect-square items-center justify-center border-r border-b px-6 outline-none"
        >
          {/* A preview: the tile is the control, not the component. The
              component spans the tile's width (minus a small inset). */}
          <div
            inert
            className="pointer-events-none w-full *:w-full! *:max-w-none!"
          >
            {item.component}
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
