import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Check } from "reicon-react/icons/Check";
import { ChevronRight } from "reicon-react/icons/ChevronRight";

import { cn } from "@/lib/utils";

// Menu rows match the button heights: 32px by default, with the same smaller
// and larger steps available where a menu needs them.
const dropdownMenuItemVariants = cva(
  "relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        sm: "h-7 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-8",
        lg: "h-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const DropdownMenu = ({ ...props }: MenuPrimitive.Root.Props) => (
  <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
);

const DropdownMenuPortal = ({ ...props }: MenuPrimitive.Portal.Props) => (
  <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
);

const DropdownMenuTrigger = ({ ...props }: MenuPrimitive.Trigger.Props) => (
  <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
);

const DropdownMenuContent = ({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner
      className="isolate z-50 outline-none"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
    >
      <MenuPrimitive.Popup
        data-slot="dropdown-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 shadow-popover z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 duration-150 ease-out outline-none data-closed:overflow-hidden",
          className
        )}
        {...props}
      />
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
);

const DropdownMenuGroup = ({ ...props }: MenuPrimitive.Group.Props) => (
  <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
);

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) => (
  <MenuPrimitive.GroupLabel
    data-slot="dropdown-menu-label"
    data-inset={inset}
    className={cn(
      "text-muted-foreground px-1.5 py-1 text-xs font-medium data-inset:pl-7",
      className
    )}
    {...props}
  />
);

const DropdownMenuItem = ({
  className,
  inset,
  variant = "default",
  size,
  ...props
}: MenuPrimitive.Item.Props &
  VariantProps<typeof dropdownMenuItemVariants> & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }) => (
  <MenuPrimitive.Item
    data-slot="dropdown-menu-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      dropdownMenuItemVariants({ size }),
      "group/dropdown-menu-item focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:text-destructive",
      className
    )}
    {...props}
  />
);

// Menu item that navigates: renders an <a> with the same styles as an item.
const DropdownMenuLinkItem = ({
  className,
  size,
  ...props
}: MenuPrimitive.LinkItem.Props &
  VariantProps<typeof dropdownMenuItemVariants>) => (
  <MenuPrimitive.LinkItem
    data-slot="dropdown-menu-link-item"
    className={cn(
      dropdownMenuItemVariants({ size }),
      "focus:bg-accent focus:text-accent-foreground",
      className
    )}
    {...props}
  />
);

const DropdownMenuSub = ({ ...props }: MenuPrimitive.SubmenuRoot.Props) => (
  <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
);

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  size,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props &
  VariantProps<typeof dropdownMenuItemVariants> & {
    inset?: boolean;
  }) => (
  <MenuPrimitive.SubmenuTrigger
    data-slot="dropdown-menu-sub-trigger"
    data-inset={inset}
    className={cn(
      dropdownMenuItemVariants({ size }),
      "group/dropdown-menu-sub-trigger focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
    {/* Muted until the row is highlighted or its submenu is open; a step
        smaller than the row's icons. */}
    <ChevronRight
      aria-hidden="true"
      className="text-muted-foreground group-data-popup-open/dropdown-menu-sub-trigger:text-accent-foreground ml-auto size-3.5 transition-colors"
    />
  </MenuPrimitive.SubmenuTrigger>
);

const DropdownMenuSubContent = ({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) => (
  <DropdownMenuContent
    data-slot="dropdown-menu-sub-content"
    className={cn(
      "bg-popover text-popover-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 shadow-popover w-auto min-w-[96px] rounded-lg p-1 duration-150 ease-out",
      className
    )}
    align={align}
    alignOffset={alignOffset}
    side={side}
    sideOffset={sideOffset}
    {...props}
  />
);

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  inset,
  size,
  ...props
}: MenuPrimitive.CheckboxItem.Props &
  VariantProps<typeof dropdownMenuItemVariants> & {
    inset?: boolean;
  }) => (
  <MenuPrimitive.CheckboxItem
    data-slot="dropdown-menu-checkbox-item"
    data-inset={inset}
    className={cn(
      dropdownMenuItemVariants({ size }),
      "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground pr-8",
      className
    )}
    checked={checked}
    {...props}
  >
    <span
      className="pointer-events-none absolute right-2 flex items-center justify-center"
      data-slot="dropdown-menu-checkbox-item-indicator"
    >
      <MenuPrimitive.CheckboxItemIndicator>
        <Check />
      </MenuPrimitive.CheckboxItemIndicator>
    </span>
    {children}
  </MenuPrimitive.CheckboxItem>
);

const DropdownMenuRadioGroup = ({
  ...props
}: MenuPrimitive.RadioGroup.Props) => (
  <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
);

const DropdownMenuRadioItem = ({
  className,
  children,
  inset,
  indicator = "check",
  size,
  ...props
}: MenuPrimitive.RadioItem.Props &
  VariantProps<typeof dropdownMenuItemVariants> & {
    inset?: boolean;
    /**
     * `check`: a trailing tick on the picked item. `radio`: a leading
     * circle-and-dot on every item, for exclusive choices like a sort order.
     */
    indicator?: "check" | "radio";
  }) => (
  <MenuPrimitive.RadioItem
    data-slot="dropdown-menu-radio-item"
    data-inset={inset}
    className={cn(
      dropdownMenuItemVariants({ size }),
      "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground",
      indicator === "check" ? "pr-8" : "gap-2 pr-2",
      className
    )}
    {...props}
  >
    {indicator === "check" ? (
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <Check />
        </MenuPrimitive.RadioItemIndicator>
      </span>
    ) : (
      <span
        className="border-input dark:bg-input/30 pointer-events-none flex size-4 shrink-0 items-center justify-center rounded-full border"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator className="bg-primary size-2 rounded-full" />
      </span>
    )}
    {children}
  </MenuPrimitive.RadioItem>
);

const DropdownMenuSeparator = ({
  className,
  ...props
}: MenuPrimitive.Separator.Props) => (
  <MenuPrimitive.Separator
    data-slot="dropdown-menu-separator"
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
);

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    data-slot="dropdown-menu-shortcut"
    className={cn(
      "text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
      className
    )}
    {...props}
  />
);

export {
  DropdownMenuLinkItem,
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
