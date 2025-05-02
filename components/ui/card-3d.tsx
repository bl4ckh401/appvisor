"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: "low" | "medium" | "high"
  glowColor?: string
  depth?: number
}

export function Card3D({
  children,
  className,
  intensity = "medium",
  glowColor = "rgba(80, 220, 100, 0.3)",
  depth = 1,
  ...props
}: Card3DProps) {
  const [rotateX, setRotateX] = React.useState(0)
  const [rotateY, setRotateY] = React.useState(0)

  const intensityMap = {
    low: 2,
    medium: 4,
    high: 6,
  }

  const intensityValue = intensityMap[intensity]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * intensityValue
    const rotateYValue = ((centerX - x) / centerX) * intensityValue
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl glossy-card border border-border/30 backdrop-blur-md",
        className,
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
        boxShadow: `0 10px 30px -10px rgba(0, 0, 0, 0.3), 0 0 ${depth * 10}px ${glowColor}`,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div
        className="absolute inset-0 z-10 rounded-xl"
        style={{
          background: `radial-gradient(circle at ${(rotateY / intensityValue) * 50 + 50}% ${
            (rotateX / intensityValue) * 50 + 50
          }%, ${glowColor} 0%, transparent 50%)`,
          opacity: 0.2,
          mixBlendMode: "plus-lighter",
        }}
      />
      <div className="relative z-20">{children}</div>
    </motion.div>
  )
}
