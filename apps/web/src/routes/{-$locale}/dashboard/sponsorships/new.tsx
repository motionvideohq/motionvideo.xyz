import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useState } from "react";
import type { FormEvent } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { z } from "zod";

import { ChoiceCard } from "@/components/choice-card";
import { OrderSummary } from "@/components/order-summary";
import { FormSection, HeroHeader, PageMain } from "@/components/page";
import { PlanDetails } from "@/components/plan-details";
import {
  CreativePreview,
  CreativeSections,
  EMPTY_CREATIVE,
} from "@/components/sponsor-creative-fields";
import type { CreativeFields } from "@/components/sponsor-creative-fields";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import {
  SPONSOR_BILLINGS,
  SPONSOR_PRICE_USD,
  SPONSOR_TIERS,
} from "@/constants/sponsors";
import type { SponsorBilling, SponsorTier } from "@/constants/sponsors";
import { track } from "@/lib/analytics";
import { localizedRedirect } from "@/lib/localized-redirect";
import { sponsorDraftSchema } from "@/lib/sponsorships";
import { createMetadata } from "@/seo/metadata";
import {
  getMySponsorships,
  getSoldOutTiers,
  saveSponsorDraft,
  startSponsorCheckout,
} from "@/server/sponsorship-functions";
import type { MySponsorship } from "@/server/sponsorship-functions";

// Sign in, fill in the plan and the placement, review, then pay on Dodo.
// The draft is saved before checkout, so the creative is ready the moment
// the payment lands; Dodo's cancel URL brings the sponsor back to it.

interface NewSponsorshipSearch {
  tier?: SponsorTier;
  billing?: SponsorBilling;
  /** An unpaid draft to finish. */
  sponsorship?: string;
}

interface DraftFields extends CreativeFields {
  tier: SponsorTier;
  billing: SponsorBilling;
}

type FormError =
  | "validation"
  | "cover"
  | "sold-out"
  | "drafts"
  | "save"
  | "checkout";

const routeApi = getRouteApi("/{-$locale}/dashboard/sponsorships/new");

const fieldsOf = (
  draft: MySponsorship | undefined,
  search: NewSponsorshipSearch,
  soldOut: readonly SponsorTier[]
): DraftFields => {
  if (draft) {
    return {
      tier: draft.tier,
      billing: draft.billing,
      name: draft.name ?? "",
      url: draft.url ?? "",
      tagline: draft.tagline ?? "",
      logo: draft.logo ?? "",
      cover: draft.cover ?? "",
      darkInvert: draft.darkInvert,
    };
  }
  // The asked-for tier when it has a seat, else the first tier that does
  // (Diamond when every tier is full; saving then explains it sold out).
  const open = (tier: SponsorTier) => !soldOut.includes(tier);
  const tier =
    search.tier && open(search.tier)
      ? search.tier
      : (SPONSOR_TIERS.find(open) ?? "diamond");
  return {
    ...EMPTY_CREATIVE,
    tier,
    billing: search.billing ?? "monthly",
  };
};

const NewSponsorship = () => {
  const content = useIntlayer("sponsorships-page");
  const sponsorCopy = useIntlayer("sponsor");
  const { locale } = useLocale();
  const { email, sponsorships, soldOutTiers } = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  const draft = sponsorships.find(
    (sponsorship) =>
      sponsorship.id === search.sponsorship && sponsorship.status === "unpaid"
  );
  const [fields, setFields] = useState(() =>
    fieldsOf(draft, search, soldOutTiers)
  );
  // Set once the draft is saved, so a retry edits it instead of adding one.
  const [savedId, setSavedId] = useState(draft?.id);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const price = SPONSOR_PRICE_USD[fields.tier];
  const update = (patch: Partial<DraftFields>) =>
    setFields((current) => ({ ...current, ...patch }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) {
      return;
    }
    if (!fields.cover.trim()) {
      setError("cover");
      return;
    }
    const input = sponsorDraftSchema.safeParse({
      id: savedId,
      tier: fields.tier,
      billing: fields.billing,
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
    setPending(true);
    setError(null);
    let id: string;
    try {
      const saved = await saveSponsorDraft({ data: input.data });
      if (!saved.ok) {
        setPending(false);
        setError(saved.error);
        return;
      }
      ({ id } = saved);
      setSavedId(id);
    } catch {
      setPending(false);
      setError("save");
      return;
    }
    track("checkout_start", {
      product: `sponsor-${fields.tier}-${fields.billing}`,
    });
    try {
      const checkout = await startSponsorCheckout({
        data: { id, locale },
      });
      if (!checkout.ok) {
        setPending(false);
        setError(checkout.error);
        return;
      }
      window.location.assign(checkout.url);
    } catch {
      setPending(false);
      setError("checkout");
    }
  };

  return (
    <PageMain layout="landing" width="narrow" className="gap-16">
      <HeroHeader
        title={content.checkout.heroTitle}
        intro={content.checkout.heroIntro}
      />

      <form
        onSubmit={onSubmit}
        aria-busy={pending}
        className="flex flex-col gap-14"
      >
        <fieldset disabled={pending} className="flex min-w-0 flex-col gap-14">
          <FormSection
            title={content.checkout.planSection}
            description={content.checkout.planSectionBody}
          >
            <RadioGroup
              className="flex flex-col gap-3"
              value={fields.tier}
              onValueChange={(value) =>
                // SAFETY: the group only holds values from SPONSOR_TIERS.
                update({ tier: value as SponsorTier })
              }
            >
              {SPONSOR_TIERS.map((tier) => {
                const soldOut = soldOutTiers.includes(tier);
                return (
                  <ChoiceCard
                    key={tier}
                    value={tier}
                    onSelect={() => update({ tier })}
                    disabled={soldOut}
                    title={content.tiers[tier]}
                    price={SPONSOR_PRICE_USD[tier]}
                    priceNote={content.priceSuffix[fields.billing]}
                    body={soldOut ? content.checkout.soldOut : undefined}
                  >
                    <PlanDetails
                      label={content.checkout.details}
                      perks={sponsorCopy.tiers[tier].perks.map((perk) => ({
                        key: perk.value,
                        node: perk,
                      }))}
                    />
                  </ChoiceCard>
                );
              })}
            </RadioGroup>
          </FormSection>

          <FormSection
            title={content.checkout.billingSection}
            description={content.checkout.billingSectionBody}
          >
            <RadioGroup
              className="grid gap-3 sm:grid-cols-2"
              value={fields.billing}
              onValueChange={(value) =>
                // SAFETY: the group only holds values from SPONSOR_BILLINGS.
                update({ billing: value as SponsorBilling })
              }
            >
              {SPONSOR_BILLINGS.map((billing) => (
                <ChoiceCard
                  key={billing}
                  value={billing}
                  onSelect={() => update({ billing })}
                  title={content.billings[billing]}
                  body={content.checkout.billingBodies[billing]}
                />
              ))}
            </RadioGroup>
          </FormSection>

          <CreativeSections
            idPrefix="new-sponsorship"
            fields={fields}
            update={update}
          />

          <FormSection
            title={content.preview}
            description={content.previewSectionBody}
          >
            <CreativePreview fields={fields} tier={fields.tier} />
          </FormSection>

          <FormSection
            title={content.checkout.reviewSection}
            description={content.checkout.reviewSectionBody}
          >
            <OrderSummary
              item={content.tiers[fields.tier]}
              terms={content.billings[fields.billing]}
              price={`$${price}`}
              dueLabel={content.checkout.dueToday}
              due={`$${price}`}
              signedInLabel={content.checkout.signedInAs}
              email={email}
            />
            <p className="text-muted-foreground text-xs leading-relaxed">
              {content.checkout.note}
            </p>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {content.checkout.errors[error]}
              </p>
            )}
            <Button type="submit" size="lg" className="w-fit">
              {pending ? content.checkout.opening : content.checkout.submit}
            </Button>
          </FormSection>
        </fieldset>
      </form>
    </PageMain>
  );
};

const idSchema = z.string().min(1).max(100);

export const Route = createFileRoute("/{-$locale}/dashboard/sponsorships/new")({
  component: NewSponsorship,
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "account-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).newSponsorshipTitle,
    }),
  validateSearch: (search): NewSponsorshipSearch => ({
    tier: z.enum(SPONSOR_TIERS).safeParse(search.tier).data,
    billing: z.enum(SPONSOR_BILLINGS).safeParse(search.billing).data,
    sponsorship: idSchema.safeParse(search.sponsorship).data,
  }),
  loader: async ({ location, params }) => {
    const [mine, soldOutTiers] = await Promise.all([
      getMySponsorships({ data: {} }),
      getSoldOutTiers(),
    ]);
    if (!mine) {
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: { redirect: location.href },
      });
    }
    return { ...mine, soldOutTiers };
  },
});
