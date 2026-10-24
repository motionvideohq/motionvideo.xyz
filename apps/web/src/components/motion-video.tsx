import { Dialog } from "@base-ui/react/dialog";
import { Link } from "@tanstack/react-router";
import MediaThemeSutro from "player.style/sutro/react";
import {
  Fragment,
  useCallback,
  useId,
  useEffect,
  useRef,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { flushSync } from "react-dom";
import { useIntlayer, useLocale } from "react-intlayer";
import type { IconComponent } from "reicon-react";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { ChevronLeft } from "reicon-react/icons/ChevronLeft";
import { ChevronRight } from "reicon-react/icons/ChevronRight";
import { Sliders } from "reicon-react/icons/Sliders";
import { User } from "reicon-react/icons/User";
import { Xmark } from "reicon-react/icons/Xmark";

import { BookmarkButton } from "@/components/bookmark-button";
import { CopyIcon } from "@/components/copy-icon";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { SponsoredCard } from "@/components/sponsored-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  SharedTooltip,
  createTooltipHandle,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { track } from "@/lib/analytics";
import {
  findEffort,
  findIterations,
  findMotionCategory,
  motionModelSlug,
} from "@/lib/motion-catalog";
import type {
  GalleryScope,
  GallerySearch,
  MotionVideo,
} from "@/lib/motion-catalog";
import { promptFor } from "@/lib/prompt-translations";
import { relativeDate } from "@/lib/relative-date";
import { cn } from "@/lib/utils";

// Shared-element name: the card media morphs into the overlay's player.
// Slugs are `[a-z0-9-]` already; strip anything else so the ident stays valid.
const videoTransitionName = (slug: string) =>
  `video-${slug.replaceAll(/[^\w-]/gu, "")}`;

// Only one card carries the shared name: the one the overlay opens from and
// closes back into. Naming every card made each visible card its own
// view-transition layer, painted above the overlay's backdrop for the whole
// morph, so the grid flashed over the opening player.
let morphSlug: string | null = null;
const morphListeners = new Set<() => void>();
const subscribeMorph = (listener: () => void) => {
  morphListeners.add(listener);
  return () => {
    morphListeners.delete(listener);
  };
};

/**
 * Picks the card that morphs into the overlay (`null`: none). Call it right
 * before a view-transition navigation: the DOM updates synchronously, so the
 * old-state snapshot already carries the name.
 */
export const setMorphCard = (slug: string | null) => {
  if (morphSlug === slug) {
    return;
  }
  morphSlug = slug;
  flushSync(() => {
    for (const listener of morphListeners) {
      listener();
    }
  });
};

// The overlay's current video is the card it closes back into. Its card is
// unnamed while open and re-renders on close, so no listeners need waking.
const rememberMorphCard = (slug: string) => {
  morphSlug = slug;
};

// Stepping crossfades player to player; no grid card may morph meanwhile.
const stepPlayer = (go: () => void) => {
  setMorphCard(null);
  go();
};

/** Opens a video's overlay over the page the grid belongs to (`scope`). */
const VideoLink = ({
  slug,
  scope,
  search,
  ...props
}: Omit<ComponentPropsWithRef<"a">, "href"> & {
  slug: string;
  scope: GalleryScope | undefined;
  search: GallerySearch;
}) => {
  const shared = { search, resetScroll: false, viewTransition: true, ...props };
  switch (scope?.kind) {
    case "category": {
      return (
        <Link
          to="/category/$category/videos/$slug"
          params={{ category: scope.category, slug }}
          {...shared}
        />
      );
    }
    case "model": {
      return (
        <Link
          to="/model/$model/videos/$slug"
          params={{ model: motionModelSlug(scope.model), slug }}
          {...shared}
        />
      );
    }
    case "type": {
      return (
        <Link
          to="/type/$type/videos/$slug"
          params={{ type: scope.type, slug }}
          {...shared}
        />
      );
    }
    default: {
      return <Link to="/videos/$slug" params={{ slug }} {...shared} />;
    }
  }
};

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
    <User
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
      className="bg-muted shadow-outline relative overflow-hidden rounded-xl"
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

const TOOLTIP_DELAY = 200;

// Actions that stay hidden until the card is hovered or keyboard-focused.
// Kept in one place so the prompt and source controls reveal identically.
const HOVER_ACTION =
  "pointer-events-none absolute opacity-0 transition-opacity duration-200 group-has-[:focus-visible]/card:pointer-events-auto group-has-[:focus-visible]/card:opacity-100 group-hover/card:pointer-events-auto group-hover/card:opacity-100 motion-reduce:transition-none [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100";

/**
 * Copy prompt and Bookmark (the two main actions, outline) on the card.
 */
const VideoActions = ({
  video,
  size = "icon",
  bookmarkAlwaysVisible = false,
}: {
  video: MotionVideo;
  /** `icon-sm` (28px) on the card. */
  size?: "icon" | "icon-sm";
  /** Keep the bookmark visible instead of revealing it with the card hover. */
  bookmarkAlwaysVisible?: boolean;
}) => {
  // One tooltip for both buttons: moving between them slides it across and
  // morphs the label instead of closing one and opening another.
  const tooltip = useMemo(() => createTooltipHandle<ReactNode>(), []);
  const { locale } = useLocale();
  const prompt = promptFor(video, locale);
  const bookmark = (
    <BookmarkButton
      kind="video"
      id={video.slug}
      variant="outline"
      size={size}
      className="rounded-full"
      tooltip={tooltip}
    />
  );
  const copyPrompt = prompt ? (
    <CopyPromptButton
      prompt={prompt.text}
      analytics={{ from: "card" }}
      size={size}
      className="rounded-full"
      tooltip={tooltip}
    />
  ) : null;

  if (bookmarkAlwaysVisible) {
    return (
      <>
        <div className="absolute top-2.5 right-2.5">{bookmark}</div>
        {copyPrompt && (
          <div className={cn(HOVER_ACTION, "top-2.5 right-12")}>
            {copyPrompt}
          </div>
        )}
        <SharedTooltip handle={tooltip} />
      </>
    );
  }

  return (
    <div
      className={cn("flex shrink-0 gap-2", HOVER_ACTION, "top-2.5 right-2.5")}
    >
      {copyPrompt}
      {bookmark}
      <SharedTooltip handle={tooltip} />
    </div>
  );
};

export const MotionVideoCard = ({
  video,
  paused,
  open,
  scope,
  search,
  onOpen,
  bookmarkAlwaysVisible = false,
}: {
  video: MotionVideo;
  paused: boolean;
  /** This video's overlay route is showing; it owns the shared element. */
  open: boolean;
  /** The page the grid shows (Discover when undefined); the overlay opens over it. */
  scope: GalleryScope | undefined;
  search: GallerySearch;
  /**
   * Opens the overlay over the current page (Bookmarks, Featured) instead of
   * Discover. The link still points at the video's own page, so a new tab
   * or a copied link works.
   */
  onOpen?: () => void;
  /** Keep the bookmark visible on the card instead of only on hover. */
  bookmarkAlwaysVisible?: boolean;
}) => {
  const content = useIntlayer("motion-gallery");
  const label = `${content.watch.value}: ${video.title}, @${video.handle}`;
  const morph = useSyncExternalStore(
    subscribeMorph,
    () => morphSlug === video.slug,
    () => false
  );

  return (
    <article className="group/card relative">
      <VideoLink
        slug={video.slug}
        scope={scope}
        search={search}
        aria-label={label}
        onClick={(event) => {
          if (
            onOpen &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            event.button === 0
          ) {
            event.preventDefault();
            onOpen();
            return;
          }
          setMorphCard(video.slug);
        }}
        className="group focus-visible:ring-ring relative block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <MotionPreview
          video={video}
          paused={paused}
          transitionName={
            morph && !open ? videoTransitionName(video.slug) : undefined
          }
        />
        {/* Plain hover state: tags and title over a bottom gradient. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between rounded-xl bg-linear-to-t from-black/70 via-transparent to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
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
          <h2 className="h-7 truncate pr-10 pl-10 text-sm leading-7 font-medium tracking-tight text-white">
            {video.title}
          </h2>
        </div>
      </VideoLink>
      {/* Siblings of the card link (buttons can't nest in a link); shown on
          hover or keyboard focus, clear of the tags, title and avatar. The
          bookmark stays visible on the Bookmarks page. */}
      {/* One provider for the card's actions, so their tooltips share
          open state and morph between labels instead of blinking. */}
      <TooltipProvider>
        <VideoActions
          video={video}
          size="icon-sm"
          bookmarkAlwaysVisible={bookmarkAlwaysVisible}
        />
        {/* The creator's original post, like the top-right actions but pinned
            bottom-right; the same link as the detail view's "View source". */}
        {video.tweetUrl && (
          <Tooltip>
            <TooltipTrigger
              delay={TOOLTIP_DELAY}
              render={
                <a
                  href={video.tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={content.viewSource.value}
                  data-track="source_click"
                  data-track-from="card"
                  data-track-slug={video.slug}
                />
              }
              // A real CTA (the card itself opens the detail view), so it
              // matches the copy-prompt and bookmark buttons.
              className={cn(
                buttonVariants({ size: "icon-sm", variant: "outline" }),
                "rounded-full",
                HOVER_ACTION,
                "right-2.5 bottom-2.5"
              )}
            >
              <ArrowRightUp aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{content.viewSource.value}</TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
      <a
        href={`https://x.com/${video.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`@${video.handle}`}
        title={`@${video.handle}`}
        className="focus-visible:ring-ring absolute bottom-2.5 left-2.5 size-7 overflow-hidden rounded-full shadow-sm transition-transform outline-none hover:scale-110 focus-visible:ring-2"
      >
        <CreatorAvatar src={video.avatar} size={28} className="size-full" />
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
  // Dashed lines between rows, and above the first and below the last.
  <div className="flex items-start justify-between gap-4 border-t border-dashed py-2.5 text-sm last:border-b">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 flex-col items-end text-right">{children}</dd>
  </div>
);

/** How the video was made (model, stack, effort, rounds), when reported. */
const MakingRows = ({ video }: { video: MotionVideo }) => {
  const content = useIntlayer("motion-gallery");
  const effort = findEffort(video.effort);
  const iterations = findIterations(video.iterations);
  return (
    <>
      {video.model && (
        <DetailRow label={content.model}>{video.model}</DetailRow>
      )}
      {video.stack && (
        <DetailRow label={content.stack}>{video.stack}</DetailRow>
      )}
      {effort && (
        <DetailRow label={content.effort}>{content.efforts[effort]}</DetailRow>
      )}
      {iterations && (
        <DetailRow label={content.iterations}>
          {content.iterationCounts[iterations]}
        </DetailRow>
      )}
    </>
  );
};

// Text-link style for the small actions under the prompt.
const PROMPT_LINK =
  "text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm text-xs font-medium outline-none hover:underline focus-visible:ring-3";

/**
 * The detail view's prompt. Long prompts fold to a fixed height with a fade
 * and a Show all link, so the details below stay in reach without a scroll
 * box inside the scrolling panel. `aside` sits on the same row, at the end
 * (the translation switch). Key it by video: each prompt starts folded and
 * is measured once.
 */
const PromptText = ({
  prompt,
  lang,
  aside,
}: {
  prompt: string;
  lang?: string;
  aside?: ReactNode;
}) => {
  const content = useIntlayer("motion-gallery");
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  // Measured after mount (the server cannot know): until then the prompt
  // renders folded without the toggle.
  const [overflows, setOverflows] = useState(false);
  const measure = useCallback((element: HTMLPreElement | null) => {
    if (element) {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    }
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full">
        <pre
          id={id}
          ref={measure}
          lang={lang}
          className={cn(
            "bg-muted rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap",
            !expanded && "max-h-72 overflow-hidden"
          )}
        >
          {prompt}
        </pre>
        {overflows && !expanded && (
          <div
            aria-hidden="true"
            className="from-muted pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-xl bg-linear-to-t to-transparent"
          />
        )}
      </div>
      {(overflows || aside) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          {overflows ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={id}
              onClick={() => setExpanded(!expanded)}
              className={PROMPT_LINK}
            >
              {expanded ? content.showLess : content.showAll}
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-3.5 transition-transform motion-reduce:transition-none",
                  expanded && "rotate-180"
                )}
              />
            </button>
          ) : (
            <span />
          )}
          {aside}
        </div>
      )}
    </div>
  );
};

// The original's language in its own script: "中文 → EN" reads in any locale.
const LANGUAGE_NAMES = { zh: "中文", ja: "日本語" } as const;

// Hosts the detail view's source button names, by registrable domain.
const SOURCE_ACTIONS = {
  "x.com": "openOnX",
  "twitter.com": "openOnX",
  "youtube.com": "watchOnYouTube",
  "youtu.be": "watchOnYouTube",
  "github.com": "viewOnGitHub",
} as const;

type SourceAction =
  | (typeof SOURCE_ACTIONS)[keyof typeof SOURCE_ACTIONS]
  | "visitWebsite";

/**
 * What the detail view's source button says for this URL: "Open on X" for a
 * post, "Watch on YouTube", "View on GitHub", else "Visit website". Cards
 * always say "View source".
 */
const sourceAction = (url: string): SourceAction => {
  const host = URL.parse(url)?.hostname.replace(/^(?:www|m|mobile)\./u, "");
  return (
    Object.entries(SOURCE_ACTIONS).find(([domain]) => domain === host)?.[1] ??
    "visitWebsite"
  );
};

/**
 * Previous/next beside Bookmark in the panel's top row. At either end of the
 * grid the arrow stays, disabled: there is nothing that way.
 */
const StepButton = ({
  onStep,
  icon: Icon,
  label,
  endLabel,
}: {
  onStep?: () => void;
  icon: IconComponent;
  label: string;
  endLabel: string;
}) => (
  <Button
    variant="secondary"
    size="icon-lg"
    aria-label={onStep ? label : endLabel}
    disabled={!onStep}
    onClick={onStep}
    className="rounded-full"
  >
    <Icon aria-hidden="true" />
  </Button>
);

/**
 * The detail view's prompt: copy button and folded text. English visitors
 * get a translation of non-English prompts, with "Show original" to switch
 * back. Key it by video so each one starts on the translation.
 */
const PromptSection = ({ video }: { video: MotionVideo }) => {
  const content = useIntlayer("motion-gallery");
  const { locale } = useLocale();
  const [copyStatus, setCopyStatus] = useTransientStatus<
    "idle" | "copied" | "failed"
  >("idle");
  const [showOriginal, setShowOriginal] = useState(false);
  const translated = promptFor(video, locale);
  const prompt =
    translated?.translatedFrom && showOriginal
      ? { text: video.prompt ?? translated.text }
      : translated;

  const copyPrompt = async () => {
    if (!prompt) {
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt.text);
      track("prompt_copy", { from: "detail", slug: video.slug });
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className="flex flex-col gap-3" aria-label={content.prompt.value}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{content.prompt}</h2>
        {prompt && (
          <div className="flex gap-2">
            <Link
              to="/customize/$slug"
              params={{ slug: video.slug }}
              data-track="customize_click"
              data-track-slug={video.slug}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Sliders aria-hidden="true" />
              {content.customize}
            </Link>
            <Button variant="outline" size="sm" onClick={copyPrompt}>
              <CopyIcon copied={copyStatus === "copied"} />
              {copyStatus === "copied" ? content.copied : content.copyShort}
            </Button>
          </div>
        )}
      </div>
      {prompt ? (
        <PromptText
          key={showOriginal ? "original" : "shown"}
          prompt={prompt.text}
          lang={prompt.translatedFrom ? "en" : translated?.translatedFrom}
          aside={
            translated?.translatedFrom && (
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <span
                  title={
                    showOriginal
                      ? content.originalIn[translated.translatedFrom].value
                      : content.translatedFrom[translated.translatedFrom].value
                  }
                >
                  {LANGUAGE_NAMES[translated.translatedFrom]}
                  {!showOriginal && " → EN"}
                </span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  className={PROMPT_LINK}
                  onClick={() => setShowOriginal(!showOriginal)}
                >
                  {showOriginal
                    ? content.showTranslation
                    : content.showOriginal}
                </button>
              </p>
            )
          }
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          {content.unavailablePrompt}
        </p>
      )}
      <output className="text-muted-foreground text-xs">
        {copyStatus === "failed" && content.copyError}
      </output>
    </section>
  );
};

/**
 * The detail view's skill, for videos made with one: a link to its
 * repository and the command that installs it. Key it by video.
 */
const SkillSection = ({ video }: { video: MotionVideo }) => {
  const content = useIntlayer("motion-gallery");
  const [copyStatus, setCopyStatus] = useTransientStatus<
    "idle" | "copied" | "failed"
  >("idle");
  if (!video.skillUrl) {
    return null;
  }
  const { skillInstall } = video;
  const copyLabel =
    copyStatus === "copied" ? content.copied.value : content.copyCommand.value;

  const copyInstall = async () => {
    if (!skillInstall) {
      return;
    }
    try {
      await navigator.clipboard.writeText(skillInstall);
      track("skill_install_copy", { slug: video.slug });
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className="flex flex-col gap-3" aria-label={content.skill.value}>
      {/* Same header row as the prompt: View repo where Copy sits there. */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{content.skill}</h2>
        <a
          href={video.skillUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-track="skill_click"
          data-track-slug={video.slug}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {content.viewRepo}
          <ArrowRightUp aria-hidden="true" />
        </a>
      </div>
      {skillInstall && (
        <div className="bg-muted flex items-start gap-2 rounded-xl py-1.5 pr-1.5 pl-4">
          {/* Wraps between words only (never at a hyphen), so a long command
              stays readable in full. Words in a command don't repeat. */}
          <code className="min-w-0 flex-1 py-1.5 font-mono text-xs leading-relaxed">
            {skillInstall.split(" ").map((word) => (
              <Fragment key={word}>
                <span className="whitespace-nowrap">{word}</span>{" "}
              </Fragment>
            ))}
          </code>
          <Tooltip>
            <TooltipTrigger
              delay={TOOLTIP_DELAY}
              // Its label changes to "Copied" on click: stay open.
              closeOnClick={false}
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={copyInstall}
                  aria-label={copyLabel}
                />
              }
            >
              <CopyIcon copied={copyStatus === "copied"} />
            </TooltipTrigger>
            <TooltipContent>{copyLabel}</TooltipContent>
          </Tooltip>
        </div>
      )}
      <output className="text-muted-foreground text-xs">
        {copyStatus === "failed" && content.copyError}
      </output>
    </section>
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
  previous: goPrevious,
  next: goNext,
}: {
  video: MotionVideo;
  onClose: () => void;
  /** Opens the previous/next video of the grid behind, when there is one. */
  previous?: () => void;
  next?: () => void;
}) => {
  const content = useIntlayer("motion-gallery");
  const [failed, setFailed] = useState(false);
  // Every detail video starts playing. `autoPlay` alone was inconsistent:
  // browsers block unmuted autoplay without a recent user gesture (or, in
  // Safari, only for videos that have sound), so some clips stayed paused.
  // Try with sound first; if the browser refuses, play muted instead.
  // Stable, so it runs once per mounted <video> (keyed by slug) and never
  // restarts a clip the viewer paused.
  const autoplay = useCallback((element: HTMLVideoElement | null) => {
    if (!element) {
      return;
    }
    const start = async () => {
      try {
        await element.play();
      } catch {
        element.muted = true;
        try {
          await element.play();
        } catch {
          // Still blocked (e.g. data saver): leave the poster and controls.
        }
      }
    };
    void start();
  }, []);
  // One event per video shown, however it was opened (card, arrows, link).
  useEffect(() => {
    track("video_open", { slug: video.slug });
  }, [video.slug]);
  // Fades out page chrome keyed on `in-data-overlay-open` (the bottom blur).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.overlayOpen = "";
    return () => {
      delete root.dataset.overlayOpen;
    };
  }, []);
  useEffect(() => {
    rememberMorphCard(video.slug);
  }, [video.slug]);
  const previous = goPrevious && (() => stepPlayer(goPrevious));
  const next = goNext && (() => stepPlayer(goNext));
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
      if (key === "ArrowLeft" && goPrevious) {
        return stepPlayer(goPrevious);
      }
      if (key === "ArrowRight" && goNext) {
        return stepPlayer(goNext);
      }
    };
    // Capture phase: the dialog stops arrow keys before they bubble up.
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [goPrevious, goNext]);
  const types = video.tags.filter((tag) => tag === "prompt" || tag === "skill");
  const { locale } = useLocale();
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
          <div className="grid min-h-full lg:h-full lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Full-bleed frosted stage: the whole page is blurred, so the
                empty space around the player reads as dismissible. */}
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
              {/* Inset so the video never touches the viewport edges. As a
                  size container it lets the player fit both ways and stay
                  centred, whatever the video's shape. */}
              <div className="[container-type:size] pointer-events-none absolute inset-5 flex items-center justify-center">
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
                    ref={autoplay}
                    playsInline
                    preload="metadata"
                    aria-label={video.title}
                    onError={() => setFailed(true)}
                    className="bg-muted size-full object-cover"
                  />
                </MediaThemeSutro>
              </div>
            </div>
            <aside className="bg-background flex min-h-0 flex-col gap-5 border-t p-5 lg:h-full lg:overflow-y-auto lg:border-t-0 lg:border-l">
              <div className="flex flex-col gap-3">
                {/* Close on the left; Bookmark, then previous/next, on the
                    right; the title below. */}
                <div className="flex items-center justify-between gap-2">
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
                    <Xmark aria-hidden="true" />
                  </Dialog.Close>
                  <div className="flex shrink-0 gap-2">
                    <BookmarkButton
                      kind="video"
                      id={video.slug}
                      variant="secondary"
                      size="icon-lg"
                      className="rounded-full"
                      inDialog
                    />
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
                <Dialog.Title className="text-xl leading-tight font-semibold tracking-tight text-balance">
                  {video.title}
                </Dialog.Title>
                {/* Avatar, then name over @handle: the two lines match the
                    avatar's 40px height. */}
                <a
                  href={`https://x.com/${video.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/creator flex items-center gap-3 self-start"
                >
                  <CreatorAvatar
                    src={video.avatar}
                    size={40}
                    className="size-10 shrink-0 rounded-full"
                  />
                  <span className="flex h-10 min-w-0 flex-col justify-center text-sm leading-5">
                    <span className="truncate font-medium group-hover/creator:underline">
                      {video.creatorName ?? `@${video.handle}`}
                    </span>
                    <span className="text-muted-foreground truncate">
                      @{video.handle}
                    </span>
                  </span>
                </a>
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
                    data-track="source_click"
                    data-track-from="detail"
                    data-track-slug={video.slug}
                    className={buttonVariants({
                      variant: "gradient",
                      size: "lg",
                    })}
                  >
                    {content[sourceAction(video.tweetUrl)]}
                    <ArrowRightUp aria-hidden="true" />
                  </a>
                )}
              </div>
              <dl>
                {/* Diamond's third placement: the first details row, beside
                    every video. Renders nothing until a Diamond is live. */}
                <SponsoredCard placement="sidebar" />
                {video.contentTags.length > 0 && (
                  <DetailRow label={content.category}>
                    {video.contentTags.map((tag) => {
                      const category = findMotionCategory(tag);
                      return category ? (
                        <Link
                          key={tag}
                          to="/category/$category"
                          params={{ category }}
                          className="hover:underline"
                        >
                          {content.categories[category]}
                        </Link>
                      ) : (
                        <span key={tag}>{tag}</span>
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
                <MakingRows video={video} />
              </dl>
              {/* A skill video without a prompt shows only the skill. */}
              {(video.prompt || !video.skillUrl) && (
                <PromptSection key={video.slug} video={video} />
              )}
              {video.skillUrl && (
                <SkillSection key={`${video.slug}-skill`} video={video} />
              )}
              {/* Quiet, at the bottom: questions, credit or removal requests
                  land on /contact with this video already filled in. */}
              <p className="text-muted-foreground mt-auto pt-2 text-xs">
                {content.questions}{" "}
                <Link
                  to={ROUTES.CONTACT}
                  search={{
                    inquiry: "removal",
                    ref: absoluteUrl(`/videos/${video.slug}`),
                  }}
                  className="hover:text-foreground underline underline-offset-4 transition-colors"
                >
                  {content.contactUs}
                </Link>
              </p>
            </aside>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
