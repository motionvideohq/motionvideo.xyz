import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { lazy, Suspense } from "react";
import { z } from "zod";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";

// The Showcase editor. Rendering, IndexedDB and WebCodecs only exist in the
// browser, so the editor mounts client-side only and its code (Remotion,
// three.js) loads in its own chunk.

const ShowcaseEditor = lazy(async () => {
  const module = await import("@/components/create/showcase/editor/editor");
  return { default: module.ShowcaseEditor };
});

interface EditorSearch {
  project?: string;
  template?: string;
  /** Appended by Dodo to the single-export checkout return URL. */
  payment_id?: string;
}

const idSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[\w-]+$/u);

const Loading = () => <div className="bg-background fixed inset-0 z-40" />;

const EditorPage = () => {
  const { project, template, payment_id: paymentId } = Route.useSearch();
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <ShowcaseEditor
          projectId={project}
          templateId={template}
          paymentId={paymentId}
        />
      </Suspense>
    </ClientOnly>
  );
};

export const Route = createFileRoute("/{-$locale}/create/showcase/editor")({
  component: EditorPage,
  validateSearch: (search): EditorSearch => ({
    project: idSchema.safeParse(search.project).data,
    template: idSchema.safeParse(search.template).data,
    payment_id: idSchema.safeParse(search.payment_id).data,
  }),
  // A working tool, not a page to index: each visit is someone's project.
  staticData: { noIndex: true },
  head: ({ params }) => {
    const meta = getIntlayer(
      "create-showcase-editor",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return createMetadata({
      title: meta.metaTitle,
      description: meta.metaDescription,
    });
  },
});
