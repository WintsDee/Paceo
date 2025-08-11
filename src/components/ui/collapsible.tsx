import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import * as React from "react"
import { cn } from "@/lib/utils"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn("flex items-center gap-2 transition-smooth", className)}
    {...props}
  />
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, style, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    style={{
      ...(style || {}),
      ["--radix-accordion-content-height" as any]: "var(--radix-collapsible-content-height)",
    }}
    className={cn(
      "overflow-hidden will-change-[height,opacity] transform-gpu data-[state=open]:animate-[accordion-down_0.3s_ease-out] data-[state=closed]:animate-[accordion-up_0.3s_ease-out]",
      className
    )}
    {...props}
  />
))
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
