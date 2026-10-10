import { createFileRoute, notFound } from "@tanstack/react-router";

import { DIRECTORY_PAGES, findDirectoryCategory } from "@/lib/directories";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/creatives` layout; this route owns the
// category URL (`/creatives/studios`, `/creatives/designers`) and its head tags.
export const Route = createFileRoute("/creatives/$category")({
  loader: ({ params }) => {
    const category = findDirectoryCategory("studio", params.category);
    if (!category) {
      throw notFound();
    }
    return { category };
  },
  head: ({ loaderData, params }) =>
    createMetadata({
      canonical: `/creatives/${params.category}`,
      ...(loaderData && DIRECTORY_PAGES.studio[loaderData.category.slug]),
    }),
});
