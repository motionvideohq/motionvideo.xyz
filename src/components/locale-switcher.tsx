import { ChevronDownIcon, LanguagesIcon } from "lucide-react";
import { useIntlayer, useLocale } from "react-intlayer";

import { SUPPORTED_LOCALES } from "@/components/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localeNames = { en: "English", es: "Español", fr: "Français" } as const;

export const LocaleSwitcher = () => {
  const { locale, setLocale } = useLocale();
  const content = useIntlayer("chrome");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${content.language.value}: ${locale.toUpperCase()}`}
        className={buttonVariants({ size: "sm", variant: "ghost" })}
      >
        <LanguagesIcon aria-hidden className="size-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDownIcon aria-hidden className="size-3.5" />
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
              {localeNames[value]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
