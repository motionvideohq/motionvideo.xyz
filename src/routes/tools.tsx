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

const routeApi = getRouteApi("/tools");

const Tools = () => {
  const { signedIn } = routeApi.useLoaderData();
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <ResourceDirectory
        kind="tool"
        category={findDirectoryCategory("tool", category)}
      />
      <SiteFooter />
    </>
  );
};

// Layout for `/tools` and `/tools/$category`: the directory stays mounted while
// switching categories; the child routes own the URL and head tags.
export const Route = createFileRoute("/tools")({
  component: Tools,
  loader: () => getLandingData(),
});
