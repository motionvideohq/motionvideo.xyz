import { createFileRoute } from "@tanstack/react-router";

import { DocsPage, docsHead, loadDocsPage } from "@/components/docs/docs-page";

// /docs: content/docs/index.mdx (Quickstart).
const DocsIndex = () => <DocsPage data={Route.useLoaderData()} />;

export const Route = createFileRoute("/docs/")({
  component: DocsIndex,
  loader: () => loadDocsPage([]),
  head: ({ loaderData }) => docsHead(loaderData),
});
