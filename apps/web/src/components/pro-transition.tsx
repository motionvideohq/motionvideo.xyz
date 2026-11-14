import { useRouter } from "@tanstack/react-router";
import { GlimmProvider, useGlimm } from "glimm/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";

const isProPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) {
    segments.shift();
  }
  return `/${segments.join("/")}` === ROUTES.PRO;
};

const ProLinkInterceptor = () => {
  const router = useRouter();
  const { sweep } = useGlimm();

  useEffect(() => {
    let busy = false;
    const intercept = async (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self") ||
        Object.hasOwn(link.dataset, "glimmSkip")
      ) {
        return;
      }
      const destination = new URL(link.href);
      if (
        destination.origin !== window.location.origin ||
        !isProPath(destination.pathname) ||
        isProPath(window.location.pathname)
      ) {
        return;
      }
      // Capture before React's Link handler: only entry into /pro sweeps.
      // Tabs, downloads, other routes and /pro's own filters stay native.
      event.preventDefault();
      event.stopPropagation();
      if (busy) {
        return;
      }
      busy = true;
      const transition = sweep(async () => {
        await router.navigate({
          href: `${destination.pathname}${destination.search}${destination.hash}`,
        });
      });
      try {
        await transition.done;
      } catch (error) {
        busy = false;
        throw error;
      }
      busy = false;
    };
    window.addEventListener("click", intercept, true);
    return () => window.removeEventListener("click", intercept, true);
  }, [router, sweep]);

  return null;
};

/** Gold sweep when a link opens /pro; reduced motion skips it entirely. */
export const ProTransition = ({ children }: { children: ReactNode }) => (
  <GlimmProvider
    palette={{
      a: [0.8, 0.55, 0.15],
      b: [0.2, 0.25, 0.15],
      c: [1, 1, 1],
      d: [0, 0.08, 0.15],
    }}
    sweepMs={800}
    outroMs={160}
    easing="easeInOutCubic"
    reducedMotion="instant"
  >
    <ProLinkInterceptor />
    {children}
  </GlimmProvider>
);
