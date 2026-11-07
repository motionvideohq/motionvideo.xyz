import { useEffect, useRef, useState } from "react";

import { Dropzone } from "@/registry/ui/magnetic-dropzone";

// Picks a file and fakes a short upload, for the dropzone's page on
// /design/components. Nothing leaves the browser.
export const MagneticDropzoneDemo = () => {
  const [busy, setBusy] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Dropzone
      accept="image/*,application/pdf"
      maxSize={5 * 1024 * 1024}
      busy={busy}
      helper="PNG, JPG or PDF, up to 5 MB"
      onFilesChange={(files) => {
        if (files.length === 0) {
          return;
        }
        setBusy(true);
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setBusy(false), 1200);
      }}
      className="w-full max-w-md"
    />
  );
};
