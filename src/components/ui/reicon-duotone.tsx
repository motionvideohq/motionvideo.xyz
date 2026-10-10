import { cn } from "cn";
import type { CSSProperties, SVGProps } from "react";
import type { IconComponent } from "reicon-react";

import { DUOTONE_GLYPHS } from "@/components/ui/reicon-duotone-glyphs";

interface ReiconDuotoneProps extends Omit<
  SVGProps<SVGSVGElement>,
  "children" | "color"
> {
  icon: IconComponent;
  size?: number | string;
  color?: string;
  /** Colour of the duotone's light layer (defaults to the icon colour). */
  secondaryColor?: string;
  /** Paint the light layer at full strength (a solid glyph, e.g. a saved bookmark). */
  filled?: boolean;
}

/**
 * Reicon's official Duotone glyph (reicon.dev "Duotone", vendored into
 * `reicon-duotone-glyphs.ts` by `pnpm icons:duotone`). reicon-react only ships
 * Outline and Filled, so icons absent from the duotone set render their
 * reicon-react Outline glyph (Filled when `filled`).
 */
export const ReiconDuotone = ({
  icon: Icon,
  size = 24,
  color,
  secondaryColor,
  filled = false,
  className,
  style,
  ...props
}: ReiconDuotoneProps) => {
  const glyph = Icon.displayName
    ? DUOTONE_GLYPHS.get(Icon.displayName)
    : undefined;
  const colors: CSSProperties & { "--reicon-tone"?: string } = { ...style };
  if (color) {
    colors.color = color;
  }
  if (secondaryColor) {
    colors["--reicon-tone"] = secondaryColor;
  }

  if (!glyph) {
    return (
      <Icon
        size={size}
        weight={filled ? "Filled" : "Outline"}
        className={cn("reicon-duotone", className)}
        style={colors}
        {...props}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "reicon-duotone [&_[data-tone=secondary]]:fill-[var(--reicon-tone,currentColor)]",
        filled && "[&_[data-tone=secondary]]:opacity-100",
        className
      )}
      style={colors}
      {...props}
      // Static, vendored reicon markup; no user input reaches it.
      // oxlint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: glyph }}
    />
  );
};
