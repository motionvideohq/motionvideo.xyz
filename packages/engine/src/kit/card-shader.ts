// The card material: one shader draws a media item fitted into a card, the
// card's rounded shape, border, device frame (browser, phone, tablet,
// laptop), back face, shading, glare and per-card blur. Everything is
// computed from the card's size in world units, so frames stay crisp at any
// export resolution.

export const CARD_VERTEX = `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const CARD_FRAGMENT = `
uniform sampler2D uMap;
uniform float uHasMap;
uniform vec2 uMapSize;
uniform vec4 uCrop;
uniform float uFit;
uniform vec2 uFocus;
uniform vec2 uCard;
uniform vec2 uBox;
uniform int uFrame;
uniform float uDark;
uniform float uRadius;
uniform float uBorder;
uniform vec3 uBorderColor;
uniform float uBrightness;
uniform float uOpacity;
uniform float uBackMode;
uniform vec3 uBackColor;
uniform vec3 uMatColor;
uniform float uShade;
uniform float uGlare;
uniform float uGlarePos;
uniform float uBlur;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;

// Rounded box, per-corner radii r = (top right, bottom right, top left, bottom left).
float sdRoundBox(vec2 p, vec2 b, vec4 r) {
  r.xy = (p.x > 0.0) ? r.xy : r.zw;
  r.x = (p.y > 0.0) ? r.x : r.y;
  vec2 q = abs(p) - b + r.x;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

float fill(float d) {
  float aa = max(fwidth(d), 1e-5);
  return 1.0 - smoothstep(-aa, aa, d);
}

vec4 over(vec4 dst, vec3 color, float a) {
  return vec4(mix(dst.rgb, color, a), dst.a + a * (1.0 - dst.a));
}

// Media sampled at q (0–1 inside the content rect, origin top left).
vec3 sampleMedia(vec2 q, vec2 contentSize, float facing) {
  if (uHasMap < 0.5) {
    return uMatColor;
  }
  vec2 src = uMapSize * uCrop.zw;
  float ta = src.x / src.y;
  float ca = contentSize.x / contentSize.y;
  vec2 scale = vec2(1.0);
  if ((ta > ca) == (uFit < 0.5)) {
    scale.x = ca / ta;
  } else {
    scale.y = ta / ca;
  }
  vec2 t;
  if (uFit < 0.5) {
    // Cover: show a window of the image, positioned by the focal point.
    t = (1.0 - scale) * uFocus + q * scale;
  } else {
    // Contain: the whole image, centred; bars show the mat colour.
    t = (q - 0.5) / scale + 0.5;
    if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) {
      return uMatColor;
    }
  }
  if (facing < 0.0) {
    t.x = 1.0 - t.x;
  }
  vec2 img = uCrop.xy + t * uCrop.zw;
  return texture2D(uMap, vec2(img.x, 1.0 - img.y), uBlur * 7.0).rgb;
}

void main() {
  vec2 p = (vUv - 0.5) * uCard;
  vec2 hb = uBox * 0.5;
  float s = min(uBox.x, uBox.y);
  float facing = gl_FrontFacing ? 1.0 : -1.0;

  vec3 body = mix(vec3(0.86, 0.86, 0.88), vec3(0.075, 0.075, 0.085), uDark);
  vec3 chrome = mix(vec3(0.93, 0.93, 0.945), vec3(0.15, 0.15, 0.17), uDark);

  // Content rect (centre, half size) and its corner radii; the device body
  // around it is drawn first.
  vec2 cc = vec2(0.0);
  vec2 ch = hb;
  vec4 cr = vec4(uRadius * s);
  vec4 col = vec4(0.0);
  float outer = 1.0;

  if (uFrame == 1) {
    // Browser window: title bar with three dots and an address pill.
    float r = max(uRadius * s, 0.012 * s);
    float bar = min(0.058 * uBox.x, 0.22 * uBox.y);
    outer = fill(sdRoundBox(p, hb, vec4(r)));
    col = over(col, chrome, outer);
    float dotR = bar * 0.12;
    for (int i = 0; i < 3; i++) {
      vec2 c = vec2(-hb.x + bar * 0.62 + float(i) * bar * 0.4, hb.y - bar * 0.5);
      col = over(col, mix(vec3(0.76), vec3(0.32), uDark), fill(length(p - c) - dotR));
    }
    vec2 pill = vec2(min(0.21 * uBox.x, hb.x - bar * 2.2), bar * 0.25);
    col = over(col, mix(vec3(1.0), vec3(0.22, 0.22, 0.245), uDark),
      fill(sdRoundBox(p - vec2(0.0, hb.y - bar * 0.5), pill, vec4(pill.y))));
    ch = vec2(hb.x, hb.y - bar * 0.5);
    cc = vec2(0.0, -bar * 0.5);
    cr = vec4(0.0, r, 0.0, r);
  } else if (uFrame == 2) {
    // Phone: rounded body, thin bezel, island.
    float ro = 0.15 * uBox.x;
    float e = 0.03 * uBox.x;
    outer = fill(sdRoundBox(p, hb, vec4(ro)));
    col = over(col, body, outer);
    ch = hb - e;
    cr = vec4(ro - e);
  } else if (uFrame == 3) {
    // Tablet: even bezel, small camera dot.
    float ro = 0.06 * s;
    float e = 0.04 * s;
    outer = fill(sdRoundBox(p, hb, vec4(ro)));
    col = over(col, body, outer);
    ch = hb - e;
    cr = vec4(max(ro - e * 0.6, 0.0));
  } else if (uFrame == 4) {
    // Laptop: lid with bezel and chin, base slab with a notch.
    float baseH = uBox.y * 0.07;
    float lidW = uBox.x * 0.86;
    float lidH = uBox.y - baseH;
    vec2 lidC = vec2(0.0, hb.y - lidH * 0.5);
    float lr = 0.025 * lidW;
    float lid = fill(sdRoundBox(p - lidC, vec2(lidW, lidH) * 0.5, vec4(lr, 0.0, lr, 0.0)));
    float slab = fill(sdRoundBox(p - vec2(0.0, -hb.y + baseH * 0.5), vec2(hb.x, baseH * 0.5),
      vec4(baseH * 0.15, baseH * 0.5, baseH * 0.15, baseH * 0.5)));
    outer = max(lid, slab);
    col = over(col, body, lid);
    col = over(col, mix(vec3(0.78, 0.78, 0.8), vec3(0.2, 0.2, 0.22), uDark), slab);
    col = over(col, mix(vec3(0.66), vec3(0.1), uDark),
      fill(sdRoundBox(p - vec2(0.0, -hb.y + baseH * 0.82), vec2(lidW * 0.09, baseH * 0.16), vec4(baseH * 0.16))));
    float e = 0.022 * lidW;
    float chin = e * 1.8;
    ch = vec2(lidW * 0.5 - e, (lidH - e - chin) * 0.5);
    cc = vec2(0.0, lidC.y + (chin - e) * 0.5);
    cr = vec4(0.004 * lidW);
  }

  vec2 local = p - cc;
  float content = fill(sdRoundBox(local, ch, cr));
  if (uFrame == 0) {
    outer = content;
  }
  if (outer * max(content, col.a) < 0.002) {
    discard;
  }

  vec3 media;
  if (facing < 0.0 && uBackMode > 0.5) {
    media = uBackColor;
  } else {
    vec2 q = vec2(local.x / (ch.x * 2.0) + 0.5, 0.5 - local.y / (ch.y * 2.0));
    media = sampleMedia(q, ch * 2.0, facing);
    if (facing < 0.0) {
      media *= 0.55;
    }
  }

  // Border: an inner stroke along the content edge.
  if (uBorder > 0.0) {
    float edge = fill(sdRoundBox(local, ch, cr) + uBorder * s);
    media = mix(uBorderColor, media, edge);
  }

  col = over(col, media, content);
  vec3 c = col.rgb * uBrightness;

  float face = abs(dot(normalize(vNormalW), normalize(vViewDir)));
  c *= mix(1.0, 0.35 + 0.65 * face, uShade);

  if (uGlare > 0.0) {
    float g = dot(p / max(uCard.x, uCard.y), normalize(vec2(1.0, 0.65)));
    float band = exp(-pow((g - uGlarePos) / 0.22, 2.0));
    c += vec3(band * uGlare * 0.32);
  }

  gl_FragColor = vec4(c, col.a * outer * uOpacity);
}
`;

export const SHADOW_FRAGMENT = `
uniform vec2 uPlane;
uniform vec2 uBox;
uniform float uRadius;
uniform float uSoft;
uniform float uOpacity;
uniform vec3 uColor;

varying vec2 vUv;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 p = (vUv - 0.5) * uPlane;
  float d = sdRoundBox(p, uBox * 0.5, uRadius);
  float a = 1.0 - smoothstep(-uSoft, uSoft, d);
  if (a < 0.002) {
    discard;
  }
  gl_FragColor = vec4(uColor, a * uOpacity);
}
`;
