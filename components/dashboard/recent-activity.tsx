"use client"

import { motion } from "framer-motion"
import { Clock, ImageIcon, Plus } from "lucide-react"
import Link from "next/link"
import { ModernCard } from "@/components/ui/modern-card"

interface RecentActivityProps {
  mockups?: any[]
}

export function RecentActivity({ mockups = [] }: RecentActivityProps) {
  // Safe handling of mockups data
  const recentMockups = mockups?.slice(0, 5) || []

  // Default activities if no mockups
  const defaultActivities = [
    {
      id: "1",
      type: "created",
      title: "Welcome to AppVisor!",
      description: "Start by creating your first mockup",
      time: "Just now",
      icon: <Plus className="h-4 w-4" />,
    },
  ]

  const activities =
    recentMockups.length > 0
      ? recentMockups.map((mockup, index) => ({
          id: mockup?.id || `activity-${index}`,
          type: "created",
          title: `Created mockup`,
          description: mockup?.title || `Mockup ${index + 1}`,
          time: mockup?.created_at ? formatTimeAgo(mockup.created_at) : "Recently",
          icon: <ImageIcon className="h-4 w-4" />,
        }))
      : defaultActivities

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
        <Link href="/mockups" className="text-sm text-primary hover:text-primary/80 transition-colors">
          View all
        </Link>
      </div>

      <ModernCard variant="glass" className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No recent activity</p>
            <Link href="/editor">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Create Your First Mockup
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ModernCard>
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  } catch {
    return "Recently"
  }
}
