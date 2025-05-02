"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const button3DVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary/90 text-primary-foreground hover:bg-primary/80 border border-primary/20 shadow-[0_4px_0px_0px] shadow-primary/50",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive/80 border border-destructive/20 shadow-[0_4px_0px_0px] shadow-destructive/50",
        outline:
          "border border-input/40 bg-background/30 hover:bg-accent/30 hover:text-accent-foreground shadow-[0_4px_0px_0px] shadow-border/50",
        secondary:
          "bg-secondary/90 text-secondary-foreground hover:bg-secondary/80 border border-secondary/20 shadow-[0_4px_0px_0px] shadow-secondary/50",
        ghost: "hover:bg-accent/30 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "border border-primary/20 shadow-[0_4px_0px_0px] shadow-primary/50 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface Button3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button3DVariants> {
  asChild?: boolean
  noAnimation?: boolean
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, variant, size, asChild = false, noAnimation = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    if (noAnimation) {
      return <Comp className={cn(button3DVariants({ variant, size, className }))} ref={ref} {...props} />
    }

    return (
      <motion.div
        whileHover={{ translateY: -2 }}
        whileTap={{ translateY: 2 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Comp className={cn(button3DVariants({ variant, size, className }))} ref={ref} {...props} />
        {variant !== "ghost" && variant !== "link" && (
          <motion.div
            className="absolute inset-0 rounded-md bg-white/10 opacity-0"
            whileHover={{ opacity: 0.1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    )
  },
)
Button3D.displayName = "Button3D"

export { Button3D, button3DVariants }
