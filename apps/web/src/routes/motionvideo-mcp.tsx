import { Link, createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { Crown } from "reicon-react/icons/Crown";

import { GitHubIcon } from "@/components/brand-icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";
import { getMcpDemo } from "@/server/mcp-landing-functions";
import type { McpDemo } from "@/server/mcp-landing-functions";

// The server's source; setup lives in the docs (/docs/mcp).
const MCP_REPO = "https://github.com/motionvideohq/motionvideo-mcp";

// `pro`: needs a Pro or Business plan on the signed-in account (see /docs/mcp).
const TOOLS = [
  { name: "search-videos", key: "searchVideos", pro: false },
  { name: "get-video", key: "getVideo", pro: false },
  { name: "list-categories", key: "listCategories", pro: false },
  { name: "browse-directory", key: "browseDirectory", pro: false },
  { name: "search-moves", key: "searchMoves", pro: true },
  { name: "get-move-prompt", key: "getMovePrompt", pro: true },
] as const;

const EXTRAS = [
  {
    name: "motionvideo://catalog/overview",
    kind: "resource",
    key: "catalogOverview",
  },
  { name: "motionvideo://videos/{slug}", kind: "resource", key: "videoEntry" },
  { name: "remix-video", kind: "prompt", key: "remixVideo" },
] as const;

const routeApi = getRouteApi("/motionvideo-mcp");

const sectionTitle = "text-2xl font-semibold tracking-tight";

/** A tool call as the client shows it: server and tool, then its arguments. */
const ToolCall = ({ name, args }: { name: string; args: string }) => (
  <p className="text-muted-foreground flex min-w-0 items-center gap-2 font-mono text-xs">
    <span className="bg-background text-foreground shrink-0 rounded-md border px-2 py-1 shadow-xs">
      <span className="text-muted-foreground">motionvideo · </span>
      {name}
    </span>
    <span className="truncate">{args}</span>
  </p>
);

/**
 * A still of an agent conversation using the server: the user's ask, a
 * `search-videos` call with real catalog results, then `get-video` with the
 * first result's original prompt.
 */
const Conversation = ({ demo }: { demo: McpDemo }) => {
  const content = useIntlayer("mcp-landing");
  const { detail } = demo;
  return (
    <figure className="flex flex-col gap-3">
      <div className="bg-muted/40 overflow-hidden rounded-xl border shadow-sm">
        <div aria-hidden="true" className="flex gap-1.5 border-b px-4 py-3">
          <span className="bg-foreground/15 size-2.5 rounded-full" />
          <span className="bg-foreground/15 size-2.5 rounded-full" />
          <span className="bg-foreground/15 size-2.5 rounded-full" />
        </div>
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <p className="bg-background ml-auto max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm shadow-xs">
            {content.demo.user}
          </p>
          <ToolCall name="search-videos" args={JSON.stringify(demo.search)} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {demo.videos.map((video) => (
              <li key={video.slug} className="min-w-0">
                <Link
                  to="/videos/$slug"
                  params={{ slug: video.slug }}
                  className="bg-background flex flex-col overflow-hidden rounded-lg border shadow-xs transition-shadow hover:shadow-md"
                >
                  <img
                    src={video.poster}
                    alt=""
                    width={320}
                    height={180}
                    loading="lazy"
                    className="bg-muted aspect-video w-full object-cover"
                  />
                  <span className="flex flex-col gap-0.5 p-2.5">
                    <span className="truncate text-sm font-medium">
                      {video.title}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      @{video.handle}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {detail && (
            <>
              <ToolCall
                name="get-video"
                args={JSON.stringify({ slug: detail.slug })}
              />
              <div className="bg-background flex flex-col gap-2 rounded-xl border p-4 shadow-xs">
                <p className="text-muted-foreground flex min-w-0 flex-wrap gap-x-1.5 text-xs">
                  <span className="text-foreground font-medium">
                    {content.demo.prompt}
                  </span>
                  <span aria-hidden="true">·</span>
                  <Link
                    to="/videos/$slug"
                    params={{ slug: detail.slug }}
                    className="hover:underline"
                  >
                    {detail.title}
                  </Link>
                  <span>@{detail.handle}</span>
                </p>
                <blockquote className="font-serif text-sm leading-relaxed">
                  “{detail.excerpt}”
                </blockquote>
              </div>
            </>
          )}
        </div>
      </div>
      <figcaption className="text-muted-foreground text-sm">
        {content.demo.caption}
      </figcaption>
    </figure>
  );
};

const McpLanding = () => {
  const { signedIn, demo } = routeApi.useLoaderData();
  const content = useIntlayer("mcp-landing");

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main
        id="main-content"
        className="flex flex-col gap-24 pt-12 pb-8 sm:pt-20"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6">
          <section className="grid gap-8 md:grid-cols-[max-content_minmax(0,1fr)] md:gap-12">
            <div className="flex flex-col justify-between gap-6">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {content.heroStart}
                <br />
                {content.heroEnd}
              </h1>
              <p className="text-muted-foreground text-sm">{content.note}</p>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <p className="text-muted-foreground text-lg text-pretty">
                {content.intro}
              </p>
              {/* One gradient CTA; the rest are plain. */}
              <div className="flex flex-wrap gap-2">
                {/* ROUTES.DOCS_MCP, through the docs' catch-all route. */}
                <Link
                  to="/docs/$"
                  params={{ _splat: "mcp" }}
                  className={buttonVariants({
                    size: "xl",
                    variant: "gradient",
                  })}
                >
                  {content.setUp}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <a
                  href={MCP_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    size: "xl",
                    variant: "outline",
                  })}
                >
                  <GitHubIcon aria-hidden="true" className="size-4" />
                  {content.github}
                </a>
              </div>
            </div>
          </section>
          <Conversation demo={demo} />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-24 px-6">
          <section id="tools" className="flex scroll-mt-8 flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className={sectionTitle}>{content.toolsTitle}</h2>
              <p className="text-muted-foreground">{content.toolsIntro}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {TOOLS.map((tool) => (
                <li
                  key={tool.name}
                  className="bg-card shadow-outline flex flex-col gap-2 rounded-xl p-5"
                >
                  <span className="text-muted-foreground flex items-center justify-between text-xs">
                    {content.kinds.tool}
                    {tool.pro && (
                      <Tooltip>
                        <TooltipTrigger
                          aria-label={content.proFeature.value}
                          className="text-primary focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-3"
                        >
                          <Crown aria-hidden="true" className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>{content.proFeature}</TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                  <code className="font-mono text-sm font-medium">
                    {tool.name}
                  </code>
                  <p className="text-muted-foreground text-sm text-pretty">
                    {content.capabilities[tool.key]}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="bg-card shadow-outline flex flex-col divide-y rounded-xl">
              {EXTRAS.map((extra) => (
                <div
                  key={extra.name}
                  className="grid gap-1 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-6"
                >
                  <dt className="flex min-w-0 flex-col gap-1">
                    <span className="text-muted-foreground text-xs">
                      {content.kinds[extra.kind]}
                    </span>
                    <code className="font-mono text-sm font-medium break-all">
                      {extra.name}
                    </code>
                  </dt>
                  <dd className="text-muted-foreground text-sm text-pretty sm:self-end">
                    {content.capabilities[extra.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="faq" className="flex scroll-mt-8 flex-col gap-6">
            <h2 className={sectionTitle}>{content.faq}</h2>
            <Accordion>
              {content.faqs.map((faq) => (
                <AccordionItem
                  key={faq.question.value}
                  value={faq.question.value}
                >
                  {/* Roomier rows here only; the shared trigger keeps its default padding. */}
                  {/* oxlint-disable-next-line shadcn/no-restyle */}
                  <AccordionTrigger className="py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/motionvideo-mcp")({
  component: McpLanding,
  head: () =>
    createMetadata({
      canonical: ROUTES.MOTIONVIDEO_MCP,
      title: "MotionVideo MCP",
      description: `Connect ${SITE.NAME} to Claude, ChatGPT, Cursor, VS Code and other MCP clients. Search AI-made motion videos, pull their original prompts, and browse motion tools and studios. The catalog tools are free and need no sign-in.`,
    }),
  loader: async () => {
    const [landing, demo] = await Promise.all([getLandingData(), getMcpDemo()]);
    return { ...landing, demo };
  },
});
