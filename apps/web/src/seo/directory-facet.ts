import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import type { DirectoryFilter, DirectoryKind } from "@/lib/directories";
import { createMetadata } from "@/seo/metadata";

const SECTIONS = {
  tool: "tools",
  studio: "creatives",
  skill: "skills",
  extra: "extras",
} as const;

/** Facet pages reuse the directory's translated labels and facet introductions. */
export const directoryFacetMetadata = (
  kind: DirectoryKind,
  facet: DirectoryFilter,
  requestedLocale: string
) => {
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const content = getIntlayer("resource-directory", locale);
  const labels: Record<string, string> = content.filters[kind];
  const label = labels[facet];
  const section = getIntlayer("directory-meta", locale)[SECTIONS[kind]];
  return createMetadata({
    title: `${label} · ${section.title}`,
    description: content.facetIntros[kind].replace("{filter}", label),
  });
};
