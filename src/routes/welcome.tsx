import {
  createFileRoute,
  getRouteApi,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { EnvelopeCheck } from "reicon-react/icons/EnvelopeCheck";
import { Loader } from "reicon-react/icons/Loader";
import { z } from "zod";

import { ConfettiSideCannons } from "@/components/confetti";
import {
  AuthCard,
  LinkSentMessage,
  SignInPanel,
  StatusPanel,
} from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { SITE } from "@/constants/site";
import { authClient } from "@/lib/auth-client";
import { createMetadata } from "@/seo/metadata";
import { getCheckoutResult } from "@/server/functions";

interface WelcomeSearch {
  payment_id?: string;
  preview?: "sent";
}

const routeApi = getRouteApi("/welcome");

// Stacked under the invisible sign-in form so this page keeps the exact size
// of /sign-in.
const ThanksView = ({
  children,
  icon,
  action,
}: {
  children: ReactNode;
  icon: ReactNode;
  action?: ReactNode;
}) => {
  const content = useIntlayer("account");
  return (
    <StatusPanel
      action={action}
      icon={icon}
      title={`${content.thanks.value} ${SITE.NAME}!`}
    >
      {children}
    </StatusPanel>
  );
};

const SignInLink = ({
  email,
  preview,
}: {
  email: string;
  preview: boolean;
}) => {
  const content = useIntlayer("account");
  const started = useRef(false);
  const [status, setStatus] = useState<"sending" | "sent" | "failed">(
    preview ? "sent" : "sending"
  );

  const send = async () => {
    if (preview) {
      return;
    }
    setStatus("sending");
    const { error } = await authClient.signIn.magicLink({
      callbackURL: "/dashboard",
      email,
      metadata: { welcome: true },
    });
    setStatus(error ? "failed" : "sent");
  };

  useEffect(() => {
    if (preview || started.current) {
      return;
    }
    started.current = true;
    void send();
  });

  if (status === "sending") {
    return (
      <ThanksView
        icon={
          <ReiconDuotone
            icon={Loader}
            aria-hidden
            className="size-8 animate-spin text-black"
          />
        }
      >
        {content.sendingLink} <strong>{email}</strong>.
      </ThanksView>
    );
  }

  if (status === "failed") {
    return (
      <ThanksView
        icon={
          <ReiconDuotone
            icon={EnvelopeCheck}
            aria-hidden
            className="size-8 text-black"
          />
        }
        action={
          <Button size="lg" onClick={send}>
            {content.sendAgain}
          </Button>
        }
      >
        {content.sendError}
      </ThanksView>
    );
  }

  return (
    <ThanksView
      icon={
        <ReiconDuotone
          icon={EnvelopeCheck}
          aria-hidden
          className="size-8 text-black"
        />
      }
    >
      <LinkSentMessage email={email} />
    </ThanksView>
  );
};

const Welcome = () => {
  const content = useIntlayer("account");
  const checkout = routeApi.useLoaderData();
  const { preview: previewSearch } = routeApi.useSearch();
  const preview = import.meta.env.DEV && previewSearch === "sent";
  const router = useRouter();

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <AuthCard>
        <SignInPanel
          hidden
          email=""
          error={null}
          onEmailChange={() => null}
          onSubmit={(event) => event.preventDefault()}
          status="idle"
        />
        {checkout.succeeded && checkout.email ? (
          <>
            <ConfettiSideCannons />
            <SignInLink email={checkout.email} preview={preview} />
          </>
        ) : (
          <StatusPanel
            icon={
              <ReiconDuotone
                icon={Loader}
                aria-hidden
                className="size-8 animate-spin text-black"
              />
            }
            title={content.confirming}
            action={
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.invalidate()}
              >
                {content.checkAgain}
              </Button>
            }
          >
            {content.seconds}
          </StatusPanel>
        )}
      </AuthCard>
    </main>
  );
};

export const Route = createFileRoute("/welcome")({
  // Search and deps come before `loader` so their types flow into it.
  // Dodo appends `payment_id` (and an unverified `status`) to the return URL;
  // the loader looks the payment up instead of trusting the query.
  validateSearch: (search): WelcomeSearch => ({
    payment_id: z.string().safeParse(search.payment_id).data,
    preview: search.preview === "sent" ? "sent" : undefined,
  }),
  loaderDeps: ({ search }) => ({
    paymentId: search.payment_id,
    preview: search.preview,
  }),
  loader: async ({ deps }) => {
    if (import.meta.env.DEV && deps.preview === "sent") {
      return {
        succeeded: true,
        email: "preview@example.com",
      };
    }
    const checkout = deps.paymentId
      ? await getCheckoutResult({ data: { paymentId: deps.paymentId } })
      : null;
    // No or unknown checkout: buyers can still sign in with their email.
    if (!checkout) {
      throw redirect({ to: "/sign-in" });
    }
    return checkout;
  },
  component: Welcome,
  head: () => createMetadata({ noIndex: true, title: "Welcome" }),
});
