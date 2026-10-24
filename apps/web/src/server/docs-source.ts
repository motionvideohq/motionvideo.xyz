import { docs } from "collections/server";
import { defineI18n } from "fumadocs-core/i18n";
import { loader } from "fumadocs-core/source";

import { SUPPORTED_LOCALES } from "@/components/locale-provider";
import { ROUTES } from "@/constants/routes";

// Server only: the compiled content/docs collection (see source.config.ts).
// Docs locales are the site's locales, but the URL never carries one: every
// locale shares /docs/<slug>. A translation is `name.<locale>.mdx` next to the
// English `name.mdx`; a locale without one falls back to English.
export const docsI18n = defineI18n({
  languages: [...SUPPORTED_LOCALES],
  defaultLanguage: "en",
  parser: "dot",
  hideLocale: "always",
});

export const docsSource = loader({
  baseUrl: ROUTES.DOCS,
  i18n: docsI18n,
  source: docs.toFumadocsSource(),
});
