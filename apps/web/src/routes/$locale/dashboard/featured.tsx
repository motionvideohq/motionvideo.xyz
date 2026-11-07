import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { z } from "zod";

import {
  DIRECTORY_COVER_RATIO,
  DirectoryCard,
} from "@/components/directory-card";
import { LocalizedLink as Link } from "@/components/localized-link";
import { MotionVideoCard, MotionVideoOverlay } from "@/components/motion-video";
import { PageMain, AccountPageHeader } from "@/components/page";
import { SectionIcon } from "@/components/section-icon";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DEFAULT_LOCALE, isLocale, localizedPath } from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { DIRECTORY_ENTRIES } from "@/lib/directories";
import type { DirectoryEntry, DirectoryKind } from "@/lib/directories";
import { localizedRedirect } from "@/lib/localized-redirect";
import type { MotionVideo } from "@/lib/motion-catalog";
import { VirtualMasonry } from "@/registry/components/virtual-masonry";
import type { MasonryItem } from "@/registry/components/virtual-masonry";
import { buttonVariants } from "@/registry/ui/button";
import { createMetadata } from "@/seo/metadata";
import type { MySubmission } from "@/server/community-functions";
import { getMySubmissions } from "@/server/community-functions";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/$locale/dashboard/featured");
const videosBySlug = new Map<string, MotionVideo>(
  catalog.videos.map((video) => [video.slug, video])
);

type FeaturedItem =
  | { kind: "video"; video: MotionVideo }
  | { kind: DirectoryKind; entry: DirectoryEntry };

/** The catalog item a featured submission became, if it is still listed. */
const findFeaturedItem = ({
  kind,
  status,
  featuredItemId,
}: MySubmission): FeaturedItem | undefined => {
  if (status !== "featured" || !featuredItemId) {
    return undefined;
  }
  if (kind === "video") {
    const video = videosBySlug.get(featuredItemId);
    return video && { kind, video };
  }
  const entry = DIRECTORY_ENTRIES[kind].find(({ id }) => id === featuredItemId);
  return entry && { kind, entry };
};

const relativeDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(date);

const linkClass = `${buttonVariants({ variant: "outline", size: "sm" })} mt-1 self-start`;

interface FeaturedSearch {
  /** A featured video open in the overlay, over this page. */
  video?: string;
}

const SubmissionCard = ({
  submission,
  locale,
}: {
  submission: MySubmission;
  locale: string;
}) => {
  const content = useIntlayer("featured-page");
  const item = findFeaturedItem(submission);
  return (
    <article className="bg-card shadow-outline flex flex-col gap-2 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <Badge className="capitalize">{submission.kind}</Badge>
        <Badge
          variant={submission.status === "featured" ? "default" : "secondary"}
        >
          {content.status[submission.status]}
        </Badge>
        <time
          dateTime={submission.createdAt.toISOString()}
          className="text-muted-foreground ml-auto text-xs"
        >
          {relativeDate(submission.createdAt, locale)}
        </time>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">
        {submission.title}
      </h3>
      <p className="text-muted-foreground line-clamp-2 text-sm">
        {submission.description}
      </p>
      {item?.kind === "video" ? (
        <Link
          to={ROUTES.DASHBOARD_FEATURED}
          search={{ video: item.video.slug }}
          resetScroll={false}
          className={linkClass}
        >
          {content.viewFeatured}
        </Link>
      ) : (
        <a
          href={item ? item.entry.url : submission.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {item
            ? content.viewFeatured
            : submission.url.replace(/^https?:\/\//u, "").split("/")[0]}
          <ArrowRightUp aria-hidden="true" />
        </a>
      )}
    </article>
  );
};

const Featured = () => {
  const content = useIntlayer("featured-page");
  const sections = useIntlayer("site-header");
  const { locale } = useLocale();
  const { submissions } = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  // Videos open over this page, stepping through the featured videos.
  const videos = submissions.flatMap((submission) => {
    const item = findFeaturedItem(submission);
    return item?.kind === "video" ? [item.video] : [];
  });
  const openIndex = videos.findIndex((video) => video.slug === search.video);
  const openVideo = (slug?: string, replace = false) =>
    navigate({ search: { video: slug }, replace, resetScroll: false });
  const featured: MasonryItem[] = submissions.flatMap((submission) => {
    const item = findFeaturedItem(submission);
    if (!item) {
      return [];
    }
    return item.kind === "video"
      ? [
          {
            key: submission.id,
            aspectRatio: item.video.width / item.video.height,
            node: (
              <MotionVideoCard
                video={item.video}
                paused={openIndex !== -1}
                open={false}
                scope={undefined}
                search={{}}
                onOpen={() => openVideo(item.video.slug)}
              />
            ),
          },
        ]
      : [
          {
            key: submission.id,
            aspectRatio: DIRECTORY_COVER_RATIO,
            node: (
              <DirectoryCard
                kind={item.kind}
                entry={item.entry}
                categoryLabel={undefined}
                label={`${item.entry.name}: ${content.visit.value} (${content.newTab.value})`}
              />
            ),
          },
        ];
  });

  return (
    <>
      <PageMain layout="app" width="full">
        <AccountPageHeader title={sections.featured} intro={content.intro} />
        {submissions.length > 0 ? (
          <>
            <section
              aria-labelledby="featured-work"
              className="flex flex-col gap-4"
            >
              <h2
                id="featured-work"
                className="text-lg font-semibold tracking-tight"
              >
                {content.featuredHeading}
              </h2>
              {featured.length > 0 ? (
                <VirtualMasonry items={featured} />
              ) : (
                <p className="text-muted-foreground bg-muted/40 rounded-2xl p-6 text-sm">
                  {content.emptyTitle}
                </p>
              )}
            </section>
            <section
              aria-labelledby="your-submissions"
              className="flex flex-col gap-4"
            >
              <h2
                id="your-submissions"
                className="text-lg font-semibold tracking-tight"
              >
                {content.submissionsHeading}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {submissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <Empty className="bg-muted/40 rounded-2xl">
            <EmptyHeader>
              <EmptyMedia>
                <SectionIcon
                  section="featured"
                  className="text-muted-foreground size-7"
                />
              </EmptyMedia>
              <EmptyTitle>{content.emptyTitle}</EmptyTitle>
              <EmptyDescription>{content.emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to={ROUTES.DASHBOARD_SUBMIT}
                className={buttonVariants({ variant: "gradient" })}
              >
                {content.submit}
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </PageMain>
      {openIndex !== -1 && (
        <MotionVideoOverlay
          video={videos[openIndex]}
          previous={
            openIndex > 0
              ? () => openVideo(videos[openIndex - 1].slug, true)
              : undefined
          }
          next={
            openIndex < videos.length - 1
              ? () => openVideo(videos[openIndex + 1].slug, true)
              : undefined
          }
          onClose={() => openVideo()}
        />
      )}
    </>
  );
};

export const Route = createFileRoute("/$locale/dashboard/featured")({
  component: Featured,
  validateSearch: (search): FeaturedSearch => ({
    video: z.string().min(1).max(200).safeParse(search.video).data,
  }),
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "site-header",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).featured,
    }),
  // `sponsors` feeds the video overlay's Diamond sidebar row (useSponsors).
  loader: async ({ params }) => {
    const [submissions, { sponsors }] = await Promise.all([
      getMySubmissions(),
      getLandingData(),
    ]);
    if (!submissions) {
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: {
          redirect: localizedPath(ROUTES.DASHBOARD_FEATURED, params.locale),
        },
      });
    }
    return { submissions, sponsors };
  },
});
