import type { ReactNode } from "react";

import { LocalizedLink as Link } from "@/components/localized-link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/ui/button";

/**
 * Sticky filter bar shell shared by the gallery and the resource directories.
 * Pass `label` to expose it as a toolbar; otherwise it renders a plain div.
 */
export const CollectionToolbar = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => (
  <div className="bg-background/90 sticky top-0 z-30 backdrop-blur-md">
    <div
      {...(label ? { role: "toolbar", "aria-label": label } : {})}
      className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6"
    >
      {children}
    </div>
  </div>
);

/**
 * Rounded category pill for the horizontally scrolling filter row. The
 * active pill, "All" included, reads as yellow (`default`).
 *
 * Link props stay loose (`to` as a plain string) so one chip can serve every
 * section's routes; they are forwarded to TanStack's `Link`.
 */
export const CategoryChip = ({
  active,
  label,
  to,
  params,
  search,
  activeOptions,
}: {
  active: boolean;
  label: ReactNode;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string | undefined>;
  activeOptions?: { exact?: boolean; includeSearch?: boolean };
}) => (
  // SAFETY: TanStack's Link is generic over each route's params/search, so the
  // loose per-section props below are asserted at the boundary; every caller
  // passes the `to`/`params`/`search` triple of a real route.
  <Link
    resetScroll={false}
    to={to as never}
    params={params as never}
    search={search as never}
    activeOptions={activeOptions as never}
    aria-current={active ? ("page" as const) : undefined}
    className={cn(
      buttonVariants({
        variant: active ? "default" : "secondary",
      }),
      "rounded-full px-3",
      !active && "text-muted-foreground"
    )}
  >
    {label}
  </Link>
);
