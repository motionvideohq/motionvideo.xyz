import { useState } from "react";
import { useIntlayer } from "react-intlayer";
import { GalleryAdd } from "reicon-react/icons/GalleryAdd";
import { GalleryAdd3 } from "reicon-react/icons/GalleryAdd3";

import { UPLOAD_MAX_BYTES } from "@/lib/uploads";
import type { UploadPurpose } from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { Dropzone } from "@/registry/ui/magnetic-dropzone";

const ACCEPT = "image/png,image/jpeg,image/webp";
const ACCEPTED_TYPES = new Set(ACCEPT.split(","));

type DropzoneError = "type" | "size" | "upload";

/**
 * An image field that uploads one image to /api/upload and reports the stored
 * path. Shows the current image, with Remove and Upload another once set.
 */
export const ImageDropzone = ({
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
  const content = useIntlayer("image-dropzone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DropzoneError | null>(null);
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
    let failure: DropzoneError | null = null;
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      if (response.ok) {
        // SAFETY: /api/upload answers 200 only with `{ path }`.
        ({ path } = (await response.json()) as { path: string });
      } else {
        failure = response.status === 415 ? "type" : "upload";
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

  const onFilesChange = (files: File[]) => {
    const [file] = files;
    if (!file) {
      setError(null);
      onChange("");
      return;
    }
    void upload(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <Dropzone
        accept={ACCEPT}
        maxSize={UPLOAD_MAX_BYTES[purpose]}
        value={value}
        required={required}
        busy={busy}
        failed={Boolean(error)}
        onFilesChange={onFilesChange}
        icon={
          required ? (
            <GalleryAdd3 className="size-5.5" strokeWidth={1.8} aria-hidden />
          ) : (
            <GalleryAdd className="size-5.5" strokeWidth={1.8} aria-hidden />
          )
        }
        helper={
          <>
            <span>{content.types}</span>
            <span>{hint}</span>
            <span>
              {maxMb} MB {content.max}
            </span>
          </>
        }
        className={cn("max-w-none", purpose === "cover" && "aspect-video")}
      />
      {error && (
        <p role="alert" className="text-destructive text-xs">
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
