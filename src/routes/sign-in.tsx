import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { z } from "zod";

import { LoginForm } from "@/components/login-form";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { createMetadata } from "@/seo/metadata";

interface SignInSearch {
  error?: string;
  redirect?: string;
}

const routeApi = getRouteApi("/sign-in");

// Same-origin paths only, never "//evil.com".
const safeRedirect = z
  .string()
  .startsWith("/")
  .refine((path) => !path.startsWith("//"));

const SignIn = () => {
  const content = useIntlayer("account");
  const search = routeApi.useSearch();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<"invalid" | "sending" | null>(
    search.error ? "invalid" : null
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    const callbackURL = search.redirect ?? "/dashboard";
    const { error: sendError } = await authClient.signIn.magicLink({
      email,
      callbackURL,
      errorCallbackURL: `/sign-in?redirect=${encodeURIComponent(callbackURL)}`,
    });
    if (sendError) {
      setStatus("idle");
      setError("sending");
      return;
    }
    setStatus("sent");
  };

  let errorMessage: string | null = null;
  if (error === "invalid") {
    errorMessage = content.invalidLink.value;
  } else if (error === "sending") {
    errorMessage = content.sendError.value;
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <LoginForm
        email={email}
        error={errorMessage}
        onEmailChange={setEmail}
        onSubmit={onSubmit}
        status={status}
      />
    </main>
  );
};

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
  head: () =>
    createMetadata({
      canonical: ROUTES.SIGN_IN,
      noIndex: true,
      title: "Sign in",
    }),
  validateSearch: (search): SignInSearch => ({
    error: z.string().safeParse(search.error).data,
    redirect: safeRedirect.safeParse(search.redirect).data,
  }),
});
