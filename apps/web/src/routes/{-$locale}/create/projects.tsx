import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { lazy, Suspense } from "react";
import { useIntlayer } from "react-intlayer";

import { PageHeader, PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";

// Projects live in this browser's IndexedDB, so the list renders client-side.
const Projects = lazy(async () => {
  const module = await import("@/components/create/projects/projects");
  return { default: module.Projects };
});

const ProjectsPage = () => {
  const content = useIntlayer("create-projects");
  return (
    <>
      <SiteHeader />
      <PageMain layout="app" width="full" className="gap-8">
        <PageHeader title={content.title.value} intro={content.description} />
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <Projects />
          </Suspense>
        </ClientOnly>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/create/projects")({
  component: ProjectsPage,
  staticData: { noIndex: true },
  head: ({ params }) => {
    const meta = getIntlayer(
      "create-projects",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return createMetadata({ title: meta.title, description: meta.description });
  },
});
