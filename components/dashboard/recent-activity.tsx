"use client"

import { ModernCard } from "@/components/ui/modern-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Badge } from "@/components/ui/badge"
import { Clock, Folder, ImageIcon, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"

interface RecentActivityProps {
  projects?: any[]
  mockups?: any[]
}

export function RecentActivity({ projects = [], mockups = [] }: RecentActivityProps) {
  // Combine and sort recent items
  const recentItems = [
    ...projects.map((project) => ({
      id: project.id,
      type: "project" as const,
      name: project.name,
      description: project.description,
      category: project.category,
      platform: project.platform,
      created_at: project.created_at,
      href: `/projects/${project.id}`,
    })),
    ...mockups.map((mockup) => ({
      id: mockup.id,
      type: "mockup" as const,
      name: mockup.name,
      device_type: mockup.device_type,
      project_id: mockup.project_id,
      created_at: mockup.created_at,
      href: `/mockups/${mockup.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8) // Show last 8 items

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) return "Just now"
      if (diffInHours < 24) return `${diffInHours}h ago`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`

      const diffInWeeks = Math.floor(diffInDays / 7)
      if (diffInWeeks < 4) return `${diffInWeeks}w ago`

      return date.toLocaleDateString()
    } catch {
      return "Unknown"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      business: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      social: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      entertainment: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      education: "bg-green-500/10 text-green-400 border-green-500/20",
      health: "bg-red-500/10 text-red-400 border-red-500/20",
      finance: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      shopping: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      travel: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      food: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      games: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    }
    return colors[category as keyof typeof colors] || colors.default
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "ios":
      case "android":
        return "📱"
      case "web":
        return "🌐"
      case "tablet":
        return "📱"
      default:
        return "💻"
    }
  }

  if (recentItems.length === 0) {
    return (
      <ModernCard variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No recent activity yet</p>
          <GlassButton asChild>
            <Link href="/projects/new">Create Your First Project</Link>
          </GlassButton>
        </div>
      </ModernCard>
    )
  }

  return (
    <ModernCard variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Recent Activity</h3>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        {recentItems.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center justify-between p-4 rounded-lg bg-background/30 backdrop-blur-sm border border-border/40 hover:bg-background/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {item.type === "project" ? (
                  <Folder className="h-5 w-5 text-primary" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  {item.type === "project" && item.platform && (
                    <span className="text-sm">{getPlatformIcon(item.platform)}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type === "project" ? "Project" : "Mockup"}
                  </Badge>

                  {item.type === "project" && item.category && (
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </Badge>
                  )}

                  {item.type === "mockup" && item.device_type && (
                    <Badge variant="outline" className="text-xs">
                      {item.device_type}
                    </Badge>
                  )}
                </div>

                {item.type === "project" && item.description && (
                  <p className="text-sm text-muted-foreground truncate mt-1">{item.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">{formatTimeAgo(item.created_at)}</span>
              <GlassButton size="sm" variant="ghost" asChild>
                <Link href={item.href}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GlassButton>
            </div>
          </div>
        ))}
      </div>

      {recentItems.length >= 8 && (
        <div className="mt-6 text-center">
          <GlassButton variant="outline" asChild>
            <Link href="/dashboard/activity">View All Activity</Link>
          </GlassButton>
        </div>
      )}
    </ModernCard>
  )
}
