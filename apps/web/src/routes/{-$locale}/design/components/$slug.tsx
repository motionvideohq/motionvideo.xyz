import { createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";
import { GitHubIcon } from "@/components/icons";
import { LocalizedLink as Link } from "@/components/localized-link";
import { ROUTES } from "@/constants/routes";
import { registrySourceUrl } from "@/lib/design";
import { buttonVariants } from "@/registry/ui/button";
import { designMarkdownResponse } from "@/server/design-markdown";

const DesignComponent = () => {
  const { slug } = Route.useParams();
  const content = useIntlayer("design");
  return (
    <DesignPage
      slugs={["components", slug]}
      eyebrow={
        <div className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-2 text-xs">
          <Link
            to={ROUTES.DESIGN_COMPONENTS}
            className="hover:text-foreground focus-visible:ring-ring rounded-sm transition-colors outline-none focus-visible:ring-2"
          >
            {content.components}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-mono">{slug}</span>
        </div>
      }
      actions={
        <a
          href={registrySourceUrl(slug)}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <GitHubIcon data-icon="inline-start" />
          {content.viewSource}
        </a>
      }
    />
  );
};

export const Route = createFileRoute("/{-$locale}/design/components/$slug")({
  server: {
    handlers: {
      GET: ({ params, next }) => {
        if (params.locale !== undefined || !params.slug.endsWith(".md")) {
          return next();
        }
        return designMarkdownResponse(["components", params.slug.slice(0, -3)]);
      },
    },
  },
  component: DesignComponent,
  loader: ({ params }) => loadDesignPage(["components", params.slug]),
  head: ({ params }) => designHead(["components", params.slug], params.locale),
});
