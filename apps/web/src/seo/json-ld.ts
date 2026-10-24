import { FAQS } from "@/constants/faqs";
import { LINK } from "@/constants/links";
import { PLAN_PRICE_CENTS, PLANS, planOffers } from "@/constants/plans";
import type { Plan, PlanBilling } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";
import type { MotionVideo } from "@/lib/motion-catalog";
import { movePath } from "@/lib/moves";
import type { Move } from "@/lib/moves";

// Structured data, emitted as <script type="application/ld+json"> through a
// route's `head().scripts`.

type JsonValue =
  | string
  | number
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue };

// A schema.org node: a `@type` plus JSON-serializable properties.
interface JsonLd {
  "@type": string;
  [property: string]: JsonValue;
}

// `<` is escaped so page content can never close the script tag early.
const jsonLdScript = (data: JsonLd) => ({
  children: JSON.stringify({
    "@context": "https://schema.org",
    ...data,
  }).replaceAll("<", String.raw`\u003c`),
  type: "application/ld+json",
});

const organization = {
  "@type": "Organization",
  email: LINK.EMAIL,
  founder: {
    "@type": "Person",
    name: SITE.AUTHOR.NAME,
    url: LINK.AUTHOR_WEBSITE,
  },
  logo: absoluteUrl("/brand/motionvideo-app-icon-512.png"),
  name: SITE.NAME,
  sameAs: [LINK.GITHUB, LINK.X],
  url: SITE.URL,
};

export const websiteJsonLd = () =>
  jsonLdScript({
    "@type": "WebSite",
    description: SITE.DESCRIPTION.SHORT,
    inLanguage: "en-US",
    name: SITE.NAME,
    publisher: organization,
    url: SITE.URL,
  });

export const organizationJsonLd = () => jsonLdScript(organization);

const PLAN_NAME: Record<Plan, string> = {
  business: `${SITE.NAME} Business`,
  pro: `${SITE.NAME} Pro`,
};

// ISO 8601 renewal period; lifetime has none.
const BILLING_DURATION: Partial<Record<PlanBilling, string>> = {
  annual: "P1Y",
  monthly: "P1M",
};

// One Product per plan, with an Offer per billing option, for /pro.
export const planJsonLd = () =>
  PLANS.map((plan) =>
    jsonLdScript({
      "@type": "Product",
      brand: { "@type": "Brand", name: SITE.NAME },
      description: SITE.DESCRIPTION.LONG,
      image: absoluteUrl("/og.jpg"),
      name: PLAN_NAME[plan],
      url: absoluteUrl(ROUTES.PRO),
      offers: planOffers(plan).map((billing) => {
        const price = ((PLAN_PRICE_CENTS[plan][billing] ?? 0) / 100).toFixed(2);
        const duration = BILLING_DURATION[billing];
        return {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price,
          priceCurrency: "USD",
          url: absoluteUrl(`${ROUTES.PRO}?billing=${billing}`),
          ...(duration && {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              billingDuration: duration,
              price,
              priceCurrency: "USD",
            },
          }),
        };
      }),
    })
  );

export const faqJsonLd = () =>
  jsonLdScript({
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
      name: faq.question,
    })),
  });

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const HOME_BREADCRUMB: BreadcrumbItem = { name: "Home", path: ROUTES.HOME };

// One gallery video, for its /videos/$slug page.
export const videoJsonLd = (video: MotionVideo) =>
  jsonLdScript({
    "@type": "VideoObject",
    contentUrl: absoluteUrl(video.video),
    creator: { "@type": "Person", name: `@${video.handle}` },
    description:
      video.description ??
      `${video.title}, a motion video by @${video.handle} on ${SITE.NAME}.`,
    keywords: video.contentTags.join(", "),
    name: video.title,
    thumbnailUrl: absoluteUrl(video.poster),
    uploadDate: video.date,
  });

// Home › <page> › …, from the page below the home page down to the current one.
export const breadcrumbJsonLd = (...trail: BreadcrumbItem[]) =>
  jsonLdScript({
    "@type": "BreadcrumbList",
    itemListElement: [HOME_BREADCRUMB, ...trail].map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  });

// The Moves library is a glossary of motion design techniques: each move is a
// DefinedTerm in one DefinedTermSet, so search engines read the names (and
// their aliases) as terms with definitions.
const MOVES_SET = {
  "@type": "DefinedTermSet",
  name: `${SITE.NAME} Moves`,
  url: absoluteUrl(ROUTES.MOVES),
};

export const movesJsonLd = (moves: Move[]) =>
  jsonLdScript({
    ...MOVES_SET,
    description: "Motion design techniques, named and explained.",
    hasDefinedTerm: moves.map((move) => ({
      "@type": "DefinedTerm",
      name: move.name,
      url: absoluteUrl(movePath(move)),
    })),
  });

export const moveJsonLd = (move: Move) =>
  jsonLdScript({
    "@type": "DefinedTerm",
    alternateName: move.aka,
    description: move.summary,
    inDefinedTermSet: MOVES_SET,
    name: move.name,
    termCode: move.slug,
    url: absoluteUrl(movePath(move)),
  });
