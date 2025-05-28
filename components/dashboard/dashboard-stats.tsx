"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Zap, ImageIcon } from "lucide-react"

interface DashboardStatsProps {
  projects?: any[] | null
  mockups?: any[] | null
}

export function DashboardStats({ projects, mockups }: DashboardStatsProps) {
  // Safely handle null/undefined data with fallbacks
  const safeProjects = projects || []
  const safeMockups = mockups || []

  // Calculate this month's mockups safely
  const thisMonthMockups = safeMockups.filter((m) => {
    try {
      if (!m?.created_at) return false
      const created = new Date(m.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    } catch (error) {
      console.warn("Error parsing date:", error)
      return false
    }
  }).length

  const stats = [
    {
      title: "Total Projects",
      value: safeProjects.length,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      change: "+12%",
    },
    {
      title: "Total Mockups",
      value: safeMockups.length,
      icon: <ImageIcon className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      change: "+8%",
    },
    {
      title: "This Month",
      value: thisMonthMockups,
      icon: <Zap className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      change: "+23%",
    },
    {
      title: "Team Members",
      value: 1,
      icon: <Users className="h-6 w-6" />,
      color: "from-orange-500 to-red-500",
      change: "Active",
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
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}
                >
                  {stat.icon}
                </div>
              </div>

              {/* Decorative gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 pointer-events-none`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
