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

        // Load projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (projectsError) {
          console.error("Projects error:", projectsError)
          setProjects([])
        } else {
          setProjects(projectsData || [])
        }

        // Load mockups
        try {
          const { data: mockupsData, error: mockupsError } = await supabase
            .from("mockups")
            .select("*, projects!inner(user_id)")
            .eq("projects.user_id", user.id)
            .order("created_at", { ascending: false });

          if (mockupsError) {
            if (mockupsError.message.includes("relation") && mockupsError.message.includes("does not exist")) {
              console.log("Mockups table doesn't exist yet, using empty array")
              setMockups([])
            } else {
              console.error("Mockups error:", mockupsError)
              setMockups([])
            }
          } else {
            setMockups(mockupsData || [])
          }
        } catch (mockupsErr) {
          console.error("Error fetching mockups:", mockupsErr)
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="animate-pulse space-y-6 sm:space-y-8">
            {/* Header skeleton */}
            <div className="space-y-3">
              <div className="h-8 sm:h-10 lg:h-12 bg-white/10 rounded-lg w-full max-w-md"></div>
              <div className="h-4 sm:h-5 lg:h-6 bg-white/10 rounded-lg w-full max-w-lg"></div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 sm:h-36 lg:h-40 bg-white/10 rounded-2xl"></div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              <div className="h-80 sm:h-96 bg-white/10 rounded-2xl"></div>
              <div className="h-80 sm:h-96 bg-white/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Header */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">Welcome back! 👋</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl">
              Here's what's happening with your projects today.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 sm:p-6">
              <p className="text-destructive text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* Stats */}
          <DashboardStats projects={projects} mockups={mockups} />

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Quick Actions */}
            <div className="order-2 xl:order-1">
              <QuickActions />
            </div>

            {/* Recent Activity */}
            <div className="order-1 xl:order-2">
              <RecentActivity projects={projects} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
