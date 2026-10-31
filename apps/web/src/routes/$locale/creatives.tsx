import {
  createFileRoute,
  getRouteApi,
  useParams,
} from "@tanstack/react-router";

import { ResourceDirectory } from "@/components/resource-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  directorySearch,
  findDirectoryCategory,
  findDirectoryFilter,
} from "@/lib/directories";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/$locale/creatives");

const Creatives = () => {
  const { signedIn } = routeApi.useLoaderData();
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <ResourceDirectory
        kind="studio"
        category={findDirectoryCategory("studio", category)}
        facet={findDirectoryFilter("studio", category)}
      />
      <SiteFooter />
    </>
  );
};

// The directory stays mounted across category and facet paths; child routes
// own their URLs, redirects and head tags.
export const Route = createFileRoute("/$locale/creatives")({
  component: Creatives,
  loader: () => getLandingData(),
  // `?filter=` (specialty) and `?sort=`, on any category page.
  validateSearch: directorySearch("studio"),
});
