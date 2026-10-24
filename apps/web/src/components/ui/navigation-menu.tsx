import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { ComponentPropsWithRef } from "react";
import { flushSync } from "react-dom";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import { cn } from "@/lib/utils";

const NavigationMenuPositioner = ({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  collisionPadding = 16,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) => (
  <NavigationMenuPrimitive.Portal>
    <NavigationMenuPrimitive.Positioner
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-200 ease-(--ease-out) data-instant:transition-none data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:top-[-10px]",
        className
      )}
      {...props}
    >
      <NavigationMenuPrimitive.Popup className="popover-panel bg-popover text-popover-foreground ring-foreground/10 relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-xl shadow ring-1 transition-[width,height] duration-200 ease-(--ease-out) outline-none">
        <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
      </NavigationMenuPrimitive.Popup>
    </NavigationMenuPrimitive.Positioner>
  </NavigationMenuPrimitive.Portal>
);

const NavigationMenu = ({
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align">) => (
  <NavigationMenuPrimitive.Root
    data-slot="navigation-menu"
    className={cn(
      "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuPositioner align={align} />
  </NavigationMenuPrimitive.Root>
);

interface Pill {
  x: number;
  top: number;
  width: number;
  height: number;
}

const ITEM_SELECTOR =
  '[data-slot="navigation-menu-trigger"], [data-slot="navigation-menu-link"]';

/**
 * The top-level items, with one pill that slides to the item under the
 * pointer (or focus) and rests on the item whose menu is open.
 */
const NavigationMenuList = ({
  className,
  onPointerOver,
  onPointerLeave,
  onFocus,
  children,
  ...props
}: ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) => {
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [pill, setPill] = useState<Pill | null>(null);
  const [shown, setShown] = useState(false);
  // Read by the mutation observer, which outlives any one render.
  const shownRef = useRef(false);
  const insideRef = useRef(false);

  const show = (next: boolean) => {
    shownRef.current = next;
    setShown(next);
  };

  const moveTo = (item: HTMLElement) => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const bounds = list.getBoundingClientRect();
    const box = item.getBoundingClientRect();
    const next = {
      x: box.left - bounds.left,
      top: box.top - bounds.top,
      width: box.width,
      height: box.height,
    };
    if (shownRef.current) {
      setPill(next);
      return;
    }
    // Place the pill without a transition, force layout, then fade it in, so
    // it appears under the item instead of sliding in from the last one.
    flushSync(() => setPill(next));
    pillRef.current?.getBoundingClientRect();
    show(true);
  };

  const itemUnder = (target: EventTarget | null) => {
    const list = listRef.current;
    if (!list || !(target instanceof Element)) {
      return null;
    }
    const item = target.closest<HTMLElement>(ITEM_SELECTOR);
    return item && list.contains(item) ? item : null;
  };

  const settle = () => {
    const open =
      listRef.current?.querySelector<HTMLElement>("[data-popup-open]");
    if (open) {
      moveTo(open);
    } else {
      show(false);
    }
  };
  // The observer outlives renders; an effect event always sees this one.
  const onPopupChange = useEffectEvent(() => {
    if (!insideRef.current) {
      settle();
    }
  });

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    // A menu closing by keyboard or outside click moves the pill too.
    const observer = new MutationObserver(() => onPopupChange());
    observer.observe(list, {
      attributeFilter: ["data-popup-open"],
      attributes: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return (
    <NavigationMenuPrimitive.List
      ref={listRef}
      data-slot="navigation-menu-list"
      className={cn(
        "group relative flex flex-1 list-none items-center justify-center gap-(--navigation-menu-gap) [--navigation-menu-gap:--spacing(0.5)]",
        className
      )}
      onPointerOver={(event) => {
        insideRef.current = true;
        const item = itemUnder(event.target);
        if (item) {
          moveTo(item);
        }
        onPointerOver?.(event);
      }}
      onPointerLeave={(event) => {
        insideRef.current = false;
        settle();
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        const item = itemUnder(event.target);
        if (item) {
          moveTo(item);
        }
        onFocus?.(event);
      }}
      {...props}
    >
      {pill && (
        <span
          ref={pillRef}
          aria-hidden="true"
          data-slot="navigation-menu-pill"
          className={cn(
            "bg-nav-hover pointer-events-none absolute top-0 left-0 rounded-lg ease-(--tabs-ease) motion-reduce:transition-none",
            shown
              ? "transition-[transform,width,opacity] duration-(--tabs-duration)"
              : "transition-opacity duration-150"
          )}
          style={{
            height: pill.height,
            opacity: shown ? 1 : 0,
            top: pill.top,
            transform: `translateX(${pill.x}px)`,
            width: pill.width,
          }}
        />
      )}
      {children}
    </NavigationMenuPrimitive.List>
  );
};

const NavigationMenuItem = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) => (
  <NavigationMenuPrimitive.Item
    data-slot="navigation-menu-item"
    className={cn("relative", className)}
    {...props}
  />
);

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger transition-ring focus-visible:ring-ring/50 relative inline-flex h-8 w-max items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:outline-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-popup-open:after:absolute data-popup-open:after:-inset-x-(--navigation-menu-gap) data-popup-open:after:inset-y-0 data-popup-open:after:content-['']"
);

const NavigationMenuTrigger = ({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) => (
  <NavigationMenuPrimitive.Trigger
    data-slot="navigation-menu-trigger"
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}
    <ChevronDown
      aria-hidden="true"
      className="relative top-px ms-1 size-3.5 shrink-0 transition-transform duration-200 group-data-popup-open:rotate-180"
    />
  </NavigationMenuPrimitive.Trigger>
);

const NavigationMenuContent = ({
  className,
  keepMounted = true,
  ...props
}: NavigationMenuPrimitive.Content.Props) => (
  <NavigationMenuPrimitive.Content
    data-slot="navigation-menu-content"
    keepMounted={keepMounted}
    className={cn(
      "w-auto p-1 transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:data-[activation-direction=left]:translate-x-4 data-starting-style:data-[activation-direction=left]:-translate-x-4 data-ending-style:data-[activation-direction=right]:-translate-x-4 data-starting-style:data-[activation-direction=right]:translate-x-4 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
      className
    )}
    {...props}
  />
);

const NavigationMenuLink = ({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) => (
  <NavigationMenuPrimitive.Link
    data-slot="navigation-menu-link"
    className={cn(
      "focus-visible:ring-ring/50 in-data-[slot=navigation-menu-content]:hover:bg-nav-hover in-data-[slot=navigation-menu-content]:focus:bg-nav-hover data-active:bg-muted/50 relative flex items-center gap-2 rounded-lg p-2 text-sm transition-[box-shadow,outline-color,outline-offset] duration-(--ring-duration) ease-(--ease-out) outline-none focus-visible:ring-3 focus-visible:outline-1 motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  />
);

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
};
