import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLandingData, getSessionFlag } from "@/server/functions";

const TemplatesLayout = () => (
  <>
    <SiteHeader />
    <Outlet />
    <SiteFooter />
  </>
);

// Layout for `/templates`, `/templates/$templateId` and its customize page:
// the child routes own the page body and head tags.
export const Route = createFileRoute("/$locale/templates")({
  component: TemplatesLayout,
  loader: async () => ({
    ...(await getLandingData()),
    signedIn: await getSessionFlag(),
  }),
});
