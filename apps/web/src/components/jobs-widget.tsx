import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { CompanyLogo } from "@/components/company-logo";
import { LocalizedLink as Link } from "@/components/localized-link";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/registry/ui/button";
import type { JobListing } from "@/server/job-functions";

/** How many roles the Discover card lists before "See all jobs". */
const WIDGET_LIMIT = 6;

/**
 * Open roles in the Discover grid, pinned under the sponsored card on wide
 * screens, and only rendered when there are open roles. A plain grid tile like its neighbours: title and Post a job up
 * top, one row per role, See all jobs at the bottom.
 */
export const JobsWidget = ({ jobs }: { jobs: JobListing[] }) => {
  const content = useIntlayer("jobs-page");
  return (
    <section
      aria-labelledby="jobs-widget"
      className="bg-card shadow-outline flex flex-col gap-1 rounded-xl p-2"
    >
      <header className="flex items-center justify-between gap-2 py-1 pr-0.5 pl-2">
        <h2 id="jobs-widget" className="text-sm font-medium">
          {content.widgetTitle}
        </h2>
        <Link
          to={ROUTES.DASHBOARD_JOBS_POST}
          data-track="job_post_start"
          data-track-from="discover"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {content.postJob}
        </Link>
      </header>
      <ul className="flex flex-col">
        {jobs.slice(0, WIDGET_LIMIT).map((job) => (
          <li key={job.id}>
            <a
              href={job.applyUrl}
              data-track="job_apply"
              data-track-company={job.company}
              data-track-from="discover"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-muted focus-visible:ring-ring flex items-center gap-3 rounded-lg p-2 transition-colors outline-none focus-visible:ring-2"
            >
              <CompanyLogo job={job} className="size-8 rounded-md" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {job.title}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {job.company}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Link
        to={ROUTES.JOBS}
        className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring flex items-center justify-between gap-2 rounded-lg p-2 text-sm transition-colors outline-none focus-visible:ring-2"
      >
        {content.seeAll}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
};
