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

const routeApi = getRouteApi("/extras");

const Extras = () => {
  const { signedIn } = routeApi.useLoaderData();
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <ResourceDirectory
        kind="extra"
        category={findDirectoryCategory("extra", category)}
      />
      <SiteFooter />
    </>
  );
};

// Layout for `/extras` and `/extras/$category`: X articles and resources that
// fit no other section (`/tools/resources` redirects here). The directory stays
// mounted while switching categories; the child routes own the URL and head tags.
export const Route = createFileRoute("/extras")({
  component: Extras,
  loader: () => getLandingData(),
});
