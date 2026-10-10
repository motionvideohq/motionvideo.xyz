import { useId, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { EnvelopeCheck } from "reicon-react/icons/EnvelopeCheck";

import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";

type LoginStatus = "idle" | "sending" | "sent";
type LoginError = "invalid" | "sending" | "rate-limit";

interface SignInPanelProps {
  email: string;
  error: string | null;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: LoginStatus;
  /** Replaces the default line under the title, e.g. why sign-in is needed. */
  description?: ReactNode;
}

// Brand, a stacked content area, and the legal footer. Children share one grid
// cell, so the area is as tall as the tallest child and never shifts.
export const AuthCard = ({ children }: { children: ReactNode }) => {
  const content = useIntlayer("account");
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex justify-center">
        <Brand />
      </div>
      <div className="grid">{children}</div>
      <FieldDescription className="flex items-center justify-center gap-2 text-center">
        <a href={ROUTES.TERMS}>{content.terms}</a>
        <span aria-hidden>·</span>
        <a href={ROUTES.PRIVACY}>{content.privacy}</a>
      </FieldDescription>
      <div className="flex justify-center">
        <LocaleSwitcher />
      </div>
    </div>
  );
};

export const SignInPanel = ({
  description,
  email,
  error,
  hidden = false,
  onEmailChange,
  onSubmit,
  status,
}: SignInPanelProps & { hidden?: boolean }) => {
  const content = useIntlayer("account");
  const emailId = useId();
  return (
    <div
      className={`col-start-1 row-start-1 flex flex-col gap-6 ${hidden ? "invisible **:transition-none" : ""}`}
      aria-hidden={hidden}
      inert={hidden}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-xl font-semibold">{content.signInTitle}</h1>
        <FieldDescription className="text-center">
          {description ?? content.signInDescription}
        </FieldDescription>
      </div>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={emailId}>{content.email}</FieldLabel>
            <Input
              className="h-9"
              id={emailId}
              type="email"
              autoComplete="email"
              required
              placeholder={content.emailPlaceholder.value}
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Field>
            <Button type="submit" size="lg" disabled={status === "sending"}>
              {status === "sending" ? content.sending : content.sendLink}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};

// Title on top, icon and message centered in the remaining height.
export const StatusPanel = ({
  action,
  children,
  hidden = false,
  icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  hidden?: boolean;
  icon: ReactNode;
  title: ReactNode;
}) => (
  <div
    className={`col-start-1 row-start-1 flex flex-col items-center gap-6 text-center ${hidden ? "invisible **:transition-none" : ""}`}
    aria-hidden={hidden}
    inert={hidden}
  >
    <h1 className="text-xl font-semibold">{title}</h1>
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      {icon}
      <FieldDescription className="text-center">{children}</FieldDescription>
    </div>
    {action}
  </div>
);

export const LinkSentMessage = ({ email }: { email: string }) => {
  const content = useIntlayer("account");
  return (
    <>
      <span className="block">
        {content.sentLink} <strong>{email}</strong>.
      </span>
      <span className="block">{content.expires}</span>
    </>
  );
};

/**
 * Email magic-link sign-in, used by `/sign-in` and the sign-in dialog. Any
 * email works: the account is created the first time its link is opened.
 */
export const LoginForm = ({
  callbackURL,
  description,
  initialError = null,
}: {
  /** Same-origin path the emailed link returns to once signed in. */
  callbackURL: string;
  description?: ReactNode;
  initialError?: LoginError | null;
}) => {
  const content = useIntlayer("account");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [error, setError] = useState<LoginError | null>(initialError);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    const { error: sendError } = await authClient.signIn.magicLink({
      email,
      callbackURL,
      errorCallbackURL: `${ROUTES.SIGN_IN}?redirect=${encodeURIComponent(callbackURL)}`,
    });
    if (sendError) {
      setStatus("idle");
      setError(sendError.status === 429 ? "rate-limit" : "sending");
      return;
    }
    setStatus("sent");
  };

  const errorMessages = {
    invalid: content.invalidLink.value,
    "rate-limit": content.rateLimited.value,
    sending: content.sendError.value,
  };

  return (
    <AuthCard>
      <SignInPanel
        description={description}
        email={email}
        error={error && errorMessages[error]}
        hidden={status === "sent"}
        onEmailChange={setEmail}
        onSubmit={onSubmit}
        status={status}
      />
      <StatusPanel
        hidden={status !== "sent"}
        icon={
          <ReiconDuotone
            icon={EnvelopeCheck}
            aria-hidden
            className="size-8 text-black"
          />
        }
        title={content.checkEmail}
      >
        <LinkSentMessage email={email} />
      </StatusPanel>
    </AuthCard>
  );
};
