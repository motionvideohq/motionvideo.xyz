import { createFileRoute } from "@tanstack/react-router";

import { DocsPage, docsHead, loadDocsPage } from "@/components/docs/docs-page";
import { docsPageMarkdown, markdownResponse } from "@/server/docs-markdown";
import { getDocsSource } from "@/server/docs-source";

// /docs/<slug>: content/docs/<slug>.mdx; unknown slugs throw notFound() in
// the server function.
const DocsSplat = () => <DocsPage data={Route.useLoaderData()} />;

export const Route = createFileRoute("/{-$locale}/docs/$")({
  // /docs/<slug>.md (unprefixed only): the page as Markdown. It lives here
  // because English docs share the unprefixed /docs/… URLs, so a root route
  // for the `.md` files would never win the match; other requests render.
  server: {
    handlers: {
      GET: async ({ params, next }) => {
        const splat = params._splat ?? "";
        if (params.locale !== undefined || !splat.endsWith(".md")) {
          return next();
        }
        const source = await getDocsSource();
        const page = source.getPage(
          splat.slice(0, -3).split("/").filter(Boolean)
        );
        return page
          ? markdownResponse(await docsPageMarkdown(page))
          : new Response("Not found", { status: 404 });
      },
    },
  },
  component: DocsSplat,
  loader: ({ params }) =>
    loadDocsPage(params._splat?.split("/").filter(Boolean) ?? []),
  head: ({ loaderData }) => docsHead(loaderData),
});
