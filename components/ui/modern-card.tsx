"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const modernCardVariants = cva(
  "relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        glass: "bg-white/5 border-white/10 backdrop-blur-xl",
        gradient: "bg-gradient-to-br from-primary to-accent text-white border-transparent",
        glow: "bg-card border-primary/20 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof modernCardVariants> {
  interactive?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant, interactive, children, ...props }, ref) => {
    const cardClasses = cn(
      modernCardVariants({ variant }),
      interactive && "cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-transform",
      className,
    )

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    )
  },
)
ModernCard.displayName = "ModernCard"

export { ModernCard, modernCardVariants }
