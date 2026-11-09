import {
  allParams,
  getTemplate,
  resolveParams,
  showcaseTiming,
} from "@motionvideo/engine";
import type { ParamDef } from "@motionvideo/engine";
import { useIntlayer } from "react-intlayer";
import { Shuffle } from "reicon-react/icons/Shuffle";

import { Button } from "@/components/ui/button";

import {
  Section,
  SegmentedField,
  SelectField,
  SliderField,
  ToggleField,
} from "./fields";
import { useParamLabels } from "./param-labels";
import { editor, useDoc } from "./store";

// The current template's controls, clip length and media order.

const ParamControl = ({
  def,
  value,
}: {
  def: ParamDef;
  value: number | string | boolean;
}) => {
  const labels = useParamLabels();
  const label = labels.label(def);
  const set = (next: number | string | boolean) =>
    editor.update(
      (d) => ({ ...d, params: { ...d.params, [def.key]: next } }),
      `param:${def.key}`
    );
  if (def.type === "range") {
    return (
      <SliderField
        label={label}
        value={Number(value)}
        min={def.min}
        max={def.max}
        step={def.step}
        unit={def.unit}
        onChange={set}
      />
    );
  }
  if (def.type === "select") {
    return (
      <SelectField
        label={label}
        value={String(value)}
        options={def.options.map((o) => ({
          value: o.value,
          label: labels.option(o.value, o.label),
        }))}
        onChange={set}
      />
    );
  }
  return <ToggleField label={label} checked={Boolean(value)} onChange={set} />;
};

export const ControlsPanel = () => {
  const content = useIntlayer("create-showcase-editor");
  const doc = useDoc();
  const template = getTemplate(doc.template);
  const params = resolveParams(template, doc.params);
  const timing = showcaseTiming(doc);
  const custom = doc.timing.seconds !== undefined;

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-1">
        <p className="text-sm font-medium">{template.name}</p>
        <p className="text-muted-foreground mt-0.5 text-xs text-pretty">
          {template.description}
        </p>
      </div>
      <Section title={content.motion}>
        {allParams(template).map((def) => (
          <ParamControl key={def.key} def={def} value={params[def.key]} />
        ))}
      </Section>
      <Section title={content.length}>
        <SegmentedField
          label={content.lengthMode}
          value={custom ? "custom" : "loops"}
          options={[
            { value: "loops", label: content.loopsMode },
            { value: "custom", label: content.customLength },
          ]}
          onChange={(mode) =>
            editor.update((d) => ({
              ...d,
              timing:
                mode === "custom"
                  ? {
                      loops: d.timing.loops,
                      seconds: Math.round(showcaseTiming(d).seconds),
                    }
                  : { loops: d.timing.loops },
            }))
          }
        />
        {custom ? (
          <SliderField
            label={content.seconds.value}
            value={doc.timing.seconds ?? timing.seconds}
            min={1}
            max={60}
            step={0.5}
            unit=" s"
            onChange={(seconds) =>
              editor.update(
                (d) => ({ ...d, timing: { ...d.timing, seconds } }),
                "timing:seconds"
              )
            }
          />
        ) : (
          <SegmentedField
            label={content.loopCount}
            value={doc.timing.loops}
            options={[1, 2, 3, 4].map((n) => ({ value: n, label: `${n}×` }))}
            onChange={(loops) =>
              editor.update((d) => ({ ...d, timing: { loops } }))
            }
          />
        )}
        <p className="text-muted-foreground text-[11px] text-pretty">
          {content.lengthNote({
            seconds: timing.seconds.toFixed(1),
            loops: String(timing.loops),
          })}
        </p>
      </Section>
      <Section title={content.order}>
        <SegmentedField
          label={content.mediaOrder}
          value={doc.mediaOrder}
          options={[
            { value: "in-order", label: content.inOrder },
            { value: "shuffle", label: content.shuffled },
          ]}
          onChange={(mediaOrder) =>
            editor.update((d) => ({ ...d, mediaOrder }))
          }
        />
        {doc.mediaOrder === "shuffle" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.update((d) => ({ ...d, seed: d.seed + 1 }))}
          >
            <Shuffle aria-hidden="true" className="size-3.5" />
            {content.reshuffle}
          </Button>
        ) : null}
      </Section>
    </div>
  );
};
