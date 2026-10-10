import {
  createFileRoute,
  getRouteApi,
  useParams,
} from "@tanstack/react-router";

import { ResourceDirectory } from "@/components/resource-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { findDirectoryCategory } from "@/lib/directories";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/creatives");

const Creatives = () => {
  const { signedIn } = routeApi.useLoaderData();
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <ResourceDirectory
        kind="studio"
        category={findDirectoryCategory("studio", category)}
      />
      <SiteFooter />
    </>
  );
};

// Layout for `/creatives` and `/creatives/$category` (studios, designers): the
// directory stays mounted while switching; the child routes own the head tags.
export const Route = createFileRoute("/creatives")({
  component: Creatives,
  loader: () => getLandingData(),
});
