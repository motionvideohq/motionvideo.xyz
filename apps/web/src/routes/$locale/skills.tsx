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

const routeApi = getRouteApi("/$locale/skills");

const Skills = () => {
  const { signedIn } = routeApi.useLoaderData();
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <ResourceDirectory
        kind="skill"
        category={findDirectoryCategory("skill", category)}
        facet={findDirectoryFilter("skill", category)}
      />
      <SiteFooter />
    </>
  );
};

// Agent skills, split out of the tools import (`/tools/skills` redirects here).
// The directory stays mounted across category and facet paths; child routes
// own their URLs, redirects and head tags.
export const Route = createFileRoute("/$locale/skills")({
  component: Skills,
  loader: () => getLandingData(),
  validateSearch: directorySearch("skill"),
});
