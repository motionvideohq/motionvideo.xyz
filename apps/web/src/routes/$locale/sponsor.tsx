import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Envelope } from "reicon-react/icons/Envelope";
import { Plus } from "reicon-react/icons/Plus";
import { TickCircle } from "reicon-react/icons/TickCircle";

import { XIcon } from "@/components/icons";
import { LocalizedLink as Link } from "@/components/localized-link";
import { HeroHeader, PageMain, SectionHeader } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SponsorAudienceSection } from "@/components/sponsor-audience";
import { SponsorPlacements } from "@/components/sponsor-placements";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { LINK } from "@/constants/links";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import {
  FOUNDING_SPONSORS,
  SPONSOR_PRICE_USD,
  SPONSOR_TIERS,
} from "@/constants/sponsors";
import type { FoundingSponsor } from "@/constants/sponsors";
import { cn } from "@/lib/utils";
import { withUtm } from "@/lib/utm";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";
import { getSoldOutTiers } from "@/server/sponsorship-functions";

const routeApi = getRouteApi("/$locale/sponsor");

/** A sponsor's mark, name and tagline, linking out (labelled sponsored). */
const SponsorLink = ({ sponsor }: { sponsor: FoundingSponsor }) => (
  <a
    href={withUtm(sponsor.url, "sponsor-page")}
    target="_blank"
    rel="sponsored noopener"
    className="group bg-card shadow-outline hover:bg-muted/60 flex items-center gap-3 rounded-xl p-3 transition-colors"
  >
    <span className="bg-background shadow-outline dark:bg-popover flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1.5">
      <img
        src={sponsor.logo}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn(
          "size-full object-contain",
          sponsor.darkInvert && "dark:invert"
        )}
      />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-sm font-medium">{sponsor.name}</span>
      {sponsor.tagline && (
        <span className="text-muted-foreground truncate text-xs">
          {sponsor.tagline}
        </span>
      )}
    </span>
    <ArrowRightUp
      aria-hidden="true"
      className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors"
    />
  </a>
);

const Sponsor = () => {
  const content = useIntlayer("sponsor");
  const { signedIn, sponsors, soldOutTiers } = routeApi.useLoaderData();

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      {/* Same shell and heading scale as the other company pages (About,
          Brand, Contact). */}
      <PageMain width="full" className="items-center gap-20">
        <HeroHeader
          title={content.pitch}
          intro={content.note}
          actions={
            // From sm up the note hangs off the button's right edge, so the
            // button itself stays centred; on mobile it sits below it.
            <div className="flex flex-col items-center gap-3 sm:relative sm:block">
              <a
                href="#plans"
                className={buttonVariants({ variant: "gradient", size: "xl" })}
              >
                {content.seePlans}
              </a>
              <span className="text-muted-foreground text-sm whitespace-nowrap sm:absolute sm:top-1/2 sm:left-full sm:ml-4 sm:-translate-y-1/2">
                {content.limited}
              </span>
            </div>
          }
        />

        {/* Only real numbers: left out when analytics can't be read. */}
        <SponsorAudienceSection />

        <section
          aria-labelledby="placements"
          className="flex w-full max-w-4xl flex-col gap-6"
        >
          <SectionHeader id="placements" title={content.placements} />
          <SponsorPlacements />
        </section>

        <section
          aria-labelledby="sponsors"
          className="flex w-full max-w-3xl flex-col gap-6"
        >
          <SectionHeader id="sponsors" title={content.sponsors} />
          <ul className="flex flex-col gap-3">
            {/* Curated partners from the start: listed on their own, not in
                a paid tier. */}
            {FOUNDING_SPONSORS.length > 0 && (
              <li className="grid gap-2 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-start">
                <span className="text-muted-foreground text-sm sm:py-5">
                  {content.founding}
                </span>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {FOUNDING_SPONSORS.map((sponsor) => (
                    <li key={`${sponsor.name}:${sponsor.url}`}>
                      <SponsorLink sponsor={sponsor} />
                    </li>
                  ))}
                </ul>
              </li>
            )}
            {SPONSOR_TIERS.map((id) => {
              const tierSponsors = sponsors.filter(
                (sponsor) => sponsor.tier === id
              );
              const full = soldOutTiers.includes(id);
              return (
                <li
                  key={id}
                  className="grid gap-2 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-start"
                >
                  <span className="text-muted-foreground text-sm sm:py-5">
                    {content.tiers[id].name}
                  </span>
                  <div className="flex flex-col gap-2">
                    {tierSponsors.length > 0 && (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {tierSponsors.map((sponsor) => (
                          <li key={`${sponsor.name}:${sponsor.url}`}>
                            <SponsorLink sponsor={sponsor} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {full ? (
                      <div className="border-foreground/20 text-muted-foreground flex items-center gap-3 rounded-xl border border-dashed p-3">
                        <span className="min-w-0 flex-1 text-sm font-medium">
                          {content.sponsorsSeats}
                        </span>
                        <span className="text-sm">{content.soldOut}</span>
                      </div>
                    ) : (
                      <Link
                        to={ROUTES.DASHBOARD_SPONSORSHIPS_NEW}
                        search={{ tier: id }}
                        data-track="sponsor_plan_click"
                        data-track-tier={id}
                        className="group hover:bg-muted/60 border-foreground/20 flex items-center gap-3 rounded-xl border border-dashed p-3 transition-colors"
                      >
                        <span className="bg-muted text-muted-foreground group-hover:text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                          <Plus aria-hidden="true" className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium">
                          {tierSponsors.length > 0
                            ? content.tiers[id].join
                            : content.tiers[id].firstSponsor}
                        </span>
                        <span className="text-muted-foreground group-hover:text-foreground hidden items-center gap-1.5 text-sm transition-colors sm:inline-flex">
                          {content.takeSlot}
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </span>
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="plans"
          className="flex w-full max-w-4xl scroll-mt-24 flex-col gap-6"
        >
          <SectionHeader id="plans" title={content.plans} />
          <ul className="grid gap-4 md:grid-cols-3">
            {SPONSOR_TIERS.map((id) => {
              const tier = content.tiers[id];
              const featured = id === "diamond";
              return (
                <li key={id} className="relative flex">
                  {/* Diamond: primary border with the badge centred on its
                      top edge (outside the card, which clips overflow). */}
                  {featured && (
                    <Badge className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                      {content.mostImpact}
                    </Badge>
                  )}
                  <Card
                    size="lg"
                    className={cn("w-full", featured && "ring-primary ring-2")}
                  >
                    <CardHeader>
                      <div className="flex flex-col gap-3">
                        <h3 className="flex items-center justify-between gap-2 text-base font-semibold">
                          {tier.name}
                        </h3>
                        <p className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-semibold tracking-tight tabular-nums">
                            ${SPONSOR_PRICE_USD[id]}
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
                            <TickCircle
                              aria-hidden="true"
                              className="text-primary mt-0.5 size-4 shrink-0"
                            />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="border-t-0 bg-transparent pt-0">
                      {soldOutTiers.includes(id) ? (
                        <Button
                          size="lg"
                          variant="outline"
                          disabled
                          className="w-full"
                        >
                          {content.soldOut}
                        </Button>
                      ) : (
                        <Link
                          to={ROUTES.DASHBOARD_SPONSORSHIPS_NEW}
                          search={{ tier: id }}
                          data-track="sponsor_plan_click"
                          data-track-tier={id}
                          className={buttonVariants({
                            className: "w-full",
                            size: "lg",
                            variant: featured ? "gradient" : "secondary",
                          })}
                        >
                          {tier.choose}
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="custom"
          className="bg-card shadow-outline flex w-full max-w-4xl flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
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
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <Envelope aria-hidden="true" />
              {content.email}
            </a>
            <a
              href={LINK.X_DM}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <XIcon aria-hidden="true" />
              {content.dmX}
              <ArrowRightUp aria-hidden="true" />
            </a>
          </div>
        </section>

        <section
          aria-labelledby="faq"
          className="flex w-full max-w-3xl flex-col gap-6"
        >
          <SectionHeader id="faq" title={content.faq} />
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
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/$locale/sponsor")({
  component: Sponsor,
  loader: async () => {
    // The audience numbers are fetched in the browser with a skeleton: a slow
    // PostHog query must never hold up navigation to this page.
    const [landing, soldOutTiers] = await Promise.all([
      getLandingData(),
      getSoldOutTiers(),
    ]);
    return { ...landing, soldOutTiers };
  },
  head: ({ params }: LocaleHeadContext) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).sponsor;
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
