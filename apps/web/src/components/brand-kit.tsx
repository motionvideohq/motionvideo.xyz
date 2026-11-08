import { useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowUpRight } from "reicon-react/icons/ArrowUpRight";
import { Download } from "reicon-react/icons/Download";
import { Moon } from "reicon-react/icons/Moon";
import { Refresh } from "reicon-react/icons/Refresh";
import { Sun } from "reicon-react/icons/Sun";
import { Xmark } from "reicon-react/icons/Xmark";

import { CopyIcon } from "@/components/copy-icon";
import { LOGOMARK_PATH, Logomark } from "@/components/logo";
import { SITE } from "@/constants/site";
import kit from "@/data/brand-kit.json";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/registry/ui/button";

// The brand page's sections: the kit download and a drawing of the
// logomark, every logo with copy and save actions, the colors, the type and
// the usage rules. The files in public/brand and the zip's weight
// (src/data/brand-kit.json) come from `pnpm brand:kit`.

const BRAND = "/brand";
const ZIP = `${BRAND}/motionvideo-brand-assets.zip`;
const TIMELESS_URL = "https://www.timeless.co/type";
const TIMELESS_PLAYGROUND_URL = "https://www.timeless.co/type/playground";
const PAPER_MONO_URL = "https://github.com/paper-design/paper-mono";

type CopyStatus = "idle" | "copied" | "failed";

/** Copies an asset (SVG markup or a PNG image) and reports how it went. */
const copyAsset = async (file: string, format: "svg" | "png") => {
  const url = `${BRAND}/${file}.${format}`;
  if (format === "svg") {
    const response = await fetch(url);
    await navigator.clipboard.writeText(await response.text());
  } else {
    // The promise form keeps Safari's user-gesture window open while the
    // image downloads.
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": fetch(url).then((response) => response.blob()),
      }),
    ]);
  }
  track("brand_copy", { asset: file, format });
};

/**
 * A button that runs a copy: its icon turns into a tick when it worked, and
 * its label says so when it didn't.
 */
const CopyButton = ({
  label,
  onCopy,
  size = "sm",
}: {
  label: ReactNode;
  onCopy: () => Promise<void>;
  size?: "sm" | "lg";
}) => {
  const content = useIntlayer("brand");
  const [status, flash] = useTransientStatus<CopyStatus>("idle");
  return (
    <Button
      variant="outline"
      size={size}
      onClick={async () => {
        try {
          await onCopy();
          flash("copied");
        } catch {
          flash("failed");
        }
      }}
    >
      <CopyIcon copied={status === "copied"} />
      {status === "failed" ? content.copyFailed : label}
      <span aria-live="polite" className="sr-only">
        {status === "copied" && content.copied}
      </span>
    </Button>
  );
};

// ─── Hero ──────────────────────────────────────────────────────────────────

// The logomark's viewBox (LOGOMARK_PATH), and construction lines on its
// edges that run off the frame.
const MARK = { x: 12, y: 12, width: 1242, height: 587 };
const GUIDES = [
  [MARK.x - 4000, MARK.y, MARK.x + 4000 + MARK.width, MARK.y],
  [
    MARK.x - 4000,
    MARK.y + MARK.height,
    MARK.x + 4000 + MARK.width,
    MARK.y + MARK.height,
  ],
  [MARK.x, MARK.y - 4000, MARK.x, MARK.y + 4000 + MARK.height],
  [
    MARK.x + MARK.width,
    MARK.y - 4000,
    MARK.x + MARK.width,
    MARK.y + 4000 + MARK.height,
  ],
] as const;

/**
 * The logomark draws its outline along the construction lines, then fills
 * in; Replay runs it again. Reduced motion shows it finished.
 */
const MarkShowcase = () => {
  const content = useIntlayer("brand");
  const [run, setRun] = useState(0);
  return (
    <figure className="bg-muted/40 shadow-outline relative grid aspect-[2/1] place-items-center overflow-hidden rounded-xl bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-size-[2rem_2rem] bg-center">
      <figcaption className="sr-only">{content.showcase}</figcaption>
      <svg
        aria-hidden="true"
        viewBox={`${MARK.x} ${MARK.y} ${MARK.width} ${MARK.height}`}
        className="text-foreground w-3/5 overflow-visible"
      >
        {GUIDES.map(([x1, y1, x2, y2]) => (
          <line
            key={`${x1} ${y1}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity={0.15}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path
          key={run}
          d={LOGOMARK_PATH}
          pathLength={1}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinejoin="round"
          className="[stroke-dasharray:1] motion-safe:[animation:brand-draw_1.6s_var(--ease-out)_both,brand-fill_0.6s_ease-out_1.2s_both]"
        />
      </svg>
      <span className="text-muted-foreground absolute bottom-3 left-3 font-mono text-xs">
        {MARK.width} × {MARK.height}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="absolute right-3 bottom-3"
        onClick={() => setRun((current) => current + 1)}
      >
        <Refresh aria-hidden="true" />
        {content.replay}
      </Button>
    </figure>
  );
};

export const BrandHero = () => {
  const content = useIntlayer("brand");
  const { locale } = useLocale();
  const size = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "kilobyte",
    maximumFractionDigits: 0,
  }).format(kit.zip.bytes / 1024);
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          {content.title}
        </h1>
        <p className="text-muted-foreground max-w-xl leading-7">
          {content.intro}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={ZIP}
          download
          data-track="brand_download"
          className={buttonVariants({ variant: "gradient", size: "lg" })}
        >
          <Download aria-hidden="true" />
          {content.download}
          <span className="font-normal opacity-60">ZIP · {size}</span>
        </a>
        <CopyButton
          size="lg"
          label={content.copyMark}
          onCopy={() => copyAsset("motionvideo-logomark-black", "svg")}
        />
      </div>
      <MarkShowcase />
    </header>
  );
};

// ─── Logos ─────────────────────────────────────────────────────────────────

type Tone = "light" | "dark";

interface LogoAsset {
  key: "lockup" | "logomark" | "wordmark" | "yellow" | "appIcon";
  /** File names without extension, per background; one entry: no switch. */
  files: Partial<Record<Tone, string>>;
  /** Size of the preview image. */
  preview: string;
}

const LOGOS: readonly LogoAsset[] = [
  {
    key: "lockup",
    files: {
      light: "motionvideo-lockup-black",
      dark: "motionvideo-lockup-white",
    },
    preview: "h-7",
  },
  {
    key: "logomark",
    files: {
      light: "motionvideo-logomark-black",
      dark: "motionvideo-logomark-white",
    },
    preview: "h-12",
  },
  {
    key: "wordmark",
    files: {
      light: "motionvideo-wordmark-black",
      dark: "motionvideo-wordmark-white",
    },
    preview: "h-7",
  },
  {
    key: "yellow",
    files: { dark: "motionvideo-logomark-yellow" },
    preview: "h-12",
  },
  {
    key: "appIcon",
    files: { light: "motionvideo-app-icon" },
    preview: "size-20 rounded-[22%] shadow-outline",
  },
];

const TONE_SURFACE: Record<Tone, string> = {
  light: "bg-white",
  dark: "bg-neutral-950",
};

const TONE_ICONS = { light: Sun, dark: Moon } as const;

/** A tile's action row: what it does on the left, the formats on the right. */
const ActionRow = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-muted-foreground text-sm">{label}</span>
    <div className="flex items-center gap-1.5">{children}</div>
  </div>
);

/**
 * One logo: its preview, switched in place between the light- and
 * dark-background versions when it has both, then copy and save actions for
 * the version shown.
 */
const LogoTile = ({ asset }: { asset: LogoAsset }) => {
  const content = useIntlayer("brand");
  const tones = (["light", "dark"] as const).filter(
    (tone) => asset.files[tone]
  );
  const [tone, setTone] = useState<Tone>(tones[0] ?? "light");
  const file = asset.files[tone] ?? "";
  const toneLabel = { light: content.onLight, dark: content.onDark };
  return (
    <li className="flex flex-col gap-3">
      <div
        className={cn(
          "shadow-outline relative flex aspect-[16/10] items-center justify-center rounded-xl",
          TONE_SURFACE[tone]
        )}
      >
        <img
          src={`${BRAND}/${file}.svg`}
          alt={`${content.logoNames[asset.key].value} (${toneLabel[tone].value})`}
          decoding="async"
          className={cn("w-auto max-w-[80%]", asset.preview)}
        />
        {tones.length > 1 && (
          <div className="bg-background shadow-outline absolute top-2 right-2 flex rounded-lg p-0.5">
            {tones.map((side) => {
              const Icon = TONE_ICONS[side];
              return (
                <Button
                  key={side}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={toneLabel[side].value}
                  aria-pressed={side === tone}
                  title={toneLabel[side].value}
                  onClick={() => setTone(side)}
                  className="text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
                >
                  <Icon aria-hidden="true" />
                </Button>
              );
            })}
          </div>
        )}
      </div>
      <h3 className="text-foreground font-medium">
        {content.logoNames[asset.key]}
      </h3>
      <div className="flex flex-col gap-2">
        <ActionRow label={content.copy}>
          <CopyButton label="SVG" onCopy={() => copyAsset(file, "svg")} />
          <CopyButton label="PNG" onCopy={() => copyAsset(file, "png")} />
        </ActionRow>
        <ActionRow label={content.save}>
          {(["svg", "png"] as const).map((format) => (
            <a
              key={format}
              href={`${BRAND}/${file}.${format}`}
              download
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Download aria-hidden="true" />
              {format.toUpperCase()}
            </a>
          ))}
        </ActionRow>
      </div>
    </li>
  );
};

const SectionTitle = ({
  title,
  intro,
}: {
  title: ReactNode;
  intro: ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <h2 className="text-foreground text-xl font-semibold tracking-tight">
      {title}
    </h2>
    <p className="text-muted-foreground leading-7">{intro}</p>
  </div>
);

export const BrandLogos = () => {
  const content = useIntlayer("brand");
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle title={content.logos} intro={content.logosIntro} />
      <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2">
        {LOGOS.map((asset) => (
          <LogoTile key={asset.key} asset={asset} />
        ))}
      </ul>
    </section>
  );
};

// ─── Colors ────────────────────────────────────────────────────────────────

// Page colors match the site's backgrounds (--background in globals.css);
// ink matches the logo files; the yellows are --color-cta-*.
const GROUND = {
  light: {
    page: "#FFFFFF",
    ink: "#000000",
    lockup: "motionvideo-lockup-black",
  },
  dark: { page: "#0A0A0A", ink: "#FFFFFF", lockup: "motionvideo-lockup-white" },
} as const;
const YELLOW = "#FFBE25";
const LIGHT_YELLOW = "#FFDD73";
const GRADIENT = `linear-gradient(180deg, ${LIGHT_YELLOW} 0%, ${YELLOW} 100%)`;

/** A color (or the gradient) that copies its value when clicked. */
const Swatch = ({
  value,
  fill,
  name,
  use,
}: {
  value: string;
  /** CSS background for the chip: the color itself, or the gradient. */
  fill: string;
  name: ReactNode;
  /** What the color is for. */
  use?: ReactNode;
}) => {
  const content = useIntlayer("brand");
  const [status, flash] = useTransientStatus<CopyStatus>("idle");
  return (
    <button
      type="button"
      aria-label={content.copyColor({ value }).value}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          track("brand_copy", { asset: "color", value });
          flash("copied");
        } catch {
          flash("failed");
        }
      }}
      className="hover:bg-muted focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors outline-none focus-visible:ring-3"
    >
      <span
        aria-hidden="true"
        className="size-9 shrink-0 rounded-md ring-1 ring-black/10 ring-inset dark:ring-white/10"
        style={{ background: fill }}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground font-medium">{name}</span>
        {use && <span className="text-muted-foreground truncate">{use}</span>}
      </span>
      <span
        aria-live="polite"
        className="text-muted-foreground shrink-0 font-mono text-xs"
      >
        {status === "copied" && content.copied}
        {status === "failed" && content.copyFailed}
        {status === "idle" && (value.startsWith("#") ? value : "CSS")}
      </span>
    </button>
  );
};

const colorCardClass = "shadow-outline overflow-hidden rounded-xl";

export const BrandColors = () => {
  const content = useIntlayer("brand");
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle title={content.colors} intro={content.colorsIntro} />
      <div className="grid gap-4 sm:grid-cols-2">
        {(["light", "dark"] as const).map((tone) => (
          <div key={tone} className={colorCardClass}>
            <div
              className="flex h-28 items-center justify-center"
              style={{ background: GROUND[tone].page }}
            >
              <img
                src={`${BRAND}/${GROUND[tone].lockup}.svg`}
                alt=""
                decoding="async"
                className="h-6 w-auto"
              />
            </div>
            <div className="flex flex-col p-1.5">
              <p className="text-muted-foreground px-2 pt-1 pb-0.5 text-xs font-medium">
                {tone === "light" ? content.onLight : content.onDark}
              </p>
              <Swatch
                value={GROUND[tone].page}
                fill={GROUND[tone].page}
                name={content.page}
              />
              <Swatch
                value={GROUND[tone].ink}
                fill={GROUND[tone].ink}
                name={content.colorNames.ink}
                use={content.colorRoles.ink}
              />
            </div>
          </div>
        ))}
      </div>
      <div className={colorCardClass}>
        <div
          className="flex h-28 items-center justify-center"
          style={{ background: GRADIENT }}
        >
          <Logomark className="h-10 w-auto text-black" />
        </div>
        <div className="grid p-1.5 sm:grid-cols-3">
          <Swatch
            value={YELLOW}
            fill={YELLOW}
            name={content.colorNames.yellow}
            use={content.colorRoles.yellow}
          />
          <Swatch
            value={LIGHT_YELLOW}
            fill={LIGHT_YELLOW}
            name={content.colorNames.lightYellow}
            use={content.colorRoles.lightYellow}
          />
          <Swatch
            value={GRADIENT}
            fill={GRADIENT}
            name={content.colorNames.gradient}
            use="linear-gradient(180deg, …)"
          />
        </div>
      </div>
    </section>
  );
};

// ─── Type ──────────────────────────────────────────────────────────────────

// Prompts stay in English in every locale, like the gallery's.
const MONO_SAMPLE =
  "Draw the logomark’s outline, then fill it: 1.6s, ease-out.";

const TypeCard = ({
  name,
  specimen,
  sample,
  use,
  footer,
}: {
  name: string;
  specimen: string;
  sample: ReactNode;
  use: ReactNode;
  footer: ReactNode;
}) => (
  <div className="shadow-outline flex flex-col gap-5 rounded-xl p-5">
    <div className="flex items-end justify-between gap-4">
      <span
        aria-hidden="true"
        className={cn("text-foreground text-6xl leading-none", specimen)}
      >
        Aa
      </span>
    </div>
    <div className={cn("text-foreground", specimen)}>{sample}</div>
    <div className="mt-auto flex flex-col gap-1 text-sm">
      <h3 className="text-foreground text-base font-medium">{name}</h3>
      <p className="text-muted-foreground">{use}</p>
      {footer}
    </div>
  </div>
);

const FontLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
  >
    {children}
    <ArrowUpRight aria-hidden="true" className="size-3.5" />
  </a>
);

export const BrandType = () => {
  const content = useIntlayer("brand");
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle title={content.type} intro={content.typeIntro} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TypeCard
          name="Timeless Sans"
          specimen="font-sans font-semibold tracking-tight"
          sample={<p className="text-2xl text-balance">{SITE.TAGLINE}</p>}
          use={content.timelessUse}
          footer={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <FontLink href={TIMELESS_URL}>{content.getTimeless}</FontLink>
              <FontLink href={TIMELESS_PLAYGROUND_URL}>
                {content.timelessPlayground}
              </FontLink>
            </div>
          }
        />
        <TypeCard
          name="Paper Mono"
          specimen="font-mono"
          sample={
            <p className="bg-muted/50 rounded-lg p-3 text-[0.8125rem] leading-6">
              <span className="text-muted-foreground">&gt; </span>
              {MONO_SAMPLE}
            </p>
          }
          use={content.paperMonoUse}
          footer={
            <FontLink href={PAPER_MONO_URL}>{content.getPaperMono}</FontLink>
          }
        />
      </div>
    </section>
  );
};

// ─── Usage ─────────────────────────────────────────────────────────────────

const RULES = ["name", "room", "files", "endorsement"] as const;

// Each misuse applied to the logomark.
const DONTS = [
  ["recolor", "text-sky-500"],
  ["stretch", "scale-x-150 scale-y-75"],
  ["rotate", "-rotate-12"],
  ["effects", "drop-shadow-[0_6px_6px_rgb(0_0_0/0.5)] blur-[0.5px]"],
] as const;

export const BrandUsage = ({ questions }: { questions: ReactNode }) => {
  const content = useIntlayer("brand");
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle title={content.usage} intro={content.usageIntro} />
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {RULES.map((rule) => (
          <div key={rule} className="flex flex-col gap-1">
            <h3 className="text-foreground font-medium">
              {content.rules[rule].title}
            </h3>
            <p className="text-muted-foreground leading-7">
              {content.rules[rule].body}
            </p>
          </div>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {DONTS.map(([key, misuse]) => (
          <li key={key} className="flex flex-col gap-2">
            <div className="bg-muted/40 shadow-outline flex aspect-square items-center justify-center rounded-xl">
              <Logomark className={cn("text-foreground h-8 w-auto", misuse)} />
            </div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Xmark aria-hidden="true" className="text-destructive size-4" />
              {content.donts[key]}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground leading-7">{questions}</p>
    </section>
  );
};
