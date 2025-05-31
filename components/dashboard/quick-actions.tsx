import { Plus } from "lucide-react"
import Link from "next/link"

import { GlassButton } from "@/components/ui/glass-button"
import { ModernCard } from "@/components/ui/modern-card"

export function QuickActions() {
  return (
    <ModernCard variant="glass" className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <GlassButton className="h-auto p-4 sm:p-6 flex flex-col items-center space-y-2 sm:space-y-3" asChild>
          <Link href="/projects/new">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm sm:text-base">New Project</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Start creating</p>
            </div>
          </Link>
        </GlassButton>
        {/* Add more quick actions here */}
      </div>
    </ModernCard>
  )
}
