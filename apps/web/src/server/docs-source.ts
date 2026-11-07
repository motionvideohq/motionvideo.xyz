import { docs } from "collections/server";
import { defineI18n } from "fumadocs-core/i18n";
import { loader, multiple } from "fumadocs-core/source";
import type { MetaData, StaticSource } from "fumadocs-core/source";
import type { Document } from "fumadocs-openapi";
import { createOpenAPI, openapiSource } from "fumadocs-openapi/server";
import type { OpenAPIPageData } from "fumadocs-openapi/server";

import { LOCALES } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";

import { openApiDocument } from "./openapi";

// Server only: the compiled content/docs collection (see source.config.ts)
// plus the API reference generated from src/server/openapi.ts. Docs locales
// are the site's locales. Fumadocs URLs stay unprefixed (`/docs/<slug>`);
// links add the `/{-$locale}` prefix when they render. A translation is
// `name.<locale>.mdx` next to the English file; a locale without one falls
// back to English. API reference pages are the same in every locale.
export const docsI18n = defineI18n({
  languages: [...LOCALES],
  defaultLanguage: "en",
  parser: "dot",
  hideLocale: "always",
});

/** The API reference document's ID in page props (`document`). */
export const OPENAPI_DOCUMENT_ID = "public-api";

const docsOpenAPI = createOpenAPI({
  // SAFETY: a 3.1 document; fumadocs upgrades every input to its 3.2 shape.
  input: { [OPENAPI_DOCUMENT_ID]: openApiDocument as Document },
});

type OpenAPISource = StaticSource<{
  metaData: MetaData;
  pageData: OpenAPIPageData;
}>;

const buildDocsSource = (openapi: OpenAPISource) =>
  loader({
    baseUrl: ROUTES.DOCS,
    i18n: docsI18n,
    source: multiple({ docs: docs.toFumadocsSource(), openapi }),
  });

/**
 * The docs loader. Its page and tree types are inferred by fumadocs from
 * both sources, so this names them once for every consumer.
 */
export type DocsSource = ReturnType<typeof buildDocsSource>;
/** A docs page: MDX (`data.type === "docs"`) or API reference (`"openapi"`). */
export type DocsPage = DocsSource["$inferPage"];

const createDocsSource = async () =>
  buildDocsSource(await openapiSource(docsOpenAPI, { baseDir: "api" }));

let docsSource: Promise<DocsSource> | undefined;

/**
 * Built once per isolate, on first use: the OpenAPI pages come from an async
 * bundling step. One page per operation at /docs/api/<operationId>;
 * content/docs/api/index.mdx is the overview and its meta.json orders them.
 */
export const getDocsSource = () => (docsSource ??= createDocsSource());
