import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";
import { Send } from "reicon-react/icons/Send";

import { PageHeader } from "@/components/page";
import { SendShortcut } from "@/components/send-shortcut";
import { Button } from "@/components/ui/button";
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
import { LINK } from "@/constants/links";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { useSession } from "@/lib/auth-client";
import { publicUrlSchema } from "@/lib/community";
import { INQUIRY_TYPES, contactSchema } from "@/lib/contact";
import type { ContactInput } from "@/lib/contact";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { sendContactMessage } from "@/server/functions";

const inlineLink = "text-foreground underline underline-offset-4";

// Links into the form preset it, e.g. the "Contact us" line under a video:
// `?inquiry=removal&ref=<page URL>`.
interface ContactSearch {
  inquiry?: "removal";
  ref?: string;
}

const noSubscribe = () => () => {
  // Nothing changes after hydration.
};

const Contact = () => {
  const content = useIntlayer("contact");
  const sections = useIntlayer("site-footer");
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<"validation" | "send" | null>(null);
  const search = Route.useSearch();
  // The page is prerendered without a query string, so the preset applies
  // only once hydrated (false while hydrating, true after).
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  );
  const [picked, setPicked] = useState<ContactInput["inquiry"] | null>(null);
  const inquiry =
    picked ??
    (hydrated && search.inquiry === "removal"
      ? "Removal or credit"
      : INQUIRY_TYPES[0]);

  // The page the link came from goes into the subject and message.
  useEffect(() => {
    if (search.inquiry !== "removal") {
      return;
    }
    const form = formRef.current;
    const subject = form?.elements.namedItem("subject");
    const message = form?.elements.namedItem("message");
    if (search.ref && subject instanceof HTMLInputElement && !subject.value) {
      subject.value = search.ref.slice(0, 150);
    }
    if (
      search.ref &&
      message instanceof HTMLTextAreaElement &&
      !message.value
    ) {
      message.value = `${search.ref}\n\n`;
    }
  }, [search.inquiry, search.ref]);

  // Signed in: the account's name and email, unless already typed. The page
  // is prerendered, so this fills in once the session loads.
  const session = useSession();
  const user = session.data?.user;
  useEffect(() => {
    const form = formRef.current;
    const name = form?.elements.namedItem("name");
    const email = form?.elements.namedItem("email");
    if (user?.name && name instanceof HTMLInputElement && !name.value) {
      name.value = user.name;
    }
    if (user?.email && email instanceof HTMLInputElement && !email.value) {
      email.value = user.email;
    }
  }, [user?.name, user?.email]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = contactSchema.safeParse({
      email: form.get("email"),
      inquiry,
      message: form.get("message"),
      name: form.get("name"),
      subject: form.get("subject"),
      website: form.get("website") ?? "",
    });
    if (!input.success) {
      setError("validation");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const result = await sendContactMessage({ data: input.data });
      if (!result.ok) {
        setStatus("idle");
        setError("send");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("send");
    }
  };

  // ⌘/Ctrl + Enter sends from the message box.
  const onMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <>
      <PageHeader title={sections.contact.value} intro={content.intro.value} />
      {status === "sent" ? (
        <div className="bg-muted/50 flex items-start gap-3 rounded-xl p-5">
          <Check aria-hidden className="text-primary mt-0.5 size-5" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">{content.sent}</p>
            <p className="text-muted-foreground text-sm">{content.thanks}</p>
          </div>
        </div>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{content.name}</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder={content.namePlaceholder.value}
              required
              maxLength={100}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{content.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={content.emailPlaceholder.value}
              required
              maxLength={254}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="inquiry">{content.inquiry}</Label>
            <Select
              value={inquiry}
              onValueChange={(value) => value && setPicked(value)}
            >
              <SelectTrigger id="inquiry" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {INQUIRY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {content.inquiryLabels[type]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">{content.subject}</Label>
            <Input
              id="subject"
              name="subject"
              placeholder={`${content.inquiryLabels[inquiry].value}: ${content.subjectPlaceholder.value}`}
              required
              maxLength={150}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">{content.message}</Label>
            <Textarea
              id="message"
              name="message"
              placeholder={content.messagePlaceholder.value}
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              className="min-h-36"
              onKeyDown={onMessageKeyDown}
            />
          </div>
          {/* Honeypot: hidden from people and assistive tech. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
          />
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error === "validation"
                ? content.validationError
                : content.sendError}
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex">
              <SendShortcut enter={content.enter.value} />
              {content.toSend}
            </span>
            <Button
              type="submit"
              size="lg"
              disabled={status === "sending"}
              className="ml-auto"
            >
              <Send aria-hidden="true" />
              {status === "sending" ? content.sending : content.send}
            </Button>
          </div>
        </form>
      )}

      <p className="text-muted-foreground">
        {content.prefer}
        <a href={`mailto:${LINK.EMAIL}`} className={inlineLink}>
          {LINK.EMAIL}
        </a>{" "}
        {content.dm}
        <a href={LINK.X} className={inlineLink}>
          {SITE.AUTHOR.TWITTER}
        </a>
        .
      </p>
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/contact")({
  component: Contact,
  validateSearch: (search): ContactSearch => ({
    inquiry: search.inquiry === "removal" ? "removal" : undefined,
    ref: publicUrlSchema.safeParse(search.ref).data,
  }),
  head: ({ params }) => ({
    ...createMetadata({
      description: getIntlayer(
        "directory-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).contact.description,
      title: getIntlayer(
        "directory-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).contact.title,
    }),
    scripts: [
      breadcrumbJsonLd(
        { page: "contact", path: ROUTES.CONTACT },
        params.locale
      ),
    ],
  }),
});
