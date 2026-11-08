import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Suspense, use, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { CompanyLogo } from "@/components/company-logo";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getNavPreviews } from "@/server/nav-functions";
import type { NavJob, NavPreviews, NavVideo } from "@/server/nav-functions";

// The header menus' right-hand previews. Their data comes from one server
// call, made the first time a menu is about to open and shared after that;
// a failed call is forgotten so the next open retries.

export type NavPreviewsPromise = Promise<NavPreviews | null>;

let cached: NavPreviewsPromise | null = null;

const fetchNavPreviews = async (): NavPreviewsPromise => {
  try {
    return await getNavPreviews();
  } catch {
    cached = null;
    return null;
  }
};

export const loadNavPreviews = (): NavPreviewsPromise => {
  cached ??= fetchNavPreviews();
  return cached;
};

/** What fills a preview's frame. */
export type NavMedia =
  | { kind: "video"; video: NavVideo | null }
  | { kind: "cover"; src: string | null }
  | { kind: "jobs"; listings: NavJob[] }
  | { kind: "icon"; icon: ReactNode };

export interface NavPreviewItem {
  key: string;
  /** The router link the item renders as. */
  link: ReactElement;
  title: ReactNode;
  /** Before the title in the list. */
  icon: ReactNode;
  /** Shown beside the title in the list once the previews load. */
  count?: (data: NavPreviews) => number;
  /** The caption's second line. */
  detail: (data: NavPreviews) => ReactNode;
  media: (data: NavPreviews) => NavMedia;
}

const EASE = [0.32, 0.72, 0, 1] as const;

const PreviewVideo = ({
  video,
  playing,
}: {
  video: NavVideo;
  playing: boolean;
}) =>
  // Only the shown item's clip is mounted, and only while its menu is open;
  // otherwise (and under reduced motion) the poster stands in.
  playing ? (
    <video
      src={video.preview}
      poster={video.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      className="size-full object-cover"
    />
  ) : (
    <img
      src={video.poster}
      alt=""
      decoding="async"
      className="size-full object-cover"
    />
  );

// A directory section's first cover, filling the frame.
const PreviewCover = ({ src }: { src: string | null }) =>
  src ? (
    <img src={src} alt="" decoding="async" className="size-full object-cover" />
  ) : null;

// A page without imagery of its own: its icon on a tile over a dot grid.
const PreviewIcon = ({ icon }: { icon: ReactNode }) => (
  <div className="flex size-full items-center justify-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[12px_12px]">
    <span className="bg-popover shadow-outline text-foreground flex size-12 items-center justify-center rounded-xl [&_svg]:size-5">
      {icon}
    </span>
  </div>
);

// Top-aligned and compact: the caption covers the frame's lower edge.
const PreviewJobs = ({ listings }: { listings: NavJob[] }) => (
  <ul className="flex size-full flex-col gap-1.5 p-3">
    {listings.map((job) => (
      <li
        key={job.id}
        className="bg-background shadow-outline dark:bg-popover flex items-center gap-2.5 rounded-lg p-1.5"
      >
        <CompanyLogo job={job} className="size-6 rounded-md" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{job.title}</span>
          <span className="text-muted-foreground truncate text-xs">
            {job.company}
          </span>
        </span>
      </li>
    ))}
  </ul>
);

const PreviewMedia = ({
  media,
  playing,
}: {
  media: NavMedia;
  playing: boolean;
}) => {
  switch (media.kind) {
    case "video": {
      return media.video ? (
        <PreviewVideo video={media.video} playing={playing} />
      ) : null;
    }
    case "cover": {
      return <PreviewCover src={media.src} />;
    }
    case "jobs": {
      return <PreviewJobs listings={media.listings} />;
    }
    case "icon": {
      return <PreviewIcon icon={media.icon} />;
    }
    default: {
      return null;
    }
  }
};

// The frame fills the preview column, which is as tall as the panel: every
// panel is, whatever its number of items.
const frameClass =
  "bg-muted shadow-outline absolute inset-0 overflow-hidden rounded-lg";

const PreviewSkeleton = () => (
  <Skeleton className={cn(frameClass, "shadow-none")} />
);

/**
 * The shown item's media over a caption (its title and one line). Switching
 * items crossfades both; reduced motion swaps them at once and shows posters.
 */
const Preview = ({
  item,
  previews,
  open,
}: {
  item: NavPreviewItem;
  previews: NavPreviewsPromise;
  open: boolean;
}) => {
  const data = use(previews);
  const reduceMotion = useReducedMotion() ?? false;
  const fade = { duration: reduceMotion ? 0 : 0.28, ease: EASE };
  return (
    <>
      <div aria-hidden="true" className={frameClass}>
        <AnimatePresence initial={false}>
          <motion.div
            key={item.key}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {data && (
              <PreviewMedia
                media={item.media(data)}
                playing={open && !reduceMotion}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Caption over the frame's lower edge, like a gallery card's title. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 grid rounded-b-lg bg-linear-to-t from-black/70 to-transparent px-3 pt-10 pb-2.5 text-white">
        <AnimatePresence initial={false}>
          <motion.div
            key={item.key}
            className="flex min-w-0 flex-col gap-0.5 [grid-area:1/1]"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <p className="truncate text-sm font-medium">{item.title}</p>
            {data && (
              <p className="truncate text-xs text-white/75">
                {item.detail(data)}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

const ItemCount = ({
  item,
  previews,
}: {
  item: NavPreviewItem;
  previews: NavPreviewsPromise;
}) => {
  const data = use(previews);
  const total = data && item.count ? item.count(data) : 0;
  return total > 0 ? (
    <span className="text-muted-foreground ms-auto text-xs tabular-nums">
      {total}
    </span>
  ) : null;
};

/**
 * A menu panel: the items as a list on the left, and a large preview of the
 * one under the pointer (or focus) on the right; the first by default. It
 * fills the panel; the list and the preview split its width.
 */
export const NavPreviewMenu = ({
  items,
  active,
  onActive,
  previews,
  open,
}: {
  items: NavPreviewItem[];
  active: string;
  onActive: (key: string) => void;
  /** `null` until a menu first opens. */
  previews: NavPreviewsPromise | null;
  /** Whether this panel's menu is open; clips only play while it is. */
  open: boolean;
}) => {
  const shown = items.find((item) => item.key === active) ?? items[0];
  return (
    // The panel's padding (NavigationMenuContent's p-1) and this gap match,
    // so the list and the preview sit evenly in the popup.
    <div className="grid size-full grid-cols-2 gap-1">
      <ul className="flex min-w-0 flex-col gap-px">
        {items.map((item) => (
          <li key={item.key}>
            <NavigationMenuLink
              render={item.link}
              data-previewing={item.key === shown?.key ? "" : undefined}
              onPointerEnter={() => onActive(item.key)}
              onFocus={() => onActive(item.key)}
              className="text-muted-foreground data-previewing:bg-nav-hover data-previewing:text-foreground rounded-lg px-3 font-medium whitespace-nowrap transition-colors"
            >
              {item.icon}
              <span className="truncate">{item.title}</span>
              {previews && (
                <Suspense fallback={null}>
                  <ItemCount item={item} previews={previews} />
                </Suspense>
              )}
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
      <div className="relative">
        {previews && shown ? (
          <Suspense fallback={<PreviewSkeleton />}>
            <Preview item={shown} previews={previews} open={open} />
          </Suspense>
        ) : (
          <PreviewSkeleton />
        )}
      </div>
    </div>
  );
};

export interface NavCardItem {
  key: string;
  /** The router link the card renders as. */
  link: ReactElement;
  title: ReactNode;
  /** Before the title. */
  icon: ReactNode;
  /** One or two lines under the title. */
  detail: ReactNode;
  media: (data: NavPreviews) => NavMedia;
}

const CardMedia = ({
  item,
  previews,
  playing,
}: {
  item: NavCardItem;
  previews: NavPreviewsPromise;
  playing: boolean;
}) => {
  const data = use(previews);
  return data ? (
    <span className="absolute inset-0">
      <PreviewMedia media={item.media(data)} playing={playing} />
    </span>
  ) : null;
};

/**
 * A menu panel for a few pages: one card each, side by side, filling the
 * panel. A card's clip plays while it's under the pointer (or focused).
 */
export const NavCardMenu = ({
  items,
  previews,
  open,
}: {
  items: NavCardItem[];
  /** `null` until a menu first opens. */
  previews: NavPreviewsPromise | null;
  /** Whether this panel's menu is open; clips only play while it is. */
  open: boolean;
}) => {
  const reduceMotion = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <ul
      className="grid size-full auto-cols-fr grid-flow-col gap-1"
      onPointerLeave={() => setHovered(null)}
    >
      {items.map((item) => (
        <li key={item.key} className="flex min-w-0">
          <NavigationMenuLink
            render={item.link}
            onPointerEnter={() => setHovered(item.key)}
            onFocus={() => setHovered(item.key)}
            onBlur={() => setHovered(null)}
            className="text-muted-foreground hover:text-foreground focus:text-foreground h-full w-full flex-col items-stretch gap-0 p-1 transition-colors"
          >
            <span
              aria-hidden="true"
              className="bg-muted shadow-outline relative min-h-0 flex-1 overflow-hidden rounded-md"
            >
              {previews ? (
                <Suspense fallback={<PreviewSkeleton />}>
                  <CardMedia
                    item={item}
                    previews={previews}
                    playing={open && hovered === item.key && !reduceMotion}
                  />
                </Suspense>
              ) : (
                <PreviewSkeleton />
              )}
            </span>
            <span className="flex flex-col gap-0.5 px-1.5 pt-2 pb-1">
              <span className="flex items-center gap-2 font-medium">
                {item.icon}
                <span className="truncate">{item.title}</span>
              </span>
              <span className="text-muted-foreground line-clamp-2 text-xs">
                {item.detail}
              </span>
            </span>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  );
};
