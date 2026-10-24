import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

// Docs pages under /docs, compiled at build time by the fumadocs-mdx Vite
// plugin into `.source/` (no filesystem access at runtime on Workers).
// Translations sit next to the English file as `name.<locale>.mdx`.
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // Server code only needs frontmatter and the page tree; bodies load lazily.
    async: true,
    schema: pageSchema.extend({ description: z.string() }),
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
      // Colours only as CSS variables; the code block picks light or dark.
      defaultColor: false,
    },
    // Both emit fumadocs-ui components that the docs engine doesn't provide.
    remarkCodeTabOptions: false,
    remarkNpmOptions: false,
  },
});
