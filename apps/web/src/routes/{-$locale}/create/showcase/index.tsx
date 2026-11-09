import {
  ASPECT_IDS,
  COLLECTIONS,
  SOCIAL_PRESETS,
  TEMPLATES,
  templatesIn,
} from "@motionvideo/engine";
import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { Lock } from "reicon-react/icons/Lock";
import { TickCircle } from "reicon-react/icons/TickCircle";

import { starterMedia } from "@/components/create/showcase/editor/samples";
import {
  HERO_TEMPLATES,
  LivePreview,
} from "@/components/create/showcase/live-preview";
import {
  SOCIAL_PRESET_IDS,
  TemplateGrid,
} from "@/components/create/showcase/template-card";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PageMain, SectionHeader } from "@/components/page";
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
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  CREATE_PASS_CENTS,
  CREATE_PASS_DAYS,
  FREE_LIMITS,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
} from "@/constants/create";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { PLAN_PRICE_CENTS } from "@/constants/plans";
import { formatUsd } from "@/constants/pricing";
import { ROUTES } from "@/constants/routes";
import { fillTemplate } from "@/lib/motion-video-route";
import { findMove, movePath } from "@/lib/moves";
import { cn } from "@/lib/utils";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

// Prices and limits the copy fills in, from the plan constants.
const PLAN_VALUES = {
  price: formatUsd(CREATE_PASS_CENTS),
  days: String(CREATE_PASS_DAYS),
  resolution: String(FREE_LIMITS.resolution),
  fps: String(FREE_LIMITS.fps),
};

// Templates built on a move, with the move, for "From template to code".
const MOVE_LINKS = TEMPLATES.flatMap((template) => {
  const move = findMove(template.move);
  return move ? [{ template, move }] : [];
});

const sectionClass = "flex scroll-mt-8 flex-col gap-8";
const tileClass = "bg-card shadow-outline rounded-xl";

/** A ticked list, as on the pricing page. */
const Ticks = ({ items }: { items: ReactNode[] }) => (
  <ul className="flex flex-col gap-3 text-sm">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2">
        <TickCircle
          aria-hidden="true"
          className="text-primary mt-0.5 size-4 shrink-0"
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

/** Grey bars standing in for a screen when no sample image is available. */
const ScreenSketch = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn("bg-background flex size-full flex-col gap-2 p-3", className)}
  >
    <span className="bg-muted h-2 w-1/3 rounded-full" />
    <span className="bg-muted h-2 w-1/2 rounded-full" />
    <span className="bg-muted mt-auto h-1/2 w-full rounded-md" />
  </span>
);

const Screen = ({ src }: { src: string | undefined }) =>
  src ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      className="size-full object-cover object-top"
    />
  ) : (
    <ScreenSketch />
  );

/** One screenshot plain, in a browser frame and in a phone frame. */
const DeviceFrames = () => {
  const content = useIntlayer("create-showcase");
  const desktop = starterMedia("other").find((item) => item.kind === "image");
  const [phone] = starterMedia("phone");
  const desktopSrc = desktop?.ref.type === "url" ? desktop.ref.url : undefined;
  const phoneSrc = phone?.ref.type === "url" ? phone.ref.url : undefined;
  return (
    <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_0.45fr]">
      <figure className="flex flex-col gap-2">
        <div className="shadow-outline aspect-[4/3] overflow-hidden rounded-lg">
          <Screen src={desktopSrc} />
        </div>
        <figcaption className="text-muted-foreground text-sm">
          {content.framePlain}
        </figcaption>
      </figure>
      <figure className="flex flex-col gap-2">
        <div className="bg-muted shadow-outline flex aspect-[4/3] flex-col overflow-hidden rounded-lg">
          <span
            aria-hidden="true"
            className="flex h-6 shrink-0 items-center gap-1.5 px-2.5"
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="bg-muted-foreground/30 size-2 rounded-full"
              />
            ))}
            <span className="bg-background mx-auto h-3.5 w-1/2 rounded-full" />
          </span>
          <div className="min-h-0 flex-1">
            <Screen src={desktopSrc} />
          </div>
        </div>
        <figcaption className="text-muted-foreground text-sm">
          {content.frameBrowser}
        </figcaption>
      </figure>
      <figure className="mx-auto flex w-1/2 flex-col gap-2 sm:w-full">
        <div className="bg-foreground aspect-[9/19] overflow-hidden rounded-[18%/8.5%] p-[6%]">
          <div className="size-full overflow-hidden rounded-[13%/6%]">
            <Screen src={phoneSrc} />
          </div>
        </div>
        <figcaption className="text-muted-foreground text-sm">
          {content.framePhone}
        </figcaption>
      </figure>
    </div>
  );
};

/** A sample screen recording playing on a tilted card. */
const ClipCard = () => {
  const clip = starterMedia("other").find((item) => item.kind === "video");
  const src = clip?.ref.type === "url" ? clip.ref.url : undefined;
  return (
    <div className="perspective-[1200px]">
      <div className="shadow-outline aspect-video transform-[rotateY(-14deg)_rotateX(6deg)] overflow-hidden rounded-xl shadow-xl">
        {src ? (
          // A silent product demo: nothing to caption.
          // oxlint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={src}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        ) : (
          <span className="relative block size-full">
            <ScreenSketch />
            <span className="bg-foreground/15 absolute inset-x-4 bottom-3 h-1 overflow-hidden rounded-full">
              <span className="animate-mv-progress bg-foreground/60 block h-full motion-reduce:animate-none" />
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

/** Free, single export and Pro, in the pricing page's card style. */
const Pricing = () => {
  const content = useIntlayer("create-showcase");
  const { free, single, pro } = content.plans;
  const plans = [
    {
      key: "free",
      name: free.name,
      price: formatUsd(0),
      unit: null,
      note: free.note,
      perks: [
        free.video(PLAN_VALUES),
        free.still({ size: String(FREE_LIMITS.still) }),
        free.templates,
        free.watermark,
      ],
      cta: (
        <Link
          to={ROUTES.CREATE_SHOWCASE_EDITOR}
          data-track="showcase_pricing_free"
          className={buttonVariants({
            className: "w-full",
            size: "xl",
            variant: "secondary",
          })}
        >
          {free.cta}
        </Link>
      ),
    },
    {
      key: "single",
      name: single.name,
      price: PLAN_VALUES.price,
      unit: single.unit,
      note: single.note(PLAN_VALUES),
      perks: [
        single.quality,
        single.formats,
        single.transparent,
        single.templates,
      ],
      cta: (
        <Link
          to={ROUTES.CREATE_SHOWCASE_EDITOR}
          data-track="showcase_pricing_single"
          className={buttonVariants({
            className: "w-full",
            size: "xl",
            variant: "gradient",
          })}
        >
          {single.cta}
        </Link>
      ),
    },
    {
      key: "pro",
      name: pro.name,
      price: formatUsd(PLAN_PRICE_CENTS.pro.monthly ?? 0),
      unit: pro.unit,
      note: pro.note,
      perks: [pro.everything, pro.tools, pro.library],
      cta: (
        <Link
          to={ROUTES.PRO}
          data-track="showcase_pricing_pro"
          className={buttonVariants({
            className: "w-full",
            size: "xl",
            variant: "secondary",
          })}
        >
          {pro.cta}
        </Link>
      ),
    },
  ];
  return (
    <ul className="grid w-full gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <li key={plan.key} className="flex">
          <Card
            size="lg"
            className={cn(
              "w-full",
              plan.key === "single" && "ring-primary ring-2"
            )}
          >
            <CardHeader>
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                <div className="flex flex-col gap-1">
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-tight tabular-nums">
                      {plan.price}
                    </span>
                    {plan.unit && (
                      <span className="text-muted-foreground text-sm">
                        {plan.unit}
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">{plan.note}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <Ticks items={plan.perks} />
            </CardContent>
            <CardFooter className="border-t-0 bg-transparent pt-0">
              {plan.cta}
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
};

const ShowcaseLanding = () => {
  const content = useIntlayer("create-showcase");
  const card = useIntlayer("showcase-template-card");
  const clipLimits = content.clipLimits({
    seconds: String(MAX_VIDEO_SECONDS),
    size: String(MAX_VIDEO_BYTES / 2 ** 20),
  });
  const exportFormats = Object.values(content.exports);

  return (
    <>
      <SiteHeader />
      <PageMain layout="landing" width="full">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-between gap-6">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
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
              <div className="flex flex-wrap gap-2">
                <Link
                  to={ROUTES.CREATE_SHOWCASE_EDITOR}
                  data-track="showcase_open_editor"
                  data-track-from="hero"
                  className={buttonVariants({
                    size: "xl",
                    variant: "gradient",
                  })}
                >
                  {content.openEditor}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link
                  to={ROUTES.CREATE_SHOWCASE_TEMPLATES}
                  className={buttonVariants({ size: "xl", variant: "outline" })}
                >
                  {content.browseTemplates}
                </Link>
              </div>
            </div>
          </section>
          <LivePreview templates={HERO_TEMPLATES} />
        </div>

        <section
          id="templates"
          className={cn(sectionClass, "mx-auto w-full max-w-5xl")}
        >
          <SectionHeader
            title={content.galleryTitle}
            description={content.galleryBody({
              count: String(TEMPLATES.length),
            })}
          />
          {COLLECTIONS.map((collection) => (
            <div key={collection} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold tracking-tight">
                  {card.collections[collection].name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {card.collections[collection].blurb}
                </p>
              </div>
              <TemplateGrid templates={templatesIn(collection)} />
            </div>
          ))}
          <Link
            to={ROUTES.CREATE_SHOWCASE_TEMPLATES}
            className={buttonVariants({
              className: "self-center",
              variant: "outline",
            })}
          >
            {content.allTemplates}
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-20">
          <section id="frames" className={sectionClass}>
            <SectionHeader
              align="start"
              title={content.framesTitle}
              description={content.framesBody}
            />
            <DeviceFrames />
          </section>

          <section
            id="clips"
            className="grid scroll-mt-8 items-center gap-8 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-6">
              <SectionHeader
                align="start"
                title={content.clipsTitle}
                description={content.clipsBody}
              />
              <Ticks items={[content.clipTrim, content.clipLoop, clipLimits]} />
            </div>
            <ClipCard />
          </section>

          <section id="formats" className={sectionClass}>
            <SectionHeader
              align="start"
              title={content.formatsTitle}
              description={content.formatsBody}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className={cn(tileClass, "flex flex-col gap-3 p-4")}>
                <h3 className="font-medium">{content.aspects}</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {ASPECT_IDS.map((aspect) => (
                    <li
                      key={aspect}
                      className="bg-secondary rounded-md px-2 py-0.5 font-mono text-xs tabular-nums"
                    >
                      {aspect}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(tileClass, "flex flex-col gap-3 p-4")}>
                <h3 className="font-medium">{content.presetsLabel}</h3>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {SOCIAL_PRESET_IDS.map((preset) => (
                    <li key={preset} className="flex justify-between gap-2">
                      <span>{card.presets[preset]}</span>
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        {SOCIAL_PRESETS[preset].aspect}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(tileClass, "flex flex-col gap-3 p-4")}>
                <h3 className="font-medium">{content.exportsLabel}</h3>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {exportFormats.map((format) => (
                    <li key={format.value}>{format}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section
            id="private"
            className={cn(tileClass, "flex flex-col gap-6 p-6 sm:p-8")}
          >
            <span className="bg-secondary flex size-10 items-center justify-center rounded-full">
              <Lock aria-hidden="true" className="size-5" />
            </span>
            <SectionHeader
              align="start"
              title={content.privateTitle}
              description={content.privateBody}
            />
            <Ticks
              items={[
                content.privateUploads,
                content.privateRender,
                content.privateSaved,
              ]}
            />
          </section>

          <section id="code" className={sectionClass}>
            <SectionHeader
              align="start"
              title={content.codeTitle}
              description={content.codeBody}
            />
            {MOVE_LINKS.length > 0 && (
              <ul className="flex flex-col gap-px overflow-hidden rounded-xl">
                {MOVE_LINKS.map(({ template, move }) => (
                  <li
                    key={template.id}
                    className="bg-card shadow-outline flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm"
                  >
                    <Link
                      to={ROUTES.CREATE_SHOWCASE_TEMPLATE}
                      params={{ templateId: template.id }}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {template.name}
                    </Link>
                    <ArrowRight
                      aria-hidden="true"
                      className="text-muted-foreground size-4"
                    />
                    <Link
                      to={movePath(move)}
                      className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      {move.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={ROUTES.MOVES}
              className={buttonVariants({
                className: "self-start",
                variant: "outline",
              })}
            >
              {content.browseMoves}
              <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        </div>

        <section
          id="pricing"
          className={cn(sectionClass, "mx-auto w-full max-w-5xl")}
        >
          <SectionHeader
            title={content.pricingTitle}
            description={content.pricingBody}
          />
          <Pricing />
        </section>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-20">
          <section id="faq" className="flex scroll-mt-8 flex-col gap-6">
            <SectionHeader title={content.faqTitle} />
            <Accordion>
              {content.faqs.map((faq) => (
                <AccordionItem
                  key={faq.question.value}
                  value={faq.question.value}
                >
                  {/* Roomier rows, as on the other landing pages. */}
                  {/* oxlint-disable-next-line shadcn/no-restyle */}
                  <AccordionTrigger icon="plus" className="py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      {fillTemplate(faq.answer.value, PLAN_VALUES)}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/create/showcase/")({
  component: ShowcaseLanding,
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const copy = getIntlayer("create-showcase", locale);
    return {
      ...createMetadata({
        title: copy.metaTitle,
        description: copy.metaDescription,
      }),
      scripts: [
        breadcrumbJsonLd(
          [
            {
              name: getIntlayer("create-hub", locale).title,
              path: ROUTES.CREATE,
            },
            {
              name: getIntlayer("site-header", locale).showcase,
              path: ROUTES.CREATE_SHOWCASE,
            },
          ],
          locale
        ),
        faqPageJsonLd(
          copy.faqs.map((faq) => ({
            question: faq.question,
            answer: fillTemplate(faq.answer, PLAN_VALUES),
          })),
          locale
        ),
      ],
    };
  },
  loader: () => getLandingData(),
});
