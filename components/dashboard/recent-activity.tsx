"use client"

import { formatDate } from "@/lib/utils"
import { ModernCard } from "@/components/ui/modern-card"
import { ImageIcon, Clock } from "lucide-react"

interface RecentActivityProps {
  mockups?: any[]
}

export function RecentActivity({ mockups = [] }: RecentActivityProps) {
  const recentMockups = mockups.slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>

      <ModernCard variant="glass" className="p-6">
        {recentMockups.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-2">Start creating mockups to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentMockups.map((mockup, index) => (
              <div
                key={mockup.id || index}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{mockup.title || "Untitled Mockup"}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {mockup.created_at ? formatDate(mockup.created_at) : "Unknown date"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModernCard>
    </div>
  )
}
