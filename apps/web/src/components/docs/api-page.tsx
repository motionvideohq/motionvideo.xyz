import { createMarkdownRenderer } from "fumadocs-core/content/md";
import type { Highlighter } from "fumadocs-core/highlight";
import { remarkGfm } from "fumadocs-core/mdx-plugins/remark-gfm";
import type { TOCItemType } from "fumadocs-core/toc";
import { toJsx } from "fumadocs-core/utils/hast-to-jsx";
import {
  createOpenAPIRenderer,
  useOpenAPI,
  useRenderContext,
  useServer,
} from "fumadocs-openapi";
import type { CodeBlockProps, OpenAPIComponents } from "fumadocs-openapi";
import {
  OperationProvider,
  useCodeUsage,
  useOperation,
  useResponseExamples,
} from "fumadocs-openapi/operation";
import type { PageOperationProps } from "fumadocs-openapi/operation";
import type { OpenAPIPageProps_Spec } from "fumadocs-openapi/server";
import { Suspense, use } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { CodeBlock } from "@/components/docs/code-block";
import { Heading, docsMdxComponents } from "@/components/docs/mdx-components";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API reference pages (content/docs/api/*), rendered from the OpenAPI
// document (src/server/openapi.ts) with fumadocs-openapi's headless renderer:
// it resolves the operation, its example requests and responses, and these
// components draw them with the docs' own headings, code blocks and lists.
// No fumadocs-ui styles: its components are only the library's defaults for
// slots filled here.

/** Props of an API reference page, from `page.data.getOpenAPIPageProps()`. */
export type ApiPageProps = Omit<OpenAPIPageProps_Spec, "document"> & {
  document: string;
};

/** A JSON Schema node as the renderer reads it; refs resolve on demand. */
interface FieldSchema {
  $ref?: string;
  type?: string | string[];
  format?: string;
  description?: string;
  enum?: unknown[];
  items?: FieldSchema;
  properties?: Record<string, FieldSchema>;
  required?: string[];
}

const { Markdown: MarkdownRenderer } = createMarkdownRenderer({
  remarkPlugins: [remarkGfm],
});

const markdownComponents = {
  a: docsMdxComponents.a,
  code: docsMdxComponents.code,
  strong: docsMdxComponents.strong,
  ul: docsMdxComponents.ul,
  ol: docsMdxComponents.ol,
  li: docsMdxComponents.li,
};

/** Descriptions from the document (CommonMark + GFM). */
const Markdown = ({ md }: { md: string }) => (
  <div className="flex flex-col gap-3">
    <MarkdownRenderer components={markdownComponents}>{md}</MarkdownRenderer>
  </div>
);

// Languages load once per highlighter; `use()` needs the same promise on
// every render.
const languageLoads = new WeakMap<Highlighter, Map<string, Promise<void>>>();

const loadLanguage = (highlighter: Highlighter, lang: string) => {
  let loads = languageLoads.get(highlighter);
  if (!loads) {
    loads = new Map();
    languageLoads.set(highlighter, loads);
  }
  let load = loads.get(lang);
  if (!load) {
    load = highlighter.loadLanguage?.(lang) ?? Promise.resolve();
    loads.set(lang, load);
  }
  return load;
};

const HighlightedCode = ({ lang, code }: CodeBlockProps) => {
  const { highlighter } = useRenderContext();
  use(loadLanguage(highlighter, lang));
  return toJsx(highlighter.codeToHast(code, { lang }), {
    components: { pre: CodeBlock },
  });
};

/**
 * Generated code (requests, response examples), highlighted in the browser
 * with the same Shiki themes and CSS variables as the MDX code blocks.
 */
const ApiCodeBlock = (props: CodeBlockProps) => (
  <Suspense
    fallback={
      <CodeBlock>
        <code>{props.code}</code>
      </CodeBlock>
    }
  >
    <HighlightedCode {...props} />
  </Suspense>
);

// h2, h3 and h4, as in MDX; deeper headings render as h4.
const HEADINGS = [
  { as: "h2", className: "mt-6 text-xl" },
  { as: "h3", className: "mt-3 text-base" },
  { as: "h4", className: "mt-2 text-sm" },
] as const;

const ApiHeading: OpenAPIComponents["Heading"] = ({ depth, ...props }) => (
  <Heading {...HEADINGS[Math.min(Math.max(depth, 2), 4) - 2]} {...props} />
);

const typeLabel = (
  schema: FieldSchema | undefined,
  resolve: (node: FieldSchema) => FieldSchema
): string => {
  if (!schema) {
    return "any";
  }
  if (schema.$ref) {
    return schema.$ref.split("/").at(-1) ?? "object";
  }
  const resolved = resolve(schema);
  if (resolved.type === "array") {
    return `${typeLabel(resolved.items, resolve)}[]`;
  }
  return (
    (Array.isArray(resolved.type)
      ? resolved.type.join(" | ")
      : resolved.type) ?? "any"
  );
};

const listClass =
  "shadow-outline divide-border flex flex-col divide-y rounded-xl px-4 text-sm leading-6";

/** One property, parameter or header: name, type, flags, description. */
const Field = ({
  name,
  schema,
  location,
  required,
  description,
  children,
}: {
  name: string;
  schema: FieldSchema | undefined;
  /** Where a parameter goes: `header`, `query`, `path` or `cookie`. */
  location?: string;
  required?: boolean;
  description?: string;
  children?: ReactNode;
}) => {
  const content = useIntlayer("docs-layout");
  // SAFETY: the renderer's `resolve` keeps the JSON Schema shape.
  const resolve = useOpenAPI().doc.resolve as (
    node: FieldSchema
  ) => FieldSchema;
  const resolved = schema ? resolve(schema) : undefined;
  const values =
    resolved?.enum ??
    (resolved?.type === "array" && resolved.items
      ? resolve(resolved.items).enum
      : undefined);
  const text = description ?? resolved?.description;
  return (
    <li className="flex min-w-0 flex-col gap-1.5 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <code className="text-foreground font-mono text-[0.8125rem] font-medium break-all">
          {name}
        </code>
        <span className="font-mono text-xs">{typeLabel(schema, resolve)}</span>
        {location ? (
          <span className="font-mono text-xs">{location}</span>
        ) : null}
        {resolved?.format ? (
          <span className="font-mono text-xs">{resolved.format}</span>
        ) : null}
        {required === undefined ? null : (
          <span
            className={
              required
                ? "text-xs font-medium text-amber-600 dark:text-amber-400"
                : "text-xs"
            }
          >
            {required ? content.api.required : content.api.optional}
          </span>
        )}
      </div>
      {text ? <Markdown md={text} /> : null}
      {values && values.length > 0 ? (
        <p className="flex flex-wrap items-baseline gap-1.5 text-xs">
          <span>{content.api.values}:</span>
          {values.map((value) => (
            <code
              key={String(value)}
              className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono"
            >
              {String(value)}
            </code>
          ))}
        </p>
      ) : null}
      {children}
    </li>
  );
};

/**
 * The properties of an object schema (or of an array's items), nested
 * objects folded under "Show fields". A schema already open further up is
 * not expanded again, so recursive schemas end.
 */
const SchemaFields = ({
  schema,
  seen,
}: {
  schema: FieldSchema;
  seen?: string[];
}) => {
  const content = useIntlayer("docs-layout");
  // SAFETY: as in Field.
  const resolve = useOpenAPI().doc.resolve as (
    node: FieldSchema
  ) => FieldSchema;
  let current = resolve(schema);
  const refs = [...(seen ?? []), ...(schema.$ref ? [schema.$ref] : [])];
  if (current.type === "array" && current.items) {
    if (current.items.$ref) {
      refs.push(current.items.$ref);
    }
    current = resolve(current.items);
  }
  const required = new Set(current.required);
  return (
    <ul className={listClass}>
      {Object.entries(current.properties ?? {}).map(([name, property]) => {
        const resolved = resolve(property);
        const inner =
          resolved.type === "array" && resolved.items
            ? resolved.items
            : property;
        const nested =
          (!inner.$ref || !refs.includes(inner.$ref)) &&
          resolve(inner).properties !== undefined;
        return (
          <Field
            key={name}
            name={name}
            schema={property}
            required={required.has(name) || undefined}
          >
            {nested ? (
              <details className="group/fields mt-1">
                <summary className="text-foreground w-fit cursor-pointer text-xs font-medium select-none">
                  {content.api.showFields}
                </summary>
                <div className="mt-2">
                  <SchemaFields schema={property} seen={refs} />
                </div>
              </details>
            ) : null}
          </Field>
        );
      })}
    </ul>
  );
};

const ApiSchemaUI: OpenAPIComponents["SchemaUI"] = ({ root }) => (
  // SAFETY: `root` is a JSON Schema from the document.
  <SchemaFields schema={root as FieldSchema} />
);

const UsageCode = ({ id, lang }: { id: string; lang: string }) => {
  const code = useCodeUsage(id);
  return code ? <ApiCodeBlock lang={lang} code={code} /> : null;
};

/** cURL, JavaScript, Python… for the operation's example request. */
const ExampleRequest = () => {
  const { codeUsages } = useOperation();
  const usages = [...codeUsages.map().entries()];
  const [first] = usages;
  if (!first) {
    return null;
  }
  return (
    <Tabs defaultValue={first[0]} className="gap-3">
      <TabsList className="max-w-full justify-start overflow-x-auto">
        {usages.map(([id, usage]) => (
          <TabsTrigger key={id} value={id} className="px-2.5">
            {usage.label ?? id}
          </TabsTrigger>
        ))}
      </TabsList>
      {usages.map(([id, usage]) => (
        <TabsContent key={id} value={id}>
          <UsageCode id={id} lang={usage.lang} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

const OperationBody = () => {
  const content = useIntlayer("docs-layout");
  const { method, path, parameters, responses } = useOperation();
  const examples = useResponseExamples();
  const { resolveUrl } = useServer();
  const { resolve } = useOpenAPI().doc;
  const H2 = docsMdxComponents.h2;
  const H3 = docsMdxComponents.h3;
  const params = parameters.flatMap((group) => group.items);
  return (
    <>
      <p className="bg-card shadow-outline flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5">
        <Badge variant="secondary" className="font-mono">
          {method.toUpperCase()}
        </Badge>
        <code className="text-foreground min-w-0 truncate font-mono text-[0.8125rem]">
          {resolveUrl(path)}
        </code>
      </p>
      {params.length > 0 ? (
        <>
          <H2 id="parameters">{content.api.parameters}</H2>
          <ul className={listClass}>
            {params.map((param) => (
              <Field
                key={`${param.in}:${param.name}`}
                name={param.name}
                // SAFETY: as in Field.
                schema={param.schema as FieldSchema | undefined}
                required={param.required ?? false}
                location={param.in}
                description={param.description}
              />
            ))}
          </ul>
        </>
      ) : null}
      <H2 id="example-request">{content.api.exampleRequest}</H2>
      <ExampleRequest />
      <H2 id="responses">{content.api.responses}</H2>
      {responses.map(({ status, response, content: media }) => {
        const headers = Object.entries(response.headers ?? {});
        const sample = examples.find((tab) => tab.code === status)
          ?.examples?.[0]?.sample;
        return (
          <section key={status} className="flex flex-col gap-4">
            <H3 id={`response-${status}`}>{status}</H3>
            {response.description ? (
              <Markdown md={response.description} />
            ) : null}
            {headers.length > 0 ? (
              <>
                <h4 className="text-foreground text-sm font-medium">
                  {content.api.headers}
                </h4>
                <ul className={listClass}>
                  {headers.map(([name, header]) => {
                    const resolved = resolve(header);
                    return (
                      <Field
                        key={name}
                        name={name}
                        // SAFETY: as in Field.
                        schema={resolved.schema as FieldSchema | undefined}
                        description={resolved.description}
                      />
                    );
                  })}
                </ul>
              </>
            ) : null}
            {Object.entries(media).map(([mediaType, item]) => {
              // SAFETY: as in Field.
              const schema = item.schema as FieldSchema | undefined;
              return schema ? (
                <div key={mediaType} className="flex flex-col gap-4">
                  <h4 className="text-foreground flex flex-wrap items-baseline gap-2 text-sm font-medium">
                    {content.api.responseBody}
                    <code className="text-muted-foreground font-mono text-xs font-normal">
                      {mediaType}
                    </code>
                  </h4>
                  <SchemaFields schema={schema} />
                </div>
              ) : null;
            })}
            {sample === undefined ? null : (
              <>
                <h4 className="text-foreground text-sm font-medium">
                  {content.api.example}
                </h4>
                <ApiCodeBlock
                  lang="json"
                  code={JSON.stringify(sample, null, 2)}
                />
              </>
            )}
          </section>
        );
      })}
    </>
  );
};

const ApiOperation = ({
  type,
  path,
  method,
  operation,
  pathItem,
}: PageOperationProps) => (
  <OperationProvider
    type={type}
    path={path}
    method={method}
    operation={operation}
    pathItem={pathItem}
  >
    <OperationBody />
  </OperationProvider>
);

/** Renders the operations of an API reference page. */
export const ApiPage = createOpenAPIRenderer({
  // Types are not shown, so don't generate them.
  generateTypeScriptDefinitions: false,
  components: {
    Operation: ApiOperation,
    SchemaUI: ApiSchemaUI,
    CodeBlock: ApiCodeBlock,
    Markdown,
    Heading: ApiHeading,
  },
});

/**
 * The page's table of contents, matching the headings OperationBody renders.
 * `labels` are the translated section names.
 */
export const apiPageToc = (
  { payload, operations = [] }: ApiPageProps,
  labels: {
    parameters: ReactNode;
    exampleRequest: ReactNode;
    responses: ReactNode;
  }
): TOCItemType[] =>
  operations.flatMap(({ path, method }) => {
    const pathItem = payload.bundled?.paths?.[path];
    const operation = pathItem?.[method];
    if (!operation) {
      return [];
    }
    const hasParameters =
      (operation.parameters?.length ?? 0) + (pathItem.parameters?.length ?? 0) >
      0;
    return [
      ...(hasParameters
        ? [{ depth: 2, title: labels.parameters, url: "#parameters" }]
        : []),
      { depth: 2, title: labels.exampleRequest, url: "#example-request" },
      { depth: 2, title: labels.responses, url: "#responses" },
      ...Object.keys(operation.responses ?? {}).map((status) => ({
        depth: 3,
        title: status,
        url: `#response-${status}`,
      })),
    ];
  });
