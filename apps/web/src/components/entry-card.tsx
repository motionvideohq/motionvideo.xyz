import type { ReactNode } from "react";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { LocalizedLink as Link } from "@/components/localized-link";
import type { VideoPick } from "@/lib/video-picks";

/**
 * A card linking to one entry of a list page (blog posts, changelog
 * releases): cover poster on the left, then title, description and a meta
 * line (a date) with an arrow. Matches the /templates cards.
 */
export const EntryCard = ({
  to,
  params,
  cover,
  title,
  description,
  meta,
}: {
  /** App path of the entry's route, e.g. "/blog/$slug". */
  to: string;
  params?: Record<string, string>;
  cover: VideoPick | undefined;
  title: ReactNode;
  description: ReactNode;
  meta: ReactNode;
}) => (
  <Link
    to={to}
    params={params}
    className="group bg-card shadow-outline hover:bg-muted/60 flex flex-col gap-4 overflow-hidden rounded-xl p-3 transition-colors sm:flex-row"
  >
    <span className="bg-muted aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
      {cover && (
        <img
          src={cover.poster}
          alt=""
          width={cover.width}
          height={cover.height}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      )}
    </span>
    <span className="flex min-w-0 flex-col gap-2 py-1 sm:pr-2">
      <h2 className="text-lg font-semibold tracking-tight text-balance">
        {title}
      </h2>
      <span className="text-muted-foreground text-sm text-pretty">
        {description}
      </span>
      <span className="text-muted-foreground mt-auto flex items-center gap-1.5 pt-1 text-xs">
        {meta}
        <ArrowRight
          aria-hidden="true"
          className="group-hover:text-foreground ml-auto size-4 transition-colors"
        />
      </span>
    </span>
  </Link>
);
