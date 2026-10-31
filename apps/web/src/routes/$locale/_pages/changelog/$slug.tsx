import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";

import { PageHeader } from "@/components/page";
import { ProseBody } from "@/components/prose-mdx";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { changelog, formatChangelogDate } from "@/lib/changelog";
import { breadcrumbJsonLd, changelogEntryJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const ChangelogEntry = () => {
  const content = useIntlayer("changelog");
  const { locale } = useLocale();
  const { slug } = Route.useParams();
  // The loader already threw notFound() for unknown slugs.
  const entry = changelog.getPage([slug]);
  if (!entry) {
    return null;
  }
  return (
    <>
      <Link
        to="/$locale/changelog"
        params={{ locale }}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {content.allUpdates}
      </Link>
      <article className="flex flex-col gap-10">
        <PageHeader
          title={entry.data.title}
          intro={
            <time dateTime={entry.data.date}>
              {formatChangelogDate(entry.data.date, locale)}
            </time>
          }
        />
        <ProseBody Body={entry.data.body} />
      </article>
    </>
  );
};

export const Route = createFileRoute("/$locale/_pages/changelog/$slug")({
  component: ChangelogEntry,
  head: ({ params }) => {
    const entry = changelog.getPage([params.slug]);
    if (!entry) {
      return {};
    }
    return {
      ...createMetadata({
        description: entry.data.description,
        title: entry.data.title,
      }),
      scripts: [
        breadcrumbJsonLd(
          [
            { page: "changelog", path: ROUTES.CHANGELOG },
            { name: entry.data.title, path: entry.url },
          ],
          params.locale
        ),
        changelogEntryJsonLd(
          { ...entry.data, path: entry.url },
          isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
        ),
      ],
    };
  },
  // Bodies load lazily (`async` in src/lib/changelog.ts); fetch this one
  // before rendering so the page never suspends.
  loader: async ({ params }) => {
    const entry = changelog.getPage([params.slug]);
    if (!entry) {
      throw notFound();
    }
    await entry.data.preload();
  },
});
