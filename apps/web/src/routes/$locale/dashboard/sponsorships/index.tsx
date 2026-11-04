import {
  createFileRoute,
  getRouteApi,
  useRouter,
} from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useState } from "react";
import type { FormEvent } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { z } from "zod";

import { LocalizedLink as Link } from "@/components/localized-link";
import { AccountPageHeader, FormSection, PageMain } from "@/components/page";
import { SectionIcon } from "@/components/section-icon";
import {
  CreativePreview,
  CreativeSections,
} from "@/components/sponsor-creative-fields";
import type { CreativeFields } from "@/components/sponsor-creative-fields";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { SPONSOR_PRICE_USD } from "@/constants/sponsors";
import { track } from "@/lib/analytics";
import { localizedRedirect } from "@/lib/localized-redirect";
import { sponsorCreativeSchema } from "@/lib/sponsorships";
import { createMetadata } from "@/seo/metadata";
import {
  deleteSponsorDraft,
  getMySponsorships,
  getSponsorPortalUrl,
  saveSponsorCreative,
} from "@/server/sponsorship-functions";
import type { MySponsorship } from "@/server/sponsorship-functions";

// Checkout returns here with the sponsorship it paid for; Dodo appends
// `subscription_id` (monthly) or `payment_id` (one-off), plus its own
// `status`, which we re-read from the API instead.
interface SponsorshipsSearch {
  sponsorship?: string;
  subscription_id?: string;
  payment_id?: string;
}

type SaveError = "validation" | "cover" | "storage";

const routeApi = getRouteApi("/$locale/dashboard/sponsorships/");

const helpClass = "text-muted-foreground text-xs leading-relaxed";

const CreativeForm = ({ sponsorship }: { sponsorship: MySponsorship }) => {
  const content = useIntlayer("sponsorships-page");
  const router = useRouter();
  const [fields, setFields] = useState<CreativeFields>({
    name: sponsorship.name ?? "",
    url: sponsorship.url ?? "",
    tagline: sponsorship.tagline ?? "",
    logo: sponsorship.logo ?? "",
    cover: sponsorship.cover ?? "",
    darkInvert: sponsorship.darkInvert,
  });
  const [status, setStatus] = useState<"idle" | "pending" | "saved">("idle");
  const [error, setError] = useState<SaveError | null>(null);
  const update = (patch: Partial<CreativeFields>) => {
    setFields((current) => ({ ...current, ...patch }));
    setStatus("idle");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "pending") {
      return;
    }
    if (!fields.cover.trim()) {
      setError("cover");
      return;
    }
    const input = sponsorCreativeSchema.safeParse({
      id: sponsorship.id,
      name: fields.name,
      url: fields.url,
      tagline: fields.tagline,
      logo: fields.logo,
      cover: fields.cover,
      darkInvert: fields.darkInvert,
    });
    if (!input.success) {
      setError("validation");
      return;
    }
    setStatus("pending");
    setError(null);
    try {
      await saveSponsorCreative({ data: input.data });
      track("sponsor_creative_saved");
      setStatus("saved");
      await router.invalidate();
    } catch {
      setStatus("idle");
      setError("storage");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      aria-busy={status === "pending"}
      className="flex flex-col gap-12"
    >
      <fieldset
        disabled={status === "pending"}
        className="flex min-w-0 flex-col gap-12"
      >
        <CreativeSections
          idPrefix={sponsorship.id}
          fields={fields}
          update={update}
        />

        <FormSection
          title={content.preview}
          description={content.previewSectionBody}
        >
          <CreativePreview fields={fields} tier={sponsorship.tier} />
        </FormSection>

        <FormSection
          title={content.submitSection}
          description={content.submitSectionBody}
        >
          <p className={helpClass}>{content.resubmit}</p>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {content.errors[error]}
            </p>
          )}
          {status === "saved" && (
            <p aria-live="polite" className="text-sm">
              {content.saved}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={status === "pending"}
            className="w-fit"
          >
            {status === "pending" ? content.saving : content.save}
          </Button>
        </FormSection>
      </fieldset>
    </form>
  );
};

const BillingButton = ({ id }: { id: string }) => {
  const content = useIntlayer("sponsorships-page");
  const { locale } = useLocale();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const openPortal = async () => {
    setBusy(true);
    setFailed(false);
    try {
      window.location.href = await getSponsorPortalUrl({
        data: { id, locale },
      });
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" disabled={busy} onClick={openPortal}>
        {busy ? content.opening : content.manageBilling}
      </Button>
      {failed && (
        <p role="alert" className="text-destructive text-xs">
          {content.billingError}
        </p>
      )}
    </div>
  );
};

/** A plan and billing line, e.g. "Gold · $150/month". */
const PlanLine = ({ sponsorship }: { sponsorship: MySponsorship }) => {
  const content = useIntlayer("sponsorships-page");
  return (
    <p className="text-muted-foreground text-sm">
      {content.billings[sponsorship.billing]} · $
      {SPONSOR_PRICE_USD[sponsorship.tier]}
      {content.priceSuffix[sponsorship.billing]}
    </p>
  );
};

// Saved on /sponsorships/new but not paid yet: finish or drop it.
const DraftCard = ({ sponsorship }: { sponsorship: MySponsorship }) => {
  const content = useIntlayer("sponsorships-page");
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteSponsorDraft({ data: { id: sponsorship.id } });
      await router.invalidate();
    } catch {
      // Still listed; the button works again.
    }
    setDeleting(false);
  };

  return (
    <section
      aria-label={content.tiers[sponsorship.tier].value}
      className="bg-card shadow-outline flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 sm:p-6"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {sponsorship.name ?? content.tiers[sponsorship.tier]}
          <Badge variant="outline">{content.statuses.unpaid}</Badge>
        </h2>
        <PlanLine sponsorship={sponsorship} />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" disabled={deleting} onClick={remove}>
          {content.deleteDraft}
        </Button>
        <Link
          to={ROUTES.DASHBOARD_SPONSORSHIPS_NEW}
          search={{ sponsorship: sponsorship.id }}
          className={buttonVariants()}
        >
          {content.finishCheckout}
        </Link>
      </div>
    </section>
  );
};

const SponsorshipCard = ({ sponsorship }: { sponsorship: MySponsorship }) => {
  const content = useIntlayer("sponsorships-page");
  const { locale } = useLocale();
  const once = sponsorship.billing === "once";
  const ending =
    once ||
    sponsorship.cancelAtPeriodEnd ||
    sponsorship.status === "cancelled" ||
    sponsorship.status === "expired";
  // One-off runs end 30 days after approval; monthly runs renew.
  const dateValue = once ? sponsorship.endsAt : sponsorship.nextBillingAt;
  const date =
    dateValue &&
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(dateValue);
  const hiddenWhileInactive =
    sponsorship.review === "approved" && sponsorship.status !== "active";

  return (
    <section
      aria-label={content.tiers[sponsorship.tier].value}
      className="bg-card shadow-outline flex flex-col gap-6 rounded-2xl p-5 sm:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            {content.tiers[sponsorship.tier]}
            <Badge
              variant={sponsorship.status === "active" ? "default" : "outline"}
            >
              {content.statuses[sponsorship.status]}
            </Badge>
          </h2>
          <PlanLine sponsorship={sponsorship} />
          {date && (
            <p className="text-muted-foreground text-sm">
              {ending ? content.ends : content.renews} {date}
            </p>
          )}
        </div>
        {sponsorship.hasPortal && <BillingButton id={sponsorship.id} />}
      </header>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm">
          <span className="text-muted-foreground">{content.placement}:</span>{" "}
          <span className="font-medium">
            {hiddenWhileInactive
              ? content.approvedInactive
              : content.reviews[sponsorship.review]}
          </span>
        </p>
        {sponsorship.reviewNote && (
          <div className="bg-muted/60 rounded-xl p-3 text-sm">
            <p className="text-muted-foreground text-xs">
              {content.reviewNote}
            </p>
            <p className="mt-1 whitespace-pre-line">{sponsorship.reviewNote}</p>
          </div>
        )}
      </div>
      <CreativeForm sponsorship={sponsorship} />
    </section>
  );
};

const idSchema = z.string().min(1).max(100);

const Sponsorships = () => {
  const content = useIntlayer("sponsorships-page");
  const sections = useIntlayer("site-header");
  const { sponsorships } = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  // Back from checkout: the sponsorship counts as paid once Dodo confirms it.
  const returned =
    search.sponsorship === undefined
      ? undefined
      : sponsorships.find(
          (sponsorship) => sponsorship.id === search.sponsorship
        );
  const confirming =
    returned !== undefined &&
    (returned.status === "unpaid" || returned.status === "pending");

  const refresh = async () => {
    setRefreshing(true);
    await router.invalidate();
    setRefreshing(false);
  };

  return (
    <PageMain layout="app" width="narrow">
      <AccountPageHeader
        title={sections.sponsorships}
        intro={content.intro}
        actions={
          sponsorships.length > 0 && (
            <Link
              to={ROUTES.DASHBOARD_SPONSORSHIPS_NEW}
              className={buttonVariants()}
            >
              {content.newSponsorship}
            </Link>
          )
        }
      />
      {confirming && (
        <section
          aria-live="polite"
          className="bg-card shadow-outline flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">
              {content.confirmingTitle}
            </h2>
            <p className="text-muted-foreground text-sm">
              {content.confirmingBody}
            </p>
          </div>
          <Button
            variant="outline"
            disabled={refreshing}
            onClick={refresh}
            className="w-fit shrink-0"
          >
            {content.refresh}
          </Button>
        </section>
      )}
      {returned?.status === "active" && returned.review === "pending" && (
        <section
          aria-live="polite"
          className="bg-card shadow-outline flex items-start gap-3 rounded-2xl p-5"
        >
          <SectionIcon
            section="sponsorships"
            className="mt-0.5 size-6 shrink-0"
          />
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">{content.activeTitle}</h2>
            <p className="text-muted-foreground text-sm">
              {content.activeBody}
            </p>
          </div>
        </section>
      )}
      {sponsorships.length > 0 ? (
        sponsorships.map((sponsorship) =>
          sponsorship.status === "unpaid" ? (
            <DraftCard key={sponsorship.id} sponsorship={sponsorship} />
          ) : (
            <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
          )
        )
      ) : (
        <Empty className="bg-muted/40 rounded-2xl">
          <EmptyHeader>
            <EmptyMedia>
              <SectionIcon
                section="sponsorships"
                className="text-muted-foreground size-7"
              />
            </EmptyMedia>
            <EmptyTitle>{content.emptyTitle}</EmptyTitle>
            <EmptyDescription>{content.emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              to={ROUTES.DASHBOARD_SPONSORSHIPS_NEW}
              className={buttonVariants()}
            >
              {content.startCampaign}
            </Link>
          </EmptyContent>
        </Empty>
      )}
    </PageMain>
  );
};

export const Route = createFileRoute("/$locale/dashboard/sponsorships/")({
  component: Sponsorships,
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "site-header",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).sponsorships,
    }),
  validateSearch: (search): SponsorshipsSearch => ({
    sponsorship: idSchema.safeParse(search.sponsorship).data,
    subscription_id: idSchema.safeParse(search.subscription_id).data,
    payment_id: idSchema.safeParse(search.payment_id).data,
  }),
  loaderDeps: ({ search }) => ({
    subscriptionId: search.subscription_id,
    paymentId: search.payment_id,
  }),
  loader: async ({ deps, location, params }) => {
    const mine = await getMySponsorships({ data: deps });
    if (!mine) {
      // Sign-in returns here with the checkout to confirm.
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: { redirect: location.href },
      });
    }
    return mine;
  },
});
