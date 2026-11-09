import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  DoubleSide,
  FrontSide,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector4,
} from "three";
import type { Mesh, ShaderMaterialParameters, Texture } from "three";

import type { DeviceFrame, MediaItem } from "../schema/common.ts";
import { CARD_FRAGMENT, CARD_VERTEX, SHADOW_FRAGMENT } from "./card-shader.ts";
import { FRAME_IDS } from "./frames.ts";

// One card: the media in its frame, plus an optional soft shadow behind it.
// Each card owns its materials; their uniforms are updated after every
// render, so scrubbing never recompiles shaders.

const PLANE = new PlaneGeometry(1, 1, 1, 1);

export interface CardLook {
  radius: number;
  border: number;
  borderColor: string;
  back: "mirror" | "color";
  backColor: string;
  brightness: number;
  frame: DeviceFrame;
  dark: boolean;
  shade: number;
  glare: number;
  shadow: null | {
    opacity: number;
    softness: number;
    offset: number;
    color: string;
  };
}

export interface CardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  /** Card size in world units. */
  size: [number, number];
  /** The device's box inside the card (see frameBox). */
  box: [number, number];
  opacity: number;
  brightness: number;
  blur: number;
  glarePos: number;
  order: number;
  item: MediaItem | undefined;
  map: { texture: Texture; width: number; height: number } | undefined;
  /** Focal point after scroll animation is applied. */
  focus: { x: number; y: number };
  look: CardLook;
}

type Uniforms = ShaderMaterial["uniforms"];

const cardUniforms = () => ({
  uMap: { value: null },
  uHasMap: { value: 0 },
  uMapSize: { value: new Vector2(1, 1) },
  uCrop: { value: new Vector4(0, 0, 1, 1) },
  uFit: { value: 0 },
  uFocus: { value: new Vector2(0.5, 0.5) },
  uCard: { value: new Vector2(1, 1) },
  uBox: { value: new Vector2(1, 1) },
  uFrame: { value: 0 },
  uDark: { value: 0 },
  uRadius: { value: 0 },
  uBorder: { value: 0 },
  uBorderColor: { value: new Color() },
  uBrightness: { value: 1 },
  uOpacity: { value: 1 },
  uBackMode: { value: 0 },
  uBackColor: { value: new Color() },
  uMatColor: { value: new Color() },
  uShade: { value: 0 },
  uGlare: { value: 0 },
  uGlarePos: { value: 0 },
  uBlur: { value: 0 },
});

const shadowUniforms = () => ({
  uPlane: { value: new Vector2(1, 1) },
  uBox: { value: new Vector2(1, 1) },
  uRadius: { value: 0 },
  uSoft: { value: 0.05 },
  uOpacity: { value: 0.3 },
  uColor: { value: new Color() },
});

/** The shader material on a mesh, once R3F has attached it. */
const shaderOf = (mesh: Mesh | null) =>
  mesh?.material instanceof ShaderMaterial ? mesh.material : null;

const setMedia = (u: Uniforms, { map, item, focus }: CardProps) => {
  const crop = item?.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  u.uMap.value = map?.texture ?? null;
  u.uHasMap.value = map ? 1 : 0;
  u.uMapSize.value.set(map?.width ?? 1, map?.height ?? 1);
  u.uCrop.value.set(crop.x, crop.y, crop.w, crop.h);
  u.uFit.value = item?.fit === "contain" ? 1 : 0;
  u.uFocus.value.set(focus.x, focus.y);
};

const setLook = (u: Uniforms, props: CardProps) => {
  const { look, size, box } = props;
  u.uCard.value.set(size[0], size[1]);
  u.uBox.value.set(box[0], box[1]);
  u.uFrame.value = FRAME_IDS[look.frame];
  u.uDark.value = look.dark ? 1 : 0;
  u.uRadius.value = look.radius;
  u.uBorder.value = look.border;
  u.uBorderColor.value.set(look.borderColor);
  u.uBrightness.value = look.brightness * props.brightness;
  u.uOpacity.value = props.opacity;
  u.uBackMode.value = look.back === "color" ? 1 : 0;
  u.uBackColor.value.set(look.backColor);
  u.uMatColor.value.set(look.dark ? "#18181b" : "#f4f4f5");
  u.uShade.value = look.shade;
  u.uGlare.value = look.glare;
  u.uGlarePos.value = props.glarePos;
  u.uBlur.value = props.blur;
};

/** Shadow blur radius in world units for a card whose short side is `short`. */
const softnessOf = (look: CardLook, short: number) =>
  look.shadow ? 0.02 + look.shadow.softness * 0.16 * short : 0;

const setShadow = (u: Uniforms, { look, box, opacity }: CardProps) => {
  if (!look.shadow) {
    return;
  }
  const short = Math.min(box[0], box[1]);
  const soft = softnessOf(look, short);
  u.uPlane.value.set(box[0] + soft * 4, box[1] + soft * 4);
  u.uBox.value.set(box[0], box[1]);
  u.uRadius.value =
    look.frame === "phone" ? 0.15 * box[0] : look.radius * short;
  u.uSoft.value = soft;
  u.uOpacity.value = look.shadow.opacity * opacity;
  u.uColor.value.set(look.shadow.color);
};

export const Card = (props: CardProps) => {
  const { position, rotation, size, box, order, look } = props;
  const cardMesh = useRef<Mesh>(null);
  const shadowMesh = useRef<Mesh>(null);
  // Material arguments must keep their identity: R3F rebuilds a material
  // whenever its `args` change.
  const cardArgs = useMemo(
    (): [ShaderMaterialParameters] => [
      {
        vertexShader: CARD_VERTEX,
        fragmentShader: CARD_FRAGMENT,
        uniforms: cardUniforms(),
      },
    ],
    []
  );
  const shadowArgs = useMemo(
    (): [ShaderMaterialParameters] => [
      {
        vertexShader: CARD_VERTEX,
        fragmentShader: SHADOW_FRAGMENT,
        uniforms: shadowUniforms(),
      },
    ],
    []
  );

  // After every render, before the canvas draws this frame (layout effects
  // run ahead of the frame renderer's effect).
  useLayoutEffect(() => {
    const card = shaderOf(cardMesh.current);
    if (card) {
      setMedia(card.uniforms, props);
      setLook(card.uniforms, props);
    }
    const shadow = shaderOf(shadowMesh.current);
    if (shadow) {
      setShadow(shadow.uniforms, props);
    }
  });

  const [w, h] = size;
  const soft = softnessOf(look, Math.min(box[0], box[1]));
  return (
    <group position={position} rotation={rotation}>
      {look.shadow ? (
        <mesh
          ref={shadowMesh}
          geometry={PLANE}
          renderOrder={order - 0.5}
          position={[0, -look.shadow.offset * 0.12 * h, -0.002 * h]}
          scale={[box[0] + soft * 4, box[1] + soft * 4, 1]}
        >
          <shaderMaterial
            args={shadowArgs}
            transparent
            depthWrite={false}
            side={FrontSide}
          />
        </mesh>
      ) : null}
      <mesh
        ref={cardMesh}
        geometry={PLANE}
        renderOrder={order}
        scale={[w, h, 1]}
      >
        <shaderMaterial args={cardArgs} transparent side={DoubleSide} />
      </mesh>
    </group>
  );
};
