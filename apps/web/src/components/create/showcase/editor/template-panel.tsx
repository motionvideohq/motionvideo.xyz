import { applyTemplate, COLLECTIONS, templatesIn } from "@motionvideo/engine";
import type { CollectionId, TemplateDef } from "@motionvideo/engine";
import { useState } from "react";
import { useIntlayer } from "react-intlayer";

import { Badge } from "@/components/ui/badge";
import { previewFor } from "@/lib/create-previews";
import { cn } from "@/lib/utils";

import { editor, useDoc } from "./store";

// Template picker: collection filter, then a grid of preview tiles. Hover
// plays a template's preview loop; click applies it to the current media.

const TemplateTile = ({
  template,
  active,
  onPick,
}: {
  template: TemplateDef;
  active: boolean;
  onPick: () => void;
}) => {
  const content = useIntlayer("create-showcase-editor");
  const preview = previewFor(template.id);
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onPick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-pressed={active}
      data-track="create_template_pick"
      data-track-template={template.id}
      className={cn(
        "group focus-visible:ring-ring flex flex-col gap-1.5 rounded-lg p-1 text-left outline-none focus-visible:ring-2",
        active ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      <span
        className={cn(
          "bg-muted relative block aspect-video w-full overflow-hidden rounded-md ring-1",
          active ? "ring-primary" : "ring-border/60"
        )}
      >
        {preview && hover ? (
          <video
            src={preview.video}
            poster={preview.poster}
            autoPlay
            muted
            loop
            playsInline
            className="size-full object-cover"
          />
        ) : null}
        {preview && !hover ? (
          <img
            src={preview.poster}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : null}
        {template.tier === "pro" ? (
          <Badge className="absolute top-1.5 right-1.5 h-4 px-1.5 text-[10px]">
            {content.pro}
          </Badge>
        ) : null}
      </span>
      <span className="truncate px-0.5 text-xs font-medium">
        {template.name}
      </span>
    </button>
  );
};

export const TemplatePanel = () => {
  const content = useIntlayer("create-showcase-editor");
  const doc = useDoc();
  const [collection, setCollection] = useState<CollectionId | "all">("all");
  const shown = collection === "all" ? COLLECTIONS : [collection];

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-1">
        {(["all", ...COLLECTIONS] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={collection === id}
            onClick={() => setCollection(id)}
            className={cn(
              "h-6 rounded-full px-2.5 text-[11px] font-medium transition-colors",
              collection === id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {id === "all" ? content.all : content.collections[id]}
          </button>
        ))}
      </div>
      {shown.map((id) => (
        <div key={id} className="flex flex-col gap-1.5">
          {collection === "all" ? (
            <h3 className="text-muted-foreground px-1 text-[11px] font-medium tracking-wide uppercase">
              {content.collections[id]}
            </h3>
          ) : null}
          <div className="grid grid-cols-2 gap-1">
            {templatesIn(id).map((template) => (
              <TemplateTile
                key={template.id}
                template={template}
                active={template.id === doc.template}
                onPick={() => {
                  editor.update((d) => applyTemplate(d, template.id));
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
