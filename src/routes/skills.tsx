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

const routeApi = getRouteApi("/skills");

const Skills = () => {
  const { signedIn } = routeApi.useLoaderData();
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <ResourceDirectory
        kind="skill"
        category={findDirectoryCategory("skill", category)}
      />
      <SiteFooter />
    </>
  );
};

// Layout for `/skills` and `/skills/$category`: agent skills, split out of the
// tools import (`/tools/skills` redirects here). The directory stays mounted
// while switching categories; the child routes own the URL and head tags.
export const Route = createFileRoute("/skills")({
  component: Skills,
  loader: () => getLandingData(),
});
