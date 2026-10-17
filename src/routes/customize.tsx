import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLandingData } from "@/server/functions";

const CustomizeLayout = () => {
  const { signedIn } = Route.useLoaderData();
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
