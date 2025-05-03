"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { getUserUsageStats } from "@/lib/usage-tracking"
import { planFeatures } from "@/lib/plan-restrictions"
import { Loader2, Plus, ImageIcon, Settings, Layers, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [mockups, setMockups] = useState([])
  const [loading, setLoading] = useState(true)
  const [usageStats, setUsageStats] = useState<Record<string, number>>({})
  const { subscription, getCurrentPlan } = useFeatureAccess()
  const supabase = createClient()

  // Fetch projects, mockups, and usage stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        // Fetch projects
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4)

        if (projectsData) {
          setProjects(projectsData)
        }

        // Fetch recent mockups
        const { data: mockupsData } = await supabase
          .from("mockups")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(6)

        if (mockupsData) {
          setMockups(mockupsData)
        }

        // Fetch usage stats
        const stats = await getUserUsageStats()
        setUsageStats(stats)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Get plan details
  const getPlanDetails = () => {
    const plan = getCurrentPlan()
    return {
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      mockupLimit: planFeatures[plan].mockupsPerMonth,
      color: plan === "free" ? "gray" : plan === "pro" ? "lime" : "purple",
    }
  }

  const planDetails = getPlanDetails()

  // Calculate mockup usage percentage
  const getMockupUsagePercentage = () => {
    const limit = planDetails.mockupLimit
    if (limit === Number.POSITIVE_INFINITY) return 0

    const usage = usageStats.mockup_generation || 0
    return Math.min(Math.round((usage / limit) * 100), 100)
  }

  const mockupUsagePercentage = getMockupUsagePercentage()

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Subscription Status */}
        <GlassCard className="p-6 col-span-1 md:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">{planDetails.name} Plan</h2>
              <p className="text-muted-foreground">
                {planDetails.mockupLimit === Number.POSITIVE_INFINITY
                  ? "Unlimited mockups"
                  : `${usageStats.mockup_generation || 0} / ${planDetails.mockupLimit} mockups used this month`}
              </p>

              {planDetails.mockupLimit !== Number.POSITIVE_INFINITY && (
                <div className="w-full mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      mockupUsagePercentage >= 90
                        ? "bg-red-500"
                        : mockupUsagePercentage >= 70
                          ? "bg-orange-500"
                          : "bg-primary"
                    }`}
                    style={{ width: `${mockupUsagePercentage}%` }}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 md:mt-0">
              {getCurrentPlan() === "free" ? (
                <GlassButton asChild>
                  <Link href="/pricing">Upgrade Plan</Link>
                </GlassButton>
              ) : (
                <GlassButton asChild variant="outline">
                  <Link href="/billing">Manage Subscription</Link>
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <GlassButton asChild variant="outline" className="w-full justify-start">
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </GlassButton>

            <GlassButton asChild variant="outline" className="w-full justify-start">
              <Link href="/editor">
                <ImageIcon className="mr-2 h-4 w-4" />
                Create Mockup
              </Link>
            </GlassButton>

            <GlassButton asChild variant="outline" className="w-full justify-start">
              <Link href="/templates">
                <Layers className="mr-2 h-4 w-4" />
                Browse Templates
              </Link>
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Recent Projects */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Link href="/projects" className="text-primary hover:underline flex items-center">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card3D className="p-8 text-center">
            <h3 className="text-xl font-medium mb-4">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first project to start generating app mockups.</p>
            <GlassButton asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </GlassButton>
          </Card3D>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Mockups */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Mockups</h2>
          <Link href="/mockups" className="text-primary hover:underline flex items-center">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {mockups.length === 0 ? (
          <Card3D className="p-8 text-center">
            <h3 className="text-xl font-medium mb-4">No Mockups Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first mockup using our AI-powered generator.</p>
            <GlassButton asChild>
              <Link href="/editor">
                <ImageIcon className="mr-2 h-4 w-4" />
                Create Mockup
              </Link>
            </GlassButton>
          </Card3D>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockups.map((mockup) => (
              <MockupCard key={mockup.id} mockup={mockup} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Project card component
function ProjectCard({ project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card3D className="p-4 h-full hover:border-primary/50 transition-colors">
        <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url || "/placeholder.svg"}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Preview</div>
          )}
        </div>

        <h3 className="font-medium truncate">{project.name}</h3>
        <p className="text-sm text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
      </Card3D>
    </Link>
  )
}

// Mockup card component
function MockupCard({ mockup }) {
  return (
    <Link href={`/mockups/${mockup.id}`}>
      <Card3D className="p-4 h-full hover:border-primary/50 transition-colors">
        <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
          {mockup.image_url ? (
            <img
              src={mockup.image_url || "/placeholder.svg"}
              alt={mockup.name || "App Mockup"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Preview</div>
          )}
        </div>

        <h3 className="font-medium truncate">{mockup.name || "Untitled Mockup"}</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{new Date(mockup.created_at).toLocaleDateString()}</p>

          <div className="flex items-center">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </Card3D>
    </Link>
  )
}
