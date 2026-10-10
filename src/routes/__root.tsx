import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import timelessSans from "@/assets/fonts/timeless/TimelessSansVF.woff2?url";
import { LocaleProvider } from "@/components/locale-provider";
import { NotFound } from "@/components/not-found";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { SignInDialogProvider } from "@/components/sign-in-dialog";
import { themeScript } from "@/lib/theme";
import { organizationJsonLd, websiteJsonLd } from "@/seo/json-ld";
import { baseMetadata } from "@/seo/metadata";

import appCss from "../styles.css?url";

const RootDocument = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <HeadContent />
    </head>
    <body className="flex min-h-svh flex-col antialiased">
      <LocaleProvider>
        <SignInDialogProvider>{children}</SignInDialogProvider>
      </LocaleProvider>
      <ProgressiveBlur />
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

export const Route = createRootRoute({
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      // Preload the same self-hosted variable font referenced by the stylesheet.
      {
        as: "font",
        crossOrigin: "anonymous",
        href: timelessSans,
        rel: "preload",
        type: "font/woff2",
      },
      ...baseMetadata.links,
    ],
    meta: baseMetadata.meta,
    scripts: [{ children: themeScript }, websiteJsonLd(), organizationJsonLd()],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});
