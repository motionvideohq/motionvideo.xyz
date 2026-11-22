import { createFileRoute } from "@tanstack/react-router";

import { designGuideMarkdown } from "@/server/design-markdown";
import { markdownResponse } from "@/server/docs-markdown";

export const Route = createFileRoute("/design.md")({
  server: { handlers: { GET: () => markdownResponse(designGuideMarkdown) } },
});
