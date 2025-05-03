"use client"

import { ReactNode } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

interface PremiumFeatureButtonProps {
  feature: string
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  showBadge?: boolean
}

export function PremiumFeatureButton({
  feature,
  children,
  onClick,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  showBadge = true,
}: PremiumFeatureButtonProps) {
  const { checkFeatureAccess, PremiumModal } = useFeatureAccess()

  const handleClick = () => {
    const hasAccess = checkFeatureAccess(feature as any)
    if (hasAccess && onClick) {
      onClick()
    }
  }

  return (
    <>
      <GlassButton
        onClick={handleClick}
        className={className}
        variant={variant}
        size={size}
        disabled={disabled}
      >
        {children}
        {showBadge && (
          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs px-1.5 py-0.5">
            <Sparkles className="h-3 w-3 mr-1" />
            PRO
          </Badge>
        )}
      </GlassButton>
      <PremiumModal />
    </>
  )
}
