import { useIntlayer, useLocale } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Global } from "reicon-react/icons/Global";

import { SUPPORTED_LOCALES } from "@/components/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Each language in its own name. */
export const LOCALE_NAMES = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "简体中文",
  ko: "한국어",
} as const;

export const LocaleSwitcher = () => {
  const { locale, setLocale } = useLocale();
  const content = useIntlayer("locale-switcher");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${content.language.value}: ${locale.toUpperCase()}`}
        className={buttonVariants({ variant: "subtle" })}
      >
        <Global aria-hidden className="size-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDown aria-hidden className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            const selected = SUPPORTED_LOCALES.find(
              (supported) => supported === value
            );
            if (selected) {
              setLocale(selected);
            }
          }}
        >
          {SUPPORTED_LOCALES.map((value) => (
            <DropdownMenuRadioItem key={value} value={value} lang={value}>
              {LOCALE_NAMES[value]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
