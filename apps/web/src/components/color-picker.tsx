import { useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { Pipette } from "reicon-react/icons/Pipette";
import { Plus } from "reicon-react/icons/Plus";
import { Xmark } from "reicon-react/icons/Xmark";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  hexToRgb,
  hsvToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
} from "@/lib/color";
import type { Hsv } from "@/lib/color";
import { Button } from "@/registry/ui/button";

// Chromium's EyeDropper API; not in TypeScript's DOM lib yet.
declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

const DEFAULT_COLOR = "c0737f";
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const percent = (value: number) => Math.round(value * 100);

/**
 * Where a pointer is inside the element it was pressed on, as 0–1 fractions.
 * Pressing captures the pointer, so a drag keeps tracking past the edges.
 */
const dragTo =
  (onMove: (x: number, y: number) => void) =>
  (event: PointerEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (event.type === "pointerdown") {
      element.setPointerCapture(event.pointerId);
      element.focus();
    } else if (!element.hasPointerCapture(event.pointerId)) {
      return;
    }
    const rect = element.getBoundingClientRect();
    onMove(
      clamp((event.clientX - rect.left) / rect.width),
      clamp((event.clientY - rect.top) / rect.height)
    );
  };

/**
 * The colour filter's panel: a saturation/brightness square, a hue bar, the
 * hex field (and the screen eyedropper where the browser has one), then the
 * colours to search for. Each swatch is edited in place; Search applies them
 * all, and searching with none clears the filter.
 */
export const ColorPicker = ({
  colors,
  max,
  onApply,
}: {
  /** The applied colours, normalized hexes. */
  colors: string[];
  max: number;
  onApply: (colors: string[]) => void;
}) => {
  const content = useIntlayer("color-picker");
  const [draft, setDraft] = useState(() =>
    colors.length > 0 ? colors : [DEFAULT_COLOR]
  );
  const [active, setActive] = useState(0);
  // HSV is the picker's own state: a hex can't hold the hue of a grey, so
  // dragging to the left edge and back must not lose it.
  const [hsv, setHsv] = useState<Hsv>(() =>
    rgbToHsv(hexToRgb(draft[0] ?? DEFAULT_COLOR))
  );
  const hex = rgbToHex(hsvToRgb(hsv));
  const [hexText, setHexText] = useState(hex.toUpperCase());
  // The panel only renders in an open popover, so never on the server.
  const canEyedrop = Boolean(window.EyeDropper);

  // The swatch being edited follows the picker; with none left, editing
  // starts a new one.
  const update = (next: Hsv) => {
    const nextHex = rgbToHex(hsvToRgb(next));
    setHsv(next);
    setHexText(nextHex.toUpperCase());
    setDraft((current) =>
      current.length === 0
        ? [nextHex]
        : current.map((color, index) => (index === active ? nextHex : color))
    );
    if (draft.length === 0) {
      setActive(0);
    }
  };
  const updateHex = (value: string) => {
    const next = rgbToHsv(hexToRgb(value));
    // Greys keep the current hue, so the hue bar doesn't jump to red.
    update(next.s === 0 ? { ...next, h: hsv.h } : next);
  };
  const select = (index: number) => {
    setActive(index);
    const next = rgbToHsv(hexToRgb(draft[index]));
    setHsv(next.s === 0 ? { ...next, h: hsv.h } : next);
    setHexText(draft[index].toUpperCase());
  };
  const remove = (index: number) => {
    const next = draft.filter((_, other) => other !== index);
    setDraft(next);
    const nextActive = Math.min(
      active > index ? active - 1 : active,
      next.length - 1
    );
    setActive(Math.max(0, nextActive));
    if (next[nextActive]) {
      setHsv(rgbToHsv(hexToRgb(next[nextActive])));
      setHexText(next[nextActive].toUpperCase());
    }
  };
  // A new swatch starts a third of the way round the wheel from the current
  // one, so it reads as a different colour right away.
  const add = () => {
    const next = { ...hsv, h: (hsv.h + 120) % 360, s: Math.max(hsv.s, 0.5) };
    const nextHex = rgbToHex(hsvToRgb(next));
    setDraft((current) => [...current, nextHex]);
    setActive(draft.length);
    setHsv(next);
    setHexText(nextHex.toUpperCase());
  };
  const eyedrop = async () => {
    if (!window.EyeDropper) {
      return;
    }
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      const picked = normalizeHex(sRGBHex);
      if (picked) {
        updateHex(picked);
      }
    } catch {
      // Cancelled with Escape: keep the current colour.
    }
  };

  // Arrows: left/right saturation, up/down brightness; Shift moves 10%.
  const onShadeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    switch (event.key) {
      case "ArrowLeft": {
        update({ ...hsv, s: clamp(hsv.s - step) });
        break;
      }
      case "ArrowRight": {
        update({ ...hsv, s: clamp(hsv.s + step) });
        break;
      }
      case "ArrowUp": {
        update({ ...hsv, v: clamp(hsv.v + step) });
        break;
      }
      case "ArrowDown": {
        update({ ...hsv, v: clamp(hsv.v - step) });
        break;
      }
      default: {
        return;
      }
    }
    event.preventDefault();
  };
  const shadeDrag = dragTo((x, y) => update({ ...hsv, s: x, v: 1 - y }));

  return (
    <div className="flex w-72 flex-col">
      <div className="flex flex-col gap-3 p-3">
        <div
          // Two-dimensional, which no native input or UI component is.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="slider"
          tabIndex={0}
          aria-label={content.shade.value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent(hsv.s)}
          aria-valuetext={`${content.saturation.value} ${percent(hsv.s)}%, ${content.brightness.value} ${percent(hsv.v)}%`}
          onPointerDown={shadeDrag}
          onPointerMove={shadeDrag}
          onKeyDown={onShadeKey}
          className="focus-visible:ring-ring/50 shadow-outline relative h-40 cursor-crosshair touch-none rounded-lg outline-none focus-visible:ring-3"
          style={{
            backgroundColor: `hsl(${hsv.h} 100% 50%)`,
            backgroundImage:
              "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
          }}
        >
          <span
            className="pointer-events-none absolute size-4 -translate-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_3px_rgb(0_0_0/0.4)]"
            style={{
              left: `${hsv.s * 100}%`,
              top: `${(1 - hsv.v) * 100}%`,
              backgroundColor: `#${hex}`,
            }}
          />
        </div>
        {/* The shared slider, restyled as a hue bar: rainbow track, no fill,
            thumb in the current hue. */}
        <Slider
          label={content.hue.value}
          min={0}
          max={360}
          value={Math.round(hsv.h)}
          onValueChange={(value) =>
            update({ ...hsv, h: Array.isArray(value) ? value[0] : value })
          }
          className="**:data-[slot=slider-range]:hidden **:data-[slot=slider-thumb]:size-5 **:data-[slot=slider-thumb]:bg-(--hue) **:data-[slot=slider-track]:h-3 **:data-[slot=slider-track]:bg-[linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]"
          // SAFETY: `--hue` is a CSS custom property read by the thumb class.
          style={{ "--hue": `hsl(${hsv.h} 100% 50%)` } as CSSProperties}
        />
        <InputGroup className="h-10">
          {/* The current colour as the field's inline-start icon: icon-sized,
              like the eyedropper at the other end. */}
          <InputGroupAddon align="inline-start">
            <span
              aria-hidden="true"
              className="shadow-outline size-4 shrink-0 rounded-full"
              style={{ backgroundColor: `#${hex}` }}
            />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={content.hex.value}
            value={hexText}
            onChange={(event) => {
              setHexText(event.target.value);
              // Only full six-digit hexes apply while typing: three digits
              // are also valid, but are usually the start of six.
              if (/^#?[\da-f]{6}$/iu.test(event.target.value.trim())) {
                updateHex(normalizeHex(event.target.value) ?? hex);
              }
            }}
            onBlur={() => {
              const value = normalizeHex(hexText);
              if (value && value !== hex) {
                updateHex(value);
              } else {
                setHexText(hex.toUpperCase());
              }
            }}
            spellCheck={false}
            autoComplete="off"
            maxLength={7}
            className="font-mono uppercase"
          />
          {canEyedrop && (
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      size="icon-sm"
                      aria-label={content.eyedropper.value}
                      onClick={eyedrop}
                    />
                  }
                >
                  <Pipette aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>{content.eyedropper}</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          )}
        </InputGroup>
        <ul
          aria-label={content.colors.value}
          className="flex flex-wrap items-center gap-3"
        >
          {draft.map((color, index) => (
            // Swatches can repeat a colour, so the index is the identity.
            // oxlint-disable-next-line react/no-array-index-key
            <li key={index} className="relative">
              <Button
                variant="outline"
                size="icon-xl"
                aria-label={`${content.edit.value} #${color.toUpperCase()}`}
                aria-pressed={index === active}
                onClick={() => select(index)}
                className="aria-pressed:ring-foreground aria-pressed:ring-offset-popover aria-pressed:ring-2 aria-pressed:ring-offset-2"
                style={{ backgroundColor: `#${color}` }}
              />
              <Button
                variant="outline"
                size="icon-xs"
                aria-label={`${content.remove.value} #${color.toUpperCase()}`}
                onClick={() => remove(index)}
                className="absolute -top-2 -right-2 rounded-full"
              >
                <Xmark aria-hidden="true" />
              </Button>
            </li>
          ))}
          {draft.length < max && (
            <li>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xl"
                      aria-label={content.add.value}
                      onClick={add}
                    />
                  }
                >
                  <Plus aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>{content.add}</TooltipContent>
              </Tooltip>
            </li>
          )}
        </ul>
      </div>
      <Separator />
      <div className="flex gap-2 p-3">
        {colors.length > 0 && (
          <Button variant="secondary" size="lg" onClick={() => onApply([])}>
            {content.clear}
          </Button>
        )}
        <Button size="lg" className="flex-1" onClick={() => onApply(draft)}>
          {content.search}
        </Button>
      </div>
    </div>
  );
};
