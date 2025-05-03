"use client"

import type { ReactNode } from "react"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { GlassButton } from "@/components/ui/glass-button"
import type { planFeatures } from "@/lib/plan-restrictions"

interface PremiumFeatureButtonProps {
  feature: keyof typeof planFeatures.free
  children: ReactNode
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient"
  className?: string
  disabled?: boolean
}

export function PremiumFeatureButton({
  feature,
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
}: PremiumFeatureButtonProps) {
  const { checkFeatureAccess, showPremiumFeature } = useFeatureAccess()

  const handleClick = () => {
    // Check if user has access to this feature
    const hasAccess = checkFeatureAccess(feature)

    if (hasAccess) {
      // If they have access, execute the onClick handler
      if (onClick) onClick()
    } else {
      // If they don't have access, show the premium feature modal
      showPremiumFeature(feature)
    }
  }

  return (
    <GlassButton variant={variant} onClick={handleClick} className={className} disabled={disabled}>
      {children}
    </GlassButton>
  )
}
