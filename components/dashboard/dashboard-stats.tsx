"use client"

import { TrendingUp, TrendingDown, ImageIcon, Zap, Target, Calendar, Palette } from "lucide-react"
import { ModernCard } from "@/components/ui/modern-card"

interface DashboardStatsProps {
  projects?: any[]
  mockups?: any[]
}

export function DashboardStats({ projects = [], mockups = [] }: DashboardStatsProps) {
  // Calculate real statistics
  const totalProjects = projects.length
  const totalMockups = mockups.length

  // Calculate recent activity (last 7 days)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const recentProjects = projects.filter((project) => {
    try {
      const createdDate = new Date(project.created_at)
      return createdDate >= weekAgo
    } catch {
      return false
    }
  }).length

  const recentMockups = mockups.filter((mockup) => {
    try {
      const createdDate = new Date(mockup.created_at)
      return createdDate >= weekAgo
    } catch {
      return false
    }
  }).length

  // Calculate this month's activity
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthMockups = mockups.filter((mockup) => {
    try {
      const createdDate = new Date(mockup.created_at)
      return createdDate >= monthAgo
    } catch {
      return false
    }
  }).length

  // Calculate most popular category
  const categoryCount = projects.reduce(
    (acc, project) => {
      const category = project.category || "other"
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostPopularCategory = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

  // Calculate growth percentages (mock calculation for demo)
  const projectGrowth =
    recentProjects > 0 ? `+${Math.round((recentProjects / Math.max(totalProjects - recentProjects, 1)) * 100)}%` : "0%"
  const mockupGrowth =
    recentMockups > 0 ? `+${Math.round((recentMockups / Math.max(totalMockups - recentMockups, 1)) * 100)}%` : "0%"

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      change: projectGrowth,
      trend: recentProjects > 0 ? ("up" as const) : ("neutral" as const),
      icon: <Target className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      subtitle: `${recentProjects} this week`,
    },
    {
      title: "Total Mockups",
      value: totalMockups,
      change: mockupGrowth,
      trend: recentMockups > 0 ? ("up" as const) : ("neutral" as const),
      icon: <ImageIcon className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      subtitle: `${thisMonthMockups} this month`,
    },
    {
      title: "Recent Activity",
      value: recentProjects + recentMockups,
      change: "+100%",
      trend: recentProjects + recentMockups > 0 ? ("up" as const) : ("neutral" as const),
      icon: <Zap className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      subtitle: "Last 7 days",
    },
    {
      title: "Top Category",
      value: mostPopularCategory.charAt(0).toUpperCase() + mostPopularCategory.slice(1),
      change: `${categoryCount[mostPopularCategory] || 0} projects`,
      trend: "up" as const,
      icon: <Palette className="h-6 w-6" />,
      color: "from-orange-500 to-red-500",
      subtitle: "Most used",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div key={stat.title}>
          <ModernCard variant="glass" className="p-4 sm:p-6 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center text-sm ${
                    stat.trend === "up"
                      ? "text-green-400"
                      : stat.trend === "down"
                        ? "text-red-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : stat.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                {stat.subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{stat.subtitle}</p>}
              </div>
            </div>
          </ModernCard>
        </div>
      ))}
    </div>
  )
}
