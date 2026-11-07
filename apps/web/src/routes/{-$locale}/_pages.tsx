import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Shared shell for text pages (about, brand, contact, legal). Pathless: the
// child routes keep their own URLs, e.g. /terms.
const PagesLayout = () => (
  <>
    <SiteHeader />
    <PageMain layout="document" width="narrow">
      <Outlet />
    </PageMain>
    <SiteFooter />
  </>
);

export const Route = createFileRoute("/{-$locale}/_pages")({
  component: PagesLayout,
});
