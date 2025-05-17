import { cn } from "@/lib/utils"
import type React from "react"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg", className)}
      {...props}
    >
      {children}
    </div>
  )
}
