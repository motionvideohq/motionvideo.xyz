import { createFileRoute } from "@tanstack/react-router";

import { DocsPage, docsHead, loadDocsPage } from "@/components/docs/docs-page";

// /docs/<slug>: content/docs/<slug>.mdx; unknown slugs throw notFound() in
// the server function.
const DocsSplat = () => <DocsPage data={Route.useLoaderData()} />;

export const Route = createFileRoute("/docs/$")({
  component: DocsSplat,
  loader: ({ params }) =>
    loadDocsPage(params._splat?.split("/").filter(Boolean) ?? []),
  head: ({ loaderData }) => docsHead(loaderData),
});
