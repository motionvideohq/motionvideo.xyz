import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

// A single-thumb slider: `onValueChange` gets the one number back.
const Slider = ({
  className,
  min = 0,
  max = 100,
  getAriaValueText,
  ...props
}: SliderPrimitive.Root.Props<number> &
  Pick<SliderPrimitive.Thumb.Props, "getAriaValueText">) => (
  <SliderPrimitive.Root
    data-slot="slider"
    className={cn(
      "data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
      className
    )}
    min={min}
    max={max}
    thumbAlignment="edge"
    {...props}
  >
    <SliderPrimitive.Control className="relative flex w-full touch-none items-center py-1.5 select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-muted relative grow overflow-hidden rounded-full select-none data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Indicator
          data-slot="slider-range"
          className="bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        getAriaValueText={getAriaValueText}
        className="border-primary ring-ring/50 bg-background relative block size-4 shrink-0 rounded-full border-2 shadow-sm transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 data-disabled:pointer-events-none data-disabled:opacity-50"
      />
    </SliderPrimitive.Control>
  </SliderPrimitive.Root>
);

export { Slider };
