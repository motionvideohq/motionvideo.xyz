import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Bookmark } from "reicon-react/icons/Bookmark";
import { ChevronLeft } from "reicon-react/icons/ChevronLeft";
import { ChevronRight } from "reicon-react/icons/ChevronRight";
import { Ufo } from "reicon-react/icons/Ufo";
import { Xmark } from "reicon-react/icons/Xmark";

import { CopyIcon } from "@/components/copy-icon";
import { SponsorSlots } from "@/components/sponsor-slots";
import { SponsoredCard } from "@/components/sponsored-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ASSETS_URL } from "@/constants/links";
import type { SponsorTier } from "@/constants/sponsors";
import type { MotionCategory } from "@/lib/motion-catalog";
import { cn } from "@/lib/utils";

interface PreviewVideo {
  title: string;
  handle: string;
  /** Display name on X, for the detail sidebar's creator line. */
  creatorName?: string;
  avatar: string;
  poster: string;
  width: number;
  height: number;
}

// A handful of real gallery entries (copied from src/data/motion-catalog.json
// so the sponsor page doesn't ship the whole catalog) to fill the previews
// around the live sponsor components.
const ASSETS = ASSETS_URL;
const VIDEOS = {
  showreel: {
    title: "Claude motion designer showreel",
    handle: "stephanlivera",
    avatar: `${ASSETS}/avatars/stephanlivera-b812a8857d.webp`,
    poster: `${ASSETS}/motion/stephanlivera-df17a2/poster-f2e1162434.webp`,
    width: 1920,
    height: 1080,
  },
  morph: {
    title: "Shape morphing through UI states",
    handle: "twoclipping",
    avatar: `${ASSETS}/avatars/twoclipping-938bc64bce.webp`,
    poster: `${ASSETS}/motion/twoclipping-5cba86/poster-9a98945de1.webp`,
    width: 1440,
    height: 1440,
  },
  jellyfish: {
    title: "Translucent jellyfish motion loop",
    handle: "AntSeed",
    creatorName: "Antseed",
    avatar: `${ASSETS}/avatars/antseed-b6b3f312bd.jpg`,
    poster: `${ASSETS}/motion/antseed-3a1534/poster-161dc42cc9.jpg`,
    width: 1920,
    height: 1080,
  },
  octopus: {
    title: "Octopus DJ reel-to-reel",
    handle: "xiaolinnihao",
    avatar: `${ASSETS}/avatars/xiaolinnihao-67d1a52ff1.jpg`,
    poster: `${ASSETS}/motion/xiaolinnihao-876941/poster-fc024e61ae.jpg`,
    width: 1200,
    height: 900,
  },
  kinetic: {
    title: "Bold kinetic type showreel",
    handle: "shneural",
    avatar: `${ASSETS}/avatars/shneural-98aedaaf19.webp`,
    poster: `${ASSETS}/motion/shneural-2abdfa/poster-bb366515ef.webp`,
    width: 1920,
    height: 1080,
  },
  photo: {
    title: "Photo print app launch film",
    handle: "twoclipping",
    avatar: `${ASSETS}/avatars/twoclipping-ffdf9514af.webp`,
    poster: `${ASSETS}/motion/twoclipping-221cab/poster-4562997504.webp`,
    width: 1440,
    height: 1440,
  },
  abstract: {
    title: "Abstract motion design reel",
    handle: "ajith_io",
    avatar: `${ASSETS}/avatars/ajith-io-18fd45716e.webp`,
    poster: `${ASSETS}/motion/ajith-io-b5626e/poster-5090fc50e3.webp`,
    width: 1920,
    height: 1080,
  },
} satisfies Record<string, PreviewVideo>;

// The detail view shown in the sidebar preview, with what its sidebar lists.
const DETAIL = {
  video: VIDEOS.jellyfish,
  categories: ["shapes", "characters"] satisfies MotionCategory[],
  model: "Gemini 4 Argon",
  prompt:
    "Code translucent jellyfish in deep petrol-blue water, with cyan and coral light. Make their bells squeeze quickly and recover slowly to propel them forward. Tentacles should trail with a delay, each jellyfish on its own rhythm.",
};

/** A feed card as the gallery draws it: poster, creator avatar bottom left. */
const PosterTile = ({ video }: { video: PreviewVideo }) => (
  <span
    className="bg-muted shadow-outline relative block overflow-hidden rounded-xl"
    style={{ aspectRatio: `${video.width} / ${video.height}` }}
  >
    <img
      src={video.poster}
      alt=""
      loading="lazy"
      decoding="async"
      className="size-full object-cover"
    />
    <img
      src={video.avatar}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="absolute bottom-2 left-2 size-5 rounded-full shadow-sm"
    />
  </span>
);

/** A round icon button as the detail sidebar draws it, inert. */
const IconChip = ({ children }: { children: ReactNode }) => (
  <span className="bg-secondary text-secondary-foreground flex size-6 items-center justify-center rounded-full [&_svg]:size-3">
    {children}
  </span>
);

const DetailRow = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => (
  <div
    aria-hidden="true"
    className="flex items-start justify-between gap-3 border-t border-dashed py-1.5 last:border-b"
  >
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 flex-col items-end text-right">{children}</dd>
  </div>
);

/**
 * One placement: what it is and who gets it, beside a cropped preview of the
 * real page with the live sponsor component in place.
 */
const Placement = ({
  title,
  body,
  tiers,
  children,
}: {
  title: ReactNode;
  body: ReactNode;
  tiers: readonly SponsorTier[];
  children: ReactNode;
}) => {
  const content = useIntlayer("sponsor");
  return (
    <li className="grid gap-5 py-6 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm text-pretty">{body}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {tiers.map((tier) => (
            <li key={tier}>
              <Badge variant="outline">{content.tiers[tier].name}</Badge>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-background shadow-outline overflow-hidden rounded-xl">
        {children}
      </div>
    </li>
  );
};

/**
 * The three placements a sponsor buys, each in a cropped preview of the real
 * page: gallery posters and copy around the same live components (and live
 * sponsors) the site renders. Only the sponsor components are interactive.
 */
export const SponsorPlacements = () => {
  const content = useIntlayer("sponsor");
  const gallery = useIntlayer("motion-gallery");
  return (
    <ul>
      <Placement
        title={content.placementItems.card.title}
        body={content.placementItems.card.body}
        tiers={["diamond", "gold", "silver"]}
      >
        {/* One feed lane (viewports under 592px: `laneCount` adds a second
            lane at a 560px grid, inside the grid's 16px padding): the
            sponsored card a few tiles in, full width between two posters. */}
        <div className="flex flex-col gap-2.5 mask-b-from-70% p-3 min-[592px]:hidden">
          <div
            aria-hidden="true"
            className="flex h-14 shrink-0 flex-col justify-end overflow-hidden"
          >
            <PosterTile video={VIDEOS.octopus} />
          </div>
          <div className="flex aspect-video shrink-0">
            <SponsoredCard placement="feed" demo />
          </div>
          <div aria-hidden="true" className="h-14 overflow-hidden">
            <PosterTile video={VIDEOS.kinetic} />
          </div>
        </div>
        {/* Two or more lanes: the feed's top, cropped from a wider grid (the left
            lane runs off the edge, so lanes keep a real card's width): the
            sponsored card in the first row's rightmost lane, fading out where
            the crop ends. */}
        <div className="-ml-[24%] hidden h-72 w-[124%] grid-cols-3 items-start gap-2.5 mask-b-from-60% p-3 min-[592px]:grid">
          <div aria-hidden="true" className="flex flex-col gap-2.5">
            <PosterTile video={VIDEOS.showreel} />
            <PosterTile video={VIDEOS.morph} />
          </div>
          <div aria-hidden="true" className="flex flex-col gap-2.5">
            <PosterTile video={VIDEOS.jellyfish} />
            <PosterTile video={VIDEOS.octopus} />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex aspect-video">
              <SponsoredCard placement="feed" demo />
            </div>
            <span aria-hidden="true">
              <PosterTile video={VIDEOS.kinetic} />
            </span>
          </div>
        </div>
      </Placement>
      <Placement
        title={content.placementItems.slots.title}
        body={content.placementItems.slots.body}
        tiers={["diamond", "gold"]}
      >
        {/* The gallery's intro tile (title, copy, actions, then the slots):
            full width over the first card in the one-lane feed (under
            592px, as above); beside the first feed lane once there are two. */}
        <div className="flex h-80 flex-col gap-3 p-3 min-[592px]:grid min-[592px]:h-64 min-[592px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] min-[592px]:grid-rows-[100%]">
          <div className="flex shrink-0 flex-col justify-end gap-3 min-[592px]:min-h-0">
            <div aria-hidden="true" className="flex flex-col gap-3">
              <div>
                <p className="truncate text-lg leading-tight font-semibold tracking-tight">
                  {gallery.title}
                </p>
                <p className="text-muted-foreground mt-1.5 line-clamp-3 text-xs leading-tight text-pretty">
                  {gallery.intro}
                </p>
              </div>
              <span className="flex flex-wrap gap-1.5">
                <span
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Ufo />
                  {gallery.surprise}
                </span>
                <span
                  className={buttonVariants({
                    variant: "gradient",
                    size: "sm",
                  })}
                >
                  {gallery.submitVideo}
                  <ArrowRightUp />
                </span>
              </span>
            </div>
            <SponsorSlots demo />
          </div>
          <div
            aria-hidden="true"
            className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden mask-b-from-40% min-[592px]:flex-none min-[592px]:mask-b-from-60%"
          >
            <PosterTile video={VIDEOS.photo} />
            <PosterTile video={VIDEOS.abstract} />
          </div>
        </div>
      </Placement>
      <Placement
        title={content.placementItems.sidebar.title}
        body={content.placementItems.sidebar.body}
        tiers={["diamond"]}
      >
        {/* A video's detail view: the player over a blurred backdrop, and
            the sidebar with the Diamond list item under the source button.
            Under `lg` they stack, as the real view does: the bottom of the
            stage, then the sidebar below its top border. */}
        <div className="grid h-[26rem] grid-rows-[7rem_minmax(0,1fr)] text-xs lg:h-96 lg:grid-cols-[minmax(0,1fr)_19rem] lg:grid-rows-none">
          <div
            aria-hidden="true"
            className="relative flex items-end justify-center overflow-hidden bg-black px-4 pb-4 lg:items-center lg:p-4"
          >
            <img
              src={DETAIL.video.poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-2xl"
            />
            <img
              src={DETAIL.video.poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="relative w-2/3 rounded-lg shadow-2xl lg:w-full"
              style={{
                aspectRatio: `${DETAIL.video.width} / ${DETAIL.video.height}`,
              }}
            />
          </div>
          <div className="flex flex-col gap-3 border-t mask-b-from-80% p-3 lg:border-t-0 lg:border-l">
            <div aria-hidden="true" className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <IconChip>
                  <Xmark />
                </IconChip>
                <span className="flex gap-1.5">
                  <IconChip>
                    <Bookmark />
                  </IconChip>
                  <IconChip>
                    <ChevronLeft />
                  </IconChip>
                  <IconChip>
                    <ChevronRight />
                  </IconChip>
                </span>
              </div>
              <p className="text-sm leading-tight font-semibold tracking-tight text-balance">
                {DETAIL.video.title}
              </p>
              {/* The creator under the title: avatar, then name over @handle. */}
              <span className="flex items-center gap-2">
                <img
                  src={DETAIL.video.avatar}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="size-7 shrink-0 rounded-full"
                />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-medium">
                    {DETAIL.video.creatorName ?? `@${DETAIL.video.handle}`}
                  </span>
                  <span className="text-muted-foreground truncate">
                    @{DETAIL.video.handle}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  buttonVariants({ variant: "gradient", size: "sm" }),
                  "w-full"
                )}
              >
                {gallery.openOnX}
                <ArrowRightUp />
              </span>
            </div>
            <dl>
              <SponsoredCard
                placement="sidebar"
                demo
                rowClassName="gap-3 py-1.5 text-xs"
              />
              <DetailRow label={gallery.category}>
                {DETAIL.categories.map((category) => (
                  <span key={category}>{gallery.categories[category]}</span>
                ))}
              </DetailRow>
              <DetailRow label={gallery.type}>{gallery.prompt}</DetailRow>
              <DetailRow label={gallery.model}>{DETAIL.model}</DetailRow>
            </dl>
            <div aria-hidden="true" className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{gallery.prompt}</p>
                <span
                  className={buttonVariants({ variant: "outline", size: "xs" })}
                >
                  <CopyIcon copied={false} />
                  {gallery.copyShort}
                </span>
              </div>
              <p className="bg-muted rounded-lg p-2.5 font-serif leading-relaxed">
                {DETAIL.prompt}
              </p>
            </div>
          </div>
        </div>
      </Placement>
    </ul>
  );
};
