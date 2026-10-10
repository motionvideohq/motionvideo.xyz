import { useIntlayer } from "react-intlayer";
import { Moon } from "reicon-react/icons/Moon";
import { Sun } from "reicon-react/icons/Sun";

import { buttonVariants } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
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
  const content = useIntlayer("theme-toggle");
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
              className={buttonVariants({ size: "icon", variant: "subtle" })}
            />
          }
          onClick={toggleTheme}
        >
          <ReiconDuotone
            icon={Sun}
            aria-hidden="true"
            className="size-[18px] transition-transform duration-500 motion-reduce:transition-none dark:hidden"
          />
          <ReiconDuotone
            icon={Moon}
            aria-hidden="true"
            className="hidden size-[18px] transition-transform duration-500 motion-reduce:transition-none dark:block"
          />
        </TooltipTrigger>
        <TooltipContent side="top">
          {content.toggleTheme} <Kbd>{HOTKEY.toUpperCase()}</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
