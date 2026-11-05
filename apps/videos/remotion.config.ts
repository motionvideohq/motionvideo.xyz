import { existsSync } from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

const src = path.join(process.cwd(), "src");

// The licensed snapcn components are gitignored. When they are not
// installed, point their imports at src/launch/licensed-fallback.tsx so the
// project still bundles and every other video renders.
const licensed = Object.fromEntries(
  ["manifesto", "lockup-reveal"]
    .filter((name) => !existsSync(path.join(src, `components/snap-cn/${name}.tsx`)))
    .map((name) => [`@/components/snap-cn/${name}$`, path.join(src, "launch/licensed-fallback.tsx")]),
);

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(null);
Config.overrideBundlerConfig((config) => {
  const c = enableTailwind(config);
  return {
    ...c,
    resolve: {
      ...c.resolve,
      // Exact-match fallbacks first, then the `@` → src alias.
      alias: { ...c.resolve?.alias, ...licensed, "@": src },
    },
  };
});
