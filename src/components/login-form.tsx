import { MailCheckIcon } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { Brand } from "@/components/site-chrome";
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
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

type LoginStatus = "idle" | "sending" | "sent";

interface SignInPanelProps {
  email: string;
  error: string | null;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: LoginStatus;
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
    <div className="flex justify-center"><LocaleSwitcher /></div>
  </div>
  );
};

export const SignInPanel = ({
  email,
  error,
  hidden = false,
  onEmailChange,
  onSubmit,
  status,
}: SignInPanelProps & { hidden?: boolean }) => {
  const content = useIntlayer("account");
  return (
  <div
    className={`col-start-1 row-start-1 flex flex-col gap-6 ${hidden ? "invisible **:transition-none" : ""}`}
    aria-hidden={hidden}
    inert={hidden}
  >
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="text-xl font-semibold">{content.signInTitle}</h1>
      <FieldDescription className="text-center">
        {content.dontOwn} {SITE.NAME} {content.yet}{" "}
        <a href={ROUTES.CHECKOUT} className="text-black">
          {content.buyHere}
        </a>
      </FieldDescription>
    </div>
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{content.email}</FieldLabel>
          <Input
            className="h-9"
            id="email"
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

export const LoginForm = (props: SignInPanelProps) => {
  const content = useIntlayer("account");
  return (
  <AuthCard>
    <SignInPanel {...props} hidden={props.status === "sent"} />
    <StatusPanel
      hidden={props.status !== "sent"}
      icon={<MailCheckIcon aria-hidden className="size-8 text-black" />}
      title={content.checkEmail}
    >
      <LinkSentMessage email={props.email} />
    </StatusPanel>
  </AuthCard>
  );
};
