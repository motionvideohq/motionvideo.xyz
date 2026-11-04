import type { OpenAPIV3_1 } from "fumadocs-openapi";

import { DEFAULT_LOCALE, localizedPath } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";
import catalog from "@/data/motion-catalog.json";
import directories from "@/data/resource-directories.json";
import { DIRECTORY_FILTERS } from "@/lib/directories";
import {
  EFFORTS,
  ITERATIONS,
  MOTION_CATEGORIES,
  MOTION_MODELS,
  MOTION_TYPES,
} from "@/lib/motion-catalog";
import { MOVE_FAMILIES } from "@/lib/move-families";
import { MOVES } from "@/lib/moves";
import { CATALOG_CACHE_CONTROL } from "@/server/catalog-api";

// Server only: the OpenAPI document of the public JSON endpoints
// (src/routes/api/catalog/*, src/routes/api/moves), served at /openapi.json
// and rendered as the API reference under /docs/api. Enums and the
// Cache-Control value come from the code the handlers use, and the examples
// are cut from the live data, so they can't drift.
//
// /api/mcp/* is left out: those endpoints are the MCP server's backend. Their
// access tokens are audience-bound to the MCP server (MCP_RESOURCE), which
// forwards them; other clients use the MCP tools (docs/mcp) instead.

/** The file the API reference pages are generated from, for edit links. */
export const OPENAPI_SOURCE_PATH = "src/server/openapi.ts";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

/**
 * A cached JSON read: optional `If-None-Match`, then 200 with the data (and
 * its ETag and Cache-Control) or an empty 304.
 */
const cachedGet = ({
  operationId,
  summary,
  description,
  tag,
  response,
}: {
  operationId: string;
  summary: string;
  description: string;
  tag: string;
  response: { description: string; schema: string; example: unknown };
}): OpenAPIV3_1.PathItemObject => ({
  get: {
    operationId,
    summary,
    description,
    tags: [tag],
    parameters: [{ $ref: "#/components/parameters/IfNoneMatch" }],
    responses: {
      "200": {
        description: response.description,
        headers: {
          ETag: { $ref: "#/components/headers/ETag" },
          "Cache-Control": { $ref: "#/components/headers/CacheControl" },
        },
        content: {
          "application/json": {
            schema: ref(response.schema),
            example: response.example,
          },
        },
      },
      "304": { $ref: "#/components/responses/NotModified" },
    },
  },
});

const [toolEntry] = directories.tools.entries;
const skillEntry = directories.tools.entries.find(
  (entry) => entry.category === "Skills"
);
const [studioEntry] = directories.studios.entries;

export const openApiDocument: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  info: {
    title: `${SITE.NAME} public API`,
    version: "1.0.0",
    description:
      "Read-only JSON of the gallery catalog, the directories and the public part of every move. No key or sign-in.",
  },
  servers: [{ url: SITE.URL }],
  // Every endpoint is public.
  security: [],
  externalDocs: {
    description: "API reference",
    url: absoluteUrl(localizedPath(ROUTES.DOCS_API, DEFAULT_LOCALE)),
  },
  tags: [
    {
      name: "Catalog",
      description: "The gallery videos and the resource directories.",
    },
    { name: "Moves", description: "The motion design moves library." },
  ],
  paths: {
    "/api/catalog": cachedGet({
      operationId: "get-catalog",
      summary: "Get the catalog",
      description:
        "Every gallery video with its prompt or skill, creator, model, stack, effort, colours and media URLs, plus the videos removed as duplicates.",
      tag: "Catalog",
      response: {
        description: "The motion video catalog.",
        schema: "MotionCatalog",
        example: {
          importedAt: catalog.importedAt,
          videos: catalog.videos.slice(0, 1),
          removed: catalog.removed.slice(0, 1),
        },
      },
    }),
    "/api/catalog/directories": cachedGet({
      operationId: "get-directories",
      summary: "Get the directories",
      description:
        "The tools, skills, extras (articles and resources) and creatives (studios and designers) directories.",
      tag: "Catalog",
      response: {
        description: "The resource directories.",
        schema: "Directories",
        example: {
          importedAt: directories.importedAt,
          tools: { entries: [toolEntry, skillEntry].filter(Boolean) },
          studios: { entries: [studioEntry] },
        },
      },
    }),
    "/api/moves": cachedGet({
      operationId: "get-moves",
      summary: "Get the moves",
      description:
        "The public part of every move: name, family, summary, explanation, good-for tags, gallery examples and related moves. Prompts are part of Pro and not included.",
      tag: "Moves",
      response: {
        description: "Every move, without its prompt.",
        schema: "Moves",
        example: { moves: MOVES.slice(0, 1) },
      },
    }),
  },
  components: {
    parameters: {
      IfNoneMatch: {
        name: "If-None-Match",
        in: "header",
        required: false,
        description:
          "The `ETag` of an earlier response. If it is still current, the response is a `304` with no body. Send the value exactly as received (one quoted value): lists, weak `W/` validators and `*` always get a full response.",
        schema: { type: "string" },
      },
    },
    headers: {
      ETag: {
        description:
          "Quoted SHA-256 hex digest of the response body. Changes whenever the data does.",
        schema: { type: "string" },
      },
      CacheControl: {
        description:
          "Browsers reuse a response for 5 minutes and shared caches for an hour, then may serve it stale for up to a day while they revalidate.",
        schema: { type: "string", enum: [CATALOG_CACHE_CONTROL] },
      },
    },
    responses: {
      NotModified: {
        description:
          "Not modified: `If-None-Match` matched the current `ETag`. No body; reuse the copy you have.",
        headers: { ETag: { $ref: "#/components/headers/ETag" } },
      },
    },
    schemas: {
      MotionCatalog: {
        type: "object",
        required: ["importedAt", "videos", "removed"],
        properties: {
          importedAt: {
            type: "string",
            format: "date-time",
            description: "When the catalog was last imported.",
          },
          videos: {
            type: "array",
            description: "Every gallery video, in catalog order.",
            items: ref("MotionVideo"),
          },
          removed: {
            type: "array",
            description:
              "Videos removed as duplicates. Their old page URLs redirect to the video they duplicated.",
            items: ref("RemovedVideo"),
          },
        },
      },
      MotionVideo: {
        type: "object",
        required: [
          "slug",
          "title",
          "date",
          "tags",
          "contentTags",
          "promptShared",
          "handle",
          "avatar",
          "poster",
          "preview",
          "video",
          "width",
          "height",
        ],
        properties: {
          slug: {
            type: "string",
            description:
              "Stable ID: the creator's handle and a short hash. The video's page is `/videos/{slug}` under a locale, e.g. `/en/videos/{slug}`.",
          },
          title: { type: "string" },
          date: {
            type: "string",
            format: "date",
            description: "When the creator posted it (YYYY-MM-DD).",
          },
          tags: {
            type: "array",
            description:
              "What it shares to remake it: a prompt, a skill, or both.",
            items: { type: "string", enum: [...MOTION_TYPES] },
          },
          contentTags: {
            type: "array",
            description: "Gallery categories, at least one.",
            items: { type: "string", enum: [...MOTION_CATEGORIES] },
          },
          promptShared: {
            type: "boolean",
            description: "Whether the creator shared the prompt.",
          },
          handle: {
            type: "string",
            description: "The creator's X handle, without `@`.",
          },
          creatorName: {
            type: "string",
            description: "The creator's display name on X, when known.",
          },
          avatar: {
            type: "string",
            format: "uri",
            description: "The creator's avatar (WebP).",
          },
          poster: {
            type: "string",
            format: "uri",
            description: "Poster image (WebP).",
          },
          blur: {
            type: "string",
            description:
              "A tiny version of the poster as a `data:` URI, to show while media loads.",
          },
          preview: {
            type: "string",
            format: "uri",
            description: "Small looping preview (MP4).",
          },
          video: {
            type: "string",
            format: "uri",
            description: "The full video (MP4).",
          },
          width: { type: "integer", description: "Video width in pixels." },
          height: { type: "integer", description: "Video height in pixels." },
          prompt: {
            type: "string",
            description: "The prompt the creator used, when shared.",
          },
          skillUrl: {
            type: "string",
            format: "uri",
            description: "The agent skill the video was made with.",
          },
          skillInstall: {
            type: "string",
            description:
              "The command that installs the skill, e.g. `npx skills add …`.",
          },
          tweetUrl: {
            type: "string",
            format: "uri",
            description: "The source post on X.",
          },
          description: { type: "string" },
          model: {
            type: "string",
            enum: [...MOTION_MODELS],
            description:
              "The model it was made with, as the creator reported it.",
          },
          stack: {
            type: "string",
            description:
              "What rendered it, as the creator reported it, e.g. `Remotion` or `HTML + Playwright`.",
          },
          effort: {
            type: "string",
            enum: [...EFFORTS],
            description: "The reasoning effort the model ran at.",
          },
          iterations: {
            type: "string",
            enum: [...ITERATIONS],
            description: "How many rounds of feedback it took.",
          },
          colors: {
            type: "array",
            description:
              "Dominant colours as hex without `#`, the largest share of the frame first.",
            items: { type: "string", pattern: "^[0-9a-f]{6}$" },
          },
        },
      },
      RemovedVideo: {
        type: "object",
        required: ["slug", "duplicateOf", "tweetUrl"],
        properties: {
          slug: { type: "string", description: "The removed video's slug." },
          duplicateOf: {
            type: "string",
            description:
              "Slug of the video it duplicated (which may itself be removed later).",
          },
          tweetUrl: { type: "string", format: "uri" },
        },
      },
      Directories: {
        type: "object",
        required: ["importedAt", "tools", "studios"],
        properties: {
          importedAt: {
            type: "string",
            format: "date-time",
            description: "When the directories were last imported.",
          },
          tools: {
            type: "object",
            description:
              "Tools, plus skills (category `Skills`), web articles (`Articles`) and resources (`Resources`); the site lists the last three under Skills and Extras.",
            required: ["entries"],
            properties: {
              entries: { type: "array", items: ref("DirectoryEntry") },
            },
          },
          studios: {
            type: "object",
            description:
              "Studios (category `Studio`) and designers (`Designers`), listed on the site as Creatives.",
            required: ["entries"],
            properties: {
              entries: { type: "array", items: ref("DirectoryEntry") },
            },
          },
        },
      },
      DirectoryEntry: {
        type: "object",
        required: [
          "id",
          "name",
          "description",
          "category",
          "url",
          "cover",
          "addedAt",
        ],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          category: {
            type: "string",
            description: "e.g. `Editor`, `AI`, `Skills`, `Studio`.",
          },
          url: { type: "string", format: "uri" },
          cover: {
            type: ["string", "null"],
            format: "uri",
            description: "Cover image (WebP), or `null` without one.",
          },
          addedAt: {
            type: "string",
            format: "date",
            description: "When the entry joined the directory (YYYY-MM-DD).",
          },
          pricing: {
            type: "string",
            enum: [...DIRECTORY_FILTERS.tool],
            description: "Tools only.",
          },
          stars: {
            type: "integer",
            description: "Skills only: GitHub stars.",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Skills only: the repository's last push.",
          },
          renderers: {
            type: "array",
            description:
              "Skills only: what renders the video, most central first.",
            items: { type: "string", enum: [...DIRECTORY_FILTERS.skill] },
          },
          specialties: {
            type: "array",
            description:
              "Studios and designers only: what they're known for, strongest first.",
            items: { type: "string", enum: [...DIRECTORY_FILTERS.studio] },
          },
          resourceType: {
            type: "string",
            enum: [...DIRECTORY_FILTERS.extra],
            description: "Resources only.",
          },
          publishedAt: {
            type: "string",
            format: "date-time",
            description: "Articles only: when it was published.",
          },
        },
      },
      Moves: {
        type: "object",
        required: ["moves"],
        properties: {
          moves: { type: "array", items: ref("Move") },
        },
      },
      Move: {
        type: "object",
        required: [
          "slug",
          "name",
          "family",
          "aka",
          "summary",
          "body",
          "goodFor",
          "examples",
          "related",
        ],
        properties: {
          slug: {
            type: "string",
            description:
              "Stable ID. The move's page is `/moves/{family}/{slug}` under a locale.",
          },
          name: { type: "string" },
          family: { type: "string", enum: [...MOVE_FAMILIES] },
          aka: {
            type: "array",
            description: "Other names people search for.",
            items: { type: "string" },
          },
          summary: {
            type: "string",
            description: "One sentence: what it looks like.",
          },
          body: {
            type: "string",
            description:
              "Markdown: how it reads, when it works, common mistakes.",
          },
          goodFor: {
            type: "array",
            description: "Short tags, e.g. `logo stings`.",
            items: { type: "string" },
          },
          examples: {
            type: "array",
            description: "Slugs of catalog videos that show the move.",
            items: { type: "string" },
          },
          related: {
            type: "array",
            description: "Slugs of related moves.",
            items: { type: "string" },
          },
        },
      },
    },
  },
};

/**
 * The API reference pages: one per operation, named after its operationId
 * (fumadocs-openapi's default, see docs-source.ts). Every operation is a GET.
 */
export const API_REFERENCE_PATHS = Object.values(
  openApiDocument.paths ?? {}
).flatMap((item) =>
  item?.get?.operationId ? [`${ROUTES.DOCS_API}/${item.get.operationId}`] : []
);
