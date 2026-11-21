import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LAUNCH_VIDEOS_LIVE } from "@/constants/launch-videos";
import { getLandingData } from "@/server/functions";

const LaunchVideosLayout = () => (
  <>
    <SiteHeader />
    <Outlet />
    <SiteFooter />
  </>
);

// Layout for `/launch-videos`, a film's page and the composer: the child
// routes own the page body and head tags. Until the release flag is on,
// every page under it is a 404. No session here: prompts are fetched on a
// click, and the click's result says whether it's locked.
export const Route = createFileRoute("/{-$locale}/launch-videos")({
  beforeLoad: () => {
    if (!LAUNCH_VIDEOS_LIVE) {
      throw notFound();
    }
  },
  component: LaunchVideosLayout,
  loader: () => getLandingData(),
});
