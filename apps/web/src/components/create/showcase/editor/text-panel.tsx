import { CORNERS, FONTS, SINGLE_WEIGHT_FONTS } from "@motionvideo/engine";
import type { Corner, FontFamily, Overlays } from "@motionvideo/engine";
import { useRef } from "react";
import { useIntlayer } from "react-intlayer";
import { Upload } from "reicon-react/icons/Upload";

import { Button } from "@/components/ui/button";

import {
  ColorField,
  Section,
  SectionSwitch,
  SegmentedField,
  SelectField,
  SliderField,
  TextField,
  ToggleField,
} from "./fields";
import { importFiles } from "./media";
import { editor, useDoc } from "./store";

// Title, corner captions, logo and their in/out animation.

const setOverlay = <K extends keyof Overlays>(
  key: K,
  patch: Partial<Overlays[K]>,
  group?: string
) =>
  editor.update(
    (d) => ({
      ...d,
      overlays: { ...d.overlays, [key]: { ...d.overlays[key], ...patch } },
    }),
    group ? `overlay:${key}:${group}` : undefined
  );

const fontOptions = FONTS.map((f) => ({ value: f, label: f }));

const uploadLogo = async (files: FileList | null) => {
  if (!files?.length) {
    return;
  }
  const { added } = await importFiles([files[0]]);
  const [item] = added;
  if (!item || item.kind !== "image") {
    return;
  }
  editor.update((d) => ({
    ...d,
    assets: [...d.assets.filter((a) => a.id !== d.overlays.logo.media), item],
    overlays: {
      ...d.overlays,
      logo: { ...d.overlays.logo, on: true, media: item.id },
    },
  }));
};

export const TextPanel = () => {
  const content = useIntlayer("create-showcase-editor");
  const doc = useDoc();
  const { title, labels, logo, anim } = doc.overlays;
  const file = useRef<HTMLInputElement>(null);

  const cornerLabels: Record<Corner, string> = {
    tl: content.topLeft.value,
    tr: content.topRight.value,
    bl: content.bottomLeft.value,
    br: content.bottomRight.value,
  };

  return (
    <div className="flex flex-col">
      <Section
        title={content.title}
        aside={
          <SectionSwitch
            label={content.title.value}
            checked={title.on}
            onChange={(on) => setOverlay("title", { on })}
          />
        }
      >
        {title.on ? (
          <>
            <TextField
              label={content.text}
              value={title.text}
              maxLength={140}
              onChange={(text) => setOverlay("title", { text }, "text")}
            />
            <SelectField<FontFamily>
              label={content.font}
              value={title.font}
              options={fontOptions}
              onChange={(font) =>
                setOverlay("title", {
                  font,
                  weight: SINGLE_WEIGHT_FONTS[font] ? 400 : title.weight,
                })
              }
            />
            {SINGLE_WEIGHT_FONTS[title.font] ? null : (
              <SegmentedField
                label={content.weight}
                value={title.weight}
                options={([400, 500, 600, 700] as const).map((w) => ({
                  value: w,
                  label: String(w),
                }))}
                onChange={(weight) => setOverlay("title", { weight })}
              />
            )}
            <SliderField
              label={content.size.value}
              value={title.size}
              min={0.02}
              max={0.3}
              step={0.005}
              onChange={(size) => setOverlay("title", { size }, "size")}
            />
            <SliderField
              label={content.position.value}
              value={title.y}
              min={0}
              max={1}
              step={0.01}
              onChange={(y) => setOverlay("title", { y }, "y")}
            />
            <ColorField
              label={content.color}
              value={title.color}
              onChange={(color) => setOverlay("title", { color }, "color")}
            />
          </>
        ) : null}
      </Section>

      <Section
        title={content.captions}
        aside={
          <SectionSwitch
            label={content.captions.value}
            checked={labels.on}
            onChange={(on) => setOverlay("labels", { on })}
          />
        }
      >
        {labels.on ? (
          <>
            {CORNERS.map((corner) => (
              <TextField
                key={corner}
                label={cornerLabels[corner]}
                value={labels[corner]}
                maxLength={60}
                onChange={(v) => setOverlay("labels", { [corner]: v }, corner)}
              />
            ))}
            <SelectField<FontFamily>
              label={content.font}
              value={labels.font}
              options={fontOptions}
              onChange={(font) => setOverlay("labels", { font })}
            />
            <SliderField
              label={content.size.value}
              value={labels.size}
              min={0.01}
              max={0.06}
              step={0.001}
              onChange={(size) => setOverlay("labels", { size }, "size")}
            />
            <ToggleField
              label={content.autoColor}
              checked={labels.color === "auto"}
              onChange={(auto) =>
                setOverlay("labels", { color: auto ? "auto" : "#ffffff" })
              }
            />
            {labels.color === "auto" ? null : (
              <ColorField
                label={content.color}
                value={labels.color}
                onChange={(color) => setOverlay("labels", { color }, "color")}
              />
            )}
          </>
        ) : null}
      </Section>

      <Section
        title={content.logo}
        aside={
          logo.media ? (
            <SectionSwitch
              label={content.logo.value}
              checked={logo.on}
              onChange={(on) => setOverlay("logo", { on })}
            />
          ) : undefined
        }
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => file.current?.click()}
        >
          <Upload aria-hidden="true" className="size-3.5" />
          {logo.media ? content.replaceLogo : content.uploadLogo}
        </Button>
        <input
          ref={file}
          type="file"
          accept="image/png,image/svg+xml,image/webp,image/jpeg"
          className="hidden"
          onChange={(e) => {
            uploadLogo(e.target.files);
            e.target.value = "";
          }}
        />
        {logo.media && logo.on ? (
          <>
            <SegmentedField<Corner>
              label={content.corner}
              value={logo.corner}
              options={CORNERS.map((c) => ({
                value: c,
                label: c.toUpperCase(),
              }))}
              onChange={(corner) => setOverlay("logo", { corner })}
            />
            <SliderField
              label={content.size.value}
              value={logo.size}
              min={0.04}
              max={0.4}
              step={0.005}
              onChange={(size) => setOverlay("logo", { size }, "size")}
            />
            <SliderField
              label={content.opacity.value}
              value={logo.opacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(opacity) => setOverlay("logo", { opacity }, "opacity")}
            />
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() =>
                editor.update((d) => ({
                  ...d,
                  assets: d.assets.filter(
                    (a) => a.id !== d.overlays.logo.media
                  ),
                  overlays: {
                    ...d.overlays,
                    logo: { ...d.overlays.logo, on: false, media: undefined },
                  },
                }))
              }
            >
              {content.removeLogo}
            </Button>
          </>
        ) : null}
      </Section>

      <Section
        title={content.animateOverlays}
        aside={
          <SectionSwitch
            label={content.animateOverlays.value}
            checked={anim.on}
            onChange={(on) => setOverlay("anim", { on })}
          />
        }
      >
        {anim.on ? (
          <SegmentedField
            label={content.animation}
            value={anim.kind}
            options={[
              { value: "rise", label: content.rise },
              { value: "fade", label: content.fade },
              { value: "blur", label: content.blurIn },
            ]}
            onChange={(kind) => setOverlay("anim", { kind })}
          />
        ) : (
          <p className="text-muted-foreground text-[11px] text-pretty">
            {content.animateNote}
          </p>
        )}
      </Section>
    </div>
  );
};
