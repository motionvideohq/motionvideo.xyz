import type { ReactNode } from "react";
import { Ufo } from "reicon-react/icons/Ufo";

import { LocalizedLink as Link } from "@/components/localized-link";
import { SponsorSlots } from "@/components/sponsor-slots";
import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

/** Surprise me and Submit, the intro actions of the gallery and directories. */
export const SurpriseAndSubmit = ({
  onSurprise,
  surpriseDisabled,
  surpriseLabel,
  submitLabel,
  submitSearch,
}: {
  onSurprise: () => void;
  surpriseDisabled?: boolean;
  surpriseLabel: ReactNode;
  submitLabel: ReactNode;
  submitSearch: { kind: string; category?: string };
}) => (
  <>
    <Button
      variant="outline"
      size="lg"
      disabled={surpriseDisabled}
      onClick={onSurprise}
      data-track="surprise_me"
      data-track-kind={submitSearch.kind}
    >
      <Ufo aria-hidden="true" />
      {surpriseLabel}
    </Button>
    <Link
      to={ROUTES.DASHBOARD_SUBMIT}
      data-track="submit_click"
      data-track-kind={submitSearch.kind}
      // SAFETY: /submit accepts every section kind plus an optional
      // category slug; callers pass their section's kind and slug.
      search={submitSearch as never}
      className={buttonVariants({ variant: "gradient", size: "lg" })}
    >
      {submitLabel}
    </Link>
  </>
);

/**
 * The first masonry tile shared by the gallery, the resource directories and
 * Jobs: heading, intro copy, the page's actions, and the Diamond and Gold
 * sponsor slots.
 */
export const CollectionIntro = ({
  titleId,
  title,
  description,
  actions,
}: {
  titleId: string;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
}) => (
  <section
    aria-labelledby={titleId}
    className="flex flex-col justify-end gap-4 sm:aspect-4/3"
  >
    <header>
      {/* Fixed shape on every page (one-line title, three-line
          description), so switching sections or categories never shifts the
          grid. Copy is written to fit; overflow truncates. */}
      <h1
        id={titleId}
        className="truncate text-2xl leading-tight font-semibold tracking-tight"
      >
        {title}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm leading-tight text-pretty">
        {description}
      </p>
    </header>
    <div className="flex flex-wrap gap-2">{actions}</div>
    <SponsorSlots />
  </section>
);
