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

const routeApi = getRouteApi("/$locale/extras");

const Extras = () => {
  const { signedIn } = routeApi.useLoaderData();
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <ResourceDirectory
        kind="extra"
        category={findDirectoryCategory("extra", category)}
        facet={findDirectoryFilter("extra", category)}
      />
      <SiteFooter />
    </>
  );
};

// X articles and resources (`/tools/resources` redirects here). The directory
// stays mounted across category and facet paths; child routes own the URLs,
// redirects and head tags.
export const Route = createFileRoute("/$locale/extras")({
  component: Extras,
  loader: () => getLandingData(),
  // `?filter=` (resource type) and `?sort=`, on any category page.
  validateSearch: directorySearch("extra"),
});
