import { defineConfig } from "drizzle-kit";

// Only used to generate SQL migrations; they are applied with
// `wrangler d1 migrations apply` (see package.json scripts).
export default defineConfig({
  dialect: "sqlite",
  schema: [
    "./src/server/db/schema.ts",
    "./src/server/db/community-schema.ts",
    "./src/server/db/bookmark-schema.ts",
  ],
  out: "./drizzle",
});
