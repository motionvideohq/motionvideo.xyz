import { cn } from "cn";
import { MousePointer2Icon, PlayIcon } from "lucide-react";
import MediaThemeSutro from "player.style/sutro/react";
import { useEffect, useRef } from "react";
import { useIntlayer } from "react-intlayer";

interface DemoFrameProps {
  /** Rendered video URL. Empty shows the animated placeholder. */
  src: string;
  variant: "dashboard" | "palette";
  caption?: { label: string; prompt: string };
  /** `load`: play as soon as the page loads (hero). Default: play only
   * while at least half the video is on screen. */
  autoplay?: "load" | "visible";
}

const Rise = ({ className }: { className: string }) => (
  <div
    className={cn(
      "animate-mv-rise bg-background rounded-md border shadow-xs motion-reduce:animate-none",
      className
    )}
  />
);

// Static class lists so Tailwind can see every generated utility.
const SIDEBAR_DELAYS = [
  "mv-delay-0",
  "mv-delay-80",
  "mv-delay-160",
  "mv-delay-240",
];
const STAT_DELAYS = ["mv-delay-200", "mv-delay-320", "mv-delay-440"];
const BAR_HEIGHTS = [
  "h-2/5",
  "h-13/20",
  "h-1/2",
  "h-4/5",
  "h-3/5",
  "h-19/20",
  "h-3/4",
];
const PALETTE_ROWS = [
  { delay: "mv-delay-150", width: "w-3/5" },
  { delay: "mv-delay-260", width: "w-1/2" },
  { delay: "mv-delay-370", width: "w-2/5" },
  { delay: "mv-delay-480", width: "w-3/10" },
];

const DashboardScene = () => (
  <div className="bg-background/60 grid h-full grid-cols-[1fr_3fr] gap-3 rounded-lg border p-2 sm:gap-4 sm:p-4">
    <div className="flex flex-col gap-2 sm:gap-4">
      {SIDEBAR_DELAYS.map((delay) => (
        <Rise key={delay} className={cn("h-[9%]", delay)} />
      ))}
    </div>
    <div className="grid grid-cols-3 grid-rows-[1fr_2fr] gap-2 sm:gap-3">
      {STAT_DELAYS.map((delay) => (
        <Rise key={delay} className={delay} />
      ))}
      <div className="animate-mv-rise mv-delay-600 bg-background col-span-3 flex items-end gap-2 rounded-md border p-2 motion-reduce:animate-none sm:gap-3 sm:p-3">
        {BAR_HEIGHTS.map((height) => (
          <div
            key={height}
            className={cn("bg-primary flex-1 rounded-sm", height)}
          />
        ))}
      </div>
    </div>
  </div>
);

const PaletteScene = () => (
  <div className="flex h-full items-center justify-center">
    <div className="bg-background flex w-3/4 flex-col gap-2 rounded-xl border p-2 shadow-lg sm:gap-3 sm:p-4">
      <div className="bg-muted h-[14%] rounded-md" />
      {PALETTE_ROWS.map(({ delay, width }, i) => (
        <div
          key={delay}
          className={cn(
            "animate-mv-rise data-[active=true]:bg-primary/20 flex h-[12%] items-center gap-2 rounded-md px-2 motion-reduce:animate-none sm:gap-3",
            delay
          )}
          data-active={i === 1}
        >
          <div className="bg-foreground/20 aspect-square h-1/2 rounded-sm" />
          <div className={cn("bg-foreground/15 h-1/3 rounded-sm", width)} />
        </div>
      ))}
    </div>
  </div>
);

const play = async (video: HTMLVideoElement) => {
  // Browsers only allow autoplay while muted; if they still refuse, the
  // player's own play button is the fallback.
  video.muted = true;
  try {
    await video.play();
  } catch {
    // Autoplay blocked: leave the video paused on its first frame.
  }
};

// Muted, looping autoplay. Skipped for visitors who prefer reduced motion.
const AutoplayVideo = ({
  src,
  autoplay,
}: {
  src: string;
  autoplay: "load" | "visible";
}) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (autoplay === "load") {
      play(video);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          play(video);
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoplay]);

  return (
    // Motion pieces with music only, no spoken words to caption.
    // oxlint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={ref}
      slot="media"
      // `#t=0.1` makes browsers paint the first frame as the poster.
      src={`${src}#t=0.1`}
      muted
      loop
      playsInline
      preload={autoplay === "load" ? "auto" : "metadata"}
      className="size-full object-cover"
    />
  );
};

// A video in the Sutro player (player.style), or a looping CSS-only stand-in
// until `src` is set.
export const DemoFrame = ({
  src,
  variant,
  caption,
  autoplay = "visible",
}: DemoFrameProps) => {
  const content = useIntlayer("chrome");
  return (
  <figure className="flex flex-col gap-3">
    <div className="bg-muted/40 relative aspect-video overflow-hidden rounded-xl border shadow-sm">
      {src ? (
        <MediaThemeSutro className="block size-full">
          <AutoplayVideo src={src} autoplay={autoplay} />
        </MediaThemeSutro>
      ) : (
        <>
          <div className="animate-mv-zoom absolute inset-0 p-4 motion-reduce:animate-none sm:p-8">
            {variant === "dashboard" ? <DashboardScene /> : <PaletteScene />}
          </div>
          <MousePointer2Icon
            aria-hidden
            className="animate-mv-cursor fill-foreground text-background absolute top-0 left-0 size-[6%] drop-shadow motion-reduce:animate-none"
          />
          <div className="from-background/90 absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t to-transparent px-3 pt-6 pb-2">
            <PlayIcon aria-hidden className="fill-foreground size-3" />
            <div className="bg-foreground/15 h-0.5 flex-1 overflow-hidden rounded-full">
              <div className="animate-mv-progress bg-foreground/70 h-full motion-reduce:animate-none" />
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              0:08
            </span>
          </div>
        </>
      )}
    </div>
    {caption && (
      <figcaption className="text-muted-foreground flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-6">
        <span className="text-foreground shrink-0 font-medium">
          {caption.label}
        </span>
        <span className="sm:text-right">{content.prompt} “{caption.prompt}”</span>
      </figcaption>
    )}
  </figure>
  );
};
