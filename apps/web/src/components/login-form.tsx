import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";

import { Brand } from "@/components/brand";
import { GoogleIcon } from "@/components/icons";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logomark } from "@/components/logo";
import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CAPTCHA_HEADER, WELCOME_HEADER } from "@/constants/auth";
import { localizedPath } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { track } from "@/lib/analytics";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;
const textButtonClass =
  "hover:text-foreground cursor-pointer underline underline-offset-4 transition-colors disabled:opacity-50";

type LoginError = "sending" | "rate-limit" | "invalid-code" | "attempts";

/**
 * Where the form sits (always centred):
 *   centred → a standalone page of its own (/welcome): brand on top, locale
 *             switcher below
 *   page    → the /sign-in column; the route draws the brand
 *   dialog  → the sign-in dialog, padded off the dialog's edges
 */
export type AuthLayout = "centred" | "page" | "dialog";

/**
 * The sign-in shell in the shared field markup: one FieldGroup holding the
 * heading and description, the step's fields (`children`), and the Terms ·
 * Privacy line, centred wherever it sits.
 */
export const AuthCard = ({
  layout = "centred",
  title,
  description,
  children,
}: {
  layout?: AuthLayout;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) => {
  const content = useIntlayer("account");
  const { locale } = useLocale();
  return (
    <FieldGroup className={cn(layout === "dialog" && "px-6 pt-12 pb-6")}>
      {layout === "centred" && (
        <div className="flex justify-center">
          <Brand />
        </div>
      )}
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold text-balance">{title}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {description}
        </p>
      </div>
      {children}
      <FieldDescription className="text-center">
        <a href={localizedPath(ROUTES.TERMS, locale)}>{content.terms}</a>
        {" · "}
        <a href={localizedPath(ROUTES.PRIVACY, locale)}>{content.privacy}</a>
      </FieldDescription>
      {layout === "centred" && (
        <div className="flex justify-center">
          <LocaleSwitcher />
        </div>
      )}
    </FieldGroup>
  );
};

/**
 * "Sign in to MotionVideo". In the dialog the logomark sits right before the
 * name, wherever the locale puts the name in the sentence.
 */
const SignInTitle = ({ withLogo }: { withLogo: boolean }) => {
  const content = useIntlayer("account");
  const title = content.signInTitle.value;
  if (!withLogo) {
    return title;
  }
  const [before, after] = title.split(SITE.NAME);
  return (
    <>
      {before}
      <span className="whitespace-nowrap">
        {/* Explicit width: the viewBox is 1242 × 587. */}
        <Logomark className="mr-[0.2em] inline-block h-[0.62em] w-[1.31em] align-baseline" />
        {SITE.NAME}
      </span>
      {after}
    </>
  );
};

/** Which message a failed code check shows. */
const verifyErrorOf = (error: {
  status: number;
  code?: string;
}): LoginError => {
  if (error.status === 429) {
    return "rate-limit";
  }
  return error.code === "TOO_MANY_ATTEMPTS" ? "attempts" : "invalid-code";
};

/**
 * Under the code step: "Change email" (unless the address was given) and
 * "Send a new code".
 */
const CodeStepLinks = ({
  busy,
  canChangeEmail,
  onChangeEmail,
  onResend,
}: {
  busy: boolean;
  canChangeEmail: boolean;
  onChangeEmail: () => void;
  onResend: () => void;
}) => {
  const content = useIntlayer("account");
  return (
    <FieldDescription className="flex items-center justify-center gap-2 text-center">
      {canChangeEmail && (
        <>
          <button
            type="button"
            className={textButtonClass}
            onClick={onChangeEmail}
          >
            {content.changeEmail}
          </button>
          <span aria-hidden>·</span>
        </>
      )}
      <button
        type="button"
        className={textButtonClass}
        onClick={onResend}
        disabled={busy}
      >
        {content.resend}
      </button>
    </FieldDescription>
  );
};

/**
 * Email-code sign-in, used by `/sign-in`, the sign-in dialog and `/welcome`:
 * enter an email, receive a six-digit code, enter it. Any email works; the
 * account is created on first sign-in. Once signed in it goes to
 * `callbackURL` when given (the dialog closes itself instead).
 */
export const LoginForm = ({
  callbackURL,
  returnTo,
  description,
  presetEmail,
  welcome = false,
  title,
  layout = "centred",
}: {
  callbackURL?: string;
  /** Where Google sign-in lands when there is no `callbackURL` (the dialog's next page). */
  returnTo?: string;
  /** Replaces the line under the first step's title. */
  description?: ReactNode;
  /** Skip the email step: send a code to this address straight away. */
  presetEmail?: string;
  /** Send the code in the post-checkout welcome email (/welcome). */
  welcome?: boolean;
  /** Replaces the code step's title. */
  title?: ReactNode;
  /** Where the form sits; see AuthLayout. */
  layout?: AuthLayout;
}) => {
  const content = useIntlayer("account");
  const emailId = useId();
  const codeId = useId();
  const [email, setEmail] = useState(presetEmail ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">(
    presetEmail ? "code" : "email"
  );
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [verified, setVerified] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  // Turnstile: a token is needed to send a code, and each one is single-use.
  // The buttons never wait for it: a send before the first token arrives
  // shows "Sending…" until it does.
  const captcha = useRef<string | null>(null);
  const captchaWaiters = useRef<((token: string) => void)[]>([]);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const onCaptcha = (token: string | null) => {
    captcha.current = token;
    setCaptchaReady(token !== null);
    if (token) {
      for (const resolve of captchaWaiters.current.splice(0)) {
        resolve(token);
      }
    }
  };
  const nextCaptcha = () =>
    captcha.current ??
    // Settled by onCaptcha, a callback with no promise of its own.
    // oxlint-disable-next-line promise/avoid-new
    new Promise<string>((resolve) => {
      captchaWaiters.current.push(resolve);
    });

  const sendCode = async (address: string) => {
    setBusy(true);
    setError(null);
    const token = await nextCaptcha();
    // Spent: the next send waits for the fresh token the reset brings.
    captcha.current = null;
    const headers = {
      [CAPTCHA_HEADER]: token,
      [WELCOME_HEADER]: welcome ? "1" : "0",
    };
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: address,
      type: "sign-in",
      fetchOptions: { headers },
    });
    setBusy(false);
    setCaptchaReset((count) => count + 1);
    if (sendError) {
      setError(sendError.status === 429 ? "rate-limit" : "sending");
      return false;
    }
    track("sign_in_code_sent", { welcome });
    return true;
  };

  // /welcome: the buyer's email is known, so the code goes out as soon as
  // Turnstile hands over its first token.
  const autoSent = useRef(false);
  useEffect(() => {
    if (presetEmail && captchaReady && !autoSent.current) {
      autoSent.current = true;
      void sendCode(presetEmail);
    }
  });

  // Google returns to `callbackURL` (or this page) with the session set.
  const signInWithGoogle = async () => {
    setBusy(true);
    setError(null);
    const { error: googleError } = await authClient.signIn.social({
      provider: "google",
      callbackURL:
        callbackURL ??
        returnTo ??
        `${window.location.pathname}${window.location.search}`,
    });
    if (googleError) {
      setBusy(false);
      setError("sending");
    }
  };

  const onEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    if (await sendCode(email)) {
      setCode("");
      setResent(false);
      setStep("code");
    }
  };

  const onCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || code.length !== CODE_LENGTH) {
      return;
    }
    setBusy(true);
    setError(null);
    const { error: verifyError } = await authClient.signIn.emailOtp({
      email,
      otp: code,
    });
    if (verifyError) {
      setBusy(false);
      setError(verifyErrorOf(verifyError));
      return;
    }
    setVerified(true);
    track("sign_in");
    if (callbackURL) {
      // A full load, so every loader sees the new session.
      window.location.assign(callbackURL);
    }
  };

  const resend = async () => {
    if (await sendCode(email)) {
      setCode("");
      setResent(true);
    }
  };

  const errorMessages = {
    sending: content.sendError,
    "rate-limit": content.rateLimited,
    "invalid-code": content.invalidCode,
    attempts: content.tooManyAttempts,
  };

  return (
    // One form for both steps: Enter submits whichever step is showing, and
    // the code step submits itself once the last digit lands.
    <form
      ref={form}
      onSubmit={step === "email" ? onEmailSubmit : onCodeSubmit}
      className="flex flex-col gap-6"
    >
      <AuthCard
        layout={layout}
        title={
          step === "email" ? (
            <SignInTitle withLogo={layout === "dialog"} />
          ) : (
            (title ?? content.checkEmail)
          )
        }
        description={
          step === "email" ? (
            (description ?? content.signInDescription)
          ) : (
            <>
              {content.sentCode} <strong>{email}</strong>. {content.expires}
            </>
          )
        }
      >
        {step === "email" ? (
          <>
            <Field>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={busy}
                onClick={signInWithGoogle}
              >
                <GoogleIcon />
                {content.continueWithGoogle}
              </Button>
            </Field>
            {/* The label sits on the surface's own colour: the dialog's
                popover, the page's background. */}
            <FieldSeparator className="in-data-[slot=dialog-content]:*:data-[slot=field-separator-content]:bg-popover">
              {content.or}
            </FieldSeparator>
            <Field>
              <FieldLabel htmlFor={emailId}>{content.email}</FieldLabel>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                required
                placeholder={content.emailPlaceholder.value}
                // oxlint-disable-next-line jsx-a11y/no-autofocus -- the only field of this step
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            {error && <FieldError>{errorMessages[error]}</FieldError>}
            <Field>
              <Button type="submit" size="lg" disabled={busy}>
                {busy ? content.sending : content.sendCode}
              </Button>
            </Field>
          </>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor={codeId} className="sr-only">
                {content.code}
              </FieldLabel>
              <InputOTP
                id={codeId}
                maxLength={CODE_LENGTH}
                value={code}
                onChange={setCode}
                // Submits as soon as the last digit lands (typed or pasted).
                onComplete={() => form.current?.requestSubmit()}
                aria-invalid={error === "invalid-code" || error === "attempts"}
                success={verified}
                // oxlint-disable-next-line jsx-a11y/no-autofocus -- the only field of this step
                autoFocus
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  {Array.from({ length: CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </Field>
            {error && <FieldError>{errorMessages[error]}</FieldError>}
            {resent && !error && (
              <FieldDescription>{content.resent}</FieldDescription>
            )}
            <Field>
              <Button
                type="submit"
                size="lg"
                disabled={busy || code.length !== CODE_LENGTH}
              >
                {busy ? content.signingIn : content.signIn}
              </Button>
            </Field>
            <CodeStepLinks
              busy={busy}
              canChangeEmail={!presetEmail}
              onChangeEmail={() => {
                setError(null);
                setStep("email");
              }}
              onResend={resend}
            />
          </>
        )}
      </AuthCard>
      {/* One widget for both steps (kept mounted), so a fresh token is
          ready for "Send a new code" too. */}
      <Turnstile onToken={onCaptcha} resetKey={captchaReset} />
    </form>
  );
};
