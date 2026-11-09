import { useIntlayer } from "react-intlayer";
import { Download } from "reicon-react/icons/Download";
import { Text } from "reicon-react/icons/Text";
import { Window } from "reicon-react/icons/Window";

import { LocalizedLink as Link } from "@/components/localized-link";
import { Logo, Logomark } from "@/components/logo";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ROUTES } from "@/constants/routes";
import { track } from "@/lib/analytics";

const ASSETS = {
  logomark: "/brand/motionvideo-logomark-black.svg",
  logotype: "/brand/motionvideo-wordmark-black.svg",
  appIcon: "/brand/motionvideo-app-icon.svg",
} as const;
const ZIP = "/brand/motionvideo-brand-assets.zip";

/** Copies an SVG's markup, ready to paste into Figma or code. */
const copySvg = async (asset: keyof typeof ASSETS) => {
  try {
    const response = await fetch(ASSETS[asset]);
    await navigator.clipboard.writeText(await response.text());
    track("brand_copy", { asset });
  } catch {
    // Clipboard blocked: nothing to undo.
  }
};

const iconClass = "text-muted-foreground size-4";

/**
 * The header logo, linking home (see logo.tsx). Right-click (or long-press)
 * offers the brand assets: copy the logomark, logotype or app icon as SVG,
 * open the guidelines, or download everything as one zip.
 */
export const Brand = () => {
  const content = useIntlayer("brand-menu");
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <Link
            to={ROUTES.HOME}
            className="flex items-center font-semibold tracking-tight whitespace-nowrap"
          />
        }
      >
        <Logo />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => copySvg("logomark")}>
          <Logomark
            aria-hidden="true"
            className="text-muted-foreground h-2.5 w-4"
          />
          {content.copyLogomark}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => copySvg("logotype")}>
          <Text aria-hidden="true" className={iconClass} />
          {content.copyLogotype}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => copySvg("appIcon")}>
          <Window aria-hidden="true" className={iconClass} />
          {content.copyAppIcon}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          render={
            <Link to={ROUTES.DESIGN_BRAND} data-track="brand_guidelines" />
          }
        >
          {/* A dashed square: the guidelines frame the marks. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            className={iconClass}
          >
            <rect
              x="2"
              y="2"
              width="12"
              height="12"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2.5 2"
            />
          </svg>
          {content.guidelines}
        </ContextMenuItem>
        <ContextMenuItem
          render={
            <a
              href={ZIP}
              download
              aria-label={content.download.value}
              data-track="brand_download"
            />
          }
        >
          <Download aria-hidden="true" className={iconClass} />
          {content.download}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
