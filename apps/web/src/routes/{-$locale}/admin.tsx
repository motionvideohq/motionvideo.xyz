import {
  Outlet,
  createFileRoute,
  notFound,
  useRouterState,
} from "@tanstack/react-router";
import { getPathWithoutLocale, getIntlayer } from "intlayer";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import { localizedRedirect } from "@/lib/localized-redirect";
import { createMetadata } from "@/seo/metadata";
import { getAdminAccess } from "@/server/admin-functions";

const ADMIN_TABS = [
  { label: "Submissions", to: ROUTES.ADMIN_SUBMISSIONS },
  { label: "Sponsorships", to: ROUTES.ADMIN_SPONSORSHIPS },
  { label: "Jobs", to: ROUTES.ADMIN_JOBS },
  { label: "Feedback", to: ROUTES.ADMIN_FEEDBACK },
] as const;

// Internal moderation, English only. Every admin server function re-checks
// ADMIN_EMAILS; this guard only keeps the pages out of sight.
const Admin = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => getPathWithoutLocale(state.location.pathname),
  });
  const active =
    ADMIN_TABS.find(
      (tab) => pathname === tab.to || pathname.startsWith(`${tab.to}/`)
    )?.to ?? ROUTES.ADMIN_SUBMISSIONS;

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-6 pb-16 sm:px-6"
      >
        <Tabs
          value={active}
          onValueChange={(value) => {
            // SAFETY: the tab list only holds the admin section routes.
            void navigate({ to: value as (typeof ADMIN_TABS)[number]["to"] });
          }}
          className="flex-1 gap-6"
        >
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <TabsList aria-label="Admin sections" variant="line">
              {ADMIN_TABS.map((tab) => (
                <TabsTrigger key={tab.to} value={tab.to}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </header>
          <Outlet />
        </Tabs>
      </main>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/admin")({
  component: Admin,
  staticData: { noIndex: true },
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "account-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).adminTitle,
    }),
  beforeLoad: async ({ location, params }) => {
    const access = await getAdminAccess();
    if (!access.signedIn) {
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: { redirect: location.href },
      });
    }
    // Non-admins see a plain 404, not a hint that the page exists.
    if (!access.admin) {
      throw notFound();
    }
  },
});
