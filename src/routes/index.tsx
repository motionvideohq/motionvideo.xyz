import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { cn } from "cn";
import { useIntlayer } from "react-intlayer";

import { DemoFrame } from "@/components/demo-frame";
import { FeatureArt } from "@/components/feature-art";
import { LogoGroup } from "@/components/logo-group";
import { PriceCard } from "@/components/pricing";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { AGENTS, RENDERERS } from "@/constants/stack";
import { VIDEOS } from "@/constants/videos";
import { faqJsonLd, productJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData, getOffer } from "@/server/functions";

const routeApi = getRouteApi("/");

const sectionTitle = "text-2xl font-semibold tracking-tight";

const Landing = () => {
  const { signedIn, offer } = routeApi.useLoaderData();
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
          <section className="grid gap-8 md:grid-cols-[max-content_minmax(0,1fr)] md:gap-16">
            <div className="flex flex-col justify-between gap-6">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {content.heroStart}
                <br />
                {content.heroEnd}
              </h1>
              <div className="flex flex-col gap-3">
                <LogoGroup logos={AGENTS} label={content.agents.value} />
                <LogoGroup logos={RENDERERS} label={content.stack.value} />
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <p className="text-muted-foreground text-lg text-pretty">
                {content.intro}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#pricing"
                  className={cn(buttonVariants({ size: "cta" }))}
                >
                  {content.pricing}
                </a>
                <span className="text-muted-foreground text-sm">
                  {content.oneTime}
                </span>
              </div>
            </div>
          </section>
          <DemoFrame src={VIDEOS.hero} variant="dashboard" autoplay="load" />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-24 px-6">
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className={sectionTitle}>
                {content.timeline}
              </h2>
              <p className="text-muted-foreground">
                {content.judgment}
              </p>
              <p className="text-muted-foreground">
                {content.code}
              </p>
            </div>
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
            <div className="flex flex-col gap-4">
              <h2 className={sectionTitle}>{content.launchTitle}</h2>
              <p className="text-muted-foreground">
                {content.launchBody}
              </p>
              <p className="text-muted-foreground">
                {content.control}
              </p>
            </div>
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
            <h2 className={sectionTitle}>{content.how}</h2>
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
            <div className="flex flex-col gap-4">
              <h2 className={sectionTitle}>{content.pack}</h2>
              <p className="text-muted-foreground">
                {content.packIntro}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title.value}
                  className="bg-card flex flex-col gap-4 rounded-xl border p-4"
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
            <h2 className={sectionTitle}>{content.faq}</h2>
            <Accordion>
              {faqs.map((faq) => (
                <AccordionItem key={faq.question.value} value={faq.question.value}>
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

          <section id="pricing" className="flex scroll-mt-8 flex-col gap-8">
            <h2 className={cn(sectionTitle, "text-center")}>
              {content.priceTitle}
            </h2>
            <PriceCard offer={offer} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Landing,
  head: ({ loaderData }) => ({
    ...createMetadata({
      canonical: ROUTES.HOME,
      description: SITE.DESCRIPTION.LONG,
    }),
    scripts: [productJsonLd(loaderData?.offer), faqJsonLd()],
  }),
  loader: async () => {
    const [landing, offer] = await Promise.all([getLandingData(), getOffer()]);
    return { ...landing, offer };
  },
});
