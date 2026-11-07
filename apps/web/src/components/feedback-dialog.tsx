import { createContext, use, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import type { IconComponent } from "reicon-react";
import { CheckCircle } from "reicon-react/icons/CheckCircle";
import { EmojiHappy } from "reicon-react/icons/EmojiHappy";
import { EmojiNormal } from "reicon-react/icons/EmojiNormal";
import { EmojiSad } from "reicon-react/icons/EmojiSad";
import { Send } from "reicon-react/icons/Send";

import { SendShortcut } from "@/components/send-shortcut";
import {
  Dialog as ShadDialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { useSession } from "@/lib/auth-client";
import { FEEDBACK_MAX, FEEDBACK_MOODS, feedbackSchema } from "@/lib/feedback";
import type { FeedbackMood } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import { sendFeedback } from "@/server/feedback-functions";

const MOOD_ICONS: Record<FeedbackMood, IconComponent> = {
  love: EmojiHappy,
  okay: EmojiNormal,
  bad: EmojiSad,
};

interface FeedbackDialogApi {
  open: () => void;
}

const FeedbackDialogContext = createContext<FeedbackDialogApi | null>(null);

export const useFeedbackDialog = () => {
  const api = use(FeedbackDialogContext);
  if (!api) {
    throw new Error(
      "useFeedbackDialog must be used inside FeedbackDialogProvider"
    );
  }
  return api;
};

const FeedbackForm = ({ page }: { page: string }) => {
  const content = useIntlayer("feedback-dialog");
  const session = useSession();
  const signedIn = Boolean(session.data);
  const formRef = useRef<HTMLFormElement>(null);
  const [mood, setMood] = useState<FeedbackMood | undefined>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<
    "validation" | "rate-limit" | "send" | null
  >(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const input = feedbackSchema.safeParse({
      mood,
      message: form.get("message"),
      page,
      email: signedIn || !email ? undefined : email,
      website: form.get("website") ?? "",
    });
    if (!input.success) {
      setError("validation");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const result = await sendFeedback({ data: input.data });
      if (result.ok) {
        setStatus("sent");
        track("feedback_sent", { mood: mood ?? "none" });
        return;
      }
      setError(result.error === "rate-limit" ? "rate-limit" : "send");
    } catch {
      setError("send");
    }
    setStatus("idle");
  };

  // ⌘/Ctrl + Enter sends from the message box.
  const onMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle aria-hidden="true" className="text-primary size-8" />
        <DialogTitle>{content.thanksTitle}</DialogTitle>
        <DialogDescription>{content.thanksBody}</DialogDescription>
        <DialogClose render={<Button className="mt-2" />}>
          {content.done}
        </DialogClose>
      </div>
    );
  }

  const errorText = {
    validation: content.validationError,
    "rate-limit": content.rateLimitError,
    send: content.sendError,
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 pr-8">
        <DialogTitle>{content.title}</DialogTitle>
        <DialogDescription>{content.description}</DialogDescription>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          {content.moodLabel}
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {FEEDBACK_MOODS.map((value) => {
            const Icon = MOOD_ICONS[value];
            const selected = mood === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                // Clicking the chosen mood again clears it: it's optional.
                onClick={() => setMood(selected ? undefined : value)}
                className={cn(
                  "focus-visible:ring-ring border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
                  selected &&
                    "border-primary bg-primary/10 text-foreground hover:bg-primary/10"
                )}
              >
                <Icon aria-hidden="true" className="size-6" />
                {content.moods[value]}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <Label htmlFor="feedback-message">{content.message}</Label>
        <Textarea
          id="feedback-message"
          name="message"
          placeholder={content.messagePlaceholder.value}
          required
          minLength={3}
          maxLength={FEEDBACK_MAX}
          rows={5}
          className="min-h-28"
          autoFocus
          onKeyDown={onMessageKeyDown}
        />
      </div>
      {signedIn ? (
        <p className="text-muted-foreground -mt-2 text-xs">
          {content.signedInAs}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="feedback-email">{content.email}</Label>
          <Input
            id="feedback-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={content.emailPlaceholder.value}
            maxLength={254}
          />
        </div>
      )}
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
          {errorText[error]}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
          <SendShortcut enter={content.enter.value} />
          {content.toSend}
        </span>
        <Button
          type="submit"
          disabled={status === "sending"}
          className="ml-auto"
        >
          <Send aria-hidden="true" />
          {status === "sending" ? content.sending : content.send}
        </Button>
      </div>
    </form>
  );
};

/**
 * Global feedback dialog, opened from the footer and the account menu. The
 * page it was opened on is sent along, so reports come with their context.
 */
export const FeedbackDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setState] = useState({ open: false, page: "/", key: 0 });

  const api = useMemo<FeedbackDialogApi>(
    () => ({
      open: () =>
        setState((current) => ({
          open: true,
          page: window.location.pathname,
          // Remounts the form, so each opening starts empty.
          key: current.key + 1,
        })),
    }),
    []
  );

  return (
    <FeedbackDialogContext value={api}>
      {children}
      <ShadDialog
        open={state.open}
        onOpenChange={(open) => setState((current) => ({ ...current, open }))}
      >
        <DialogContent>
          <FeedbackForm key={state.key} page={state.page} />
        </DialogContent>
      </ShadDialog>
    </FeedbackDialogContext>
  );
};
