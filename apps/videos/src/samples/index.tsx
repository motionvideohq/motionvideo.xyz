import type { ComponentType } from "react";
import { Composition, Folder } from "remotion";

import { Analytics } from "./analytics";
import { BrandBoard } from "./brand-board";
import { Calendar } from "./calendar";
import catalog from "./catalog.json";
import { Chat } from "./chat";
import { ClipChart } from "./clip-chart";
import { ClipFeed } from "./clip-feed";
import { ClipFlow } from "./clip-flow";
import { Kanban } from "./kanban";
import { LandingHero } from "./landing-hero";
import { LandingLong } from "./landing-long";
import { Logo } from "./logo";
import { MobileFitness } from "./mobile-fitness";
import { MobileMusic } from "./mobile-music";
import { MobileWallet } from "./mobile-wallet";
import { Poster } from "./poster";
import { Pricing } from "./pricing";
import { Settings } from "./settings";

/**
 * The Create sample library: original MotionVideo-owned stills and clips that
 * fill every Showcase template before a user uploads anything. The list and
 * sizes live in catalog.json, which `pnpm samples:render` reads too; the web
 * app's `create:samples` script uploads the rendered files.
 */
const COMPONENTS: Record<string, ComponentType> = {
  analytics: Analytics,
  "landing-hero": LandingHero,
  pricing: Pricing,
  settings: Settings,
  kanban: Kanban,
  chat: Chat,
  calendar: Calendar,
  poster: Poster,
  "brand-board": BrandBoard,
  "mobile-fitness": MobileFitness,
  "mobile-wallet": MobileWallet,
  "mobile-music": MobileMusic,
  "landing-long": LandingLong,
  logo: Logo,
  "clip-chart": ClipChart,
  "clip-feed": ClipFeed,
  "clip-flow": ClipFlow,
};

export const SampleFolder = () => (
  <Folder name="samples">
    {catalog.samples.map((sample) => (
      <Composition
        key={sample.id}
        id={`sample-${sample.id}`}
        component={COMPONENTS[sample.id]}
        width={sample.width}
        height={sample.height}
        fps={catalog.fps}
        durationInFrames={Math.round((sample.seconds ?? 1) * catalog.fps)}
      />
    ))}
  </Folder>
);
