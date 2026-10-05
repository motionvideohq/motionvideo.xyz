import { META_THEME_COLORS } from "@/constants/site";

// Light/dark mode. The choice lives in localStorage; nothing stored follows
// the OS setting until the visitor toggles.

export const THEME_KEY = "theme";

// `theme-color` (browser chrome) is created by `themeScript`, not route head
// metadata, so React never re-renders it with a stale color.
export const setThemeColor = (dark: boolean) => {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      dark ? META_THEME_COLORS.dark : META_THEME_COLORS.light
    );
};

// Inlined in <head> so the right theme is applied before first paint. Keep in
// sync with `setThemeColor` and the toggle.
export const themeScript = `(() => {
  const media = matchMedia("(prefers-color-scheme: dark)");
  // Reused if present: the head re-runs this script on client navigation.
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
  }
  const apply = () => {
    const theme = localStorage.getItem("${THEME_KEY}");
    const dark = theme === "dark" || (theme !== "light" && media.matches);
    document.documentElement.classList.toggle("dark", dark);
    meta.content = dark ? "${META_THEME_COLORS.dark}" : "${META_THEME_COLORS.light}";
  };
  apply();
  media.addEventListener("change", apply);
})()`;
