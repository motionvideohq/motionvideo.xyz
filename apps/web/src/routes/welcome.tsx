import {
  createFileRoute,
  getRouteApi,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { Loader } from "reicon-react/icons/Loader";
import { z } from "zod";

import { ConfettiSideCannons } from "@/components/confetti";
import { AuthCard, AuthHeading, LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { createMetadata } from "@/seo/metadata";
import { getCheckoutResult } from "@/server/functions";

interface WelcomeSearch {
  payment_id?: string;
}

const routeApi = getRouteApi("/welcome");

// Back from checkout. Once Dodo confirms the payment, a sign-in code goes to
// the buyer's email (in the welcome email) and they enter it right here.
const Welcome = () => {
  const content = useIntlayer("account");
  const checkout = routeApi.useLoaderData();
  const router = useRouter();

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {checkout.succeeded && checkout.email ? (
          <>
            <ConfettiSideCannons />
            <LoginForm
              presetEmail={checkout.email}
              welcome
              title={`${content.thanks.value} ${SITE.NAME}!`}
              callbackURL={ROUTES.DASHBOARD_BILLING}
            />
          </>
        ) : (
          <AuthCard>
            <div className="flex flex-col items-center gap-6">
              <AuthHeading title={content.confirming}>
                {content.seconds}
              </AuthHeading>
              <Loader aria-hidden className="size-8 animate-spin" />
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.invalidate()}
              >
                {content.checkAgain}
              </Button>
            </div>
          </AuthCard>
        )}
      </div>
    </main>
  );
};

export const Route = createFileRoute("/welcome")({
  // Search and deps come before `loader` so their types flow into it.
  // Dodo appends `payment_id` (and an unverified `status`) to the return URL;
  // the loader looks the payment up instead of trusting the query.
  validateSearch: (search): WelcomeSearch => ({
    payment_id: z.string().safeParse(search.payment_id).data,
  }),
  loaderDeps: ({ search }) => ({ paymentId: search.payment_id }),
  loader: async ({ deps }) => {
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
