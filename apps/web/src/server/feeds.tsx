import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DEFAULT_LOCALE, localizedPath } from "@/constants/locales";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";
import type { FeedFormat, Feeds } from "@/lib/feeds";
import type { VideoPick } from "@/lib/video-picks";

// RSS 2.0, Atom 1.0 and JSON Feed 1.1 for a section (changelog, blog), all
// three built from one item model. Feeds are per-site and in English like
// the entries, so their links (and the ids readers dedupe on) are absolute
// URLs at the default locale and never change with a reader's language.

/** A site path (`/model/opus-5-5`) as an absolute URL at the default locale. */
export const pageUrl = (path: string) =>
  absoluteUrl(localizedPath(path, DEFAULT_LOCALE));

export const isSitePath = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

// Entries link to site pages without a locale, which a feed reader would
// resolve against its own origin; the pages' links add the reader's locale
// (src/components/prose-mdx.tsx), these the default one.
export const FEED_MDX_COMPONENTS: MDXComponents = {
  a: ({ href = "", children, ...props }: ComponentProps<"a">) => (
    <a {...props} href={isSitePath(href) ? pageUrl(href) : href}>
      {children}
    </a>
  ),
  img: ({ src = "", ...props }: ComponentProps<"img">) => (
    // oxlint-disable-next-line jsx-a11y/alt-text -- alt comes from the MDX
    <img
      {...props}
      src={isSitePath(src) ? absoluteUrl(src) : src}
      loading="lazy"
    />
  ),
};

/**
 * An entry's HTML for a feed: its cover poster, then its body. Every feed
 * image is `loading="lazy"`: React emits a `<link rel="preload">` ahead of
 * any eager <img>, which would land in the item's HTML.
 */
export const feedHtml = (cover: VideoPick | undefined, body: ReactNode) =>
  renderToStaticMarkup(
    <>
      {cover && (
        <img
          src={absoluteUrl(cover.poster)}
          alt=""
          width={cover.width}
          height={cover.height}
          loading="lazy"
        />
      )}
      {body}
    </>
  );

export interface FeedItem {
  /** Absolute entry URL at the default locale; also the item's id. */
  url: string;
  title: string;
  summary: string;
  /** Publication day, `YYYY-MM-DD`. */
  date: string;
  /** The entry as HTML (`feedHtml`). */
  html: string;
  cover: VideoPick | undefined;
}

/** A section's feeds and how to build their items. */
export interface FeedSource {
  feeds: Feeds;
  /** The section's page, e.g. `/changelog`. */
  homePath: string;
  description: string;
  /** Every item, newest first. */
  items: () => Promise<FeedItem[]>;
}

const AUTHOR = { name: SITE.NAME, url: SITE.URL };
// Square PNGs from public/ (RSS images can't be SVG).
const ICON_URL = absoluteUrl("/logo512.png");
const FAVICON_URL = absoluteUrl("/logo192.png");

/** RFC 822 (RSS): `Sat, 24 Oct 2026 00:00:00 GMT`. */
const rfc822 = (day: string) => new Date(`${day}T00:00:00Z`).toUTCString();
/** RFC 3339 (Atom, JSON Feed): `2026-10-24T00:00:00Z`. */
const rfc3339 = (day: string) => `${day}T00:00:00Z`;

/** Text or an attribute value as XML; HTML content goes in escaped. */
const xml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

// Media RSS thumbnail, read by feed readers in both RSS and Atom.
const MEDIA_NS = "http://search.yahoo.com/mrss/";
const thumbnail = (cover: VideoPick | undefined) =>
  cover
    ? [
        `<media:thumbnail url="${xml(absoluteUrl(cover.poster))}" width="${cover.width}" height="${cover.height}"/>`,
      ]
    : [];

const feedResponse = (feed: FeedFormat, body: string) =>
  new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": `${feed.type}; charset=utf-8`,
    },
  });

/** RSS 2.0, with the body in `content:encoded`. */
export const rssResponse = async (source: FeedSource) => {
  const feed = source.feeds.formats.rss;
  const { title } = source.feeds;
  const home = pageUrl(source.homePath);
  const items = await source.items();
  const updated = items[0]?.date;
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="${MEDIA_NS}">`,
    "  <channel>",
    `    <title>${xml(title)}</title>`,
    `    <link>${xml(home)}</link>`,
    `    <description>${xml(source.description)}</description>`,
    `    <language>${DEFAULT_LOCALE}</language>`,
    ...(updated
      ? [`    <lastBuildDate>${rfc822(updated)}</lastBuildDate>`]
      : []),
    `    <atom:link href="${xml(absoluteUrl(feed.path))}" rel="self" type="${feed.type}"/>`,
    "    <image>",
    `      <url>${xml(FAVICON_URL)}</url>`,
    `      <title>${xml(title)}</title>`,
    `      <link>${xml(home)}</link>`,
    "    </image>",
    ...items.flatMap((item) => [
      "    <item>",
      `      <title>${xml(item.title)}</title>`,
      `      <link>${xml(item.url)}</link>`,
      `      <guid isPermaLink="true">${xml(item.url)}</guid>`,
      `      <pubDate>${rfc822(item.date)}</pubDate>`,
      `      <description>${xml(item.summary)}</description>`,
      `      <content:encoded>${xml(item.html)}</content:encoded>`,
      ...thumbnail(item.cover).map((line) => `      ${line}`),
      "    </item>",
    ]),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
  return feedResponse(feed, body);
};

/** Atom 1.0, with the body as HTML `content`. */
export const atomResponse = async (source: FeedSource) => {
  const feed = source.feeds.formats.atom;
  const home = pageUrl(source.homePath);
  const items = await source.items();
  // `updated` is required; an empty feed falls back to now.
  const updated = items[0]?.date;
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="${MEDIA_NS}" xml:lang="${DEFAULT_LOCALE}">`,
    `  <id>${xml(home)}</id>`,
    `  <title>${xml(source.feeds.title)}</title>`,
    `  <subtitle>${xml(source.description)}</subtitle>`,
    `  <link rel="alternate" type="text/html" href="${xml(home)}"/>`,
    `  <link rel="self" type="${feed.type}" href="${xml(absoluteUrl(feed.path))}"/>`,
    `  <updated>${updated ? rfc3339(updated) : new Date().toISOString()}</updated>`,
    "  <author>",
    `    <name>${xml(AUTHOR.name)}</name>`,
    `    <uri>${xml(AUTHOR.url)}</uri>`,
    "  </author>",
    `  <icon>${xml(FAVICON_URL)}</icon>`,
    ...items.flatMap((item) => [
      "  <entry>",
      `    <id>${xml(item.url)}</id>`,
      `    <title>${xml(item.title)}</title>`,
      `    <link rel="alternate" type="text/html" href="${xml(item.url)}"/>`,
      `    <published>${rfc3339(item.date)}</published>`,
      `    <updated>${rfc3339(item.date)}</updated>`,
      `    <summary>${xml(item.summary)}</summary>`,
      `    <content type="html">${xml(item.html)}</content>`,
      ...thumbnail(item.cover).map((line) => `    ${line}`),
      "  </entry>",
    ]),
    "</feed>",
    "",
  ].join("\n");
  return feedResponse(feed, body);
};

/** JSON Feed 1.1, with the body as `content_html`. */
export const jsonFeedResponse = async (source: FeedSource) => {
  const feed = source.feeds.formats.json;
  const items = await source.items();
  const body = JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: source.feeds.title,
      home_page_url: pageUrl(source.homePath),
      feed_url: absoluteUrl(feed.path),
      description: source.description,
      icon: ICON_URL,
      favicon: FAVICON_URL,
      language: DEFAULT_LOCALE,
      authors: [AUTHOR],
      items: items.map((item) => ({
        id: item.url,
        url: item.url,
        title: item.title,
        summary: item.summary,
        content_html: item.html,
        image: item.cover ? absoluteUrl(item.cover.poster) : undefined,
        date_published: rfc3339(item.date),
      })),
    },
    null,
    2
  );
  return feedResponse(feed, body);
};
