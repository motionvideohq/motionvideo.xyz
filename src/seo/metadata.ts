import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";

// Static 1200×630 share image (public/og.png).
const OG_IMAGE = {
  alt: `${SITE.NAME}: ${SITE.TAGLINE}`,
  height: "630",
  url: absoluteUrl("/og.png"),
  width: "1200",
} as const;

interface CreateMetadataOptions {
  /** Page title; the site name is appended. Omit on the home page. */
  title?: string;
  description?: string;
  /** Path of the page, used for the canonical link and og:url. */
  canonical?: string;
  noIndex?: boolean;
}

// Per-route head tags, returned from a route's `head()`. Tags here override
// the defaults from `baseMetadata` (TanStack dedupes by name/property).
export const createMetadata = ({
  title,
  description = SITE.DESCRIPTION.SHORT,
  canonical,
  noIndex = false,
}: CreateMetadataOptions = {}) => {
  const fullTitle = title
    ? `${title} | ${SITE.NAME}`
    : `${SITE.NAME}: ${SITE.TAGLINE}`;
  const url = canonical ? absoluteUrl(canonical) : SITE.URL;

  return {
    links: canonical ? [{ href: url, rel: "canonical" }] : [],
    meta: [
      { title: fullTitle },
      { content: description, name: "description" },
      { content: fullTitle, property: "og:title" },
      { content: description, property: "og:description" },
      { content: url, property: "og:url" },
      { content: fullTitle, name: "twitter:title" },
      { content: description, name: "twitter:description" },
      ...(noIndex ? [{ content: "noindex, nofollow", name: "robots" }] : []),
    ],
  };
};

// Site-wide head tags, set once on the root route.
export const baseMetadata = {
  links: [
    { href: "/favicon.ico", rel: "icon", sizes: "48x48" },
    { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
    {
      href: "/apple-touch-icon.png",
      rel: "apple-touch-icon",
      sizes: "180x180",
    },
    { href: "/manifest.json", rel: "manifest" },
  ],
  meta: [
    { charSet: "utf-8" },
    { content: "width=device-width, initial-scale=1", name: "viewport" },
    { content: "light dark", name: "color-scheme" },
    { content: SITE.NAME, name: "application-name" },
    { content: SITE.AUTHOR.NAME, name: "author" },
    { content: SITE.KEYWORDS.join(", "), name: "keywords" },
    { content: SITE.NAME, property: "og:site_name" },
    { content: "website", property: "og:type" },
    { content: "en_US", property: "og:locale" },
    { content: OG_IMAGE.url, property: "og:image" },
    { content: OG_IMAGE.alt, property: "og:image:alt" },
    { content: OG_IMAGE.width, property: "og:image:width" },
    { content: OG_IMAGE.height, property: "og:image:height" },
    { content: "summary_large_image", name: "twitter:card" },
    { content: SITE.AUTHOR.TWITTER, name: "twitter:creator" },
    { content: OG_IMAGE.url, name: "twitter:image" },
    { content: OG_IMAGE.alt, name: "twitter:image:alt" },
  ],
};
