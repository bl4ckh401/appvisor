"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Zap, ImageIcon } from "lucide-react"

interface DashboardStatsProps {
  projects?: any[]
  mockups?: any[]
}

export function DashboardStats({ projects = [], mockups = [] }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Mockups",
      value: mockups.length,
      icon: <ImageIcon className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "This Month",
      value: mockups.filter((m) => {
        const created = new Date(m.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length,
      icon: <Zap className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Team Members",
      value: 1,
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
          <Card className="glass-card p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
