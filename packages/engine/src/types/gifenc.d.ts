// gifenc ships without type declarations; these cover the calls we make.
declare module "gifenc" {
  export type Palette = number[][];

  export interface GifEncoder {
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: Palette;
        delay?: number;
        repeat?: number;
        transparent?: boolean;
        transparentIndex?: number;
      }
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array<ArrayBuffer>;
  }

  export function GIFEncoder(): GifEncoder;
  export function quantize(
    rgba: Uint8ClampedArray | Uint8Array,
    maxColors: number,
    options?: { format?: "rgb565" | "rgb444" | "rgba4444" }
  ): Palette;
  export function applyPalette(
    rgba: Uint8ClampedArray | Uint8Array,
    palette: Palette,
    format?: "rgb565" | "rgb444" | "rgba4444"
  ): Uint8Array;
}
