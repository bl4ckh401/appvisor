"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModernButton } from "@/components/ui/modern-button"
import { ImageIcon, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RecentActivityProps {
  mockups?: any[] | null
}

export function RecentActivity({ mockups }: RecentActivityProps) {
  // Safely handle null/undefined mockups
  const safeMockups = mockups || []
  const recentMockups = safeMockups.slice(0, 5)

  return (
    <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentMockups.length > 0 ? (
          <>
            {recentMockups.map((mockup, index) => (
              <div
                key={mockup.id || index}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{mockup.name || "Untitled Mockup"}</p>
                  <p className="text-xs text-muted-foreground">
                    {mockup.created_at ? new Date(mockup.created_at).toLocaleDateString() : "Unknown date"}
                  </p>
                </div>
                <ModernButton variant="ghost" size="sm" asChild>
                  <Link href={`/mockups/${mockup.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </ModernButton>
              </div>
            ))}

            {safeMockups.length > 5 && (
              <div className="pt-2">
                <ModernButton variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/mockups">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </ModernButton>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium mb-1">No recent activity</p>
            <p className="text-xs text-muted-foreground mb-4">Create your first mockup to see activity here</p>
            <ModernButton variant="secondary" size="sm" asChild>
              <Link href="/editor">Create Mockup</Link>
            </ModernButton>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
