"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { GlassButton } from "@/components/ui/glass-button"
import { planFeatures } from "@/lib/plan-restrictions"
import Link from "next/link"

interface PremiumFeaturesModalProps {
  isOpen: boolean
  onClose: () => void
  feature: keyof typeof planFeatures.free
  plan?: "pro" | "team"
}

export function PremiumFeaturesModal({ isOpen, onClose, feature, plan = "pro" }: PremiumFeaturesModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "team">(plan)

  // Get feature name for display
  const getFeatureName = () => {
    const featureMap = {
      mockupsPerMonth: "Monthly Mockups",
      templates: "Templates",
      exportFormats: "Export Formats",
      bulkGeneration: "Bulk Generation",
      teamMembers: "Team Members",
      customBranding: "Custom Branding",
      apiAccess: "API Access",
      prioritySupport: "Priority Support",
      whiteLabeling: "White Labeling",
    }

    return featureMap[feature] || feature
  }

  // Get feature description
  const getFeatureDescription = () => {
    const descriptionMap = {
      mockupsPerMonth: "Create more mockups each month with a premium plan.",
      templates: "Access all premium templates for your app mockups.",
      exportFormats: "Export your mockups in additional formats like SVG and PDF.",
      bulkGeneration: "Generate multiple mockups at once to save time.",
      teamMembers: "Add team members to collaborate on projects.",
      customBranding: "Add your own branding to mockups and exports.",
      apiAccess: "Access our API to integrate with your own tools.",
      prioritySupport: "Get faster support from our team.",
      whiteLabeling: "Remove AppVisor branding from your mockups.",
    }

    return descriptionMap[feature] || "Upgrade to access premium features."
  }

  // Get feature comparison
  const getFeatureComparison = () => {
    const free = planFeatures.free[feature]
    const pro = planFeatures.pro[feature]
    const team = planFeatures.team[feature]

    return { free, pro, team }
  }

  // Format feature value for display
  const formatFeatureValue = (value: any) => {
    if (value === true) return "Yes"
    if (value === false) return "No"
    if (value === Number.POSITIVE_INFINITY) return "Unlimited"
    if (Array.isArray(value)) return value.join(", ")
    return value
  }

  const comparison = getFeatureComparison()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Premium Feature</DialogTitle>
          <DialogDescription>{getFeatureName()} is a premium feature. Upgrade to access it.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">{getFeatureDescription()}</p>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 py-2 border-b">
              <div className="font-medium">Plan</div>
              <div className="text-center">Free</div>
              <div className="text-center">Pro</div>
              <div className="text-center">Team</div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="font-medium">{getFeatureName()}</div>
              <div className="text-center">{formatFeatureValue(comparison.free)}</div>
              <div className="text-center font-medium">{formatFeatureValue(comparison.pro)}</div>
              <div className="text-center font-medium">{formatFeatureValue(comparison.team)}</div>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-2 border-t">
              <div></div>
              <div className="text-center">
                <span className="text-muted-foreground">Current</span>
              </div>
              <div className="text-center">
                <input
                  type="radio"
                  id="pro-plan"
                  name="plan"
                  checked={selectedPlan === "pro"}
                  onChange={() => setSelectedPlan("pro")}
                  className="mr-2"
                />
              </div>
              <div className="text-center">
                <input
                  type="radio"
                  id="team-plan"
                  name="plan"
                  checked={selectedPlan === "team"}
                  onChange={() => setSelectedPlan("team")}
                  className="mr-2"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <GlassButton variant="outline" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton asChild>
            <Link href={`/subscribe?plan=${selectedPlan}`}>
              Upgrade to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
            </Link>
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
