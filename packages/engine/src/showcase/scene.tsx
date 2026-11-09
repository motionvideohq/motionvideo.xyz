import { useThree } from "@react-three/fiber";
import { Matrix4, PerspectiveCamera, Vector3 } from "three";

import { Card } from "../kit/card.tsx";
import type { CardLook } from "../kit/card.tsx";
import { FRAME_RATIOS, frameBox } from "../kit/frames.ts";
import { TAU, clamp01, deg, shuffled, wrap } from "../kit/math.ts";
import { Post } from "../kit/post.tsx";
import type { TextureMap } from "../kit/textures.tsx";
import { useVideoTextures } from "../kit/textures.tsx";
import type { DeviceFrame } from "../schema/common.ts";
import { resolveParams } from "./registry.ts";
import { CARD_RATIOS } from "./schema.ts";
import type { ShowcaseDoc, Style } from "./schema.ts";
import type { CardPose, LayoutContext, TemplateDef } from "./types.ts";

const scratch = new Vector3();
const viewMatrix = new Matrix4();

/** Card width / height for the current style and template. */
const cardRatio = (style: Style, template: TemplateDef) => {
  const fixed = CARD_RATIOS[style.cards.ratio];
  if (fixed) {
    return fixed;
  }
  const { frame } = style.cards;
  return frame === "none"
    ? CARD_RATIOS[template.cardRatio]
    : FRAME_RATIOS[frame];
};

/** Places the camera: template field of view, then zoom, orbit, tilt, drift. */
const placeCamera = (
  camera: PerspectiveCamera,
  style: Style,
  p: number,
  aspect: number
) => {
  const { fov, zoom, orbit, tilt, drift } = style.camera;
  // At distance d the z = 0 plane shows exactly 2 units of height.
  const d = 1 / Math.tan(deg(fov) / 2) / zoom;
  const yaw = deg(orbit) + drift * deg(7) * Math.sin(TAU * p);
  const pitch = deg(tilt) + drift * deg(3.5) * Math.sin(TAU * p * 2);
  camera.fov = fov;
  camera.aspect = aspect;
  camera.near = 0.01;
  camera.far = 200;
  camera.position.set(
    d * Math.sin(yaw) * Math.cos(pitch),
    d * Math.sin(pitch),
    d * Math.cos(yaw) * Math.cos(pitch)
  );
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
};

export const ShowcaseScene = ({
  doc,
  template,
  images,
  progress,
  frame,
}: {
  doc: ShowcaseDoc;
  template: TemplateDef;
  images: TextureMap;
  progress: number;
  frame: number;
}) => {
  const videos = useVideoTextures();
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const aspect = size.width / size.height;
  const { style } = doc;

  if (camera instanceof PerspectiveCamera) {
    placeCamera(camera, style, progress, aspect);
  }

  const params = resolveParams(template, doc.params);
  const ratio = cardRatio(style, template);
  const cardH = template.cardHeight;
  const ctx: LayoutContext = {
    n: Number(params.count),
    p: progress,
    dir: params.direction === "backward" ? -1 : 1,
    params,
    frameW: 2 * aspect,
    frameH: 2,
    cardW: cardH * ratio,
    cardH,
    seed: doc.seed,
  };
  const poses: CardPose[] = template.layout(ctx);

  const { media } = doc;
  const order =
    doc.mediaOrder === "shuffle"
      ? shuffled(media.length, doc.seed)
      : media.map((_, i) => i);

  // Depth of field: blur by distance from the focus plane, measured between
  // the nearest and farthest card in view space.
  viewMatrix.copy(camera.matrixWorldInverse);
  const depths = poses.map(
    (pose) => scratch.set(...pose.position).applyMatrix4(viewMatrix).z
  );
  const near = Math.max(...depths);
  const far = Math.min(...depths);
  const span = Math.max(1e-3, near - far);

  const { light } = style;
  const look = (kind: DeviceFrame): CardLook => ({
    radius: style.cards.radius,
    border: style.cards.border,
    borderColor: style.cards.borderColor,
    back: style.cards.back,
    backColor: style.cards.backColor,
    brightness: style.cards.brightness,
    frame: kind,
    dark: style.cards.frameTone === "dark",
    shade: light.on ? light.shade : 0,
    glare: light.on ? light.glare : 0,
    shadow: style.shadow.on ? style.shadow : null,
  });

  // A tall screenshot set to scroll pans down and back up once per loop.
  const scrollFocus = 0.5 - 0.5 * Math.cos(TAU * progress);
  // A sweeping glare crosses each card twice per loop, off-card at the wrap.
  const sweepGlare = wrap(progress * 2, 1) * 3 - 1.5;
  const center = { x: 0.5, y: 0.5 };
  const depthBlur = (i: number) =>
    style.depth.on
      ? style.depth.amount *
        Math.abs((near - depths[i]) / span - style.depth.focus)
      : 0;

  return (
    <>
      {poses.map((pose, i) => {
        const slot = pose.media ?? i;
        const item =
          media.length > 0 ? media[order[wrap(slot, media.length)]] : undefined;
        const textures = item?.kind === "image" ? images : videos;
        const map = item ? textures[item.id] : undefined;
        const frameKind = item?.frame ?? style.cards.frame;
        const scale = pose.scale ?? 1;
        const [sx, sy] = pose.stretch ?? [1, 1];
        const w = ctx.cardW * scale * sx;
        const h = cardH * scale * sy;
        const rot = pose.rotation ?? [0, 0, 0];
        return (
          <Card
            // Poses are positional: card i is always slot i of the layout.
            key={i}
            position={pose.position}
            rotation={rot}
            size={[w, h]}
            box={frameBox(frameKind, w, h)}
            opacity={pose.opacity ?? 1}
            brightness={pose.brightness ?? 1}
            blur={clamp01(depthBlur(i) + (pose.blur ?? 0))}
            glarePos={
              light.sweep
                ? sweepGlare
                : -Math.sin(rot[1]) * 0.9 -
                  (pose.position[0] / ctx.frameW) * 0.6
            }
            order={pose.order ?? 0}
            item={item}
            map={map}
            focus={
              item?.scroll
                ? { x: item.focus.x, y: scrollFocus }
                : (item?.focus ?? center)
            }
            look={look(frameKind)}
          />
        );
      })}
      <Post
        background={doc.background}
        backgroundMap={
          doc.background.type === "media"
            ? (images[doc.background.media] ?? videos[doc.background.media])
            : undefined
        }
        finish={style.finish}
        progress={progress}
        frame={frame}
      />
    </>
  );
};
