"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className="flex items-center space-x-2 bg-background/30 backdrop-blur-md border border-border/40 rounded-full p-1 px-3">
      <motion.div initial={{ rotate: 0 }} animate={{ rotate: isDark ? 360 : 0 }} transition={{ duration: 0.5 }}>
        {isDark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
      </motion.div>

      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-primary"
      />

      <span className="text-xs font-medium">{isDark ? "Dark" : "Light"}</span>
    </div>
  )
}
