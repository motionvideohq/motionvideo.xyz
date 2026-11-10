import { useIntlayer, useLocale } from "react-intlayer";
import { Briefcase } from "reicon-react/icons/Briefcase";

import { CollectionEmptyCard } from "@/components/collection-grid";
import { CompanyLogo } from "@/components/company-logo";
import { ExternalLinkChip } from "@/components/external-link-chip";
import { Badge } from "@/components/ui/badge";
import { relativeDate } from "@/lib/relative-date";
import { cn } from "@/lib/utils";
import type { JobListing } from "@/server/job-functions";

const tileClass =
  "group shadow-outline focus-visible:ring-ring flex aspect-video flex-col justify-between rounded-xl p-4 transition-colors outline-none focus-visible:ring-2";

/**
 * A job in the /jobs grid: the same 16:9 tile as directory covers, so every
 * card in the masonry lines up. Links straight to the apply page.
 */
export const JobCard = ({ job }: { job: JobListing }) => {
  const content = useIntlayer("jobs-page");
  const { locale } = useLocale();
  const where = [
    job.remote ? content.remote.value : null,
    job.location,
    content.types[job.type].value,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <a
      href={job.applyUrl}
      data-track="job_apply"
      data-track-company={job.company}
      data-track-from="board"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        tileClass,
        "bg-card hover:bg-muted/60",
        job.plan === "featured" && "ring-primary ring-2"
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <CompanyLogo job={job} className="size-10 rounded-lg" />
        <span className="flex items-center gap-2">
          {job.plan === "featured" && <Badge>{content.featured}</Badge>}
          <ExternalLinkChip className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100" />
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium">{job.title}</span>
        <span className="text-muted-foreground truncate text-sm">
          {job.company} · {where}
        </span>
        <span className="text-muted-foreground flex justify-between gap-2 text-xs">
          <span className="truncate tabular-nums">{job.salary}</span>
          <span className="shrink-0">
            {job.publishedAt && relativeDate(job.publishedAt, locale, "narrow")}
          </span>
        </span>
      </span>
    </a>
  );
};

/** The same tile, quiet: shown in the grid while there are no open roles. */
export const NoJobsCard = () => {
  const content = useIntlayer("jobs-page");
  return (
    <CollectionEmptyCard
      icon={Briefcase}
      title={content.emptyTitle}
      description={content.emptyBody}
    />
  );
};
