"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernCardVariants = cva("relative overflow-hidden rounded-2xl border transition-all duration-300", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground border-border shadow-sm",
      glass: "bg-white/5 border-white/10 backdrop-blur-xl shadow-xl",
      gradient: "bg-gradient-to-br from-primary to-accent text-white border-transparent shadow-2xl",
      glow: "bg-card border-primary/20 shadow-lg shadow-primary/10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof modernCardVariants> {
  interactive?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant, interactive = false, children, ...props }, ref) => {
    const cardClasses = cn(
      modernCardVariants({ variant }),
      interactive && "cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-transform",
      className,
    )

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    )
  },
)
ModernCard.displayName = "ModernCard"

export { ModernCard, modernCardVariants }
