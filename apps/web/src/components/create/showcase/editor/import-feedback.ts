import { useCallback } from "react";
import { useIntlayer } from "react-intlayer";

import { track } from "@/lib/analytics";

import type { ImportError } from "./actions";
import { editor } from "./store";

/** Tells the visitor what an import did: files skipped, samples replaced. */
export const useImportFeedback = () => {
  const content = useIntlayer("create-showcase-editor");
  return useCallback(
    ({
      added,
      failed,
      replacedSamples,
    }: {
      added: readonly unknown[];
      failed: readonly ImportError[];
      replacedSamples: boolean;
    }) => {
      if (added.length > 0) {
        track("create_media_imported", {
          count: added.length,
          failed: failed.length,
        });
      }
      if (failed.length > 0) {
        const [first] = failed;
        const reason = {
          unsupported: content.errorUnsupported,
          undecodable: content.errorUndecodable,
          "too-large": content.errorTooLarge,
          "too-long": content.errorTooLong,
        }[first.reason];
        editor.ui({
          notice: {
            tone: "error",
            message: `${first.name}: ${reason.value}${failed.length > 1 ? ` (+${failed.length - 1})` : ""}`,
          },
        });
        return;
      }
      if (replacedSamples) {
        editor.ui({
          notice: { tone: "info", message: content.samplesReplaced.value },
        });
      }
    },
    [content]
  );
};
