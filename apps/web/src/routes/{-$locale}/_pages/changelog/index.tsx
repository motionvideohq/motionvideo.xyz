import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer, useLocale } from "react-intlayer";

import { EntryCard } from "@/components/entry-card";
import { FeedButtons } from "@/components/feed-buttons";
import { PageHeader } from "@/components/page";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import {
  CHANGELOG_ENTRIES,
  CHANGELOG_FEEDS,
  formatChangelogDate,
} from "@/lib/changelog";
import { pickVideos } from "@/lib/video-picks";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// Cards match /blog and /templates: cover poster, title, description, date.
const Changelog = () => {
  const content = useIntlayer("changelog");
  const sections = useIntlayer("site-footer");
  const { locale } = useLocale();
  const { covers } = Route.useLoaderData();
  return (
    <>
      <PageHeader
        title={sections.changelog.value}
        intro={
          locale === DEFAULT_LOCALE
            ? content.intro
            : `${content.intro.value} ${content.englishOnly.value}`
        }
        actions={<FeedButtons feeds={CHANGELOG_FEEDS} />}
      />
      <ol className="flex flex-col gap-4">
        {CHANGELOG_ENTRIES.map((entry) => (
          <li key={entry.url}>
            <EntryCard
              to={ROUTES.CHANGELOG_ENTRY}
              params={{ slug: entry.slugs.join("/") }}
              cover={covers[entry.data.cover]}
              title={entry.data.title}
              description={entry.data.description}
              meta={
                <time dateTime={entry.data.date}>
                  {formatChangelogDate(entry.data.date, locale)}
                </time>
              }
            />
          </li>
        ))}
      </ol>
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/changelog/")({
  component: Changelog,
  // Only the cover posters' fields, not the catalog.
  loader: () => ({
    covers: pickVideos(
      CHANGELOG_ENTRIES.map((entry) => entry.data.cover),
      catalog.videos
    ),
  }),
  head: ({ params }) => {
    const content = getIntlayer(
      "changelog",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    const sections = getIntlayer(
      "site-footer",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return {
      ...createMetadata({
        description: content.intro,
        title: sections.changelog,
      }),
      links: CHANGELOG_FEEDS.links,
      scripts: [
        breadcrumbJsonLd(
          { page: "changelog", path: ROUTES.CHANGELOG },
          params.locale
        ),
      ],
    };
  },
});
