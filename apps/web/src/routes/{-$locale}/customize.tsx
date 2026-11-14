import { Outlet, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MOTION_CATEGORIES } from "@/lib/motion-catalog";
import type { MotionCategory } from "@/lib/motion-catalog";
import { getLandingData } from "@/server/functions";

const CustomizeLayout = () => (
  <>
    <SiteHeader />
    <Outlet />
    <SiteFooter />
  </>
);

interface CustomizeSearch {
  category?: MotionCategory;
}

// Layout for `/customize` and `/customize/$slug`: the child routes own the
// page body and head tags.
export const Route = createFileRoute("/{-$locale}/customize")({
  component: CustomizeLayout,
  validateSearch: (search): CustomizeSearch => ({
    category: z.enum(MOTION_CATEGORIES).safeParse(search.category).data,
  }),
  loader: () => getLandingData(),
});
