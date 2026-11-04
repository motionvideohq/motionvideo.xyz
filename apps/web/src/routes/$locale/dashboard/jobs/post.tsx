import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useState } from "react";
import type { FormEvent } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { z } from "zod";

import { ChoiceCard } from "@/components/choice-card";
import { ImageDropzone } from "@/components/image-dropzone";
import { OrderSummary } from "@/components/order-summary";
import { FormSection, HeroHeader, PageMain } from "@/components/page";
import { PlanDetails } from "@/components/plan-details";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JOB_PLANS, JOB_PLAN_USD, JOB_TYPES } from "@/constants/jobs";
import type { JobPlan, JobType } from "@/constants/jobs";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import { track } from "@/lib/analytics";
import {
  JOB_COMPANY_MAX,
  JOB_DESCRIPTION_MAX,
  JOB_LOCATION_MAX,
  JOB_SALARY_MAX,
  JOB_TITLE_MAX,
  jobPostSchema,
} from "@/lib/jobs";
import { localizedRedirect } from "@/lib/localized-redirect";
import { createMetadata } from "@/seo/metadata";
import {
  getMyJobPosts,
  saveJobPost,
  startJobCheckout,
} from "@/server/job-functions";
import type { MyJobPost, SavedJobPost } from "@/server/job-functions";

const routeApi = getRouteApi("/$locale/dashboard/jobs/post");

const fieldClass = "flex flex-col gap-2";
const helpClass = "text-muted-foreground text-xs leading-relaxed";

interface JobFields {
  plan: JobPlan;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  type: JobType;
  salary: string;
  description: string;
  applyUrl: string;
  logo: string;
}

const fieldsOf = (post: MyJobPost | undefined, plan: JobPlan): JobFields =>
  post
    ? {
        plan: post.plan,
        title: post.title,
        company: post.company,
        location: post.location,
        remote: post.remote,
        type: post.type,
        salary: post.salary ?? "",
        description: post.description,
        applyUrl: post.applyUrl,
        logo: post.logo ?? "",
      }
    : {
        plan,
        title: "",
        company: "",
        location: "",
        remote: true,
        type: "full-time",
        salary: "",
        description: "",
        applyUrl: "",
        logo: "",
      };

type FormError = "validation" | "save" | "checkout";

const PostJob = () => {
  const content = useIntlayer("jobs-page");
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { posts, email } = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  // Editing an unpaid draft or a post sent back for changes; anything else
  // starts a new post.
  const post = posts.find(
    (candidate) =>
      candidate.id === search.job &&
      (candidate.status === "draft" || candidate.status === "rejected")
  );
  const [fields, setFields] = useState(() =>
    fieldsOf(post, search.plan ?? "standard")
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  // Sent back for changes: already paid, so it resubmits without checkout.
  const resubmitting = post?.status === "rejected";
  const price = JOB_PLAN_USD[fields.plan];
  const update = (patch: Partial<JobFields>) =>
    setFields((current) => ({ ...current, ...patch }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) {
      return;
    }
    const input = jobPostSchema.safeParse({
      ...fields,
      id: post?.id,
      salary: fields.salary.trim() || undefined,
      logo: fields.logo.trim() || undefined,
    });
    if (!input.success) {
      setError("validation");
      return;
    }
    setPending(true);
    setError(null);
    let saved: SavedJobPost;
    try {
      saved = await saveJobPost({ data: input.data });
      track("job_post_saved", { plan: input.data.plan, status: saved.status });
    } catch {
      setPending(false);
      setError("save");
      return;
    }
    if (saved.status !== "draft") {
      await navigate({ to: ROUTES.DASHBOARD_LISTINGS });
      return;
    }
    try {
      window.location.assign(
        await startJobCheckout({ data: { id: saved.id, locale } })
      );
    } catch {
      setPending(false);
      setError("checkout");
    }
  };

  return (
    <PageMain layout="landing" width="narrow" className="gap-16">
      <HeroHeader title={content.postHeroTitle} intro={content.postHeroIntro} />
      <form
        onSubmit={onSubmit}
        aria-busy={pending}
        className="flex flex-col gap-14"
      >
        <fieldset disabled={pending} className="flex min-w-0 flex-col gap-14">
          {!resubmitting && (
            <FormSection
              title={content.planSection}
              description={content.planSectionBody}
            >
              <RadioGroup
                className="flex flex-col gap-3"
                value={fields.plan}
                onValueChange={(value) =>
                  // SAFETY: the group only holds values from JOB_PLANS.
                  update({ plan: value as JobPlan })
                }
              >
                {JOB_PLANS.map((plan) => (
                  <ChoiceCard
                    key={plan}
                    value={plan}
                    onSelect={() => update({ plan })}
                    title={content.plans[plan].name}
                    price={JOB_PLAN_USD[plan]}
                    priceNote={content.perPost}
                  >
                    <PlanDetails
                      label={content.details}
                      perks={content.plans[plan].perks.map((perk) => ({
                        key: perk.value,
                        node: perk,
                      }))}
                    />
                  </ChoiceCard>
                ))}
              </RadioGroup>
            </FormSection>
          )}

          <FormSection
            title={content.jobSection}
            description={content.jobSectionBody}
          >
            <div className={fieldClass}>
              <Label htmlFor="job-title">{content.jobTitle}</Label>
              <Input
                id="job-title"
                value={fields.title}
                onChange={(event) => update({ title: event.target.value })}
                required
                maxLength={JOB_TITLE_MAX}
              />
            </div>
            <div className={fieldClass}>
              <Label htmlFor="job-apply">{content.applyUrl}</Label>
              <Input
                id="job-apply"
                type="url"
                placeholder="https://"
                value={fields.applyUrl}
                onChange={(event) => update({ applyUrl: event.target.value })}
                required
                maxLength={2048}
                aria-describedby="job-apply-help"
              />
              <p id="job-apply-help" className={helpClass}>
                {content.applyHelp}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className={fieldClass}>
                <Label htmlFor="job-type">{content.type}</Label>
                <Select
                  value={fields.type}
                  onValueChange={(value) => {
                    if (value) {
                      update({ type: value });
                    }
                  }}
                >
                  <SelectTrigger id="job-type" className="w-full">
                    <SelectValue>{content.types[fields.type]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {JOB_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {content.types[type]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className={fieldClass}>
                <span className="text-sm font-medium">
                  {content.workLocation}
                </span>
                <label className="flex h-8 items-center gap-2 text-sm">
                  <Checkbox
                    checked={fields.remote}
                    onCheckedChange={(checked) => update({ remote: checked })}
                  />
                  {content.remoteLabel}
                </label>
              </div>
            </div>
            <div className={fieldClass}>
              <Label htmlFor="job-location">{content.location}</Label>
              <Input
                id="job-location"
                value={fields.location}
                onChange={(event) => update({ location: event.target.value })}
                required
                maxLength={JOB_LOCATION_MAX}
                aria-describedby="job-location-help"
              />
              <p id="job-location-help" className={helpClass}>
                {content.locationHelp}
              </p>
            </div>
          </FormSection>

          <FormSection
            title={content.employerSection}
            description={content.employerSectionBody}
          >
            <div className={fieldClass}>
              <Label htmlFor="job-company">{content.company}</Label>
              <Input
                id="job-company"
                value={fields.company}
                onChange={(event) => update({ company: event.target.value })}
                required
                maxLength={JOB_COMPANY_MAX}
              />
            </div>
            <div className={fieldClass}>
              <span className="text-sm font-medium">{content.logo}</span>
              <ImageDropzone
                purpose="logo"
                value={fields.logo}
                onChange={(logo) => update({ logo })}
                hint={content.logoSize.value}
              />
            </div>
          </FormSection>

          <FormSection
            title={content.detailsSection}
            description={content.detailsSectionBody}
          >
            <div className={fieldClass}>
              <Label htmlFor="job-description">{content.description}</Label>
              <Textarea
                id="job-description"
                value={fields.description}
                onChange={(event) =>
                  update({ description: event.target.value })
                }
                required
                maxLength={JOB_DESCRIPTION_MAX}
                rows={5}
                aria-describedby="job-description-help"
              />
              <p id="job-description-help" className={helpClass}>
                {content.descriptionHelp}
              </p>
            </div>
            <div className={fieldClass}>
              <Label htmlFor="job-salary">{content.salary}</Label>
              <Input
                id="job-salary"
                value={fields.salary}
                onChange={(event) => update({ salary: event.target.value })}
                maxLength={JOB_SALARY_MAX}
                aria-describedby="job-salary-help"
              />
              <p id="job-salary-help" className={helpClass}>
                {content.salaryHelp}
              </p>
            </div>
          </FormSection>

          <FormSection
            title={content.reviewSection}
            description={content.reviewSectionBody}
          >
            <OrderSummary
              item={content.plans[fields.plan].name}
              terms={content.planTerms}
              price={`$${price}`}
              dueLabel={content.dueToday}
              due={resubmitting ? content.alreadyPaid : `$${price}`}
              signedInLabel={content.signedInAs}
              email={email}
            />
            <p className={helpClass}>{content.afterCheckout}</p>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {
                  {
                    validation: content.errorValidation,
                    save: content.errorSave,
                    checkout: content.errorCheckout,
                  }[error]
                }
              </p>
            )}
            <Button type="submit" size="lg" className="w-fit">
              {pending && (resubmitting ? content.saving : content.opening)}
              {!pending && resubmitting && content.resubmit}
              {!pending && !resubmitting && content.checkout}
            </Button>
          </FormSection>
        </fieldset>
      </form>
    </PageMain>
  );
};

interface PostJobSearch {
  plan?: JobPlan;
  /** A draft or sent-back post to edit (from /listings). */
  job?: string;
}

export const Route = createFileRoute("/$locale/dashboard/jobs/post")({
  component: PostJob,
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "account-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).postJobTitle,
    }),
  validateSearch: (search): PostJobSearch => ({
    plan: z.enum(JOB_PLANS).safeParse(search.plan).data,
    job: z.string().min(1).max(100).safeParse(search.job).data,
  }),
  loader: async ({ location, params }) => {
    const mine = await getMyJobPosts({ data: {} });
    if (!mine) {
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: { redirect: location.href },
      });
    }
    return mine;
  },
});
