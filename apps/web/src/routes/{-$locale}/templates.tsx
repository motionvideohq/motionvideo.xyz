import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLandingData, getSessionFlag } from "@/server/functions";
import { getLocalPrices } from "@/server/plan-functions";

const TemplatesLayout = () => (
  <>
    <SiteHeader />
    <Outlet />
    <SiteFooter />
  </>
);

// Layout for `/templates`, `/templates/$templateId` and its customize page:
// the child routes own the page body and head tags.
export const Route = createFileRoute("/{-$locale}/templates")({
  component: TemplatesLayout,
  loader: async () => {
    // Prices only fill the locked prompts' price line, so they stream in
    // after the page (LockedPrompt) instead of holding it up.
    const prices = getLocalPrices();
    const [landing, signedIn] = await Promise.all([
      getLandingData(),
      getSessionFlag(),
    ]);
    return { ...landing, prices, signedIn };
  },
});
