import { Link } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import { HairlineFigure } from "@/components/hairline/hairline-figure";
import missingFrame from "@/components/hairline/missing-frame.js?raw";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const NotFound = () => {
  const content = useIntlayer("not-found");
  return (
    <>
      <SiteHeader signedIn={false} />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center sm:py-24"
      >
        <HairlineFigure figure={missingFrame} className="w-full max-w-md" />
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            {content.notFoundTitle}
          </h1>
          <p className="text-muted-foreground max-w-md text-pretty">
            {content.notFoundBody}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className={buttonVariants({ size: "lg", variant: "gradient" })}
          >
            {content.backHome}
          </Link>
          <a
            href={ROUTES.CONTACT}
            className={buttonVariants({ size: "lg", variant: "ghost" })}
          >
            {content.reportLink}
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};
