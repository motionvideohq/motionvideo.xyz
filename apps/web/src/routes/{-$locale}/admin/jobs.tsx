import {
  createFileRoute,
  getRouteApi,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/registry/ui/button";
import type { AdminJobPost } from "@/server/job-functions";
import { listJobPosts, reviewJobPost } from "@/server/job-functions";

const routeApi = getRouteApi("/{-$locale}/admin/jobs");

const STATUS_LABELS: Record<AdminJobPost["status"], string> = {
  draft: "Unpaid",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Changes requested",
  refunded: "Refunded",
};

const JobReview = ({ post }: { post: AdminJobPost }) => {
  const router = useRouter();
  const [note, setNote] = useState(post.reviewNote ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const review = async (action: "approve" | "reject") => {
    setPending(true);
    setError(null);
    try {
      await reviewJobPost({
        data: { id: post.id, action, note: note.trim() || undefined },
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
    <article className="bg-card shadow-outline flex flex-col gap-3 rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="capitalize">{post.plan}</Badge>
        <Badge variant={post.status === "pending" ? "default" : "outline"}>
          {STATUS_LABELS[post.status]}
          {post.expiresAt &&
            ` · until ${post.expiresAt.toLocaleDateString("en")}`}
        </Badge>
        <time
          dateTime={post.updatedAt.toISOString()}
          className="text-muted-foreground ml-auto text-xs"
        >
          Updated{" "}
          {post.updatedAt.toLocaleString("en", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </div>
      <div className="flex items-start gap-3">
        {post.logo && (
          <img
            src={post.logo}
            alt="Logo"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="bg-background shadow-outline size-12 shrink-0 rounded-xl object-contain p-1.5"
          />
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">{post.title}</h2>
          <p className="text-muted-foreground text-sm">
            {post.company} · {post.location} · {post.type}
            {post.remote && " · remote"}
            {post.salary && ` · ${post.salary}`}
          </p>
          <p className="text-sm whitespace-pre-line">{post.description}</p>
          <a
            href={post.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 self-start text-sm break-all underline-offset-4 hover:underline"
          >
            {post.applyUrl}
            <ArrowRightUp aria-hidden="true" className="size-3.5 shrink-0" />
          </a>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Owner:{" "}
        <a
          href={`mailto:${post.ownerEmail}`}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          {post.ownerEmail}
        </a>
        {post.paymentId && <> · {post.paymentId}</>}
      </p>
      {post.status !== "refunded" && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void review("approve");
          }}
        >
          <Input
            aria-label="Note to the employer"
            placeholder="Note to the employer (required to reject)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            disabled={pending}
            className="w-96 max-w-full"
          />
          <Button
            type="submit"
            size="sm"
            disabled={pending || post.status === "approved"}
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

const AdminJobs = () => {
  const posts = routeApi.useLoaderData();
  return (
    <section className="flex flex-1 flex-col gap-4">
      {posts.length > 0 ? (
        posts.map((post) => (
          // Keyed by status too, so a reviewed card resets its note.
          <JobReview key={`${post.id}-${post.status}`} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground bg-muted/40 flex flex-1 items-center justify-center rounded-2xl p-8 text-center text-sm">
          No paid job posts yet. Rejecting doesn&apos;t refund; refund in Dodo
          if needed.
        </p>
      )}
    </section>
  );
};

export const Route = createFileRoute("/{-$locale}/admin/jobs")({
  component: AdminJobs,
  loader: () => listJobPosts(),
});
