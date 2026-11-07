import { Outlet, createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";

// Every account page lives under /dashboard and shares the site chrome. The
// pages themselves own their headings and content.
const DashboardLayout = () => (
  <>
    <SiteHeader />
    <Outlet />
    <SiteFooter />
  </>
);

export const Route = createFileRoute("/{-$locale}/dashboard")({
  component: DashboardLayout,
  // Account pages are never indexed; children keep their own titles.
  staticData: { noIndex: true },
  head: ({ params }) =>
    createMetadata({
      title: getIntlayer(
        "site-header",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).dashboard,
    }),
});
