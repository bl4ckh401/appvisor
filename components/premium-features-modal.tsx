"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sparkles, Star, Check } from "lucide-react"
import Link from "next/link"
import { Button3D } from "@/components/ui/button-3d"
import { planFeatures } from "@/lib/plan-restrictions"

interface PremiumFeaturesModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  plan?: "pro" | "team"
}

export function PremiumFeaturesModal({ isOpen, onClose, feature, plan = "pro" }: PremiumFeaturesModalProps) {
  // Map feature keys to display information
  const featureDetails = {
    bulkGeneration: {
      title: "Bulk Generation",
      description: "Generate multiple mockups at once to save time and streamline your workflow.",
      proLimit: `Up to ${planFeatures.pro.bulkGeneration} mockups at once`,
      teamLimit: `Up to ${planFeatures.team.bulkGeneration} mockups at once`,
    },
    mockupsPerMonth: {
      title: "Unlimited Mockups",
      description: "Create as many mockups as you need without any monthly limits.",
      proLimit: "Unlimited mockups",
      teamLimit: "Unlimited mockups",
    },
    customBranding: {
      title: "Custom Branding",
      description: "Add your own branding elements to mockups for a consistent look and feel.",
      proLimit: "Basic branding options",
      teamLimit: "Advanced branding options",
    },
    teamMembers: {
      title: "Team Collaboration",
      description: "Work together with your team members on mockups and projects.",
      proLimit: `${planFeatures.pro.teamMembers} team member`,
      teamLimit: `Up to ${planFeatures.team.teamMembers} team members`,
    },
    apiAccess: {
      title: "API Access",
      description: "Integrate AppVisor with your own tools and workflows.",
      proLimit: "Not available",
      teamLimit: "Full API access",
    },
    exportFormats: {
      title: "Advanced Export Formats",
      description: "Export your mockups in multiple formats for different use cases.",
      proLimit: planFeatures.pro.exportFormats.join(", "),
      teamLimit: planFeatures.team.exportFormats.join(", "),
    },
    support: {
      title: "Priority Support",
      description: "Get faster response times and dedicated support for your questions.",
      proLimit: "Priority support",
      teamLimit: "Dedicated support team",
    },
  }

  // Get feature information or use default fallback
  const details = featureDetails[feature] || {
    title: "Premium Feature",
    description: "This feature is available on our premium plans.",
    proLimit: "Available",
    teamLimit: "Available",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {details.title}
          </DialogTitle>
          <DialogDescription>{details.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 relative">
              <div className="absolute -top-3 left-3 bg-background px-2 text-sm font-medium text-primary flex items-center gap-1">
                <Star className="h-3 w-3" />
                Pro Plan
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">{details.proLimit}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">All basic features</span>
                </div>
              </div>

              <div className="mt-4 text-lg font-bold">
                $19<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </div>

            <div className="border rounded-lg p-4 relative border-primary bg-primary/5">
              <div className="absolute -top-3 left-3 bg-background px-2 text-sm font-medium text-primary flex items-center gap-1">
                <Star className="h-3 w-3" />
                <Star className="h-3 w-3" />
                Team Plan
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">{details.teamLimit}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">Team collaboration</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">API access</span>
                </div>
              </div>

              <div className="mt-4 text-lg font-bold">
                $49<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button3D variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Maybe Later
          </Button3D>
          <Button3D variant="gradient" asChild className="sm:w-auto w-full">
            <Link href={`/subscribe?plan=${plan}`}>Upgrade Now</Link>
          </Button3D>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
