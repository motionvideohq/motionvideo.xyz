import { SOCIAL_PRESETS } from "@motionvideo/engine";
import type {
  CollectionId,
  SocialPreset,
  TemplateDef,
} from "@motionvideo/engine";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useIntlayer } from "react-intlayer";

import { LocalizedLink as Link } from "@/components/localized-link";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { previewFor } from "@/lib/create-previews";
import { cn } from "@/lib/utils";

// Template tiles for the Showcase pages: the rendered preview loop when one
// is published, otherwise a still sketch of the collection's arrangement.

/** Social preset ids, typed, in SOCIAL_PRESETS order. */
export const SOCIAL_PRESET_IDS = Object.keys(SOCIAL_PRESETS).filter(
  (id): id is SocialPreset => id in SOCIAL_PRESETS
);

/** Card positions per collection, in % of a 16:9 tile. */
const ARRANGEMENTS: Record<CollectionId, CSSProperties[]> = {
  carousel: [-4, 17, 38, 59, 80].map((left, i) => ({
    left: `${left}%`,
    top: i === 2 ? "24%" : "28%",
    width: "24%",
    height: i === 2 ? "52%" : "44%",
    opacity: i === 2 ? 1 : 0.75,
  })),
  orbit: [
    [6, 55, 0.7, 0.5],
    [22, 30, 0.85, 0.75],
    [38, 0, 1, 1],
    [54, -30, 0.85, 0.75],
    [70, -55, 0.7, 0.5],
  ].map(([left, turn, scale, opacity]) => ({
    left: `${left}%`,
    top: "26%",
    width: "24%",
    height: "48%",
    opacity,
    transform: `rotateY(${turn}deg) scale(${scale})`,
  })),
  stack: [-18, -6, 6, 18].map((turn) => ({
    left: "37%",
    top: "18%",
    width: "26%",
    height: "62%",
    transform: `rotate(${turn}deg)`,
    transformOrigin: "50% 120%",
  })),
  depth: [
    [8, 10, 26, 0.5],
    [62, 14, 26, 0.6],
    [16, 52, 22, 0.65],
    [30, 22, 40, 1],
  ].map(([left, top, width, opacity]) => ({
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${width * 1.3}%`,
    opacity,
  })),
  sequence: [
    {
      left: "8%",
      top: "22%",
      width: "30%",
      height: "56%",
      opacity: 0.45,
      transform: "rotateY(60deg)",
    },
    { left: "30%", top: "16%", width: "40%", height: "68%" },
  ],
  device: [{ left: "20%", top: "14%", width: "60%", height: "72%" }],
};

/** A still sketch of a collection: plain cards placed as its templates move. */
export const CollectionArt = ({
  collection,
  className,
}: {
  collection: CollectionId;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={cn(
      "from-muted to-secondary absolute inset-0 overflow-hidden bg-linear-to-br perspective-[600px]",
      className
    )}
  >
    {ARRANGEMENTS[collection].map((style, i) => (
      <span
        // Fixed per collection: the index is the card's identity.
        key={i}
        style={style}
        className="bg-background shadow-outline absolute flex flex-col overflow-hidden rounded-[6%/9%]"
      >
        {collection === "device" && (
          <span className="border-border flex h-[12%] items-center gap-[2%] border-b px-[3%]">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="bg-muted-foreground/30 aspect-square h-[40%] rounded-full"
              />
            ))}
          </span>
        )}
        <span className="bg-muted/70 m-[8%] h-[18%] w-[45%] rounded-sm" />
      </span>
    ))}
  </span>
);

/**
 * The template's preview loop, or its collection sketch. `playing` starts the
 * loop (hover on a card, always on a template page); visitors who prefer
 * reduced motion get the poster.
 */
export const TemplatePreview = ({
  template,
  playing,
  className,
}: {
  template: TemplateDef;
  playing: boolean;
  className?: string;
}) => {
  const preview = previewFor(template.id);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    if (playing && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.muted = true;
      const start = async () => {
        try {
          await video.play();
        } catch {
          // Autoplay refused: the poster stays.
        }
      };
      start();
    } else {
      video.pause();
    }
  }, [playing]);

  return (
    <span
      className={cn(
        "bg-muted relative block aspect-video overflow-hidden",
        className
      )}
    >
      {preview ? (
        // Silent motion loops: nothing to caption.
        // oxlint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={ref}
          src={preview.video}
          poster={preview.poster}
          width={preview.width}
          height={preview.height}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <CollectionArt collection={template.collection} />
      )}
    </span>
  );
};

/** A template in a gallery: preview (plays on hover), name and collection. */
export const TemplateCard = ({ template }: { template: TemplateDef }) => {
  const content = useIntlayer("showcase-template-card");
  const [hovered, setHovered] = useState(false);
  return (
    <li className="flex">
      <Link
        to={ROUTES.CREATE_SHOWCASE_TEMPLATE}
        params={{ templateId: template.id }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        data-track="showcase_template_open"
        data-track-template={template.id}
        className="group bg-card shadow-outline hover:bg-muted/60 flex w-full flex-col gap-3 rounded-xl p-2 transition-colors"
      >
        <TemplatePreview
          template={template}
          playing={hovered}
          className="rounded-lg"
        />
        <span className="flex flex-col gap-0.5 px-1.5 pb-1.5">
          <span className="flex items-center gap-2">
            <span className="truncate font-medium">{template.name}</span>
            {template.tier === "pro" && (
              <Badge variant="secondary">{content.pro}</Badge>
            )}
          </span>
          <span className="text-muted-foreground line-clamp-2 text-sm text-pretty">
            {template.description ||
              content.collections[template.collection].blurb}
          </span>
        </span>
      </Link>
    </li>
  );
};

/** Templates as a responsive grid of cards. */
export const TemplateGrid = ({
  templates,
  className,
}: {
  templates: readonly TemplateDef[];
  className?: string;
}) => (
  <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
    {templates.map((template) => (
      <TemplateCard key={template.id} template={template} />
    ))}
  </ul>
);
