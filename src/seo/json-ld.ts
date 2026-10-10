import { FAQS } from "@/constants/faqs";
import { LINK } from "@/constants/links";
import { BASE_PRICE_CENTS, LAUNCH_PRICE_CENTS, PRODUCT_NAME } from '@/constants/pricing';
import type { Offer } from '@/constants/pricing';
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";

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

export const productJsonLd = (offer?: Offer) =>
  jsonLdScript({
    "@type": "Product",
    brand: { "@type": "Brand", name: SITE.NAME },
    description: SITE.DESCRIPTION.LONG,
    image: absoluteUrl("/og.png"),
    name: PRODUCT_NAME,
    url: absoluteUrl(ROUTES.MOTIONVIDEO_SKILL),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: ((offer?.active ? LAUNCH_PRICE_CENTS : BASE_PRICE_CENTS) / 100).toFixed(2),
      priceCurrency: "USD",
      url: absoluteUrl(ROUTES.PRICING),
    },
  });

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

// Home › <page>, for pages one level below the home page.
export const breadcrumbJsonLd = (current: BreadcrumbItem) =>
  jsonLdScript({
    "@type": "BreadcrumbList",
    itemListElement: [HOME_BREADCRUMB, current].map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  });
