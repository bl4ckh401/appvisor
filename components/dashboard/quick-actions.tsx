"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ImageIcon, Palette } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Generate Mockup",
      description: "Create AI-powered app mockups",
      icon: <ImageIcon className="h-5 w-5" />,
      href: "/editor",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Browse Templates",
      description: "Explore design templates",
      icon: <Palette className="h-5 w-5" />,
      href: "/templates",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "New Project",
      description: "Start a new project",
      icon: <Plus className="h-5 w-5" />,
      href: "/projects/new",
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <Card className="glass-card p-6">
      <CardContent className="p-0">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <div className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mr-3 group-hover:scale-110 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
