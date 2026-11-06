import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { LocalizedLink as Link } from "@/components/localized-link";
import { LogoGroup } from "@/components/logo-group";
import { MotionPreview } from "@/components/motion-video";
import { HeroHeader, PageMain, SectionHeader } from "@/components/page";
import { BillingToggle, ParityBanner, PlanCards } from "@/components/pricing";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialProof } from "@/components/social-proof";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LocaleHeadContext } from "@/constants/locales";
import { MCP_RESOURCE } from "@/constants/oauth";
import { PLAN_BILLINGS } from "@/constants/plans";
import type { PlanBilling } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { SKILL } from "@/constants/skill";
import { AGENTS, RENDERERS } from "@/constants/stack";
import { cn } from "@/lib/utils";
import { planJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData, getSessionFlag } from "@/server/functions";
import { getMoveCards } from "@/server/move-functions";
import { getMyPlan, getParityOffer } from "@/server/plan-functions";

interface ProSearch {
  /** Omitted for monthly, the default tab. */
  billing?: Exclude<PlanBilling, "monthly">;
}

const routeApi = getRouteApi("/$locale/pro");

// The private skill repository's skills.
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
  /** Copy beside its media from lg, for tiles that span the whole row. */
  horizontal?: boolean;
}

/** One "What you get" bento tile: copy on top, its media below (or beside). */
const Tile = ({
  title,
  body,
  link,
  children,
  className,
  horizontal,
}: TileProps) => (
  <article
    className={cn(
      "bg-card shadow-outline flex flex-col gap-6 rounded-2xl p-6 sm:p-8",
      horizontal && "lg:grid lg:grid-cols-2 lg:items-center lg:gap-10",
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
    <AccordionTrigger icon="plus" className="py-4">
      {question}
    </AccordionTrigger>
    <AccordionContent>{children}</AccordionContent>
  </AccordionItem>
);

const Pro = () => {
  const content = useIntlayer("pricing-page");
  const landing = useIntlayer("landing");
  const { signedIn, access, cards, parity } = routeApi.useLoaderData();
  const { billing = "monthly" } = routeApi.useSearch();
  const previews = Object.values(cards).slice(0, PREVIEW_COUNT);

  return (
    <>
      <SiteHeader />
      <PageMain layout="landing" width="full" className="items-center">
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
        {/* Toggle, cards and the parity note below them share one gap. */}
        <section
          aria-label={content.plans.value}
          className="flex w-full max-w-5xl flex-col items-center gap-6"
        >
          <BillingToggle billing={billing} />
          <PlanCards billing={billing} access={access} signedIn={signedIn} />
          {parity && <ParityBanner offer={parity} />}
        </section>
        <SocialProof />
        <section
          aria-labelledby="what-you-get"
          className="flex w-full max-w-5xl flex-col gap-6"
        >
          <SectionHeader id="what-you-get" title={content.whatYouGet} />
          {/* What your agent gets, nothing else: Moves beside Templates (4|2),
              then MCP and the skill full width with their snippets beside the
              copy. Rows are as tall as their content. One column below lg,
              `minmax(0,1fr)` so the truncated snippets can't widen it. */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            <Tile
              title={content.movesTitle}
              body={content.movesBody}
              link={
                <Link to={ROUTES.MOVES} className={featureLinkClass}>
                  {content.browseMoves}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
              className="lg:col-span-4"
            >
              {/* Clips from moves' gallery examples, cropped to one shape. */}
              <ul className="mt-auto grid grid-cols-2 gap-2 sm:grid-cols-4">
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
              className="lg:col-span-2"
            />
            <Tile
              title={content.mcpTitle}
              body={content.mcpBody}
              link={
                // ROUTES.DOCS_MCP, through the docs' catch-all route.
                <Link
                  to={ROUTES.DOCS_PAGE}
                  params={{ _splat: "mcp" }}
                  className={featureLinkClass}
                >
                  {content.mcpDocs}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
              horizontal
              className="lg:col-span-6"
            >
              <div aria-hidden="true" className={snippetClass}>
                <pre className="overflow-hidden">
                  {`"motionvideo": {\n  "url": "${MCP_RESOURCE}"\n}`}
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
              title={content.skillTitle}
              body={content.skillBody}
              link={
                // ROUTES.DOCS_SKILL, through the docs' catch-all route.
                <Link
                  to={ROUTES.DOCS_PAGE}
                  params={{ _splat: "skill" }}
                  className={featureLinkClass}
                >
                  {content.skillDocs}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
              horizontal
              className="lg:col-span-6"
            >
              <div aria-hidden="true" className={snippetClass}>
                <p className="truncate">
                  <span className="text-muted-foreground select-none">$ </span>
                  {SKILL.INSTALL_COMMAND_SSH}
                </p>
                <ul className="text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-1">
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
          <SectionHeader id="faq" title={content.faq} />
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

export const Route = createFileRoute("/$locale/pro")({
  component: Pro,
  validateSearch: (search): ProSearch => {
    const billing = PLAN_BILLINGS.find((option) => option === search.billing);
    return { billing: billing === "monthly" ? undefined : billing };
  },
  loader: async () => {
    const [landing, access, cards, parity, signedIn] = await Promise.all([
      getLandingData(),
      getMyPlan(),
      getMoveCards(),
      getParityOffer(),
      getSessionFlag(),
    ]);
    return { ...landing, access, cards, parity, signedIn };
  },
  head: ({ params }: LocaleHeadContext) => ({
    ...createMetadata({
      title: `${SITE.NAME} Pro`,
      description: `${SITE.NAME} Pro and Business: the full Moves library with every prompt, every prompt template with its customizer, the Pro agent skill and every update. Pro from $9 a month, $79 a year or $149 once; Business with 3 seats from $29 a month.`,
    }),
    scripts: planJsonLd(params.locale),
  }),
});
