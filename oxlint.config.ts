import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack, antiSlop],
  // Better Auth CLI output (`pnpm auth:schema`); regenerated, not hand-edited.
  // Hairline kernel and figure: vendored verbatim (the kernel's sha256 header
  // covers its bytes) and run as scripts, so never rewritten.
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "src/server/db/schema.ts",
    "src/components/hairline/*.js",
  ],
});
