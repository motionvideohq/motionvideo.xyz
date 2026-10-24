import { Outlet, createFileRoute, getRouteApi } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/customize");

const CustomizeLayout = () => {
  const { signedIn } = routeApi.useLoaderData();
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <Outlet />
      <SiteFooter />
    </>
  );
};

// Layout for `/customize` and `/customize/$slug`: the child routes own the
// page body and head tags.
export const Route = createFileRoute("/customize")({
  component: CustomizeLayout,
  loader: () => getLandingData(),
});
