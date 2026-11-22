import { Outlet, createFileRoute, useMatches } from "@tanstack/react-router";

import { PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Text pages share a narrow document; changelog owns its grid/article layout.
// Pathless: the child routes keep their own URLs, e.g. /terms.
const PagesLayout = () => {
  const changelog = useMatches({
    select: (matches) =>
      matches.some((match) =>
        match.routeId.startsWith("/{-$locale}/_pages/changelog")
      ),
  });
  return (
    <>
      <SiteHeader />
      {changelog ? (
        <Outlet />
      ) : (
        <PageMain layout="document" width="narrow">
          <Outlet />
        </PageMain>
      )}
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages")({
  component: PagesLayout,
});
