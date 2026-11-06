import { createFileRoute, useParams } from "@tanstack/react-router";

import { ResourceDirectory } from "@/components/resource-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { directorySearch, findDirectoryCategory } from "@/lib/directories";
import { getLandingData } from "@/server/functions";

const Tools = () => {
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader />
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
export const Route = createFileRoute("/$locale/tools")({
  component: Tools,
  loader: () => getLandingData(),
  // `?filter=` (pricing) and `?sort=`, on any category page.
  validateSearch: directorySearch("tool"),
});
