import {
  applyLook,
  ASPECT_IDS,
  CARD_RATIOS,
  DEVICE_FRAMES,
  LOOK_IDS,
  SOCIAL_PRESETS,
} from "@motionvideo/engine";
import type {
  Aspect,
  Background,
  CardRatio,
  DeviceFrame,
  ShowcaseDoc,
  SocialPreset,
  Style,
} from "@motionvideo/engine";
import { useIntlayer } from "react-intlayer";

import { cn } from "@/lib/utils";

import { BackgroundSection } from "./background-section";
import {
  ColorField,
  Section,
  SegmentedField,
  SelectField,
  SectionSwitch,
  SliderField,
  ToggleField,
} from "./fields";
import { editor, useDoc } from "./store";

// The shared look every template draws with: frame, one-click looks, cards,
// shadow, light, depth of field, camera, background and finish.

type StyleKey = keyof Style;

/** Updates one field of one style section; slider drags merge into one undo step. */
const setStyle = <K extends StyleKey>(
  section: K,
  patch: Partial<Style[K]>,
  group?: string
) =>
  editor.update(
    (d) => ({
      ...d,
      look: undefined,
      style: { ...d.style, [section]: { ...d.style[section], ...patch } },
    }),
    group ? `style:${section}:${group}` : undefined
  );

const setAspect = (aspect: Aspect) =>
  editor.update((d) => ({ ...d, frame: { aspect } }));

const setSocial = (social: SocialPreset | "none") =>
  editor.update((d): ShowcaseDoc =>
    social === "none"
      ? { ...d, frame: { aspect: d.frame.aspect } }
      : { ...d, frame: { aspect: SOCIAL_PRESETS[social].aspect, social } }
  );

// SAFETY: Object.keys of a const object literal lists exactly its keys.
const SOCIAL_IDS = Object.keys(SOCIAL_PRESETS) as SocialPreset[];
// SAFETY: Object.keys of a const object literal lists exactly its keys.
const RATIO_IDS = Object.keys(CARD_RATIOS) as CardRatio[];

export const VisualPanel = () => {
  const content = useIntlayer("create-showcase-editor");
  const doc = useDoc();
  const { style } = doc;

  return (
    <div className="flex flex-col">
      <Section title={content.frame}>
        <SelectField
          label={content.aspect}
          value={doc.frame.aspect}
          options={ASPECT_IDS.map((a) => ({
            value: a,
            label: a.replace(":", " : "),
          }))}
          onChange={setAspect}
        />
        <SelectField<SocialPreset | "none">
          label={content.socialPreset}
          value={doc.frame.social ?? "none"}
          options={[
            { value: "none", label: content.noPreset },
            ...SOCIAL_IDS.map((id) => ({
              value: id,
              label: content.socials[id],
            })),
          ]}
          onChange={setSocial}
        />
        {doc.frame.social && SOCIAL_PRESETS[doc.frame.social].safe ? (
          <p className="text-muted-foreground text-[11px]">
            {content.safeZoneNote}
          </p>
        ) : null}
      </Section>

      <Section title={content.looks}>
        <div className="grid grid-cols-3 gap-1.5">
          {LOOK_IDS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={doc.look === id}
              onClick={() => editor.update((d) => applyLook(d, id))}
              className={cn(
                "h-8 rounded-md border text-xs transition-colors",
                doc.look === id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {content.lookNames[id]}
            </button>
          ))}
        </div>
        <ToggleField
          label={content.keepLook}
          checked={doc.keepLook}
          onChange={(keepLook) => editor.update((d) => ({ ...d, keepLook }))}
        />
      </Section>

      <Section title={content.cards}>
        <SelectField<DeviceFrame>
          label={content.deviceFrame}
          value={style.cards.frame}
          options={DEVICE_FRAMES.map((f) => ({
            value: f,
            label: content.frames[f],
          }))}
          onChange={(frame) => setStyle("cards", { frame })}
        />
        {style.cards.frame === "none" ? null : (
          <SegmentedField
            label={content.frameTone}
            value={style.cards.frameTone}
            options={[
              { value: "light", label: content.light },
              { value: "dark", label: content.dark },
            ]}
            onChange={(frameTone) => setStyle("cards", { frameTone })}
          />
        )}
        <SelectField<CardRatio>
          label={content.cardRatio}
          value={style.cards.ratio}
          options={RATIO_IDS.map((r) => ({
            value: r,
            label: r === "auto" ? content.auto : r.replace(":", " : "),
          }))}
          onChange={(ratio) => setStyle("cards", { ratio })}
        />
        <SliderField
          label={content.radius.value}
          value={style.cards.radius}
          min={0}
          max={0.5}
          step={0.01}
          onChange={(radius) => setStyle("cards", { radius }, "radius")}
        />
        <SliderField
          label={content.border.value}
          value={style.cards.border}
          min={0}
          max={0.06}
          step={0.002}
          onChange={(border) => setStyle("cards", { border }, "border")}
        />
        {style.cards.border > 0 ? (
          <ColorField
            label={content.borderColor}
            value={style.cards.borderColor}
            onChange={(borderColor) =>
              setStyle("cards", { borderColor }, "borderColor")
            }
          />
        ) : null}
        <SliderField
          label={content.brightness.value}
          value={style.cards.brightness}
          min={0.4}
          max={1.6}
          step={0.01}
          onChange={(brightness) =>
            setStyle("cards", { brightness }, "brightness")
          }
        />
        <SegmentedField
          label={content.cardBack}
          value={style.cards.back}
          options={[
            { value: "mirror", label: content.mirror },
            { value: "color", label: content.solidColor },
          ]}
          onChange={(back) => setStyle("cards", { back })}
        />
        {style.cards.back === "color" ? (
          <ColorField
            label={content.backColor}
            value={style.cards.backColor}
            onChange={(backColor) =>
              setStyle("cards", { backColor }, "backColor")
            }
          />
        ) : null}
      </Section>

      <Section
        title={content.shadow}
        aside={
          <SectionSwitch
            checked={style.shadow.on}
            label={content.shadow.value}
            onChange={(on) => setStyle("shadow", { on })}
          />
        }
      >
        {style.shadow.on ? (
          <>
            <SliderField
              label={content.opacity.value}
              value={style.shadow.opacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(opacity) => setStyle("shadow", { opacity }, "opacity")}
            />
            <SliderField
              label={content.softness.value}
              value={style.shadow.softness}
              min={0}
              max={1}
              step={0.01}
              onChange={(softness) =>
                setStyle("shadow", { softness }, "softness")
              }
            />
            <SliderField
              label={content.offset.value}
              value={style.shadow.offset}
              min={0}
              max={1}
              step={0.01}
              onChange={(offset) => setStyle("shadow", { offset }, "offset")}
            />
            <ColorField
              label={content.color}
              value={style.shadow.color}
              onChange={(color) => setStyle("shadow", { color }, "color")}
            />
          </>
        ) : null}
      </Section>

      <Section
        title={content.lighting}
        aside={
          <SectionSwitch
            checked={style.light.on}
            label={content.lighting.value}
            onChange={(on) => setStyle("light", { on })}
          />
        }
      >
        {style.light.on ? (
          <>
            <SliderField
              label={content.shade.value}
              value={style.light.shade}
              min={0}
              max={1}
              step={0.01}
              onChange={(shade) => setStyle("light", { shade }, "shade")}
            />
            <SliderField
              label={content.glare.value}
              value={style.light.glare}
              min={0}
              max={1}
              step={0.01}
              onChange={(glare) => setStyle("light", { glare }, "glare")}
            />
            <ToggleField
              label={content.glareSweep}
              checked={style.light.sweep}
              onChange={(sweep) => setStyle("light", { sweep })}
            />
          </>
        ) : null}
      </Section>

      <Section
        title={content.depth}
        aside={
          <SectionSwitch
            checked={style.depth.on}
            label={content.depth.value}
            onChange={(on) => setStyle("depth", { on })}
          />
        }
      >
        {style.depth.on ? (
          <>
            <SliderField
              label={content.amount.value}
              value={style.depth.amount}
              min={0}
              max={1}
              step={0.01}
              onChange={(amount) => setStyle("depth", { amount }, "amount")}
            />
            <SliderField
              label={content.focus.value}
              value={style.depth.focus}
              min={0}
              max={1}
              step={0.01}
              onChange={(focus) => setStyle("depth", { focus }, "focus")}
            />
          </>
        ) : null}
      </Section>

      <Section title={content.camera} defaultOpen={false}>
        <SliderField
          label={content.fov.value}
          value={style.camera.fov}
          min={10}
          max={80}
          step={1}
          unit="°"
          onChange={(fov) => setStyle("camera", { fov }, "fov")}
        />
        <SliderField
          label={content.zoom.value}
          value={style.camera.zoom}
          min={0.4}
          max={2.5}
          step={0.01}
          unit="×"
          onChange={(zoom) => setStyle("camera", { zoom }, "zoom")}
        />
        <SliderField
          label={content.orbit.value}
          value={style.camera.orbit}
          min={-60}
          max={60}
          step={1}
          unit="°"
          onChange={(orbit) => setStyle("camera", { orbit }, "orbit")}
        />
        <SliderField
          label={content.tilt.value}
          value={style.camera.tilt}
          min={-45}
          max={45}
          step={1}
          unit="°"
          onChange={(tilt) => setStyle("camera", { tilt }, "tilt")}
        />
        <SliderField
          label={content.drift.value}
          value={style.camera.drift}
          min={0}
          max={1}
          step={0.01}
          onChange={(drift) => setStyle("camera", { drift }, "drift")}
        />
      </Section>

      <BackgroundSection
        background={doc.background}
        onChange={(background: Background, group?: string) =>
          editor.update(
            (d) => ({ ...d, background, look: undefined }),
            group ? `background:${group}` : undefined
          )
        }
      />

      <Section title={content.finish} defaultOpen={false}>
        <SliderField
          label={content.exposure.value}
          value={style.finish.exposure}
          min={0.5}
          max={1.5}
          step={0.01}
          onChange={(exposure) => setStyle("finish", { exposure }, "exposure")}
        />
        <SliderField
          label={content.contrast.value}
          value={style.finish.contrast}
          min={0.5}
          max={1.5}
          step={0.01}
          onChange={(contrast) => setStyle("finish", { contrast }, "contrast")}
        />
        <SliderField
          label={content.saturation.value}
          value={style.finish.saturation}
          min={0}
          max={2}
          step={0.01}
          onChange={(saturation) =>
            setStyle("finish", { saturation }, "saturation")
          }
        />
        <SliderField
          label={content.bloom.value}
          value={style.finish.bloom}
          min={0}
          max={1}
          step={0.01}
          onChange={(bloom) => setStyle("finish", { bloom }, "bloom")}
        />
        <SliderField
          label={content.vignette.value}
          value={style.finish.vignette}
          min={0}
          max={1}
          step={0.01}
          onChange={(vignette) => setStyle("finish", { vignette }, "vignette")}
        />
        <SliderField
          label={content.grain.value}
          value={style.finish.grain}
          min={0}
          max={1}
          step={0.01}
          onChange={(grain) => setStyle("finish", { grain }, "grain")}
        />
      </Section>
    </div>
  );
};
