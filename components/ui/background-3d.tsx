"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Background3DProps {
  children: React.ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
  color1?: string
  color2?: string
  animate?: boolean
}

export function Background3D({
  children,
  className = "",
  intensity = "medium",
  color1 = "rgba(138, 43, 226, 0.05)",
  color2 = "rgba(63, 81, 181, 0.05)",
  animate = true,
}: Background3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  const intensityValues = {
    low: 10,
    medium: 20,
    high: 30,
  }

  const moveFactor = intensityValues[intensity]

  useEffect(() => {
    if (!animate) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      mouseX.current = (e.clientX - rect.left) / rect.width - 0.5
      mouseY.current = (e.clientY - rect.top) / rect.height - 0.5

      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${mouseX.current * moveFactor}px`)
        containerRef.current.style.setProperty("--mouse-y", `${mouseY.current * moveFactor}px`)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [animate, moveFactor])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          "--mouse-x": "0px",
          "--mouse-y": "0px",
        } as React.CSSProperties
      }
    >
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color1}, transparent 70%), 
                      radial-gradient(circle at 70% 30%, ${color2}, transparent 70%)`,
          transform: animate ? "translate(calc(var(--mouse-x) * -1), calc(var(--mouse-y) * -1))" : "none",
          transition: "transform 0.2s ease-out",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      {children}
    </div>
  )
}
