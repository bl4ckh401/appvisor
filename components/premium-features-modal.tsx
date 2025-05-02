"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sparkles, Star, Check } from "lucide-react"
import Link from "next/link"
import { Button3D } from "@/components/ui/button-3d"

interface PremiumFeaturesModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  plan?: "pro" | "team"
}

export function PremiumFeaturesModal({ isOpen, onClose, feature, plan = "pro" }: PremiumFeaturesModalProps) {
  const featureDetails = {
    bulk_generation: {
      title: "Bulk Generation",
      description: "Generate multiple mockups at once to save time and streamline your workflow.",
      proLimit: "Up to 10 mockups at once",
      teamLimit: "Up to 50 mockups at once",
    },
    unlimited_mockups: {
      title: "Unlimited Mockups",
      description: "Create as many mockups as you need without any monthly limits.",
      proLimit: "Unlimited mockups",
      teamLimit: "Unlimited mockups",
    },
    custom_branding: {
      title: "Custom Branding",
      description: "Add your own branding elements to mockups for a consistent look and feel.",
      proLimit: "Basic branding options",
      teamLimit: "Advanced branding options",
    },
    team_collaboration: {
      title: "Team Collaboration",
      description: "Work together with your team members on mockups and projects.",
      proLimit: "Not available",
      teamLimit: "Up to 5 team members",
    },
    api_access: {
      title: "API Access",
      description: "Integrate AppVisor with your own tools and workflows.",
      proLimit: "Not available",
      teamLimit: "Full API access",
    },
  }

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
