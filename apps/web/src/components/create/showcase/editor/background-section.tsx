import type { Background, MediaItem } from "@motionvideo/engine";
import { useRef } from "react";
import { useIntlayer } from "react-intlayer";
import { Upload } from "reicon-react/icons/Upload";

import { Button } from "@/components/ui/button";

import { ColorField, Section, SelectField, SliderField } from "./fields";
import { importFiles } from "./media";
import { editor } from "./store";

// Background: solid, gradients, a drifting mesh, an image or video, or none
// (transparent exports). Switching type keeps the current colours.

type BgType = Background["type"];

const colorsOf = (bg: Background): string[] => {
  if (bg.type === "solid") {
    return [bg.color];
  }
  if (bg.type === "linear" || bg.type === "radial" || bg.type === "mesh") {
    return bg.colors;
  }
  return ["#141417", "#2a2a30"];
};

const pad = (colors: string[], n: number) =>
  Array.from({ length: n }, (_, i) => colors[i] ?? colors.at(-1) ?? "#000000");

const convert = (bg: Background, type: BgType, media?: string): Background => {
  const colors = colorsOf(bg);
  switch (type) {
    case "solid": {
      return { type, color: colors[0] };
    }
    case "linear": {
      return {
        type,
        colors: pad(colors, Math.max(2, Math.min(4, colors.length))),
        angle: 120,
      };
    }
    case "radial": {
      return {
        type,
        colors: pad(colors, Math.max(2, Math.min(4, colors.length))),
        x: 0.5,
        y: 0.45,
      };
    }
    case "mesh": {
      return { type, colors: pad(colors, 4), speed: 1 };
    }
    case "media": {
      return media ? { type, media, dim: 0.2, blur: 0.3 } : bg;
    }
    default: {
      return { type: "transparent" };
    }
  }
};

export const BackgroundSection = ({
  background,
  onChange,
}: {
  background: Background;
  onChange: (bg: Background, group?: string) => void;
}) => {
  const content = useIntlayer("create-showcase-editor");
  const file = useRef<HTMLInputElement>(null);
  const bgMedia = background.type === "media" ? background.media : undefined;

  const pickMedia = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    const { added } = await importFiles([files[0]]);
    const item: MediaItem | undefined = added[0];
    if (!item) {
      return;
    }
    editor.update((d) => ({
      ...d,
      // One media background at a time: replace the previous one.
      assets: [...d.assets.filter((a) => a.id !== bgMedia), item],
      background: { type: "media", media: item.id, dim: 0.2, blur: 0.3 },
      look: undefined,
    }));
  };

  const types: BgType[] = [
    "solid",
    "linear",
    "radial",
    "mesh",
    "media",
    "transparent",
  ];
  const colors = colorsOf(background);

  return (
    <Section title={content.background}>
      <SelectField<BgType>
        label={content.backgroundType}
        value={background.type}
        options={types.map((t) => ({
          value: t,
          label: content.backgroundTypes[t],
        }))}
        onChange={(type) => {
          if (type === "media" && !bgMedia) {
            file.current?.click();
            return;
          }
          onChange(convert(background, type, bgMedia));
        }}
      />
      <input
        ref={file}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          pickMedia(e.target.files);
          e.target.value = "";
        }}
      />
      {background.type === "solid" ? (
        <ColorField
          label={content.color}
          value={background.color}
          onChange={(color) => onChange({ ...background, color }, "color")}
        />
      ) : null}
      {background.type === "linear" ||
      background.type === "radial" ||
      background.type === "mesh" ? (
        <>
          {colors.map((c, i) => (
            <ColorField
              // Stops are positional.
              // oxlint-disable-next-line react/no-array-index-key
              key={i}
              label={content.colorStop({ n: String(i + 1) })}
              value={c}
              onChange={(next) =>
                onChange(
                  {
                    ...background,
                    colors: colors.map((x, j) => (j === i ? next : x)),
                  },
                  `stop${i}`
                )
              }
            />
          ))}
          {background.type !== "mesh" && colors.length < 4 ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() =>
                onChange({
                  ...background,
                  colors: [...colors, colors.at(-1) ?? "#000000"],
                })
              }
            >
              {content.addStop}
            </Button>
          ) : null}
          {background.type !== "mesh" && colors.length > 2 ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() =>
                onChange({ ...background, colors: colors.slice(0, -1) })
              }
            >
              {content.removeStop}
            </Button>
          ) : null}
        </>
      ) : null}
      {background.type === "linear" ? (
        <SliderField
          label={content.angle.value}
          value={background.angle}
          min={0}
          max={360}
          step={1}
          unit="°"
          onChange={(angle) => onChange({ ...background, angle }, "angle")}
        />
      ) : null}
      {background.type === "radial" ? (
        <>
          <SliderField
            label={content.centerX.value}
            value={background.x}
            min={0}
            max={1}
            step={0.01}
            onChange={(x) => onChange({ ...background, x }, "x")}
          />
          <SliderField
            label={content.centerY.value}
            value={background.y}
            min={0}
            max={1}
            step={0.01}
            onChange={(y) => onChange({ ...background, y }, "y")}
          />
        </>
      ) : null}
      {background.type === "mesh" ? (
        <SliderField
          label={content.drift.value}
          value={background.speed}
          min={0}
          max={3}
          step={1}
          unit="×"
          onChange={(speed) => onChange({ ...background, speed }, "speed")}
        />
      ) : null}
      {background.type === "media" ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => file.current?.click()}
          >
            <Upload aria-hidden="true" className="size-3.5" />
            {content.replaceBackground}
          </Button>
          <SliderField
            label={content.dim.value}
            value={background.dim}
            min={0}
            max={1}
            step={0.01}
            onChange={(dim) => onChange({ ...background, dim }, "dim")}
          />
          <SliderField
            label={content.blur.value}
            value={background.blur}
            min={0}
            max={1}
            step={0.01}
            onChange={(blur) => onChange({ ...background, blur }, "blur")}
          />
        </>
      ) : null}
      {background.type === "transparent" ? (
        <p className="text-muted-foreground text-[11px] text-pretty">
          {content.transparentNote}
        </p>
      ) : null}
    </Section>
  );
};
