"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
  animate?: boolean
}

export function GlassCard({ children, className, intensity = "medium", animate = true, ...props }: GlassCardProps) {
  const intensityStyles = {
    low: "bg-background/30 backdrop-blur-sm border-border/20",
    medium: "bg-background/40 backdrop-blur-md border-border/30",
    high: "bg-background/50 backdrop-blur-lg border-border/40",
  }

  const cardContent = (
    <div className={cn("rounded-lg border shadow-sm", intensityStyles[intensity], className)} {...props}>
      {children}
    </div>
  )

  if (!animate) {
    return cardContent
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
      }}
    >
      {cardContent}
    </motion.div>
  )
}
