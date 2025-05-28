"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, FileImage, Palette, Zap } from "lucide-react"

interface Activity {
  id: string
  type: "mockup_created" | "template_used" | "project_shared" | "export_completed"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
}

interface RecentActivityProps {
  activities?: Activity[]
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const defaultActivities: Activity[] = [
    {
      id: "1",
      type: "mockup_created",
      title: "New mockup created",
      description: "iOS app mockup for e-commerce project",
      timestamp: "2 minutes ago",
      user: { name: "You", avatar: "/placeholder.svg?height=32&width=32" },
    },
    {
      id: "2",
      type: "template_used",
      title: "Template applied",
      description: "Used 'Modern Dashboard' template",
      timestamp: "1 hour ago",
      user: { name: "You", avatar: "/placeholder.svg?height=32&width=32" },
    },
    {
      id: "3",
      type: "export_completed",
      title: "Export completed",
      description: "High-resolution PNG exported",
      timestamp: "3 hours ago",
      user: { name: "You", avatar: "/placeholder.svg?height=32&width=32" },
    },
    {
      id: "4",
      type: "project_shared",
      title: "Project shared",
      description: "Shared with design team",
      timestamp: "1 day ago",
      user: { name: "You", avatar: "/placeholder.svg?height=32&width=32" },
    },
  ]

  const displayActivities = activities.length > 0 ? activities : defaultActivities

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "mockup_created":
        return <FileImage className="h-4 w-4" />
      case "template_used":
        return <Palette className="h-4 w-4" />
      case "export_completed":
        return <Zap className="h-4 w-4" />
      case "project_shared":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "mockup_created":
        return "bg-blue-500"
      case "template_used":
        return "bg-purple-500"
      case "export_completed":
        return "bg-green-500"
      case "project_shared":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white flex-shrink-0`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {activity.timestamp}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                {activity.user && (
                  <div className="flex items-center mt-2">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                      <AvatarFallback className="text-xs">{activity.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
