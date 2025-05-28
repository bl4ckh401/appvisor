"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  label?: string
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, icon, error, label, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
          <motion.input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
              icon && "pl-10",
              error && "border-destructive/50 focus-visible:ring-destructive/20",
              className,
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            {...props}
          />
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-primary/50 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        {error && (
          <motion.p
            className="text-sm text-destructive"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  },
)
ModernInput.displayName = "ModernInput"

export { ModernInput }
