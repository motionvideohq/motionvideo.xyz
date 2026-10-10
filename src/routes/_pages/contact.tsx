import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";
import { Keyboard } from "reicon-react/icons/Keyboard";
import { Send } from "reicon-react/icons/Send";

import { PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
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
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { INQUIRY_TYPES, contactSchema } from "@/lib/contact";
import type { ContactInput } from "@/lib/contact";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { sendContactMessage } from "@/server/functions";

const inlineLink = "text-foreground underline underline-offset-4";

const Contact = () => {
  const content = useIntlayer("contact");
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<"validation" | "send" | null>(null);
  const [inquiry, setInquiry] = useState<ContactInput["inquiry"]>(
    INQUIRY_TYPES[0]
  );

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
      <PageHeader title={content.title.value} intro={content.intro.value} />
      {status === "sent" ? (
        <div className="bg-muted/50 flex items-start gap-3 rounded-xl p-5">
          <ReiconDuotone
            icon={Check}
            aria-hidden
            className="text-primary mt-0.5 size-5"
          />
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
              onValueChange={(value) => value && setInquiry(value)}
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button type="submit" size="lg" disabled={status === "sending"}>
              <ReiconDuotone icon={Send} data-icon="inline-start" aria-hidden />
              {status === "sending" ? content.sending : content.send}
            </Button>
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              {content.or}
              <Kbd>
                <ReiconDuotone icon={Keyboard} aria-hidden />
                {content.enter}
              </Kbd>
              {content.toSend}
            </span>
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

export const Route = createFileRoute("/_pages/contact")({
  component: Contact,
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.CONTACT,
      description: `Get in touch with the team behind ${SITE.NAME}.`,
      title: "Contact",
    }),
    scripts: [breadcrumbJsonLd({ name: "Contact", path: ROUTES.CONTACT })],
  }),
});
