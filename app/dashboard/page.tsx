"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [mockups, setMockups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("Auth error:", userError)
          setError("Authentication required")
          return
        }

        if (!user) {
          setError("Please sign in to view your dashboard")
          return
        }

        // Load projects and mockups with error handling
        const [projectsResult, mockupsResult] = await Promise.allSettled([
          supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("mockups").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        ])

        // Handle projects result
        if (projectsResult.status === "fulfilled" && projectsResult.value.data) {
          setProjects(projectsResult.value.data)
        } else {
          console.warn("Failed to load projects")
          setProjects([])
        }

        // Handle mockups result
        if (mockupsResult.status === "fulfilled" && mockupsResult.value.data) {
          setMockups(mockupsResult.value.data)
        } else {
          console.warn("Failed to load mockups")
          setMockups([])
        }
      } catch (err) {
        console.error("Dashboard error:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
        setProjects([])
        setMockups([])
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-white/10 rounded-2xl"></div>
              <div className="h-96 bg-white/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Welcome back! 👋</h1>
          <p className="text-xl text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Stats */}
        <DashboardStats projects={projects} mockups={mockups} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity */}
          <RecentActivity mockups={mockups} />
        </div>
      </div>
    </div>
  )
}
