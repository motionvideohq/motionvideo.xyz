import { createFileRoute, notFound } from "@tanstack/react-router";

import { DIRECTORY_PAGES, findDirectoryCategory } from "@/lib/directories";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/skills` layout; this route owns the category
// URL (e.g. `/skills/ai-video`) and its head tags.
export const Route = createFileRoute("/skills/$category")({
  loader: ({ params }) => {
    const category = findDirectoryCategory("skill", params.category);
    if (!category) {
      throw notFound();
    }
    return { category };
  },
  head: ({ loaderData, params }) =>
    createMetadata({
      canonical: `/skills/${params.category}`,
      ...(loaderData && DIRECTORY_PAGES.skill[loaderData.category.slug]),
    }),
});
