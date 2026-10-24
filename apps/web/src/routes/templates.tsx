import { Outlet, createFileRoute, getRouteApi } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/templates");

const TemplatesLayout = () => {
  const { signedIn } = routeApi.useLoaderData();
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <Outlet />
      <SiteFooter />
    </>
  );
};

// Layout for `/templates`, `/templates/$templateId` and its customize page:
// the child routes own the page body and head tags.
export const Route = createFileRoute("/templates")({
  component: TemplatesLayout,
  loader: () => getLandingData(),
});
