import { useIntlayer } from "react-intlayer";

import { buttonVariants } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHotkey } from "@/hooks/use-hotkey";
import { THEME_KEY, setThemeColor } from "@/lib/theme";

const HOTKEY = "d";

const toggleTheme = () => {
  const dark = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", dark);
  setThemeColor(dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
};

export const ThemeToggle = ({ hotkey = false }: { hotkey?: boolean }) => {
  const content = useIntlayer("chrome");
  useHotkey(HOTKEY, toggleTheme, { enabled: hotkey });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={content.toggleTheme.value}
              aria-keyshortcuts={HOTKEY.toUpperCase()}
              className={buttonVariants({ size: "icon", variant: "ghost" })}
            />
          }
          onClick={toggleTheme}
        >
          {/* Half-filled circle; turns 180° in dark mode. */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            aria-hidden="true"
            className="size-[18px] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:rotate-180"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
          </svg>
        </TooltipTrigger>
        <TooltipContent side="top">
          {content.toggleTheme} <Kbd>{HOTKEY.toUpperCase()}</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
