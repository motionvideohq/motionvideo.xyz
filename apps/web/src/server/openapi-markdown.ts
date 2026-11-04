import { openApiDocument } from "./openapi";

// Server only: API reference pages as Markdown (for /docs/<slug>.md and
// /llms-full.txt), written from src/server/openapi.ts the way the page
// renders it: endpoint, parameters, an example request, then each response
// with its headers, fields and example.

// The parts of the document read here, as plain JSON. Any node may be a
// local reference (`$ref`) instead.
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

interface Parameter {
  $ref?: string;
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: FieldSchema;
}

interface Header {
  $ref?: string;
  description?: string;
  schema?: FieldSchema;
}

interface Response {
  $ref?: string;
  description: string;
  headers?: Record<string, Header>;
  content?: Record<string, { schema?: FieldSchema; example?: unknown }>;
}

interface Operation {
  parameters?: Parameter[];
  responses?: Record<string, Response>;
}

/** Follows a local `$ref` (`#/components/<kind>/<name>`) in the document. */
const resolve = <T extends { $ref?: string }>(value: T): T => {
  if (!value.$ref) {
    return value;
  }
  const [kind = "", name = ""] = value.$ref.split("/").slice(2);
  // SAFETY: every ref in the document points at a component of the kind
  // that references it (schema, parameter, header or response).
  const components = openApiDocument.components as
    | Record<string, Record<string, T>>
    | undefined;
  const target = components?.[kind]?.[name];
  if (!target) {
    throw new Error(`OpenAPI: unresolved $ref ${value.$ref}`);
  }
  return resolve(target);
};

/** Markdown table cells can't hold newlines or bare pipes. */
const cell = (text: string) =>
  text.replaceAll("\n", " ").replaceAll("|", "\\|");

const typeOf = (schema: FieldSchema): string => {
  if (schema.$ref) {
    return schema.$ref.split("/").at(-1) ?? schema.$ref;
  }
  if (schema.type === "array") {
    return `array of ${schema.items ? typeOf(schema.items) : "any"}`;
  }
  const base =
    (Array.isArray(schema.type) ? schema.type.join(" | ") : schema.type) ??
    "any";
  return schema.format ? `${base} (${schema.format})` : base;
};

/** Nested bullet list of an object schema's fields, refs expanded once. */
const fieldsOf = (
  schema: FieldSchema,
  depth = 0,
  seen: string[] = []
): string[] => {
  if (schema.$ref && seen.includes(schema.$ref)) {
    return [];
  }
  const refs = schema.$ref ? [...seen, schema.$ref] : seen;
  const resolved = resolve(schema);
  if (resolved.type === "array" && resolved.items) {
    return fieldsOf(resolved.items, depth, refs);
  }
  const indent = "  ".repeat(depth);
  const required = new Set(resolved.required);
  return Object.entries(resolved.properties ?? {}).flatMap(
    ([name, property]) => {
      const details = resolve(property);
      const values = (
        details.enum ??
        (details.type === "array" && details.items
          ? resolve(details.items).enum
          : undefined)
      )
        ?.map((value) => `\`${String(value)}\``)
        .join(", ");
      return [
        `${indent}- \`${name}\` (${typeOf(property)}${required.has(name) ? ", required" : ""})${details.description ? `: ${details.description}` : ""}${values ? ` One of ${values}.` : ""}`,
        ...fieldsOf(property, depth + 1, refs),
      ];
    }
  );
};

const operationMarkdown = (path: string, method: string) => {
  // SAFETY: the document is plain JSON; Operation names the subset read here.
  const operation = (
    openApiDocument.paths?.[path] as Record<string, Operation> | undefined
  )?.[method];
  if (!operation) {
    return "";
  }
  const url = `${openApiDocument.servers?.[0]?.url ?? ""}${path}`;
  const out = [`\`${method.toUpperCase()} ${url}\``];

  const parameters = (operation.parameters ?? []).map((item) => resolve(item));
  if (parameters.length > 0) {
    out.push(
      "## Parameters",
      [
        "| Name | In | Type | Required | Description |",
        "| --- | --- | --- | --- | --- |",
        ...parameters.map(
          (parameter) =>
            `| \`${parameter.name}\` | ${parameter.in} | ${parameter.schema ? typeOf(parameter.schema) : ""} | ${parameter.required ? "Yes" : "No"} | ${cell(parameter.description ?? "")} |`
        ),
      ].join("\n")
    );
  }

  out.push(
    "## Example request",
    `\`\`\`bash\ncurl${method === "get" ? "" : ` -X ${method.toUpperCase()}`} ${url}\n\`\`\``,
    "## Responses"
  );
  for (const [status, item] of Object.entries(operation.responses ?? {})) {
    const response = resolve(item);
    out.push(`### ${status}`, response.description);
    const headers = Object.entries(response.headers ?? {});
    if (headers.length > 0) {
      out.push(
        [
          "| Header | Description |",
          "| --- | --- |",
          ...headers.map(([name, entry]) => {
            const header = resolve(entry);
            const value = header.schema?.enum?.join(", ");
            return `| \`${name}\` | ${cell(`${header.description ?? ""}${value ? ` Value: \`${value}\`` : ""}`)} |`;
          }),
        ].join("\n")
      );
    }
    for (const [mediaType, media] of Object.entries(response.content ?? {})) {
      out.push(`Body (\`${mediaType}\`):`);
      if (media.schema) {
        out.push(fieldsOf(media.schema).join("\n"));
      }
      if (media.example !== undefined) {
        out.push(
          `Example:\n\n\`\`\`json\n${JSON.stringify(media.example, null, 2)}\n\`\`\``
        );
      }
    }
  }
  return out.join("\n\n");
};

/** The operations of an API reference page, as Markdown. */
export const openApiPageMarkdown = (
  operations: { path: string; method: string }[] = []
) =>
  operations
    .map((operation) => operationMarkdown(operation.path, operation.method))
    .join("\n\n");
