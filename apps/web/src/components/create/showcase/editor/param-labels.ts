import type { ParamDef } from "@motionvideo/engine";
import { useIntlayer } from "react-intlayer";

// Template control labels come from the engine in English; this dictionary
// translates them by control key, and select options by option value. Keys
// missing here show the engine's label.

export const useParamLabels = () => {
  const { options, ...labels } = useIntlayer("create-showcase-params");
  return {
    label: (def: ParamDef): string =>
      Object.entries(labels).find(([key]) => key === def.key)?.[1].value ??
      def.label,
    option: (value: string, fallback: string): string =>
      Object.entries(options).find(([key]) => key === value)?.[1].value ??
      fallback,
  };
};
