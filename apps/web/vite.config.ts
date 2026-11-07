import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { intlayer } from "vite-intlayer";

import { LOCALES, localizedPath } from "./src/constants/locales.ts";
import { STATIC_PAGES } from "./src/constants/routes.ts";

// Every content page is prerendered once per locale, at the same URL the
// router renders: `/about`, `/fr/about`, and so on.
const STATIC_ROUTES = LOCALES.flatMap((locale) =>
  STATIC_PAGES.map((page) => localizedPath(page, locale))
);

// Dev-only pages: dropped from the route tree in `vite build`, so neither the
// route nor its code ships to production.
const DEV_ONLY_ROUTES = ["showcase", "film"];

const config = defineConfig(({ command }) => ({
  resolve: { tsconfigPaths: true },
  // vite-intlayer keeps its generated dictionary entries out of the client's
  // dependency prebundle, but not the Workers (ssr) environment's: there they
  // got baked into node_modules/.vite/deps_ssr, so the server kept rendering
  // stale strings that the client then replaced on hydration (a visible
  // flash). Excluded, they resolve to the live .intlayer files.
  environments: {
    ssr: {
      optimizeDeps: {
        exclude: [
          "@intlayer/dictionaries-entry",
          "@intlayer/dictionaries-entry/unmerged",
          "@intlayer/dictionaries-entry/remote",
          "@intlayer/dictionaries-entry/dynamic",
          "@intlayer/dictionaries-entry/fetch",
          "@intlayer/config/built",
        ],
      },
    },
  },
  plugins: [
    devtools(),
    // One instance for every MDX source: content/docs (source.config.ts) is
    // compiled into `.source/` at build time, and the macro compiles the
    // changelog, blog and registry component collections. Only those modules
    // use the macro, so its transform skips every other module.
    fumadocsMdx({
      macro: {
        include: [
          "src/lib/changelog.ts",
          "src/lib/blog.ts",
          "src/lib/design-components.ts",
        ],
      },
    }),
    intlayer(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart({
      router: {
        // `.content.` files are intlayer dictionaries, not routes.
        routeFileIgnorePattern:
          command === "build"
            ? String.raw`\.content\.|^(?:${DEV_ONLY_ROUTES.join("|")})\.tsx$`
            : String.raw`\.content\.`,
      },
      pages: STATIC_ROUTES.map((path) => ({ path })),
      prerender: {
        autoStaticPathsDiscovery: false,
        // `/fr/about.html` rather than `/fr/about/index.html`: Workers assets
        // serve it at `/fr/about` without a trailing-slash redirect.
        autoSubfolderIndex: false,
        crawlLinks: false,
        enabled: true,
        filter: ({ path }) => STATIC_ROUTES.includes(path),
      },
    }),
    viteReact(),
  ],
}));

export default config;
