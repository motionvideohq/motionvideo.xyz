import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

/**
 * One tooltip shared by several detached `Tooltip.Trigger`s (same `handle`).
 * Moving between triggers slides the bubble and resizes it to the next label
 * instead of closing and reopening. Labels slide a full width in the direction
 * of travel (Base UI's `data-activation-direction`): moving right, the old
 * label leaves to the left and the new one enters from the right. Class strings stay literal so Tailwind
 * can scan them.
 */
export const MotionTooltip = ({
  handle,
  side = "top",
}: {
  handle: Tooltip.Handle<ReactNode>;
  side?: "top" | "bottom";
}) => (
  <Tooltip.Root handle={handle}>
    {({ payload }) => (
      <Tooltip.Portal>
        <Tooltip.Positioner
          side={side}
          sideOffset={8}
          className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
        >
          <Tooltip.Popup className="bg-foreground text-background relative h-(--popup-height,auto) w-(--popup-width,auto) max-w-xs origin-(--transform-origin) rounded-md text-xs whitespace-nowrap transition-[width,height,opacity,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:scale-90 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-90 data-starting-style:opacity-0">
            <Tooltip.Viewport className="relative size-full overflow-clip px-(--viewport-inline-padding) py-1.5 [--viewport-inline-padding:0.625rem] [&_[data-current]]:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding))] [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[380ms,300ms] [&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-full data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-full data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0 [&_[data-previous]]:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding))] [&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-[380ms,300ms] [&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-full data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-full data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0 [[data-instant]_&_[data-current]]:transition-none [[data-instant]_&_[data-previous]]:transition-none">
              {payload}
            </Tooltip.Viewport>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    )}
  </Tooltip.Root>
);
