import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useIntlayer } from "react-intlayer";

import { CollectionGrid } from "@/components/collection-grid";
import {
  CollectionIntro,
  SurpriseAndSubmit,
} from "@/components/collection-intro";
import {
  CategoryChip,
  CollectionToolbar,
} from "@/components/collection-toolbar";
import { FadeScroller } from "@/components/fade-scroller";
import { MotionVideoCard, MotionVideoOverlay } from "@/components/motion-video";
import { SiteHeader } from "@/components/site-header";
import catalog from "@/data/motion-catalog.json";
import { MOTION_CATEGORIES } from "@/lib/motion-catalog";
import type { MotionCategory, MotionVideo } from "@/lib/motion-catalog";
import type { MasonryItem } from "@/registry/components/virtual-masonry";

// Dev-only stage for the launch film (apps/videos/scripts/capture-film.mjs).
// The site's real header, toolbar, cards, search menu and detail overlay,
// fed a fixed set of catalog videos, so every take renders the same frame.
// The capture script drives it through `window.__film` instead of clicks:
// chips and cards are links, and following them would leave the stage.

// The gallery fixture: the hero video first, then three to six per category.
const FIXTURE_SLUGS = [
  "lukasersil-0ed38e",
  "twoclipping-5cba86",
  "twoclipping-221cab",
  "utsavchopra30-50540b",
  "gabrielbuzziv-4ff0c6",
  "twoclipping-6dd14e",
  "samuel-yostt-891f87",
  "steventey-0d20e4",
  "kewai386772-c4242f",
  "linearuncle-5d2bae",
  "himanshutwtxs-5f4b43",
  "fanxing321-19e06f",
  "ror-fly-9950f1",
  "stephanlivera-df17a2",
  "shneural-2abdfa",
  "ajith-io-b5626e",
  "misbahsy-f140b9",
  "fanxing321-a52ec8",
  "kenn-8f5047",
  "antseed-3a1534",
  "antseed-be2776",
  "fofrai-f82460",
  "imjustnewatai-a49509",
  "buildfastwithai-4389c4",
  "op7418-2864b1",
  "xiaolinnihao-876941",
  "heyiamnick-b6aae7",
  "emollick-8661a8",
  "notdwd-c2037d",
  "thismacapital-dfba20",
  "sab8a-364a5a",
  "kloss_xyz-a09bae",
  "0xnicc0-eccd15",
  "tkz_aiart-7ffa13",
  "lexnlin-6161a6",
  "ho-ba-f3f0e9",
  "viktoroddy-98c1d8",
];

const VIDEOS: MotionVideo[] = catalog.videos;
const FIXTURE = FIXTURE_SLUGS.map((slug) => {
  const video = VIDEOS.find((item) => item.slug === slug);
  if (!video) {
    throw new Error(`Film fixture missing from the catalog: ${slug}`);
  }
  return video;
});

interface FilmControls {
  setCategory: (category: MotionCategory | null) => void;
  openVideo: (slug: string | null) => void;
}

declare global {
  interface Window {
    __film?: FilmControls;
  }
}

const Film = () => {
  const content = useIntlayer("motion-gallery");
  const [category, setCategory] = useState<MotionCategory | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    window.__film = { setCategory, openVideo: setOpenSlug };
    return () => {
      delete window.__film;
    };
  }, []);

  const videos = category
    ? FIXTURE.filter((video) => video.contentTags.includes(category))
    : FIXTURE;
  const open = FIXTURE.find((video) => video.slug === openSlug);
  const items: MasonryItem[] = [
    {
      key: "intro",
      node: (
        <CollectionIntro
          titleId="gallery-intro-title"
          title={category ? content.categoryTitles[category] : content.title}
          description={
            category ? content.categoryIntros[category] : content.intro
          }
          actions={
            <SurpriseAndSubmit
              // Deterministic stand-in for the gallery's random pick.
              onSurprise={() => setOpenSlug(FIXTURE_SLUGS[0])}
              surpriseLabel={content.surprise}
              submitLabel={content.submitVideo}
              submitSearch={{ kind: "video" }}
            />
          }
        />
      ),
    },
    ...videos.map((video) => ({
      key: video.slug,
      aspectRatio: video.width / video.height,
      node: (
        <MotionVideoCard
          video={video}
          paused={Boolean(open)}
          open={video.slug === openSlug}
          scope={undefined}
          search={{}}
        />
      ),
    })),
  ];

  return (
    <>
      <SiteHeader />
      <CollectionToolbar label={content.browse.value}>
        <FadeScroller
          label={content.filterCategory.value}
          className="-mx-1 -my-1 min-w-0 flex-1 px-1 py-1 lg:flex-none lg:basis-[65%]"
        >
          <CategoryChip to="/film" active={!category} label={content.all} />
          {MOTION_CATEGORIES.map((id) => (
            <CategoryChip
              key={id}
              to="/film"
              active={category === id}
              label={content.categories[id]}
            />
          ))}
        </FadeScroller>
      </CollectionToolbar>
      <CollectionGrid items={items} />
      {open && (
        <MotionVideoOverlay video={open} onClose={() => setOpenSlug(null)} />
      )}
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/film")({
  component: Film,
  staticData: { noIndex: true },
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
});
