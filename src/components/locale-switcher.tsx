import { GlobeIcon } from "lucide-react";
import { useIntlayer, useLocale } from "react-intlayer";

import { SUPPORTED_LOCALES } from "@/components/locale-provider";

const localeNames = { en: "English", es: "Español", fr: "Français" } as const;

export const LocaleSwitcher = () => {
  const { locale, setLocale } = useLocale();
  const content = useIntlayer("chrome");

  return (
    <label className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors">
      <GlobeIcon aria-hidden className="size-3.5" />
      <span className="sr-only">{content.language}</span>
      <select
        aria-label={content.language.value}
        value={locale}
        onChange={(event) => {
          const selected = SUPPORTED_LOCALES.find((value) => value === event.target.value);
          if (selected) {
            setLocale(selected);
          }
        }}
        className="bg-background max-w-24 cursor-pointer rounded-sm py-1 outline-offset-4"
      >
        {SUPPORTED_LOCALES.map((value) => (
          <option key={value} value={value} lang={value}>{localeNames[value]}</option>
        ))}
      </select>
    </label>
  );
};
