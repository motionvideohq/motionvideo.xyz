import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { intlayer } from "vite-intlayer";

import { STATIC_PAGES } from "./src/constants/routes.ts";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    // Compiles content/docs (source.config.ts) into `.source/` at build time.
    fumadocsMdx(),
    intlayer(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart({
      router: {
        routeFileIgnorePattern: "\\.content\\.",
      },
      pages: STATIC_PAGES.map((path) => ({ path })),
      prerender: {
        autoStaticPathsDiscovery: false,
        // `/about.html` rather than `/about/index.html`: Workers assets serve it
        // at `/about` without a trailing-slash redirect.
        autoSubfolderIndex: false,
        crawlLinks: false,
        enabled: true,
        filter: ({ path }) => STATIC_PAGES.includes(path),
      },
    }),
    viteReact(),
  ],
});

export default config;
