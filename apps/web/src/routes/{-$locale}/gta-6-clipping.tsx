import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { BeforeAfter } from "@/components/before-after";
import { LocalizedLink as Link } from "@/components/localized-link";
import { HeroHeader, PageMain, SectionHeader } from "@/components/page";
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
  GTA_DEMO_SLUGS,
  GTA_DEMOS,
  GTA_STYLE_NAMES,
  GTA_STYLES,
  gtaDemo,
} from "@/constants/gta-demos";
import type { GtaDemoSlug } from "@/constants/gta-demos";
import { ASSETS_URL } from "@/constants/links";
import { DEFAULT_LOCALE, isLocale, localizedPath } from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { GTA_PACK_PRICE_CENTS, GTA_PACK_PRODUCT } from "@/constants/plans";
import { formatUsd } from "@/constants/pricing";
import { ROUTES } from "@/constants/routes";
import { GTA_DISCLAIMER } from "@/constants/skill";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/seo/metadata";
import { getGtaDemoPick } from "@/server/functions";

interface Gta6Search {
  /** A demo to show instead of the visitor's country's (per-country ads). */
  clip?: GtaDemoSlug;
}

const routeApi = getRouteApi("/{-$locale}/gta-6-clipping");

/**
 * The before/after demos: the `?clip=` one, else the visitor's country's
 * (picked on the server, so it's there on first paint). Creator chips
 * switch demos in place and keep the choice in the URL.
 */
const Compare = () => {
  const content = useIntlayer("gta-page");
  const { clip } = routeApi.useSearch();
  const { geoClip } = routeApi.useLoaderData();
  const navigate = routeApi.useNavigate();
  const demo = gtaDemo(clip ?? geoClip);

  return (
    <section
      aria-labelledby="before-after"
      className="flex w-full max-w-5xl flex-col gap-6"
    >
      <SectionHeader
        id="before-after"
        title={content.compareTitle}
        description={content.compareIntro}
      />
      {/* Remounted per demo, so the pair starts over in sync. */}
      <BeforeAfter
        key={demo.slug}
        before={demo.before}
        after={demo.after}
        labels={{
          before: content.before.value,
          after: content.after.value,
          sound: content.sound.value,
          mute: content.mute.value,
          play: content.play.value,
          pause: content.pause.value,
        }}
      />
      <fieldset
        aria-label={content.creators.value}
        className="flex min-w-0 flex-wrap justify-center gap-2"
      >
        {GTA_DEMOS.map((item) => (
          <button
            key={item.slug}
            type="button"
            aria-pressed={item.slug === demo.slug}
            onClick={() =>
              navigate({
                search: { clip: item.slug },
                replace: true,
                resetScroll: false,
              })
            }
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/90 rounded-full"
            )}
          >
            {item.creator}
            <span className="opacity-60">· {GTA_STYLE_NAMES[item.style]}</span>
          </button>
        ))}
      </fieldset>
      <div className="text-muted-foreground flex flex-col items-center gap-1 text-center text-xs text-pretty">
        <p>
          <a
            href={demo.beforeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {content.beforeCredit({ channel: demo.beforeChannel }).value}
          </a>
          {" · "}
          <a
            href={demo.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {
              content.afterCredit({
                creator: demo.creator,
                style: GTA_STYLE_NAMES[demo.style],
              }).value
            }
          </a>
        </p>
        <p>{content.creatorsNote}</p>
      </div>
    </section>
  );
};

/** The four looks, each a still of the same frame of the Kai Cenat demo. */
const Styles = () => {
  const content = useIntlayer("gta-page");
  return (
    <section aria-labelledby="styles" className="flex flex-col gap-6">
      <SectionHeader
        id="styles"
        align="start"
        title={content.stylesTitle}
        description={content.stylesIntro}
      />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {content.styles.map((item, index) => (
          <li key={item.name.value} className="flex flex-col gap-2">
            <img
              src={`${ASSETS_URL}/gta/style-${GTA_STYLES[index]}.jpg`}
              alt=""
              width={540}
              height={960}
              loading="lazy"
              className="bg-muted shadow-outline aspect-9/16 w-full rounded-xl object-cover"
            />
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-muted-foreground text-sm text-pretty">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

// The GTA 6 Clip Pack's sales page. Rendered per request (not one of the
// prerendered STATIC_PAGES) because the demo depends on the visitor's
// country. The buy button goes through /checkout, which signs in first and
// sends accounts that already have the pack (bought, or through their plan)
// to Billing.
const Gta6 = () => {
  const content = useIntlayer("gta-page");
  const { locale } = useLocale();

  return (
    <>
      <SiteHeader />
      <PageMain layout="landing" width="full" className="items-center">
        <HeroHeader
          title={content.title}
          intro={content.intro}
          actions={
            <>
              <a
                href={`${localizedPath(ROUTES.CHECKOUT, locale)}?product=${GTA_PACK_PRODUCT}`}
                data-track="checkout_start"
                data-track-product={GTA_PACK_PRODUCT}
                className={buttonVariants({ size: "xl", variant: "gradient" })}
              >
                {content.buy}
                <ArrowRight aria-hidden="true" />
              </a>
              {/* ROUTES.DOCS_GTA, through the docs' catch-all route. */}
              <Link
                to={ROUTES.DOCS_PAGE}
                params={{ _splat: "gta-6" }}
                className={buttonVariants({ size: "xl", variant: "outline" })}
              >
                {content.docs}
              </Link>
            </>
          }
          note={
            <>
              <span className="text-foreground font-medium">
                {formatUsd(GTA_PACK_PRICE_CENTS)}
              </span>{" "}
              {content.once} ·{" "}
              <Link
                to={ROUTES.PRO}
                search={{ billing: "annual" }}
                className="underline underline-offset-2"
              >
                {content.included}
              </Link>
            </>
          }
        />

        <Compare />

        <div className="flex w-full max-w-3xl flex-col gap-20">
          <section
            aria-labelledby="what-it-adds"
            className="flex flex-col gap-6"
          >
            <SectionHeader
              id="what-it-adds"
              align="start"
              title={content.addsTitle}
              description={content.addsIntro}
            />
            <ul className="grid gap-4 sm:grid-cols-2">
              {content.skills.map((item) => (
                <li
                  key={item.skill.value}
                  className="bg-card shadow-outline flex flex-col gap-1.5 rounded-xl p-5"
                >
                  <code className="text-muted-foreground font-mono text-xs">
                    {item.skill}
                  </code>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-muted-foreground text-sm text-pretty">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <Styles />

          <section
            id="how-it-works"
            aria-labelledby="how-it-works-title"
            className="flex scroll-mt-8 flex-col gap-6"
          >
            <SectionHeader
              id="how-it-works-title"
              align="start"
              title={content.howTitle}
            />
            <ol className="flex flex-col gap-3.5">
              {content.steps.map((step, i) => (
                <li key={step.value} className="flex items-baseline gap-3.5">
                  <span className="text-muted-foreground w-6 shrink-0 font-mono text-sm tabular-nums">
                    0{i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-muted-foreground text-sm text-pretty">
              {content.rendererNote}
            </p>
          </section>

          <section
            aria-labelledby="what-you-need"
            className="flex flex-col gap-6"
          >
            <SectionHeader
              id="what-you-need"
              align="start"
              title={content.needTitle}
            />
            <ul className="grid gap-4 sm:grid-cols-3">
              {content.needs.map((item) => (
                <li
                  key={item.title.value}
                  className="bg-card shadow-outline flex flex-col gap-1.5 rounded-xl p-5"
                >
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-muted-foreground text-sm text-pretty">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section id="faq" className="flex scroll-mt-8 flex-col gap-6">
            <SectionHeader title={content.faq} />
            <Accordion>
              {content.faqs.map((faq) => (
                <AccordionItem
                  key={faq.question.value}
                  value={faq.question.value}
                >
                  {/* Roomier rows here only; the shared trigger keeps its default padding. */}
                  {/* oxlint-disable-next-line shadcn/no-restyle */}
                  <AccordionTrigger icon="plus" className="py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Verbatim and untranslated: a trademark notice. */}
          <p lang="en" className="text-muted-foreground text-xs text-pretty">
            {GTA_DISCLAIMER}
          </p>
        </div>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/gta-6-clipping")({
  component: Gta6,
  validateSearch: (search): Gta6Search => ({
    clip: GTA_DEMO_SLUGS.find((slug) => slug === search.clip),
  }),
  loader: async () => ({ geoClip: await getGtaDemoPick() }),
  // The country doesn't change mid-visit; switching demos (`?clip=`) needs
  // no reload.
  staleTime: Number.POSITIVE_INFINITY,
  head: ({ params }: LocaleHeadContext) => {
    const content = getIntlayer(
      "gta-page",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return createMetadata({
      title: content.title,
      description: content.metaDescription,
    });
  },
});
