"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "gradient" | "solid"
  interactive?: boolean
  glow?: boolean
}

const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = "glass", interactive = false, glow = false, children, ...props }, ref) => {
    const baseStyles = "rounded-2xl border backdrop-blur-xl transition-all duration-300"

    const variantStyles = {
      glass: "bg-background/60 border-white/10 shadow-xl",
      gradient: "bg-gradient-to-br from-primary to-accent border-transparent text-white shadow-2xl",
      solid: "bg-background border-border shadow-lg",
    }

    const interactiveStyles = interactive ? "cursor-pointer hover:scale-[1.02] hover:shadow-2xl transform-gpu" : ""

    const glowStyles = glow ? "shadow-[0_0_50px_rgba(139,92,246,0.3)]" : ""

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], interactiveStyles, glowStyles, className)}
        whileHover={interactive ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

ModernCard.displayName = "ModernCard"

export { ModernCard }
