import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // Hairline kernel and figure: vendored verbatim (the kernel's sha256 header
  // covers its bytes), so the formatter must not rewrite them.
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "src/components/hairline/*.js",
  ],
});
