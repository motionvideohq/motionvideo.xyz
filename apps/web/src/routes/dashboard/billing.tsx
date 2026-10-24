import {
  Link,
  createFileRoute,
  getRouteApi,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { z } from "zod";

import { CopyIcon } from "@/components/copy-icon";
import { AccountPageHeader, PageMain } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PlanAccess } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { SKILL } from "@/constants/skill";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { createMetadata } from "@/seo/metadata";
import {
  getMyPlan,
  getPlanPortalUrl,
  inviteSeat,
  listSeats,
  removeSeat,
} from "@/server/plan-functions";
import type { Seat } from "@/server/plan-functions";

interface BillingSearch {
  checkout?: "success";
  /** Appended by Dodo to the checkout return URL; synced on load. */
  subscription_id?: string;
  payment_id?: string;
}

const routeApi = getRouteApi("/dashboard/billing");

/** Opens Dodo's billing portal (owners) or receipts (Skill Bundle buyers). */
const PortalButton = () => {
  const content = useIntlayer("billing-page");
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="lg"
      variant="outline"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          window.location.href = await getPlanPortalUrl();
        } catch {
          setBusy(false);
        }
      }}
    >
      {busy ? content.opening : content.manage}
    </Button>
  );
};

const PlanCard = ({ access }: { access: PlanAccess }) => {
  const content = useIntlayer("billing-page");
  const { locale } = useLocale();
  if (!access.plan || !access.billing) {
    return null;
  }
  const date = access.periodEnd
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        access.periodEnd
      )
    : null;
  let detail: string = content.lifetimeNote.value;
  if (date) {
    detail = `${(access.cancelAtPeriodEnd ? content.ends : content.renews).value} ${date}`;
  }
  return (
    <Card size="lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {content.plans[access.plan]}
          <Badge variant="secondary">{content.billings[access.billing]}</Badge>
        </CardTitle>
        <CardDescription>
          {access.role === "seat" ? content.seatHolder : detail}
        </CardDescription>
      </CardHeader>
      {access.status === "on_hold" && (
        <CardContent>
          <p role="alert" className="text-destructive text-sm">
            {content.onHold}
          </p>
        </CardContent>
      )}
      {access.role === "owner" && (
        <CardFooter className="flex flex-col items-start gap-2">
          <PortalButton />
          <p className="text-muted-foreground text-xs">{content.manageNote}</p>
        </CardFooter>
      )}
    </Card>
  );
};

type InviteError = "full" | "duplicate" | "self" | "failed";

/** Business owners: the seats besides theirs, an invite form and removal. */
const SeatsCard = ({ seats }: { seats: Seat[] }) => {
  const content = useIntlayer("billing-page");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<InviteError | null>(null);

  const onInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = z.email().safeParse(email.trim());
    if (!parsed.success) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await inviteSeat({ data: { email: parsed.data } });
      if (result.ok) {
        setEmail("");
        await router.invalidate();
      } else {
        setError(result.error);
      }
    } catch {
      setError("failed");
    }
    setBusy(false);
  };

  return (
    <Card size="lg">
      <CardHeader>
        <CardTitle>{content.seats}</CardTitle>
        <CardDescription>{content.seatsIntro}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col divide-y text-sm">
          <li className="text-muted-foreground py-2">{content.you}</li>
          {seats.map((seat) => (
            <li key={seat.id} className="flex items-center gap-3 py-2">
              <span className="min-w-0 flex-1 truncate">{seat.email}</span>
              <Badge variant={seat.accepted ? "default" : "secondary"}>
                {seat.accepted ? content.joined : content.invited}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await removeSeat({ data: { id: seat.id } });
                  await router.invalidate();
                }}
              >
                {content.remove}
              </Button>
            </li>
          ))}
        </ul>
        <form onSubmit={onInvite} className="flex gap-2">
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            aria-label={content.emailLabel.value}
            className="flex-1"
          />
          <Button type="submit" disabled={busy}>
            {content.invite}
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {content.errors[error]}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * The Pro tools of the MotionVideo MCP server: the MCP client signs in with
 * this account (OAuth), and the plan unlocks them, so there is nothing to
 * copy here.
 */
const McpCard = () => {
  const content = useIntlayer("billing-page");
  return (
    <Card size="lg">
      <CardHeader>
        <CardTitle>{content.mcpTitle}</CardTitle>
        <CardDescription>{content.mcpIntro}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link
          to="/docs/$"
          params={{ _splat: "mcp" }}
          hash="pro-tools"
          className={buttonVariants({ size: "lg", variant: "outline" })}
        >
          {content.mcpGuide}
        </Link>
      </CardFooter>
    </Card>
  );
};

/**
 * The agent skill, part of the plan: the private repository is granted
 * through Dodo's portal (connect GitHub there), then installed with the
 * command below. Also shown to Skill Bundle buyers, who keep the repository.
 */
const SkillCard = () => {
  const content = useIntlayer("dashboard-page");
  const [status, flash] = useTransientStatus<"idle" | "copied">("idle");
  const copied = status === "copied";
  const label = copied ? content.copied.value : content.copy.value;
  return (
    <Card size="lg">
      <CardHeader>
        <CardTitle>{content.install}</CardTitle>
        <CardDescription>{content.installIntro}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{content.commandLabel}</span>
          <div className="bg-muted/50 flex items-center gap-2 rounded-xl p-2 pl-4">
            <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs whitespace-nowrap">
              {SKILL.INSTALL_COMMAND}
            </code>
            <Button
              aria-label={label}
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(SKILL.INSTALL_COMMAND);
                  flash("copied");
                } catch {
                  // Clipboard access can be denied; the command stays selectable.
                }
              }}
            >
              <CopyIcon copied={copied} />
              {label}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs text-pretty">
            {content.globalNote}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{content.steps}</span>
          <ol className="text-muted-foreground flex list-decimal flex-col gap-1.5 pl-4 text-sm">
            <li>{content.stepPortal}</li>
            <li>{content.stepInvite}</li>
            <li>{content.stepPrompt}</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <PortalButton />
      </CardFooter>
    </Card>
  );
};

const Billing = () => {
  const content = useIntlayer("billing-page");
  const { access, seats } = routeApi.useLoaderData();
  const { checkout } = routeApi.useSearch();

  return (
    <PageMain width="narrow">
      <AccountPageHeader title={content.title} intro={content.intro} />
      {checkout === "success" && (
        <output className="bg-primary/10 text-foreground rounded-xl px-4 py-3 text-sm">
          {content.checkoutSuccess}
        </output>
      )}
      {access.plan ? (
        <PlanCard access={access} />
      ) : (
        <Card size="lg">
          <CardHeader>
            <CardTitle>{content.noPlanTitle}</CardTitle>
            <CardDescription>
              {access.legacySkill ? content.legacySkill : content.noPlanBody}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-2">
            <Link to={ROUTES.PRO} className={buttonVariants({ size: "lg" })}>
              {content.seePlans}
            </Link>
            {access.legacySkill && <PortalButton />}
          </CardFooter>
        </Card>
      )}
      {seats && <SeatsCard seats={seats} />}
      {access.plan && <McpCard />}
      {/* The repository is granted to whoever paid (Dodo's customer): plan
          owners and Skill Bundle buyers, not seat holders. */}
      {(access.role === "owner" || access.legacySkill) && <SkillCard />}
    </PageMain>
  );
};

const idSchema = z.string().min(1).max(100);

export const Route = createFileRoute("/dashboard/billing")({
  component: Billing,
  head: () =>
    createMetadata({
      canonical: ROUTES.DASHBOARD_BILLING,
      noIndex: true,
      title: "Plan and billing",
    }),
  validateSearch: (search): BillingSearch => ({
    checkout: search.checkout === "success" ? "success" : undefined,
    subscription_id: idSchema.safeParse(search.subscription_id).data,
    payment_id: idSchema.safeParse(search.payment_id).data,
  }),
  loaderDeps: ({ search }) => ({
    subscriptionId: search.subscription_id,
    paymentId: search.payment_id,
  }),
  loader: async ({ deps, location }) => {
    const access = await getMyPlan({ data: deps });
    if (!access) {
      throw redirect({
        search: { redirect: location.href },
        to: ROUTES.SIGN_IN,
      });
    }
    const seats =
      access.plan === "business" && access.role === "owner"
        ? await listSeats()
        : null;
    return { access, seats };
  },
});
