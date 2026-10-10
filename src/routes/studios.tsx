import { createFileRoute, redirect } from "@tanstack/react-router";

// Studios and designers moved to /creatives.
export const Route = createFileRoute("/studios")({
  beforeLoad: () => {
    throw redirect({ to: "/creatives", statusCode: 301 });
  },
});
