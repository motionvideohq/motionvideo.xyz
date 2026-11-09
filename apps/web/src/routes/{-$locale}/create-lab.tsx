import { ClientOnly, createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Lab = lazy(async () => {
  const module = await import("@/components/create/showcase/lab");
  return { default: module.Lab };
});

const Page = () => (
  <ClientOnly fallback={null}>
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  </ClientOnly>
);

export const Route = createFileRoute("/{-$locale}/create-lab")({
  component: Page,
  staticData: { noIndex: true },
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
});
