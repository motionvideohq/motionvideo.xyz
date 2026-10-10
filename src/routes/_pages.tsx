import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Shared shell for text pages (about, brand, contact, legal). Pathless: the
// child routes keep their own URLs, e.g. /terms.
const PagesLayout = () => (
  <>
    <SiteHeader signedIn={false} />
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24"
    >
      <Outlet />
    </main>
    <SiteFooter />
  </>
);

export const Route = createFileRoute("/_pages")({
  component: PagesLayout,
});
