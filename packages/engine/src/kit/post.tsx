import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import {
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from "three";
import type { Texture } from "three";

import type { Background } from "../schema/common.ts";

// The cards render into an offscreen target; this pass composites them over
// the background (solid, gradients, mesh, media or transparent) and applies
// the finish: exposure, contrast, saturation, bloom, vignette and grain.
// Doing it in one shader keeps every background exportable, including the
// ones CSS can't express in Remotion's browser renderer.

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = `
uniform sampler2D uScene;
uniform int uBgType;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform int uCount;
uniform float uAngle;
uniform vec2 uCenter;
uniform float uPhase;
uniform sampler2D uBgMap;
uniform float uHasBgMap;
uniform vec2 uBgMapSize;
uniform float uBgDim;
uniform float uBgBlur;
uniform vec2 uRes;
uniform float uExposure;
uniform float uContrast;
uniform float uSaturation;
uniform float uBloom;
uniform float uVignette;
uniform float uGrain;
uniform float uFrame;

varying vec2 vUv;

vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  if (uCount <= 2) return mix(uC0, uC1, t);
  if (uCount == 3) {
    return t < 0.5 ? mix(uC0, uC1, t * 2.0) : mix(uC1, uC2, t * 2.0 - 1.0);
  }
  float s = t * 3.0;
  if (s < 1.0) return mix(uC0, uC1, s);
  if (s < 2.0) return mix(uC1, uC2, s - 1.0);
  return mix(uC2, uC3, s - 2.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

vec4 background(vec2 uv) {
  float aspect = uRes.x / uRes.y;
  if (uBgType == 0) return vec4(uC0, 1.0);
  if (uBgType == 1) {
    vec2 d = vec2(cos(uAngle), sin(uAngle));
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float half_ = 0.5 * (abs(d.x) * aspect + abs(d.y));
    return vec4(ramp(dot(p, d) / (2.0 * half_) + 0.5), 1.0);
  }
  if (uBgType == 2) {
    vec2 p = (uv - uCenter) * vec2(aspect, 1.0);
    return vec4(ramp(length(p) / 0.9), 1.0);
  }
  if (uBgType == 3) {
    // Mesh: four colour points drifting on closed paths, so the loop is seamless.
    vec2 p = uv * vec2(aspect, 1.0);
    vec3 acc = vec3(0.0);
    float wsum = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      vec2 base = vec2(mod(fi, 2.0), floor(fi / 2.0)) * vec2(aspect, 1.0) * 0.8 + vec2(aspect, 1.0) * 0.1;
      vec2 c = base + 0.18 * vec2(cos(uPhase + fi * 1.7), sin(uPhase * (fi < 2.0 ? 1.0 : -1.0) + fi * 2.3));
      float w = 1.0 / pow(length(p - c) + 0.08, 2.4);
      vec3 col = i == 0 ? uC0 : i == 1 ? uC1 : i == 2 ? uC2 : uC3;
      acc += col * w;
      wsum += w;
    }
    return vec4(acc / wsum, 1.0);
  }
  if (uBgType == 4) {
    if (uHasBgMap < 0.5) return vec4(uC0, 1.0);
    float ta = uBgMapSize.x / uBgMapSize.y;
    vec2 scale = ta > aspect ? vec2(aspect / ta, 1.0) : vec2(1.0, ta / aspect);
    vec2 t = (uv - 0.5) * scale + 0.5;
    vec3 c = texture2D(uBgMap, t, uBgBlur * 8.0).rgb;
    return vec4(c * (1.0 - uBgDim), 1.0);
  }
  return vec4(0.0);
}

void main() {
  vec4 scene = texture2D(uScene, vUv);
  vec4 bg = background(vUv);
  // The scene target holds premultiplied colour.
  vec3 c = scene.rgb + bg.rgb * bg.a * (1.0 - scene.a);
  float a = scene.a + bg.a * (1.0 - scene.a);

  if (uBloom > 0.0) {
    vec3 glow = texture2D(uScene, vUv, 4.0).rgb + texture2D(uScene, vUv, 6.0).rgb;
    c += max(glow * 0.5 - 0.45, 0.0) * uBloom * 1.6;
  }
  c *= uExposure;
  c = (c - 0.5) * uContrast + 0.5;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, uSaturation);
  if (uVignette > 0.0) {
    vec2 q = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    c *= 1.0 - uVignette * smoothstep(0.35, 1.05, length(q));
  }
  if (uGrain > 0.0) {
    float n = hash(vUv * uRes + mod(uFrame, 61.0) * 17.31) - 0.5;
    c += n * uGrain * 0.22 * a;
  }
  // Premultiplied output: transparent exports keep soft card edges.
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), a);
}
`;

const BG_TYPES: Record<Background["type"], number> = {
  solid: 0,
  linear: 1,
  radial: 2,
  mesh: 3,
  media: 4,
  transparent: 5,
};

export interface Finish {
  grain: number;
  vignette: number;
  bloom: number;
  contrast: number;
  saturation: number;
  exposure: number;
}

interface PostValues {
  background: Background;
  backgroundMap:
    | { texture: Texture; width: number; height: number }
    | undefined;
  finish: Finish;
  progress: number;
  frame: number;
}

interface PassResources {
  material: ShaderMaterial;
  scene: Scene;
  camera: OrthographicCamera;
  target: WebGLRenderTarget;
}

const createPass = (): PassResources => {
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
    transparent: false,
    uniforms: {
      uScene: { value: null },
      uBgType: { value: 0 },
      uC0: { value: new Color() },
      uC1: { value: new Color() },
      uC2: { value: new Color() },
      uC3: { value: new Color() },
      uCount: { value: 2 },
      uAngle: { value: 0 },
      uCenter: { value: new Vector2(0.5, 0.5) },
      uPhase: { value: 0 },
      uBgMap: { value: null },
      uHasBgMap: { value: 0 },
      uBgMapSize: { value: new Vector2(1, 1) },
      uBgDim: { value: 0 },
      uBgBlur: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uExposure: { value: 1 },
      uContrast: { value: 1 },
      uSaturation: { value: 1 },
      uBloom: { value: 0 },
      uVignette: { value: 0 },
      uGrain: { value: 0 },
      uFrame: { value: 0 },
    },
  });
  const scene = new Scene();
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));
  return {
    material,
    scene,
    camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1),
    target: new WebGLRenderTarget(1, 1, {
      samples: 4,
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
      magFilter: LinearFilter,
    }),
  };
};

const colorsOf = (background: Background): string[] => {
  if (background.type === "solid") {
    return [background.color];
  }
  if ("colors" in background) {
    return background.colors;
  }
  return ["#000000"];
};

type Uniforms = ShaderMaterial["uniforms"];

const setBackground = (
  u: Uniforms,
  { background, backgroundMap, progress }: PostValues
) => {
  const colors = colorsOf(background);
  const [c0] = colors;
  const c1 = colors[1] ?? c0;
  const c2 = colors[2] ?? c1;
  u.uBgType.value = BG_TYPES[background.type];
  u.uC0.value.set(c0);
  u.uC1.value.set(c1);
  u.uC2.value.set(c2);
  u.uC3.value.set(colors[3] ?? c2);
  u.uCount.value = colors.length;
  u.uAngle.value =
    background.type === "linear" ? (background.angle * Math.PI) / 180 : 0;
  if (background.type === "radial") {
    u.uCenter.value.set(background.x, 1 - background.y);
  }
  // Whole cycles per loop keep the mesh seamless; 0 holds it still.
  u.uPhase.value =
    background.type === "mesh"
      ? progress * Math.PI * 2 * Math.round(background.speed)
      : 0;
  u.uBgMap.value = backgroundMap?.texture ?? null;
  u.uHasBgMap.value = backgroundMap ? 1 : 0;
  u.uBgMapSize.value.set(backgroundMap?.width ?? 1, backgroundMap?.height ?? 1);
  u.uBgDim.value = background.type === "media" ? background.dim : 0;
  u.uBgBlur.value = background.type === "media" ? background.blur : 0;
};

const setFinish = (u: Uniforms, { finish, frame }: PostValues) => {
  u.uExposure.value = finish.exposure;
  u.uContrast.value = finish.contrast;
  u.uSaturation.value = finish.saturation;
  u.uBloom.value = finish.bloom;
  u.uVignette.value = finish.vignette;
  u.uGrain.value = finish.grain;
  u.uFrame.value = frame;
};

export const Post = (values: PostValues) => {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const pass = useRef<PassResources | null>(null);
  const latest = useRef(values);

  useLayoutEffect(() => {
    const created = createPass();
    pass.current = created;
    return () => {
      created.target.dispose();
      created.material.dispose();
      pass.current = null;
    };
  }, []);

  // The newest props, read by the frame callback below.
  useLayoutEffect(() => {
    latest.current = values;
  });

  // Priority 1 takes over rendering from R3F for this canvas: draw the
  // cards into the target, then composite it over the background.
  useFrame(({ scene, camera }) => {
    const r = pass.current;
    if (!r) {
      return;
    }
    const w = Math.round(size.width * dpr);
    const h = Math.round(size.height * dpr);
    if (r.target.width !== w || r.target.height !== h) {
      r.target.setSize(w, h);
    }
    const u = r.material.uniforms;
    u.uScene.value = r.target.texture;
    u.uRes.value.set(size.width, size.height);
    setBackground(u, latest.current);
    setFinish(u, latest.current);
    gl.setRenderTarget(r.target);
    gl.setClearColor(0x00_00_00, 0);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x00_00_00, 0);
    gl.clear(true, true, true);
    gl.render(r.scene, r.camera);
  }, 1);

  return null;
};
