import { useIntlayer } from "react-intlayer";

import { CollectionGrid } from "@/components/collection-grid";
import { CollectionIntro } from "@/components/collection-intro";
import {
  CategoryChip,
  CollectionToolbar,
} from "@/components/collection-toolbar";
import { DIRECTORY_COVER_RATIO } from "@/components/directory-card";
import { FadeScroller } from "@/components/fade-scroller";
import { JobCard, NoJobsCard } from "@/components/job-card";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SponsoredCard, sponsoredTileIndex } from "@/components/sponsored-card";
import { buttonVariants } from "@/components/ui/button";
import type { MasonryItem } from "@/components/virtual-masonry";
import { JOB_TYPES } from "@/constants/jobs";
import type { JobType } from "@/constants/jobs";
import { ROUTES } from "@/constants/routes";
import { useLaneCount } from "@/hooks/use-lane-count";
import type { JobListing } from "@/server/job-functions";

// Same shell as Tools, Skills and Extras: type chips, then the masonry with
// the intro tile first and the sponsored tile in the first row.
export const JobsBoard = ({
  signedIn,
  jobs,
  type,
}: {
  signedIn: boolean;
  jobs: JobListing[];
  /** The type page being shown; `undefined` on /jobs. */
  type: JobType | undefined;
}) => {
  const content = useIntlayer("jobs-page");
  const lanes = useLaneCount();
  const filtered = type ? jobs.filter((job) => job.type === type) : jobs;

  const intro = (
    <CollectionIntro
      titleId="jobs-intro-title"
      title={type ? content.typeHeadings[type] : content.heroTitle}
      description={type ? content.typeDescriptions[type] : content.heroIntro}
      actions={
        <Link
          to={ROUTES.DASHBOARD_JOBS_POST}
          data-track="job_post_start"
          data-track-from="board"
          className={buttonVariants({ variant: "gradient", size: "lg" })}
        >
          {content.postJob}
        </Link>
      }
    />
  );
  const cards: MasonryItem[] = [
    ...filtered.map((job) => ({
      key: job.id,
      aspectRatio: DIRECTORY_COVER_RATIO,
      node: <JobCard job={job} />,
    })),
    // No roles: a quiet tile in the grid says so (the intro already offers
    // Post a job), and the sponsored tile still sits beside it.
    ...(filtered.length === 0
      ? [
          {
            key: "no-jobs",
            aspectRatio: DIRECTORY_COVER_RATIO,
            node: <NoJobsCard />,
          },
        ]
      : []),
  ];
  const items: MasonryItem[] = [{ key: "intro", node: intro }, ...cards];
  const sponsoredIndex = sponsoredTileIndex(lanes, cards.length);
  items.splice(sponsoredIndex, 0, {
    key: "sponsored",
    aspectRatio: DIRECTORY_COVER_RATIO,
    node: <SponsoredCard placement="feed" />,
  });

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <CollectionToolbar>
        <FadeScroller
          label={content.filterType.value}
          className="-mx-1 -my-1 min-w-0 basis-full px-1 py-1 lg:basis-[65%]"
        >
          {[undefined, ...JOB_TYPES].map((value) => (
            <CategoryChip
              key={value ?? "all"}
              {...(value
                ? { to: ROUTES.JOBS_TYPE, params: { type: value } }
                : { to: ROUTES.JOBS })}
              activeOptions={{ exact: true, includeSearch: false }}
              active={value === type}
              label={value ? content.types[value] : content.all}
            />
          ))}
        </FadeScroller>
      </CollectionToolbar>
      <CollectionGrid items={items} />
      <SiteFooter />
    </>
  );
};
