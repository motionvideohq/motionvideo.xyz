import { createFileRoute, useParams } from "@tanstack/react-router";

import { ResourceDirectory } from "@/components/resource-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { directorySearch, findDirectoryCategory } from "@/lib/directories";
import { getLandingData } from "@/server/functions";

const Creatives = () => {
  const { category } = useParams({ strict: false });

  return (
    <>
      <SiteHeader />
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
export const Route = createFileRoute("/{-$locale}/creatives")({
  component: Creatives,
  loader: () => getLandingData(),
  // `?filter=` (specialty) and `?sort=`, on any category page.
  validateSearch: directorySearch("studio"),
});
