"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Users, ImageIcon, Zap, Target } from "lucide-react"
import { ModernCard } from "@/components/ui/modern-card"

interface DashboardStatsProps {
  projects?: any[]
  mockups?: any[]
}

export function DashboardStats({ projects = [], mockups = [] }: DashboardStatsProps) {
  // Safe calculations with fallbacks
  const totalProjects = projects?.length || 0
  const totalMockups = mockups?.length || 0

  // Calculate recent activity (last 7 days)
  const recentMockups =
    mockups?.filter((mockup) => {
      if (!mockup?.created_at) return false
      try {
        const createdDate = new Date(mockup.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return createdDate >= weekAgo
      } catch {
        return false
      }
    })?.length || 0

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      change: "+12%",
      trend: "up" as const,
      icon: <Target className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Mockups",
      value: totalMockups,
      change: "+23%",
      trend: "up" as const,
      icon: <ImageIcon className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "This Week",
      value: recentMockups,
      change: "+8%",
      trend: "up" as const,
      icon: <Zap className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Users",
      value: "2.5K",
      change: "+5%",
      trend: "up" as const,
      icon: <Users className="h-6 w-6" />,
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ModernCard variant="glass" className="p-6 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
                <div className={`flex items-center text-sm ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>

              <div>
                <motion.div
                  className="text-3xl font-bold text-foreground mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                >
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </motion.div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </ModernCard>
        </motion.div>
      ))}
    </div>
  )
}
