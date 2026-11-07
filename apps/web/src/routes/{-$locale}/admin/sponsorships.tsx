import {
  createFileRoute,
  getRouteApi,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import type { AdminSponsorship } from "@/server/sponsorship-functions";
import {
  listSponsorships,
  reviewSponsorship,
} from "@/server/sponsorship-functions";

const routeApi = getRouteApi("/{-$locale}/admin/sponsorships");

const REVIEW_LABELS: Record<AdminSponsorship["review"], string> = {
  draft: "Not submitted",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const SponsorshipReview = ({
  sponsorship,
}: {
  sponsorship: AdminSponsorship;
}) => {
  const router = useRouter();
  const [note, setNote] = useState(sponsorship.reviewNote ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitted = sponsorship.review !== "draft";

  const review = async (action: "approve" | "reject") => {
    setPending(true);
    setError(null);
    try {
      await reviewSponsorship({
        data: {
          id: sponsorship.id,
          action,
          note: note.trim() || undefined,
        },
      });
      await router.invalidate();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error ? reviewError.message : "Review failed"
      );
    }
    setPending(false);
  };

  return (
    <article className="bg-card shadow-outline flex flex-col gap-4 rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="capitalize">{sponsorship.tier}</Badge>
        <Badge variant="outline">
          {sponsorship.billing === "once" ? "30-day run" : "Monthly"}
        </Badge>
        <Badge
          variant={sponsorship.status === "active" ? "secondary" : "outline"}
        >
          {sponsorship.status.replace("_", " ")}
          {sponsorship.cancelAtPeriodEnd && " · cancels at period end"}
          {sponsorship.endsAt &&
            ` · ends ${sponsorship.endsAt.toLocaleDateString("en", { dateStyle: "medium" })}`}
        </Badge>
        <Badge
          variant={sponsorship.review === "pending" ? "default" : "outline"}
        >
          {REVIEW_LABELS[sponsorship.review]}
        </Badge>
        <time
          dateTime={sponsorship.updatedAt.toISOString()}
          className="text-muted-foreground ml-auto text-xs"
        >
          Updated{" "}
          {sponsorship.updatedAt.toLocaleString("en", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </div>
      {submitted ? (
        <div className="flex flex-col gap-4 sm:flex-row">
          {sponsorship.cover && (
            <img
              src={sponsorship.cover}
              alt="Cover"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="bg-muted shadow-outline aspect-video w-full shrink-0 rounded-xl object-cover sm:w-64"
            />
          )}
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
              {sponsorship.logo && (
                <span className="bg-background shadow-outline dark:bg-popover flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1">
                  <img
                    src={sponsorship.logo}
                    alt="Logo"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className={cn(
                      "size-full object-contain",
                      sponsorship.darkInvert && "dark:invert"
                    )}
                  />
                </span>
              )}
              <div className="flex min-w-0 flex-col">
                <h2 className="truncate text-lg font-semibold tracking-tight">
                  {sponsorship.name}
                </h2>
                <p className="text-muted-foreground truncate text-sm">
                  {sponsorship.tagline}
                </p>
              </div>
            </div>
            {sponsorship.url && (
              <a
                href={sponsorship.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 self-start text-sm break-all underline-offset-4 hover:underline"
              >
                {sponsorship.url}
                <ArrowRightUp
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
              </a>
            )}
            {sponsorship.darkInvert && (
              <p className="text-muted-foreground text-sm">
                Logo inverted in dark mode
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          The sponsor has not submitted a placement yet.
        </p>
      )}
      <p className="text-muted-foreground text-sm">
        Owner:{" "}
        {sponsorship.ownerEmail ? (
          <a
            href={`mailto:${sponsorship.ownerEmail}`}
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            {sponsorship.ownerEmail}
          </a>
        ) : (
          "no account linked"
        )}
        {sponsorship.ownerEmail !== sponsorship.email && (
          <> · paid as {sponsorship.email}</>
        )}{" "}
        · {sponsorship.id}
      </p>
      {submitted && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void review("approve");
          }}
        >
          <Input
            aria-label="Note to the sponsor"
            placeholder="Note to the sponsor (required to reject)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            disabled={pending}
            className="w-96 max-w-full"
          />
          <Button
            type="submit"
            size="sm"
            disabled={pending || sponsorship.review === "approved"}
          >
            Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending || !note.trim()}
            onClick={() => review("reject")}
          >
            Reject
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </article>
  );
};

const AdminSponsorships = () => {
  const sponsorships = routeApi.useLoaderData();

  return (
    <section className="flex flex-1 flex-col gap-4">
      {sponsorships.length > 0 ? (
        sponsorships.map((sponsorship) => (
          // Keyed by review state too, so a reviewed card resets its note.
          <SponsorshipReview
            key={`${sponsorship.id}-${sponsorship.review}`}
            sponsorship={sponsorship}
          />
        ))
      ) : (
        <p className="text-muted-foreground bg-muted/40 flex flex-1 items-center justify-center rounded-2xl p-8 text-center text-sm">
          No sponsorships yet.
        </p>
      )}
    </section>
  );
};

export const Route = createFileRoute("/{-$locale}/admin/sponsorships")({
  component: AdminSponsorships,
  loader: () => listSponsorships(),
});
