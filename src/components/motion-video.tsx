import { Dialog } from "@base-ui/react/dialog";
import { PreviewCard } from "@base-ui/react/preview-card";
import { Tooltip } from "@base-ui/react/tooltip";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import MediaThemeSutro from "player.style/sutro/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useIntlayer, useLocale } from "react-intlayer";
import type { IconComponent } from "reicon-react";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Check } from "reicon-react/icons/Check";
import { ChevronLeft } from "reicon-react/icons/ChevronLeft";
import { ChevronRight } from "reicon-react/icons/ChevronRight";
import { Copy } from "reicon-react/icons/Copy";
import { Maximize } from "reicon-react/icons/Maximize";
import { User } from "reicon-react/icons/User";
import { Xmark } from "reicon-react/icons/Xmark";

import { BookmarkButton } from "@/components/bookmark-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { MotionTooltip } from "@/components/ui/motion-tooltip";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { findMotionCategory } from "@/lib/motion-catalog";
import type {
  GallerySearch,
  MotionCategory,
  MotionVideo,
} from "@/lib/motion-catalog";

// Shared-element name: the card media morphs into the overlay's player.
// Slugs are `[a-z0-9-]` already; strip anything else so the ident stays valid.
const videoTransitionName = (slug: string) =>
  `video-${slug.replaceAll(/[^\w-]/gu, "")}`;

// Opens a video's overlay route over the page it was opened from: Discover
// (`/videos/$slug`) or a category page (`/category/$category/videos/$slug`).
const VideoLink = ({
  slug,
  category,
  search,
  ...props
}: Omit<ComponentPropsWithRef<"a">, "href"> & {
  slug: string;
  category: MotionCategory | undefined;
  search: GallerySearch;
}) =>
  category ? (
    <Link
      to="/category/$category/videos/$slug"
      params={{ category, slug }}
      search={search}
      resetScroll={false}
      viewTransition
      {...props}
    />
  ) : (
    <Link
      to="/videos/$slug"
      params={{ slug }}
      search={search}
      resetScroll={false}
      viewTransition
      {...props}
    />
  );

/** A creator's photo, or the user glyph when there is none or it fails to load. */
const CreatorAvatar = ({
  src,
  size,
  className,
}: {
  src: string;
  size: number;
  className: string;
}) => {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("bg-muted object-cover", className)}
    />
  ) : (
    <ReiconDuotone
      icon={User}
      aria-hidden="true"
      className={cn("bg-muted text-muted-foreground p-1", className)}
    />
  );
};

const MotionPreview = ({
  video,
  paused,
  transitionName,
}: {
  video: MotionVideo;
  paused: boolean;
  transitionName?: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const content = useIntlayer("motion-gallery");

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const updatePlayback = async () => {
      if (visible && !paused && !reducedMotion.matches && !document.hidden) {
        if (!element.getAttribute("src")) {
          element.src = video.preview;
        }
        try {
          await element.play();
        } catch {
          // Autoplay can be denied; the poster and full-video link remain usable.
        }
      } else {
        element.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        updatePlayback();
      },
      { threshold: 0.25 }
    );
    observer.observe(element);
    reducedMotion.addEventListener("change", updatePlayback);
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", updatePlayback);
      document.removeEventListener("visibilitychange", updatePlayback);
      element.pause();
    };
  }, [paused, video.preview]);

  return (
    <div
      className="bg-muted ring-foreground/5 relative overflow-hidden rounded-xl ring-1 ring-inset"
      style={{
        aspectRatio: `${video.width} / ${video.height}`,
        viewTransitionName: transitionName,
      }}
    >
      {/* Decorative muted preview; full playback is available in the detail dialog. */}
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        poster={video.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
      {failed && (
        <span className="bg-background/90 text-muted-foreground absolute top-2 left-2 rounded px-2 py-1 text-xs">
          {content.previewError}
        </span>
      )}
    </div>
  );
};

// Hovering a card for HOVER_DELAY ms opens a larger, playing preview over it.
const HOVER_DELAY = 2000;
const TOOLTIP_DELAY = 200;
// Space kept between the expanded preview and the viewport edges (px).
const PREVIEW_EDGE = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const CopyPromptButton = ({
  prompt,
  tooltip,
  style,
  size,
}: {
  prompt: string;
  tooltip: Tooltip.Handle<ReactNode>;
  style: CSSProperties;
  size: "icon" | "icon-sm";
}) => {
  const content = useIntlayer("motion-gallery");
  const [copied, setCopied] = useState(false);
  const label = copied ? content.copied.value : content.copy.value;
  return (
    <Tooltip.Trigger
      handle={tooltip}
      payload={label}
      delay={TOOLTIP_DELAY}
      render={<button type="button" aria-label={label} />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
        } catch {
          // The detail view explains clipboard failures; keep this control quiet.
        }
      }}
      style={style}
      className={cn(
        buttonVariants({ size, variant: "outline" }),
        "[view-transition-class:card-action]"
      )}
    >
      <ReiconDuotone icon={copied ? Check : Copy} aria-hidden="true" />
    </Tooltip.Trigger>
  );
};

/**
 * Copy prompt and Bookmark (the two main actions, outline) on the hovered
 * card; the expanded preview adds Open (ghost) after them. `morphId` (set on
 * one row at a time, only while the preview morphs) lets Copy and Bookmark
 * glide between the two rows.
 */
const VideoActions = ({
  video,
  tooltip,
  openLink,
  morphId,
  className,
  size = "icon",
}: {
  video: MotionVideo;
  tooltip: Tooltip.Handle<ReactNode>;
  /** Renders the Open button; the card itself already opens on click. */
  openLink?: ReactElement;
  /** Sanitized slug naming the buttons `copy-`/`bookmark-<id>`. */
  morphId: string | undefined;
  className?: string;
  /** `icon-sm` (28px) on the card, `icon` (32px) in the expanded preview. */
  size?: "icon" | "icon-sm";
}) => {
  const content = useIntlayer("motion-gallery");
  return (
    <div className={cn("flex shrink-0 gap-2", className)}>
      {video.prompt && (
        <CopyPromptButton
          prompt={video.prompt}
          tooltip={tooltip}
          style={{ viewTransitionName: morphId && `copy-${morphId}` }}
          size={size}
        />
      )}
      <BookmarkButton
        slug={video.slug}
        variant="outline"
        size={size}
        tooltip={tooltip}
        style={{ viewTransitionName: morphId && `bookmark-${morphId}` }}
        className="[view-transition-class:card-action]"
      />
      {openLink && (
        <Tooltip.Trigger
          handle={tooltip}
          payload={content.open.value}
          delay={TOOLTIP_DELAY}
          render={openLink}
          aria-label={`${content.open.value}: ${video.title}`}
          className={buttonVariants({ size: "icon", variant: "ghost" })}
        >
          <ReiconDuotone icon={Maximize} aria-hidden="true" />
        </Tooltip.Trigger>
      )}
    </div>
  );
};

export const MotionVideoCard = ({
  video,
  paused,
  open,
  category,
  search,
}: {
  video: MotionVideo;
  paused: boolean;
  /** This video's overlay route is showing; it owns the shared element. */
  open: boolean;
  /** The category page the grid shows, if any; the overlay opens over it. */
  category: MotionCategory | undefined;
  search: GallerySearch;
}) => {
  const content = useIntlayer("motion-gallery");
  const [expanded, setExpanded] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  // Floating UI centres the preview on this anchor. It is the card's rect with
  // its centre clamped so a preview of the popup's measured height stays fully
  // inside the viewport: a card cut off at the bottom zooms upwards, one cut
  // off at the top zooms downwards.
  const previewAnchor = () => {
    const card = triggerRef.current;
    if (!card) {
      return null;
    }
    return {
      contextElement: card,
      getBoundingClientRect: () => {
        const rect = card.getBoundingClientRect();
        const height = popupRef.current?.offsetHeight ?? 0;
        const low = PREVIEW_EDGE + height / 2;
        const high = Math.max(
          low,
          window.innerHeight - PREVIEW_EDGE - height / 2
        );
        const centre = clamp(rect.top + rect.height / 2, low, high);
        return new DOMRect(
          rect.left,
          centre - rect.height / 2,
          rect.width,
          rect.height
        );
      },
    };
  };
  // True while a view transition expands or collapses the preview: only then
  // do the action buttons carry shared-element names, so route transitions
  // (card → overlay) never capture them.
  const [morphing, setMorphing] = useState(false);
  // The latest requested state: Base UI can report the same change several
  // times before a view transition's update callback commits it.
  const requested = useRef(false);
  const latestTransition = useRef<ViewTransition>(null);
  // Following a detail link closes the preview without a morph; the route's
  // own view transition takes over.
  const collapse = () => {
    requested.current = false;
    setExpanded(false);
  };
  // One tooltip per card; it glides between the card's and preview's buttons.
  const tooltip = useMemo(() => Tooltip.createHandle<ReactNode>(), []);
  const morphId = video.slug.replaceAll(/[^\w-]/gu, "");
  const label = `${content.watch.value}: ${video.title}, @${video.handle}`;
  const detailLink = (
    <VideoLink
      slug={video.slug}
      category={category}
      search={search}
      onClick={collapse}
    />
  );

  // Expanding/collapsing morphs the card's action row into the preview's
  // bottom bar (and back) with the View Transitions API when available.
  const changeExpanded = async (next: boolean) => {
    if (next === requested.current) {
      return;
    }
    requested.current = next;
    if (
      !document.startViewTransition ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setExpanded(next);
      return;
    }
    // Name the outgoing row before the old state is captured.
    flushSync(() => setMorphing(true));
    const transition = document.startViewTransition(() => {
      flushSync(() => setExpanded(next));
    });
    latestTransition.current = transition;
    // `finished` always resolves, even when another transition skips this one.
    await transition.finished;
    if (latestTransition.current === transition) {
      setMorphing(false);
    }
  };

  return (
    <article className="group/card relative">
      <PreviewCard.Root open={expanded} onOpenChange={changeExpanded}>
        <PreviewCard.Trigger
          ref={triggerRef}
          delay={HOVER_DELAY}
          render={detailLink}
          aria-label={label}
          className="group focus-visible:ring-ring relative block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <MotionPreview
            video={video}
            paused={paused || expanded}
            transitionName={open ? undefined : videoTransitionName(video.slug)}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between rounded-xl bg-linear-to-t from-black/70 via-transparent to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 group-focus-visible:opacity-100">
            <div className="flex gap-1">
              {video.tags
                .filter((tag) => tag === "prompt" || tag === "skill")
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                  >
                    {tag === "prompt" ? content.prompt : content.skill}
                  </span>
                ))}
            </div>
            <h2 className="truncate pl-7 text-sm font-medium tracking-tight text-white">
              {video.title}
            </h2>
          </div>
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner
            anchor={previewAnchor}
            side="top"
            // Centre the expanded view over the card instead of beside it.
            sideOffset={({ anchor, positioner }) =>
              -(anchor.height + positioner.height) / 2
            }
            collisionAvoidance={{ side: "shift", align: "shift" }}
            collisionPadding={PREVIEW_EDGE}
            className="z-40"
          >
            <PreviewCard.Popup
              ref={popupRef}
              style={{
                // The media keeps its aspect ratio, so capping the width by
                // the viewport height (minus the 4.5rem info bar and the
                // collision padding) keeps the whole preview on screen.
                width: `min(max(24rem, calc(var(--anchor-width) * 1.4)), calc(100vw - 1.5rem), calc((100svh - 6rem) * ${video.width / video.height}))`,
                viewTransitionName:
                  morphing && expanded ? `preview-${morphId}` : undefined,
              }}
              className={cn(
                "bg-popover text-popover-foreground shadow-popover origin-(--transform-origin) overflow-hidden rounded-2xl [view-transition-class:card-preview]",
                // The view transition animates the preview while morphing;
                // otherwise (no API) it scales in and out with CSS.
                morphing
                  ? "data-closed:hidden"
                  : "transition-[scale,opacity] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 motion-reduce:transition-none"
              )}
            >
              <VideoLink
                slug={video.slug}
                category={category}
                search={search}
                onClick={collapse}
                aria-label={label}
                tabIndex={-1}
                className="bg-muted block"
                style={{ aspectRatio: `${video.width} / ${video.height}` }}
              >
                {/* Decorative muted preview, as on the card. */}
                {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={video.preview}
                  poster={video.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                  className="size-full object-cover"
                />
              </VideoLink>
              <div className="flex items-center gap-3 p-3">
                <CreatorAvatar
                  src={video.avatar}
                  size={32}
                  className="size-8 shrink-0 rounded-full"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium">{video.title}</p>
                  <a
                    href={`https://x.com/${video.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground w-fit truncate text-xs"
                  >
                    @{video.handle}
                  </a>
                </div>
                <VideoActions
                  video={video}
                  tooltip={tooltip}
                  openLink={detailLink}
                  morphId={morphing && expanded ? morphId : undefined}
                />
              </div>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
      {/* Siblings of the card link (buttons can't nest in a link); shown on
          hover or keyboard focus, clear of the tags, title and avatar. */}
      <VideoActions
        video={video}
        tooltip={tooltip}
        morphId={morphing && !expanded ? morphId : undefined}
        size="icon-sm"
        className="pointer-events-none absolute top-2.5 right-2.5 opacity-0 transition-opacity duration-200 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100 group-hover/card:pointer-events-auto group-hover/card:opacity-100 motion-reduce:transition-none"
      />
      <MotionTooltip handle={tooltip} />
      <a
        href={`https://x.com/${video.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`@${video.handle}`}
        title={`@${video.handle}`}
        className="focus-visible:ring-ring absolute bottom-2.5 left-2.5 size-5 overflow-hidden rounded-full shadow-sm ring-2 ring-white/80 transition-transform outline-none hover:scale-110 focus-visible:ring-2"
      >
        <CreatorAvatar src={video.avatar} size={20} className="size-full" />
      </a>
    </article>
  );
};

const DetailRow = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 border-t border-dashed py-2.5 text-sm first:border-t-0">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 flex-col items-end text-right">{children}</dd>
  </div>
);

const RELATIVE_UNITS = [
  ["year", 365],
  ["month", 30],
  ["week", 7],
  ["day", 1],
] as const;

/** "3 months ago" for a `YYYY-MM-DD` date, in the reader's language. */
const relativeDate = (date: string, locale: string) => {
  const days = Math.round(
    (Date.parse(date) - Date.now()) / (24 * 60 * 60 * 1000)
  );
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(days) >= size || unit === "day") {
      return format.format(Math.round(days / size), unit);
    }
  }
  return date;
};

/**
 * Previous/next in the player's control row. At either end of the grid it
 * becomes a dot that shakes when pressed: there is nothing that way.
 */
const StepButton = ({
  onStep,
  icon,
  label,
  endLabel,
}: {
  onStep?: () => void;
  icon: IconComponent;
  label: string;
  endLabel: string;
}) => {
  const [shaking, setShaking] = useState(false);
  return onStep ? (
    <Button
      variant="secondary"
      size="icon-xl"
      aria-label={label}
      onClick={onStep}
      className="rounded-full"
    >
      <ReiconDuotone icon={icon} aria-hidden="true" />
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="icon-xl"
      aria-label={endLabel}
      data-shaking={shaking || undefined}
      onClick={() => setShaking(true)}
      onAnimationEnd={() => setShaking(false)}
      className="data-shaking:animate-mv-shake rounded-full motion-reduce:animate-none"
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-current" />
    </Button>
  );
};

/**
 * Route overlay for `/videos/$slug`: the player floats over the blurred
 * gallery with details beside it. The player shares a view-transition name
 * with the card it opened from, so the card morphs into place.
 */
export const MotionVideoOverlay = ({
  video,
  onClose,
  previous,
  next,
}: {
  video: MotionVideo;
  onClose: () => void;
  /** Opens the previous/next video of the grid behind, when there is one. */
  previous?: () => void;
  next?: () => void;
}) => {
  const content = useIntlayer("motion-gallery");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );
  const [failed, setFailed] = useState(false);
  // Fades out page chrome keyed on `in-data-overlay-open` (the bottom blur).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.overlayOpen = "";
    return () => {
      delete root.dataset.overlayOpen;
    };
  }, []);
  // Arrow keys step through the grid, like the on-screen buttons.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { key, target } = event;
      // Text fields and the player (whose arrows seek) keep their keys.
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /^(?:INPUT|TEXTAREA|SELECT)$/u.test(target.tagName) ||
          target.closest("media-theme-sutro"))
      ) {
        return;
      }
      if (key === "ArrowLeft" && previous) {
        return previous();
      }
      if (key === "ArrowRight" && next) {
        return next();
      }
    };
    // Capture phase: the dialog stops arrow keys before they bubble up.
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [previous, next]);
  const types = video.tags.filter((tag) => tag === "prompt" || tag === "skill");
  const { locale } = useLocale();
  const [primaryCategory] = video.contentTags.flatMap((tag) => {
    const category = findMotionCategory(tag);
    return category ? [category] : [];
  });

  const copyPrompt = async () => {
    if (!video.prompt) {
      return;
    }
    try {
      await navigator.clipboard.writeText(video.prompt);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="bg-background/80 fixed inset-0 z-50 backdrop-blur-xl" />
        <Dialog.Popup className="fixed inset-0 z-50 overflow-y-auto outline-none lg:overflow-hidden">
          <div className="grid min-h-full gap-6 p-4 sm:p-6 lg:h-full lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
            <div className="relative min-h-[70svh] lg:min-h-0">
              {/* Clicking the empty space around the player closes, like a backdrop. */}
              <Dialog.Close
                tabIndex={-1}
                aria-hidden="true"
                className="absolute inset-0 cursor-default"
              />
              {/* The video's own colours, as a soft glow behind the player. */}
              <img
                src={video.poster}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-[8%] size-[84%] scale-110 object-cover opacity-60 blur-3xl saturate-150 dark:opacity-45"
              />
              {/* The stage is the column minus the step row (3rem buttons +
                  1rem gap). As a size container it lets the player fit both
                  ways and stay centred, whatever the video's shape. */}
              <div className="[container-type:size] pointer-events-none absolute inset-x-0 top-0 bottom-16 flex items-center justify-center">
                {/* Sutro (player.style) frame, as on the skill page. */}
                <MediaThemeSutro
                  className="pointer-events-auto relative block overflow-hidden rounded-xl shadow-2xl"
                  style={{
                    aspectRatio: `${video.width} / ${video.height}`,
                    width: `min(100cqw, calc(100cqh * ${video.width / video.height}))`,
                    viewTransitionName: videoTransitionName(video.slug),
                  }}
                >
                  {/* The source catalog does not supply caption tracks. */}
                  {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    key={video.slug}
                    slot="media"
                    src={video.video}
                    poster={video.poster}
                    autoPlay
                    playsInline
                    preload="metadata"
                    aria-label={video.title}
                    onError={() => setFailed(true)}
                    className="bg-muted size-full object-cover"
                  />
                </MediaThemeSutro>
              </div>
              {/* Pinned to the bottom centre, independent of the video's size. */}
              <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-3">
                <StepButton
                  onStep={previous}
                  icon={ChevronLeft}
                  label={content.previous.value}
                  endLabel={content.noPrevious.value}
                />
                <StepButton
                  onStep={next}
                  icon={ChevronRight}
                  label={content.next.value}
                  endLabel={content.noNext.value}
                />
              </div>
            </div>
            <aside className="flex min-h-0 flex-col gap-5 lg:overflow-y-auto lg:py-2">
              <div className="flex flex-col gap-0.5">
                {/* Category on the left, Bookmark and Close side by side on
                    the right of the same row; the title sits below. */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-muted-foreground min-w-0 truncate text-xl leading-tight font-semibold tracking-tight">
                    {primaryCategory && content.categories[primaryCategory]}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <BookmarkButton
                      slug={video.slug}
                      variant="secondary"
                      size="icon-lg"
                      className="rounded-full"
                    />
                    <Dialog.Close
                      aria-label={content.close.value}
                      className={cn(
                        buttonVariants({
                          variant: "secondary",
                          size: "icon-lg",
                        }),
                        "rounded-full"
                      )}
                    >
                      <ReiconDuotone icon={Xmark} aria-hidden="true" />
                    </Dialog.Close>
                  </div>
                </div>
                <Dialog.Title className="text-xl leading-tight font-semibold tracking-tight text-balance">
                  {video.title}
                </Dialog.Title>
              </div>
              {video.description && (
                <Dialog.Description className="text-sm leading-relaxed text-pretty">
                  {video.description}
                </Dialog.Description>
              )}
              <time
                dateTime={video.date}
                className="text-muted-foreground -mt-2 text-sm"
              >
                {relativeDate(video.date, locale)}
              </time>
              {failed && (
                <p role="alert" className="text-destructive text-sm">
                  {content.videoError}
                </p>
              )}
              <div className="flex flex-col gap-2">
                {video.tweetUrl && (
                  <a
                    href={video.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "gradient",
                      size: "lg",
                    })}
                  >
                    {content.originalPost}
                    <ReiconDuotone icon={ArrowRightUp} aria-hidden="true" />
                  </a>
                )}
                {video.skillUrl && (
                  <a
                    href={video.skillUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                    })}
                  >
                    {content.viewSkill}
                    <ReiconDuotone icon={ArrowRightUp} aria-hidden="true" />
                  </a>
                )}
              </div>
              <dl>
                <DetailRow label={content.creator}>
                  <a
                    href={`https://x.com/${video.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:underline"
                  >
                    <CreatorAvatar
                      src={video.avatar}
                      size={20}
                      className="size-5 rounded-full"
                    />
                    @{video.handle}
                  </a>
                </DetailRow>
                {video.contentTags.length > 0 && (
                  <DetailRow label={content.category}>
                    {video.contentTags.map((tag) => {
                      const category = findMotionCategory(tag);
                      return (
                        <span key={tag}>
                          {category ? content.categories[category] : tag}
                        </span>
                      );
                    })}
                  </DetailRow>
                )}
                {types.length > 0 && (
                  <DetailRow label={content.type}>
                    {types.map((tag) => (
                      <span key={tag}>
                        {tag === "prompt" ? content.prompt : content.skill}
                      </span>
                    ))}
                  </DetailRow>
                )}
              </dl>
              <section
                className="flex flex-col gap-3 border-t border-dashed pt-4"
                aria-label={content.prompt.value}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-medium">{content.prompt}</h2>
                  {video.prompt && (
                    <Button variant="outline" size="sm" onClick={copyPrompt}>
                      <ReiconDuotone
                        icon={copyStatus === "copied" ? Check : Copy}
                        aria-hidden="true"
                      />
                      {copyStatus === "copied" ? content.copied : content.copy}
                    </Button>
                  )}
                </div>
                {video.prompt ? (
                  <pre className="bg-muted max-h-72 overflow-auto rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                    {video.prompt}
                  </pre>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {content.unavailablePrompt}
                  </p>
                )}
                <output className="text-muted-foreground text-xs">
                  {copyStatus === "failed" && content.copyError}
                </output>
              </section>
            </aside>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
