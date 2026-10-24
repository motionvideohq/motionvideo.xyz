import { defineConfig } from "drizzle-kit";

// Only used to generate SQL migrations; they are applied with
// `wrangler d1 migrations apply` (see package.json scripts).
export default defineConfig({
  dialect: "sqlite",
  schema: [
    "./src/server/db/schema.ts",
    "./src/server/db/community-schema.ts",
    "./src/server/db/bookmark-schema.ts",
    "./src/server/db/sponsorship-schema.ts",
    "./src/server/db/feedback-schema.ts",
    "./src/server/db/job-schema.ts",
    "./src/server/db/plan-schema.ts",
  ],
  out: "./drizzle",
});
