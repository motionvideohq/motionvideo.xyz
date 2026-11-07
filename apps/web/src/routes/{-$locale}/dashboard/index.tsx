import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { LocalizedLink as Link } from "@/components/localized-link";
import { AccountPageHeader, PageMain } from "@/components/page";
import { SectionIcon } from "@/components/section-icon";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeParam,
  localizedPath,
} from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import { authClient } from "@/lib/auth-client";
import { localizedRedirect } from "@/lib/localized-redirect";
import { Button } from "@/registry/ui/button";
import { createMetadata } from "@/seo/metadata";
import { getAccount } from "@/server/functions";

interface HubSearch {
  /** Dev-only preview of the owner state. */
  preview?: "purchased";
}

const routeApi = getRouteApi("/{-$locale}/dashboard/");

const HubCard = ({
  to,
  icon,
  title,
  description,
  badge,
}: {
  to: string;
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
  const sections = useIntlayer("site-header");
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
    <PageMain layout="app" width="narrow">
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
          icon={<SectionIcon section="billing" />}
          title={sections.billing}
          description={content.billingBody}
          badge={
            <Badge variant={purchased ? "default" : "secondary"}>
              {purchased ? content.owned : content.notOwned}
            </Badge>
          }
        />
        <HubCard
          to={ROUTES.DASHBOARD_FEATURED}
          icon={<SectionIcon section="featured" />}
          title={sections.featured}
          description={content.featuredBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_BOOKMARKS}
          icon={<SectionIcon section="bookmarks" />}
          title={sections.bookmarks}
          description={content.bookmarksBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_LISTINGS}
          icon={<SectionIcon section="listings" />}
          title={sections.listings}
          description={content.listingsBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_SPONSORSHIPS}
          icon={<SectionIcon section="sponsorships" />}
          title={sections.sponsorships}
          description={content.sponsorshipsBody}
        />
        <HubCard
          to={ROUTES.DASHBOARD_SETTINGS}
          icon={<SectionIcon section="settings" />}
          title={sections.settings}
          description={content.settingsBody}
        />
      </section>
    </PageMain>
  );
};

export const Route = createFileRoute("/{-$locale}/dashboard/")({
  component: Dashboard,
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "site-header",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).dashboard,
    }),
  validateSearch: (search): HubSearch => ({
    preview: search.preview === "purchased" ? "purchased" : undefined,
  }),
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ deps, params }) => {
    if (import.meta.env.DEV && deps.preview === "purchased") {
      return { email: "preview@example.com", purchased: true, name: null };
    }
    const account = await getAccount();
    if (!account) {
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: {
          redirect: localizedPath(ROUTES.DASHBOARD, localeParam(params.locale)),
        },
      });
    }
    return account;
  },
});
