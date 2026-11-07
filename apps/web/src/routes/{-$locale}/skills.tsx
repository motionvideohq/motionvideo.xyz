import { createFileRoute, useParams } from "@tanstack/react-router";

import { ResourceDirectory } from "@/components/resource-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { directorySearch, findDirectoryCategory } from "@/lib/directories";
import { getLandingData } from "@/server/functions";

const Skills = () => {
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader />
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
// `?filter=` (renderer) and `?sort=` apply on any of them.
export const Route = createFileRoute("/{-$locale}/skills")({
  component: Skills,
  loader: () => getLandingData(),
  validateSearch: directorySearch("skill"),
});
