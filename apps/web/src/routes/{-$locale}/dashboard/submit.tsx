import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useState } from "react";
import type { FormEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";
import { z } from "zod";

import { LocalizedLink as Link } from "@/components/localized-link";
import { FormSection, HeroHeader, PageMain } from "@/components/page";
import { useSignInDialog } from "@/components/sign-in-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeParam,
  localizedPath,
} from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import {
  SUBMISSION_CATEGORIES,
  SUBMISSION_KINDS,
  communitySubmissionSchema,
  findSubmissionCategory,
} from "@/lib/community";
import type { SubmissionCategory, SubmissionKind } from "@/lib/community";
import type { DirectorySlug } from "@/lib/directories";
import { localizedRedirect } from "@/lib/localized-redirect";
import { Button } from "@/registry/ui/button";
import { createMetadata } from "@/seo/metadata";
import {
  getSubmitter,
  submitCommunityEntry,
} from "@/server/community-functions";

interface SubmissionSearch {
  kind?: SubmissionKind;
  /** One of the kind's categories; anything else is dropped. */
  category?: SubmissionCategory;
}

type SubmissionError = "validation" | "rate-limit" | "storage" | "unauthorized";

const SubmissionForm = ({
  initialKind,
  initialCategory,
  email,
}: {
  initialKind: SubmissionKind;
  initialCategory: SubmissionCategory | undefined;
  /** The account email submissions are filed under. */
  email: string;
}) => {
  const content = useIntlayer("community-submit");
  const gallery = useIntlayer("motion-gallery");
  const directory = useIntlayer("resource-directory");
  const [kind, setKind] = useState<SubmissionKind>(initialKind);
  const [category, setCategory] = useState<SubmissionCategory | null>(
    initialCategory ?? null
  );
  const [status, setStatus] = useState<"idle" | "pending" | "saved">("idle");
  const [error, setError] = useState<SubmissionError | null>(null);
  const signInDialog = useSignInDialog();

  // Videos use the gallery categories; the other kinds their section's chips.
  let categoryOptions: { value: SubmissionCategory; label: string }[];
  if (kind === "video") {
    categoryOptions = SUBMISSION_CATEGORIES.video.map((value) => ({
      value,
      label: gallery.categories[value].value,
    }));
  } else {
    const slugs: readonly DirectorySlug[] = SUBMISSION_CATEGORIES[kind];
    const labels: Partial<Record<string, { value: string }>> =
      directory.labels[kind];
    categoryOptions = slugs.map((value) => ({
      value,
      label: labels[value]?.value ?? value,
    }));
  }
  const categoryLabel = categoryOptions.find(
    (option) => option.value === category
  )?.label;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "pending") {
      return;
    }
    const form = new FormData(event.currentTarget);
    const input = communitySubmissionSchema.safeParse({
      kind,
      category: category ?? undefined,
      name: form.get("name"),
      title: form.get("title"),
      url: form.get("url"),
      description: form.get("description"),
      prompt: kind === "video" ? (form.get("prompt") ?? "") : undefined,
      consent: form.get("consent") === "on",
      website: form.get("website") ?? "",
    });
    if (!input.success) {
      setError("validation");
      return;
    }
    setStatus("pending");
    setError(null);
    try {
      const result = await submitCommunityEntry({ data: input.data });
      if (!result.ok) {
        setStatus("idle");
        setError(result.error);
        // The session ended since the page loaded; the form stays filled in.
        if (result.error === "unauthorized") {
          signInDialog.open(content.errors.unauthorized.value);
        }
        return;
      }
      setStatus("saved");
    } catch {
      setStatus("idle");
      setError("storage");
    }
  };

  if (status === "saved") {
    return (
      <section
        aria-live="polite"
        className="bg-card shadow-outline flex flex-col gap-5 rounded-2xl p-6"
      >
        <div className="flex items-start gap-3">
          <Check aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{content.saved}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {content.thanks}
            </p>
          </div>
        </div>
        <Link
          to={ROUTES.HOME}
          className="w-fit text-sm underline underline-offset-4"
        >
          {content.back}
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-busy={status === "pending"}>
      <fieldset
        disabled={status === "pending"}
        className="flex min-w-0 flex-col gap-14"
      >
        <FormSection
          title={content.sections.kind}
          description={content.sections.kindBody}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-kind">{content.kind}</Label>
            <Select
              value={kind}
              onValueChange={(value) => {
                if (value) {
                  setKind(value);
                  // Categories differ per kind.
                  setCategory(null);
                }
              }}
            >
              <SelectTrigger id="submission-kind" className="w-full">
                <SelectValue>{content.kinds[kind]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SUBMISSION_KINDS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {content.kinds[value]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {categoryOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="submission-category">{content.category}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="submission-category"
                  className="w-full"
                  aria-describedby="submission-category-help"
                >
                  <SelectValue>
                    {categoryLabel ?? content.noCategory}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={null}>{content.noCategory}</SelectItem>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p
                id="submission-category-help"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {content.categoryHelp}
              </p>
            </div>
          )}
        </FormSection>

        <FormSection
          title={content.sections.entry}
          description={content.sections.entryBody}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-title">{content.entryTitle}</Label>
            <Input
              id="submission-title"
              name="title"
              required
              maxLength={150}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-url">{content.url}</Label>
            <Input
              id="submission-url"
              name="url"
              type="url"
              placeholder="https://"
              required
              maxLength={2048}
              aria-describedby="submission-url-help"
            />
            <p
              id="submission-url-help"
              className="text-muted-foreground text-xs leading-relaxed"
            >
              {content.urlHelp}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-description">
              {content.description}
            </Label>
            <Textarea
              id="submission-description"
              name="description"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              aria-describedby="submission-description-help"
            />
            <p
              id="submission-description-help"
              className="text-muted-foreground text-xs leading-relaxed"
            >
              {content.descriptionHelp}
            </p>
          </div>
          {kind === "video" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="submission-prompt">{content.prompt}</Label>
              <Textarea
                id="submission-prompt"
                name="prompt"
                maxLength={10_000}
                rows={4}
                aria-describedby="submission-prompt-help"
              />
              <p
                id="submission-prompt-help"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {content.promptHelp}
              </p>
            </div>
          )}
        </FormSection>

        <FormSection
          title={content.sections.you}
          description={content.sections.youBody}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-name">{content.name}</Label>
            <Input
              id="submission-name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              aria-describedby="submission-account-help"
            />
            <p
              id="submission-account-help"
              className="text-muted-foreground text-xs leading-relaxed"
            >
              {content.signedInAs} <strong>{email}</strong>.{" "}
              {content.accountEmailHelp}
            </p>
          </div>
        </FormSection>

        <FormSection
          title={content.sections.submit}
          description={content.sections.submitBody}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="submission-consent"
              name="consent"
              required
              className="mt-0.5"
            />
            <Label
              htmlFor="submission-consent"
              className="text-muted-foreground text-sm leading-relaxed font-normal"
            >
              {content.consent}
            </Label>
          </div>
          <Link
            to={ROUTES.PRIVACY}
            className="text-muted-foreground hover:text-foreground w-fit text-xs underline underline-offset-4"
          >
            {content.privacy}
          </Link>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {content.errors[error]}
            </p>
          )}
          <Button type="submit" size="lg" className="w-fit">
            {status === "pending" ? content.pending : content.submit}
          </Button>
        </FormSection>
      </fieldset>
    </form>
  );
};

const Submit = () => {
  const content = useIntlayer("community-submit");
  const { email } = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <PageMain layout="landing" width="narrow" className="gap-16">
      <HeroHeader title={content.title} intro={content.intro} />
      <SubmissionForm
        key={`${search.kind ?? "video"}:${search.category ?? ""}`}
        initialKind={search.kind ?? "video"}
        initialCategory={search.category}
        email={email}
      />
    </PageMain>
  );
};

export const Route = createFileRoute("/{-$locale}/dashboard/submit")({
  component: Submit,
  validateSearch: (search): SubmissionSearch => {
    const kind = z.enum(SUBMISSION_KINDS).safeParse(search.kind).data;
    return {
      kind,
      category: findSubmissionCategory(
        kind ?? "video",
        z.string().safeParse(search.category).data
      ),
    };
  },
  loaderDeps: ({ search }) => ({
    kind: search.kind,
    category: search.category,
  }),
  // Submissions need an account; sign-in returns here with the same kind and
  // category.
  loader: async ({ deps, params }) => {
    const submitter = await getSubmitter();
    if (!submitter) {
      const search = new URLSearchParams();
      if (deps.kind) {
        search.set("kind", deps.kind);
      }
      if (deps.category) {
        search.set("category", deps.category);
      }
      const query = search.toString();
      const back = `${localizedPath(ROUTES.DASHBOARD_SUBMIT, localeParam(params.locale))}${query ? `?${query}` : ""}`;
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: { redirect: back },
      });
    }
    return submitter;
  },
  head: ({ params }: LocaleHeadContext) => {
    const meta = getIntlayer(
      "account-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return createMetadata({
      title: meta.submitTitle,
      description: meta.submitDescription,
    });
  },
});
