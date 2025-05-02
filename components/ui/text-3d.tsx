"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Text3DProps {
  children: React.ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  color?: string
  shadowColor?: string
  intensity?: "low" | "medium" | "high"
  animate?: boolean
}

export function Text3D({
  children,
  className,
  as: Component = "h2",
  color = "text-primary",
  shadowColor = "rgba(138, 43, 226, 0.3)",
  intensity = "medium",
  animate = true,
}: Text3DProps) {
  const intensityValues = {
    low: { depth: 1, blur: 1 },
    medium: { depth: 2, blur: 2 },
    high: { depth: 3, blur: 3 },
  }

  const { depth, blur } = intensityValues[intensity]

  const textStyles = cn(
    color,
    "font-bold tracking-tight",
    {
      "text-shadow-3d": true,
    },
    className,
  )

  const content = (
    <Component
      className={textStyles}
      style={{
        textShadow: `0 ${depth}px 0 ${shadowColor}`,
        filter: `drop-shadow(0 ${blur}px ${blur}px ${shadowColor})`,
      }}
    >
      {children}
    </Component>
  )

  if (!animate) return content

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {content}
    </motion.div>
  )
}
