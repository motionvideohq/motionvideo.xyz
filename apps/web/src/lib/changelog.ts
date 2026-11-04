import { loader } from "fumadocs-core/source";
import { defineCollections } from "fumadocs-mdx/macro";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { defineFeeds } from "@/lib/feeds";

// One MDX file per release in content/changelog; the file name is the slug
// (/changelog/<slug>). `async`: only the frontmatter ships with the bundle, so
// the index lists every entry without loading their bodies; an entry page
// preloads its own body in the route loader.
const entries = defineCollections({
  async: true,
  dir: "content/changelog",
  schema: z.object({
    /** Slug of the gallery video whose poster is the entry's card cover. */
    cover: z.string(),
    /** Release day, `YYYY-MM-DD`; entries are listed newest first. */
    date: z.iso.date(),
    /** One line for the index, the meta description and link previews. */
    description: z.string(),
    title: z.string(),
  }),
  type: "doc",
});

export const changelog = loader({
  baseUrl: ROUTES.CHANGELOG,
  source: entries.toFumadocsSource(),
});

/** Every entry, newest first. */
export const CHANGELOG_ENTRIES = changelog
  .getPages()
  .toSorted((a, b) => b.data.date.localeCompare(a.data.date));

/** An entry's date in the reader's language, e.g. "October 25, 2026". */
export const formatChangelogDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

/** The changelog's feeds, in English like the entries. */
export const CHANGELOG_FEEDS = defineFeeds(`${SITE.NAME} Changelog`, {
  atom: ROUTES.CHANGELOG_ATOM,
  json: ROUTES.CHANGELOG_JSON_FEED,
  rss: ROUTES.CHANGELOG_RSS,
});
