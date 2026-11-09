import { useId, useRef, useState } from "react";
import { useIntlayer } from "react-intlayer";

import { UPLOAD_MAX_BYTES } from "@/lib/uploads";
import type { UploadPurpose } from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";

const ACCEPT = "image/png,image/jpeg,image/webp";
const ACCEPTED_TYPES = new Set(ACCEPT.split(","));

type UploadError = "type" | "size" | "upload";

/**
 * An image field that uploads one image to /api/upload and reports the stored
 * path. Shows the current image, with Remove and Upload another once set.
 */
export const ImageUpload = ({
  purpose,
  value,
  onChange,
  hint,
  required = false,
}: {
  purpose: UploadPurpose;
  /** The current image path or URL; empty when none. */
  value: string;
  onChange: (value: string) => void;
  /** Recommended size, e.g. "512 × 512 px". */
  hint: string;
  required?: boolean;
}) => {
  const content = useIntlayer("image-upload");
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const maxMb = UPLOAD_MAX_BYTES[purpose] / 1024 / 1024;

  const upload = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("type");
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES[purpose]) {
      setError("size");
      return;
    }
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("purpose", purpose);
    form.set("file", file);
    let path: string | null = null;
    let failure: UploadError | null = null;
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      if (response.ok) {
        // SAFETY: /api/upload answers 200 only with `{ path }`.
        ({ path } = (await response.json()) as { path: string });
      } else if (response.status === 415) {
        failure = "type";
      } else if (response.status === 413) {
        failure = "size";
      } else {
        failure = "upload";
      }
    } catch {
      failure = "upload";
    }
    setBusy(false);
    setError(failure);
    if (path) {
      onChange(path);
    }
  };

  return (
    <div className="flex flex-col gap-2" aria-busy={busy}>
      {value && (
        <img
          src={value}
          alt=""
          className={cn(
            "rounded-lg border object-contain",
            purpose === "cover" ? "aspect-video w-full" : "size-24"
          )}
        />
      )}
      <label htmlFor={id} className="sr-only">
        {value ? content.replace : content.browse}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        required={required && !value}
        disabled={busy}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        aria-invalid={Boolean(error)}
        className="sr-only focus:not-sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          // The saved path is the field value; reset so the same file can retry.
          event.currentTarget.value = "";
          void upload(file);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          aria-controls={id}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          onClick={() => inputRef.current?.click()}
        >
          {value ? content.replace : content.browse}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setError(null);
              onChange("");
            }}
          >
            {content.remove}
          </Button>
        )}
        <output className="text-muted-foreground text-sm">
          {busy ? content.uploading : null}
        </output>
      </div>
      <p id={`${id}-hint`} className="text-muted-foreground text-xs">
        {content.types} · {hint} · {maxMb} MB {content.max}
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {
            {
              type: content.errorType,
              size: content.errorSize,
              upload: content.errorUpload,
            }[error]
          }
        </p>
      )}
    </div>
  );
};
