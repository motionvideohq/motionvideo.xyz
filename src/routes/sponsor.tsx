import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Check } from "reicon-react/icons/Check";
import { Envelope } from "reicon-react/icons/Envelope";
import { HandHeart } from "reicon-react/icons/HandHeart";
import { Plus } from "reicon-react/icons/Plus";
import { z } from "zod";

import { XIcon } from "@/components/brand-icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import directories from "@/data/resource-directories.json";
import { MOTION_CATEGORIES } from "@/lib/motion-catalog";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const TIER_IDS = ["diamond", "gold", "silver"] as const;
type TierId = (typeof TIER_IDS)[number];

// Monthly subscriptions, billed through the Dodo checkout at ROUTES.CHECKOUT.
const TIERS: readonly { id: TierId; usdPerMonth: number }[] = [
  { id: "diamond", usdPerMonth: 500 },
  { id: "gold", usdPerMonth: 250 },
  { id: "silver", usdPerMonth: 150 },
];

const checkoutHref = (tier: TierId) => `${ROUTES.CHECKOUT}?product=${tier}`;

// Reach is counted from the catalogue that ships with the site, never from
// traffic estimates.
const STATS = [
  { id: "videos", value: catalog.videos.length },
  {
    id: "creators",
    value: new Set(catalog.videos.map(({ handle }) => handle)).size,
  },
  { id: "tools", value: directories.tools.entries.length },
  { id: "categories", value: MOTION_CATEGORIES.length },
] as const;

const sectionTitle = "text-2xl font-semibold tracking-tight";

interface SponsorSearch {
  thanks?: TierId;
}

const routeApi = getRouteApi("/sponsor");

const Sponsor = () => {
  const content = useIntlayer("sponsor");
  const { signedIn } = routeApi.useLoaderData();
  const { thanks } = routeApi.useSearch();

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 pt-12 pb-8 sm:px-6 sm:pt-20"
      >
        {thanks && (
          <section
            aria-live="polite"
            className="bg-card flex items-start gap-3 rounded-2xl border p-6"
          >
            <ReiconDuotone
              icon={HandHeart}
              aria-hidden="true"
              className="mt-0.5 size-6 shrink-0"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{content.thanksTitle}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {content.thanksBody}{" "}
                <a
                  href={`mailto:${LINK.EMAIL}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {LINK.EMAIL}
                </a>
                .
              </p>
            </div>
          </section>
        )}

        <header className="flex max-w-2xl flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="text-lg text-pretty">{content.pitch}</p>
          <p className="text-muted-foreground text-pretty">{content.note}</p>
        </header>

        <section aria-labelledby="reach" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="reach" className={sectionTitle}>
              {content.reach}
            </h2>
            <p className="text-muted-foreground text-sm">{content.reachNote}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.id}
                className="bg-card flex flex-col-reverse gap-1 rounded-xl border p-4"
              >
                <dt className="text-muted-foreground text-sm">
                  {content.stats[stat.id]}
                </dt>
                <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="sponsors" className="flex flex-col gap-6">
          <h2 id="sponsors" className={sectionTitle}>
            {content.sponsors}
          </h2>
          <ul className="flex flex-col gap-3">
            {TIERS.map(({ id }) => (
              <li
                key={id}
                className="grid gap-2 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-center"
              >
                <span className="text-muted-foreground text-sm">
                  {content.tiers[id].name}
                </span>
                <a
                  href={checkoutHref(id)}
                  className="group hover:bg-muted/60 border-foreground/20 flex items-center gap-3 rounded-xl border border-dashed p-3 transition-colors"
                >
                  <span className="bg-muted text-muted-foreground group-hover:text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <ReiconDuotone
                      icon={Plus}
                      aria-hidden="true"
                      className="size-4"
                    />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {content.tiers[id].firstSponsor}
                  </span>
                  <span className="text-muted-foreground group-hover:text-foreground hidden items-center gap-1.5 text-sm transition-colors sm:inline-flex">
                    {content.takeSlot}
                    <ReiconDuotone
                      icon={ArrowRight}
                      aria-hidden="true"
                      className="size-4"
                    />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="plans" className="flex flex-col gap-6">
          <h2 id="plans" className={sectionTitle}>
            {content.plans}
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {TIERS.map(({ id, usdPerMonth }) => {
              const tier = content.tiers[id];
              const featured = id === "diamond";
              return (
                <li key={id} className="flex">
                  <Card size="lg" className="w-full">
                    <CardHeader>
                      <div className="flex flex-col gap-3">
                        <h3 className="flex items-center justify-between gap-2 text-base font-semibold">
                          {tier.name}
                          {featured && <Badge>{content.mostImpact}</Badge>}
                        </h3>
                        <p className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-semibold tracking-tight tabular-nums">
                            ${usdPerMonth}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {content.perMonth}
                          </span>
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="flex flex-col gap-3 text-sm">
                        {tier.perks.map((perk) => (
                          <li key={perk.value} className="flex gap-2">
                            <ReiconDuotone
                              icon={Check}
                              aria-hidden="true"
                              className="text-primary mt-0.5 size-4 shrink-0"
                            />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="border-t-0 bg-transparent pt-0">
                      <a
                        href={checkoutHref(id)}
                        className={buttonVariants({
                          className: "w-full",
                          size: "lg",
                          variant: featured ? "gradient" : "outline",
                        })}
                      >
                        {tier.choose}
                        <ReiconDuotone icon={ArrowRight} aria-hidden="true" />
                      </a>
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="custom"
          className="bg-card flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-2">
            <h2 id="custom" className="text-lg font-semibold">
              {content.customTitle}
            </h2>
            <p className="text-muted-foreground text-sm text-pretty">
              {content.customBody}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href={`mailto:${LINK.EMAIL}`}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <ReiconDuotone icon={Envelope} aria-hidden="true" />
              {content.email}
            </a>
            <a
              href={LINK.X}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <XIcon aria-hidden="true" />
              {content.dmX}
              <ReiconDuotone icon={ArrowRightUp} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section aria-labelledby="faq" className="flex flex-col gap-6">
          <h2 id="faq" className={sectionTitle}>
            {content.faq}
          </h2>
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
      </main>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/sponsor")({
  component: Sponsor,
  loader: () => getLandingData(),
  validateSearch: (search): SponsorSearch => ({
    thanks: z.enum(TIER_IDS).safeParse(search.thanks).data,
  }),
  head: () =>
    createMetadata({
      canonical: ROUTES.SPONSOR,
      title: "Sponsor",
      description:
        "Sponsor MotionVideo: three monthly plans from $150 to reach people who make product films and motion design with AI and code. Labelled on the page and in the markup.",
    }),
});
