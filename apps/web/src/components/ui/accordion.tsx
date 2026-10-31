import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { ChevronUp } from "reicon-react/icons/ChevronUp";
import { Plus } from "reicon-react/icons/Plus";

import { cn } from "@/lib/utils";

const Accordion = ({ className, ...props }: AccordionPrimitive.Root.Props) => (
  <AccordionPrimitive.Root
    data-slot="accordion"
    className={cn("flex w-full flex-col", className)}
    {...props}
  />
);

const AccordionItem = ({
  className,
  ...props
}: AccordionPrimitive.Item.Props) => (
  <AccordionPrimitive.Item
    data-slot="accordion-item"
    className={cn("not-last:border-b", className)}
    {...props}
  />
);

const AccordionTrigger = ({
  className,
  children,
  icon = "chevron",
  ...props
}: AccordionPrimitive.Trigger.Props & {
  /** `plus` turns 45° into a close mark when open (the site's FAQs). */
  icon?: "chevron" | "plus";
}) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(
        "group/accordion-trigger focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:opacity-70 focus-visible:ring-3 aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4",
        className
      )}
      {...props}
    >
      {children}
      {icon === "plus" ? (
        <Plus
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45 motion-reduce:transition-none"
        />
      ) : (
        <>
          <ChevronDown
            data-slot="accordion-trigger-icon"
            className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
          />
          <ChevronUp
            data-slot="accordion-trigger-icon"
            className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
          />
        </>
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) => (
  <AccordionPrimitive.Panel
    data-slot="accordion-content"
    className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden text-sm"
    {...props}
  >
    <div
      className={cn(
        "[&_a]:hover:text-foreground h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        className
      )}
    >
      {children}
    </div>
  </AccordionPrimitive.Panel>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
