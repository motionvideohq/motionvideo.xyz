import { Link, createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { LogoGroup } from "@/components/logo-group";
import { MotionPreview } from "@/components/motion-video";
import { HeroHeader, PageMain } from "@/components/page";
import { BillingToggle, PlanCards } from "@/components/pricing";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PLAN_BILLINGS } from "@/constants/plans";
import type { PlanBilling } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { AGENTS, RENDERERS } from "@/constants/stack";
import { cn } from "@/lib/utils";
import { planJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";
import { getMoveCards } from "@/server/move-functions";
import { getMyPlan } from "@/server/plan-functions";

interface ProSearch {
  /** Omitted for monthly, the default tab. */
  billing?: Exclude<PlanBilling, "monthly">;
}

const routeApi = getRouteApi("/pro");

// The private skill repository's install command and its skills.
const INSTALL_COMMAND =
  "npx skills add git@github.com:motionvideohq/motionvideo-skill.git";
const SKILLS = [
  "motion-video",
  "motion-storyboard",
  "motion-craft",
  "motion-system",
  "motion-review",
  "motion-remotion",
  "motion-hyperframes",
  "motion-editframe",
  "motion-fframes",
] as const;

const PREVIEW_COUNT = 4;

// The Pro MCP tools a Pro or Business sign-in unlocks (see /docs/mcp).
const PRO_MCP_TOOLS = ["search-moves", "get-move-prompt"] as const;

const featureLinkClass =
  "text-foreground inline-flex items-center gap-1 text-sm font-medium hover:underline";

const snippetClass =
  "bg-muted mt-auto flex flex-col gap-3 overflow-hidden rounded-xl p-5 font-mono text-xs leading-relaxed sm:text-sm";

interface TileProps {
  title: ReactNode;
  body: ReactNode;
  link?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** One "What you get" bento tile: copy on top, its media below. */
const Tile = ({ title, body, link, children, className }: TileProps) => (
  <article
    className={cn(
      "bg-card shadow-outline flex flex-col gap-6 rounded-2xl p-6 sm:p-8",
      className
    )}
  >
    <div className="flex flex-col items-start gap-3">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-pretty">{body}</p>
      {link}
    </div>
    {children}
  </article>
);

interface FaqItemProps {
  value: string;
  question: ReactNode;
  children: ReactNode;
}

const FaqItem = ({ value, question, children }: FaqItemProps) => (
  <AccordionItem value={value}>
    {/* Roomier rows here only; the shared trigger keeps its default padding. */}
    {/* oxlint-disable-next-line shadcn/no-restyle */}
    <AccordionTrigger className="py-4">{question}</AccordionTrigger>
    <AccordionContent>{children}</AccordionContent>
  </AccordionItem>
);

const Pro = () => {
  const content = useIntlayer("pricing-page");
  const landing = useIntlayer("landing");
  const pricing = useIntlayer("pricing");
  const { signedIn, access, cards } = routeApi.useLoaderData();
  const { billing = "monthly" } = routeApi.useSearch();
  const previews = Object.values(cards).slice(0, PREVIEW_COUNT);

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <PageMain width="full" className="items-center gap-16">
        <HeroHeader
          title={
            <>
              {SITE.NAME} <span className="text-pro-gradient">Pro</span>
            </>
          }
          intro={content.intro}
          actions={
            <div className="flex flex-col items-center gap-3">
              <LogoGroup logos={AGENTS} label={landing.agents.value} />
              <LogoGroup logos={RENDERERS} label={landing.stack.value} />
            </div>
          }
        />
        {/* Toggle, cards and the note below them share one gap. */}
        <section
          aria-label={content.plans.value}
          className="flex w-full max-w-4xl flex-col items-center gap-8"
        >
          <BillingToggle billing={billing} />
          <PlanCards billing={billing} access={access} />
          <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-pretty">
            {content.free}
            <Link to={ROUTES.HOME} className={featureLinkClass}>
              {content.browseGallery}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </p>
        </section>
        <section
          aria-labelledby="what-you-get"
          className="flex w-full max-w-5xl flex-col gap-6"
        >
          <h2
            id="what-you-get"
            className="text-2xl font-semibold tracking-tight"
          >
            {content.whatYouGet}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Tile
              title={content.movesTitle}
              body={content.movesBody}
              link={
                <Link to={ROUTES.MOVES} className={featureLinkClass}>
                  {content.browseMoves}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
              className="sm:col-span-2 lg:col-span-4 lg:row-span-3"
            >
              {/* Clips from moves' gallery examples, cropped to one shape. */}
              <ul className="mt-auto grid grid-cols-2 gap-2">
                {previews.map((media) => (
                  <li
                    key={media.preview}
                    className="[&_video]:object-cover [&>div]:aspect-video!"
                  >
                    <MotionPreview video={media} paused={false} />
                  </li>
                ))}
              </ul>
            </Tile>
            <Tile
              title={content.templatesTitle}
              body={content.templatesBody}
              link={
                <Link to={ROUTES.TEMPLATES} className={featureLinkClass}>
                  {content.browseTemplates}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
              className="sm:col-span-2 lg:col-span-2"
            />
            <Tile
              title={content.mcpTitle}
              body={content.mcpBody}
              link={
                // ROUTES.DOCS_MCP, through the docs' catch-all route.
                <Link
                  to="/docs/$"
                  params={{ _splat: "mcp" }}
                  className={featureLinkClass}
                >
                  {content.mcpSetup}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
              className="lg:col-span-2"
            >
              <div aria-hidden="true" className={snippetClass}>
                <pre className="overflow-hidden">
                  {`"motionvideo": {\n  "url": "https://mcp.motionvideo.xyz/mcp"\n}`}
                </pre>
                <ul className="text-muted-foreground flex flex-col gap-1">
                  {PRO_MCP_TOOLS.map((tool) => (
                    <li key={tool} className="truncate">
                      <span className="text-primary">✓</span> {tool}
                    </li>
                  ))}
                </ul>
              </div>
            </Tile>
            <Tile
              title={content.updatesTitle}
              body={content.updatesBody}
              className="lg:col-span-2"
            />
            <Tile
              title={content.licenseTitle}
              body={content.licenseBody}
              className="sm:col-span-2 lg:col-span-2"
            >
              <dl className="mt-auto flex flex-col gap-3 text-sm">
                <div className="bg-muted flex flex-col gap-0.5 rounded-xl px-4 py-3">
                  <dt className="font-medium">{pricing.plans.pro.name}</dt>
                  <dd className="text-muted-foreground">
                    {content.licensePro}
                  </dd>
                </div>
                <div className="bg-muted flex flex-col gap-0.5 rounded-xl px-4 py-3">
                  <dt className="font-medium">{pricing.plans.business.name}</dt>
                  <dd className="text-muted-foreground">
                    {content.licenseBusiness}
                  </dd>
                </div>
              </dl>
            </Tile>
            <Tile
              title={content.skillTitle}
              body={content.skillBody}
              link={
                // ROUTES.DOCS_SKILL, through the docs' catch-all route.
                <Link
                  to="/docs/$"
                  params={{ _splat: "skill" }}
                  className={featureLinkClass}
                >
                  {content.installSteps}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
              className="sm:col-span-2 lg:col-span-4"
            >
              <div aria-hidden="true" className={snippetClass}>
                <p className="truncate">
                  <span className="text-muted-foreground select-none">$ </span>
                  {INSTALL_COMMAND}
                </p>
                <ul className="text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                  {SKILLS.map((skill) => (
                    <li key={skill} className="truncate">
                      <span className="text-primary">✓</span> {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </Tile>
          </div>
        </section>
        <section
          aria-labelledby="faq"
          className="flex w-full max-w-3xl flex-col gap-6"
        >
          <h2 id="faq" className="text-xl font-semibold tracking-tight">
            {content.faq}
          </h2>
          <Accordion>
            {content.faqs.map((faq) => (
              <FaqItem
                key={faq.question.value}
                value={faq.question.value}
                question={faq.question}
              >
                <p className="text-muted-foreground">{faq.answer}</p>
              </FaqItem>
            ))}
            <FaqItem
              value={content.refundsFaq.question.value}
              question={content.refundsFaq.question}
            >
              <p className="text-muted-foreground">
                {content.refundsFaq.answer}{" "}
                <Link to={ROUTES.REFUNDS}>{content.refundPolicy}</Link>
              </p>
            </FaqItem>
          </Accordion>
        </section>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/pro")({
  component: Pro,
  validateSearch: (search): ProSearch => {
    const billing = PLAN_BILLINGS.find((option) => option === search.billing);
    return { billing: billing === "monthly" ? undefined : billing };
  },
  loader: async () => {
    const [landing, access, cards] = await Promise.all([
      getLandingData(),
      getMyPlan(),
      getMoveCards(),
    ]);
    return { ...landing, access, cards };
  },
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.PRO,
      title: "MotionVideo Pro",
      description: `${SITE.NAME} Pro and Business: the full Moves library with every prompt, every prompt template with its customizer, the Pro agent skill and every update. Pro from $9 a month, $79 a year or $149 once; Business with 3 seats from $29 a month.`,
    }),
    scripts: planJsonLd(),
  }),
});
