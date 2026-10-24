import {
  Link,
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { Bookmark } from "reicon-react/icons/Bookmark";
import { Briefcase } from "reicon-react/icons/Briefcase";
import { Card2 } from "reicon-react/icons/Card2";
import { HandHeart } from "reicon-react/icons/HandHeart";
import { Settings } from "reicon-react/icons/Settings";
import { Sparkles } from "reicon-react/icons/Sparkles";

import { AccountPageHeader, PageMain } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { createMetadata } from "@/seo/metadata";
import { getAccount } from "@/server/functions";

interface HubSearch {
  /** Dev-only preview of the owner state. */
  preview?: "purchased";
}

const routeApi = getRouteApi("/dashboard/");

const HubCard = ({
  to,
  icon,
  title,
  description,
  badge,
}: {
  to: LinkProps["to"];
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  badge?: ReactNode;
}) => (
  <Link
    to={to}
    className="group bg-card shadow-outline hover:bg-muted/60 flex flex-col gap-3 rounded-2xl p-5 transition-colors"
  >
    <span className="flex items-center gap-2">
      <span className="text-muted-foreground group-hover:text-foreground transition-colors [&_svg]:size-5">
        {icon}
      </span>
      <span className="font-medium">{title}</span>
      {badge}
      <ArrowRight
        aria-hidden="true"
        className="text-muted-foreground group-hover:text-foreground ml-auto size-4 transition-transform group-hover:translate-x-0.5"
      />
    </span>
    <span className="text-muted-foreground text-sm text-pretty">
      {description}
    </span>
  </Link>
);

const Dashboard = () => {
  const content = useIntlayer("dashboard-page");
  const account = useIntlayer("account");
  const { email, purchased } = routeApi.useLoaderData();
  const { preview: previewSearch } = routeApi.useSearch();
  const preview = import.meta.env.DEV && previewSearch === "purchased";
  const navigate = useNavigate();

  const signOut = async () => {
    await authClient.signOut();
    await navigate({ to: ROUTES.HOME });
  };

  return (
    <PageMain width="narrow">
      <AccountPageHeader
        title={content.title}
        intro={email}
        actions={
          preview ? (
            <span className="text-muted-foreground text-sm">
              {account.localPreview}
            </span>
          ) : (
            <Button variant="destructive" size="lg" onClick={signOut}>
              {content.logOut}
            </Button>
          )
        }
      />
      <section aria-label={content.sections.value} className="grid gap-3">
        <HubCard
          to={ROUTES.DASHBOARD_BILLING}
          icon={<Card2 aria-hidden="true" />}
          title={content.billing}
          description={content.billingBody}
          badge={
            <Badge variant={purchased ? "default" : "secondary"}>
              {purchased ? content.owned : content.notOwned}
            </Badge>
          }
        />
        <HubCard
          to={ROUTES.DASHBOARD_FEATURED}
          icon={<Sparkles aria-hidden="true" />}
          title={content.featured}
          description={content.featuredBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_BOOKMARKS}
          icon={<Bookmark aria-hidden="true" />}
          title={content.bookmarks}
          description={content.bookmarksBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_LISTINGS}
          icon={<Briefcase aria-hidden="true" />}
          title={content.listings}
          description={content.listingsBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_SPONSORSHIPS}
          icon={<HandHeart aria-hidden="true" />}
          title={content.sponsorships}
          description={content.sponsorshipsBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_SETTINGS}
          icon={<Settings aria-hidden="true" />}
          title={content.settings}
          description={content.settingsBody}
        />
      </section>
    </PageMain>
  );
};

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
  head: () => createMetadata({ noIndex: true, title: "Dashboard" }),
  validateSearch: (search): HubSearch => ({
    preview: search.preview === "purchased" ? "purchased" : undefined,
  }),
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ deps }) => {
    if (import.meta.env.DEV && deps.preview === "purchased") {
      return { email: "preview@example.com", purchased: true, name: null };
    }
    const account = await getAccount();
    if (!account) {
      throw redirect({
        search: { redirect: ROUTES.DASHBOARD },
        to: ROUTES.SIGN_IN,
      });
    }
    return account;
  },
});
