import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { DIRECTORY_PAGES, findDirectoryCategory } from "@/lib/directories";
import { createMetadata } from "@/seo/metadata";

// Former tool categories that became their own sections.
const MOVED_CATEGORIES = {
  skills: ROUTES.SKILLS,
  resources: ROUTES.EXTRAS,
} as const;

// The directory renders in the `/tools` layout; this route owns the category
// URL (e.g. `/tools/ai`) and its head tags.
export const Route = createFileRoute("/tools/$category")({
  beforeLoad: ({ params }) => {
    const moved = Object.entries(MOVED_CATEGORIES).find(
      ([slug]) => slug === params.category
    )?.[1];
    if (moved) {
      throw redirect({ href: moved, statusCode: 301 });
    }
  },
  loader: ({ params }) => {
    const category = findDirectoryCategory("tool", params.category);
    if (!category) {
      throw notFound();
    }
    return { category };
  },
  head: ({ loaderData, params }) =>
    createMetadata({
      canonical: `/tools/${params.category}`,
      ...(loaderData && DIRECTORY_PAGES.tool[loaderData.category.slug]),
    }),
});
