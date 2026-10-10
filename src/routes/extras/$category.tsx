import { createFileRoute, notFound } from "@tanstack/react-router";

import { DIRECTORY_PAGES, findDirectoryCategory } from "@/lib/directories";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/extras` layout; this route owns the category
// URL (e.g. `/extras/articles`) and its head tags.
export const Route = createFileRoute("/extras/$category")({
  loader: ({ params }) => {
    const category = findDirectoryCategory("extra", params.category);
    if (!category) {
      throw notFound();
    }
    return { category };
  },
  head: ({ loaderData, params }) =>
    createMetadata({
      canonical: `/extras/${params.category}`,
      ...(loaderData && DIRECTORY_PAGES.extra[loaderData.category.slug]),
    }),
});
