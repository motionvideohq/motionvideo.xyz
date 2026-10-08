import {
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { CircleCheckIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { BuyButton } from "@/components/pricing";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SITE } from "@/constants/site";
import { authClient } from "@/lib/auth-client";
import { createMetadata } from "@/seo/metadata";
import { getAccount, getOffer, getPortalUrl } from "@/server/functions";

const routeApi = getRouteApi("/dashboard");

const PurchaseCard = () => {
  const content = useIntlayer("account");
  const account = routeApi.useLoaderData();
  const { preview: previewSearch } = routeApi.useSearch();
  const preview = import.meta.env.DEV && previewSearch === "purchased";
  const [busy, setBusy] = useState(false);

  let portalLabel: ReactNode = busy ? content.opening : content.portal;
  if (preview) {
    portalLabel = content.portalPreview;
  }
  const openPortal = async () => {
    setBusy(true);
    try {
      window.location.href = await getPortalUrl();
    } catch {
      setBusy(false);
    }
  };

  if (account.purchased) {
    return (
      <Empty className="bg-card border border-solid">
        <EmptyHeader>
          <EmptyMedia className="text-primary">
            <CircleCheckIcon aria-hidden className="size-8" />
          </EmptyMedia>
          <EmptyTitle className="text-base">{content.own} {SITE.NAME}</EmptyTitle>
          <EmptyDescription>
            {content.portalDescription}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" onClick={openPortal} disabled={busy || preview}>
            {portalLabel}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Card size="lg">
      <CardHeader>
        <CardTitle>{content.get} {SITE.NAME}</CardTitle>
        <CardDescription>
          {content.purchaseDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BuyButton offer={account.offer} />
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const content = useIntlayer("account");
  const { email } = routeApi.useLoaderData();
  const { preview: previewSearch } = routeApi.useSearch();
  const preview = import.meta.env.DEV && previewSearch === "purchased";
  const navigate = useNavigate();

  const signOut = async () => {
    await authClient.signOut();
    await navigate({ to: "/" });
  };

  return (
    <>
      <SiteHeader signedIn />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{content.dashboard}</h1>
            <p className="text-muted-foreground text-sm">{email}</p>
          </div>
          {preview ? (
            <span className="text-muted-foreground text-sm">
              {content.localPreview}
            </span>
          ) : (
            <Button variant="outline" onClick={signOut}>
              {content.signOut}
            </Button>
          )}
        </div>
        <PurchaseCard />
      </main>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => createMetadata({ noIndex: true, title: "Dashboard" }),
  validateSearch: (search) => ({
    preview:
      search.preview === "purchased" ? ("purchased" as const) : undefined,
  }),
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ deps }) => {
    if (import.meta.env.DEV && deps.preview === "purchased") {
      return {
        email: "preview@example.com",
        purchased: true,
        name: null,
        offer: await getOffer(),
      };
    }
    const account = await getAccount();
    if (!account) {
      throw redirect({ search: { redirect: "/dashboard" }, to: "/sign-in" });
    }
    return { ...account, offer: await getOffer() };
  },
});
