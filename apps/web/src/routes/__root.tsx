import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getHTMLTextDir } from "intlayer";

import { ClickTracking } from "@/components/click-tracking";
import { FeedbackDialogProvider } from "@/components/feedback-dialog";
import { FollowPrompt } from "@/components/follow-prompt";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { LivePresenceProvider } from "@/components/live-presence";
import { LocaleProvider } from "@/components/locale-provider";
import { NotFound } from "@/components/not-found";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { SignInDialogProvider } from "@/components/sign-in-dialog";
import { SoundEffects } from "@/components/ui/sound";
import { localeFromPath } from "@/constants/locales";
import { themeScript } from "@/lib/theme";
import { organizationJsonLd } from "@/seo/json-ld";
import { baseMetadata } from "@/seo/metadata";

import fontsCss from "../styles/fonts.css?url";
import appCss from "../styles/globals.css?url";

const RootDocument = ({ children }: { children: React.ReactNode }) => {
  // The locale is a route param on every page (`/$locale/...`); reading the
  // pathname here also covers dialogs and error pages rendered above the
  // locale layout.
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const locale = localeFromPath(pathname);

  return (
    <html dir={getHTMLTextDir(locale)} lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-svh flex-col antialiased">
        <LocaleProvider locale={locale}>
          <SignInDialogProvider>
            <FeedbackDialogProvider>
              <KeyboardShortcutsProvider>
                <LivePresenceProvider>
                  <SoundEffects>{children}</SoundEffects>
                </LivePresenceProvider>
              </KeyboardShortcutsProvider>
            </FeedbackDialogProvider>
          </SignInDialogProvider>
          <FollowPrompt />
        </LocaleProvider>
        <ProgressiveBlur />
        <ClickTracking />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      // Own stylesheet so HMR on app CSS never re-resolves the font.
      { href: fontsCss, rel: "stylesheet" },
      // Preload the same-origin website font served from `/fonts`.
      {
        as: "font",
        crossOrigin: "anonymous",
        fetchPriority: "high",
        href: "/fonts/timeless/TimelessSansVF-1.094.woff2",
        rel: "preload",
        type: "font/woff2",
      },
      ...baseMetadata.links,
    ],
    meta: baseMetadata.meta,
    scripts: [{ children: themeScript }, organizationJsonLd()],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});
