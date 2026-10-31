import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { DemoFrame } from "@/components/demo-frame";
import { FeatureArt } from "@/components/feature-art";
import { GitHubIcon } from "@/components/icons";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SectionHeader } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { SKILL } from "@/constants/skill";
import { VIDEOS } from "@/constants/videos";
import { faqJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/$locale/motionvideo-skill");

const Landing = () => {
  const { signedIn } = routeApi.useLoaderData();
  const content = useIntlayer("landing");
  const { faqs } = useIntlayer("faqs");
  const { features } = useIntlayer("features");
  const { steps } = useIntlayer("steps");

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main
        id="main-content"
        className="flex flex-col gap-24 pt-12 pb-8 sm:pt-20"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6">
          {/* Equal halves, as on the MCP page, so both heroes split at the
              same line whatever the heading's width. */}
          <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
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
                {/* ROUTES.DOCS_SKILL, through the docs' catch-all route. */}
                <Link
                  to="/docs/$"
                  params={{ _splat: "skill" }}
                  className={buttonVariants({
                    size: "xl",
                    variant: "gradient",
                  })}
                >
                  {content.setUp}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <a
                  href={SKILL.SETUP_SOURCE}
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
          <DemoFrame src={VIDEOS.hero} variant="dashboard" autoplay="load" />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-24 px-6">
          <section className="flex flex-col gap-8">
            <SectionHeader
              align="start"
              title={content.timeline}
              description={
                <>
                  <p>{content.judgment}</p>
                  <p>{content.code}</p>
                </>
              }
            />
            <DemoFrame
              src={VIDEOS.showreel}
              variant="dashboard"
              caption={{
                label: content.showreel.value,
                prompt: content.showreelPrompt.value,
              }}
            />
          </section>

          <section className="flex flex-col gap-8">
            <SectionHeader
              align="start"
              title={content.launchTitle}
              description={
                <>
                  <p>{content.launchBody}</p>
                  <p>{content.control}</p>
                </>
              }
            />
            <DemoFrame
              src={VIDEOS.launch}
              variant="palette"
              caption={{
                label: content.launchLabel.value,
                prompt: content.launchPrompt.value,
              }}
            />
          </section>

          <section
            id="how-it-works"
            className="flex scroll-mt-8 flex-col gap-6"
          >
            <SectionHeader align="start" title={content.how} />
            <ol className="flex flex-col gap-3.5">
              {steps.map((step, i) => (
                <li key={step.value} className="flex items-baseline gap-3.5">
                  <span className="text-muted-foreground w-6 shrink-0 font-mono text-sm tabular-nums">
                    0{i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id="features" className="flex scroll-mt-8 flex-col gap-6">
            <SectionHeader title={content.pack} />
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title.value}
                  className="bg-card shadow-outline flex flex-col gap-4 rounded-xl p-4"
                >
                  <FeatureArt kind={item.art.value} />
                  <div className="flex flex-col gap-1.5 px-1 pb-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className="flex scroll-mt-8 flex-col gap-6">
            <SectionHeader title={content.faq} />
            <Accordion>
              {faqs.map((faq) => (
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

export const Route = createFileRoute("/$locale/motionvideo-skill")({
  component: Landing,
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).skill;
    return {
      ...createMetadata({ title: meta.title, description: meta.description }),
      scripts: [faqJsonLd(params.locale)],
    };
  },
  loader: () => getLandingData(),
});
