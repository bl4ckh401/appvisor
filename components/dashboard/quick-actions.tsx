"use client"

import { motion } from "framer-motion"
import { Plus, Upload, Palette, Download, Settings, Zap } from "lucide-react"
import Link from "next/link"
import { ModernCard } from "@/components/ui/modern-card"

export function QuickActions() {
  const actions = [
    {
      title: "New Project",
      description: "Start a new mockup project",
      icon: <Plus className="h-6 w-6" />,
      href: "/projects/new",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Upload Images",
      description: "Upload screenshots to transform",
      icon: <Upload className="h-6 w-6" />,
      href: "/editor",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "AI Generator",
      description: "Generate images with AI",
      icon: <Zap className="h-6 w-6" />,
      href: "/editor?tab=ai",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Templates",
      description: "Browse mockup templates",
      icon: <Palette className="h-6 w-6" />,
      href: "/templates",
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Export",
      description: "Download your mockups",
      icon: <Download className="h-6 w-6" />,
      href: "/mockups",
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Settings",
      description: "Manage your account",
      icon: <Settings className="h-6 w-6" />,
      href: "/profile",
      color: "from-gray-500 to-slate-500",
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <ModernCard variant="glass" interactive className="p-6 h-full group">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </ModernCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
