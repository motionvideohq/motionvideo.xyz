import { getIntlayer } from "intlayer";

import { LINK, xProfileUrl } from "@/constants/links";
import { DEFAULT_LOCALE, isLocale, localizedPath } from "@/constants/locales";
import { PLAN_PRICE_CENTS, PLANS, planOffers } from "@/constants/plans";
import type { Plan, PlanBilling } from "@/constants/plans";
import { ROUTES, videoPath } from "@/constants/routes";
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

// A stable id, so every page's nodes point at one organization instead of
// repeating it (and search engines merge them into one entity).
const ORGANIZATION_ID = `${SITE.URL}/#organization`;

const organization = {
  "@id": ORGANIZATION_ID,
  "@type": "Organization",
  email: LINK.EMAIL,
  founder: {
    "@type": "Person",
    name: SITE.AUTHOR.NAME,
    url: LINK.AUTHOR_WEBSITE,
  },
  logo: absoluteUrl("/brand/motionvideo-app-icon.png"),
  name: SITE.NAME,
  sameAs: [LINK.GITHUB, LINK.X],
  url: SITE.URL,
};

const resolveLocale = (locale?: string) =>
  isLocale(locale) ? locale : DEFAULT_LOCALE;

// The site in the page's language: one node per locale home (its own `@id`,
// so the nine language versions never claim conflicting values), described
// as that locale's home page is.
export const websiteJsonLd = (locale?: string) => {
  const resolved = resolveLocale(locale);
  const url = absoluteUrl(localizedPath("/", resolved));
  return jsonLdScript({
    "@id": `${url}#website`,
    "@type": "WebSite",
    description: getIntlayer("gallery-meta", resolved).home.description,
    inLanguage: resolved,
    name: SITE.NAME,
    publisher: { "@id": ORGANIZATION_ID },
    url,
  });
};

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
export const planJsonLd = (locale?: string) => {
  const proUrl = absoluteUrl(localizedPath(ROUTES.PRO, resolveLocale(locale)));
  return PLANS.map((plan) =>
    jsonLdScript({
      "@type": "Product",
      brand: { "@type": "Brand", name: SITE.NAME },
      description: SITE.DESCRIPTION.LONG,
      image: absoluteUrl("/og.jpg"),
      name: PLAN_NAME[plan],
      url: proUrl,
      offers: planOffers(plan).map((billing) => {
        const price = ((PLAN_PRICE_CENTS[plan][billing] ?? 0) / 100).toFixed(2);
        const duration = BILLING_DURATION[billing];
        return {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price,
          priceCurrency: "USD",
          url: `${proUrl}?billing=${billing}`,
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
};

// The skill page's FAQ, in the language the page shows it in: FAQ markup
// must match the visible questions and answers.
export const faqJsonLd = (locale?: string) =>
  jsonLdScript({
    "@type": "FAQPage",
    inLanguage: resolveLocale(locale),
    mainEntity: getIntlayer("faqs", resolveLocale(locale)).faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
      name: faq.question,
    })),
  });

// One blog post. Posts are written in English whichever locale serves them;
// the URL is the page's own localized address (unprefixed in English).
export const blogPostingJsonLd = (
  post: { slug: string; title: string; description: string; date: string },
  locale?: string
) => {
  const url = absoluteUrl(
    localizedPath(`${ROUTES.BLOG}/${post.slug}`, resolveLocale(locale))
  );
  return jsonLdScript({
    "@type": "BlogPosting",
    author: { "@id": ORGANIZATION_ID },
    dateModified: post.date,
    datePublished: post.date,
    description: post.description,
    headline: post.title,
    image: absoluteUrl("/og.jpg"),
    inLanguage: "en",
    mainEntityOfPage: url,
    publisher: { "@id": ORGANIZATION_ID },
    url,
  });
};

/**
 * One crumb below home and its app path: a footer page (`page`, labelled in
 * the page's language) or a catalog entry named by its own data (`name`).
 */
export type BreadcrumbItem = { path: string } & (
  | {
      page:
        | "about"
        | "blog"
        | "brand"
        | "changelog"
        | "contact"
        | "design"
        | "privacy"
        | "refunds"
        | "terms";
    }
  | { name: string }
);

/**
 * One gallery video, for its /videos/$slug page. `description` is the page's
 * own meta description (already in the page's language). No `inLanguage`:
 * the video has no spoken language of its own, and the page's language says
 * nothing about it.
 */
export const videoJsonLd = (
  video: MotionVideo,
  description: string,
  locale?: string
) =>
  jsonLdScript({
    "@type": "VideoObject",
    contentUrl: absoluteUrl(video.video),
    creator: {
      "@type": "Person",
      name: video.creatorName ?? `@${video.handle}`,
      url: xProfileUrl(video.handle),
    },
    description: video.description ?? description,
    keywords: video.contentTags.join(", "),
    name: video.title,
    publisher: { "@id": ORGANIZATION_ID },
    thumbnailUrl: absoluteUrl(video.poster),
    uploadDate: video.date,
    url: absoluteUrl(
      localizedPath(videoPath(video.slug), resolveLocale(locale))
    ),
  });

// Home › <page> › …, from the page below the home page down to the current
// one, named in the page's language (footer pages use the footer's labels).
export const breadcrumbJsonLd = (
  trail: BreadcrumbItem | BreadcrumbItem[],
  locale?: string
) => {
  const resolved = resolveLocale(locale);
  const crumbs = [
    { name: getIntlayer("json-ld", resolved).home, path: ROUTES.HOME },
    ...[trail].flat().map((item) => ({
      name:
        "page" in item
          ? getIntlayer("site-footer", resolved)[item.page]
          : item.name,
      path: item.path,
    })),
  ];
  return jsonLdScript({
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(localizedPath(item.path, resolved)),
      name: item.name,
      position: index + 1,
    })),
  });
};

/**
 * One changelog entry, for its /changelog/$slug page. `inLanguage` is
 * English on every locale: entries are only written in English.
 */
export const changelogEntryJsonLd = (
  entry: { date: string; description: string; path: string; title: string },
  locale?: string
) =>
  jsonLdScript({
    "@type": "BlogPosting",
    author: { "@id": ORGANIZATION_ID },
    datePublished: entry.date,
    description: entry.description,
    headline: entry.title,
    inLanguage: DEFAULT_LOCALE,
    publisher: { "@id": ORGANIZATION_ID },
    url: absoluteUrl(localizedPath(entry.path, resolveLocale(locale))),
  });

// The Moves library is a glossary of motion design techniques: each move is a
// DefinedTerm in one DefinedTermSet, so search engines read the names (and
// their aliases) as terms with definitions.
const movesSet = (locale?: string) => ({
  "@type": "DefinedTermSet",
  name: `${SITE.NAME} Moves`,
  url: absoluteUrl(localizedPath(ROUTES.MOVES, resolveLocale(locale))),
});

export const movesJsonLd = (moves: Move[], locale?: string) =>
  jsonLdScript({
    ...movesSet(locale),
    description: "Motion design techniques, named and explained.",
    hasDefinedTerm: moves.map((move) => ({
      "@type": "DefinedTerm",
      name: move.name,
      url: absoluteUrl(localizedPath(movePath(move), resolveLocale(locale))),
    })),
  });

export const moveJsonLd = (move: Move, locale?: string) =>
  jsonLdScript({
    "@type": "DefinedTerm",
    alternateName: move.aka,
    description: move.summary,
    inDefinedTermSet: movesSet(locale),
    name: move.name,
    termCode: move.slug,
    url: absoluteUrl(localizedPath(movePath(move), resolveLocale(locale))),
  });
