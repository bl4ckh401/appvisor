import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { Plus, ArrowRight, ImageIcon, Settings } from "lucide-react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">Please log in to view your dashboard</p>
          <Link href="/auth">
            <ModernButton variant="gradient">Sign In</ModernButton>
          </Link>
        </div>
      </div>
    )
  }

  // Fetch user's projects with error handling
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's recent mockups with error handling
  const { data: mockups, error: mockupsError } = await supabase
    .from("mockups")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6)

  // Handle potential errors gracefully
  const safeProjects = projectsError ? [] : projects || []
  const safeMockups = mockupsError ? [] : mockups || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Welcome back!</h1>
            <p className="text-muted-foreground text-lg">Here's what's happening with your projects today.</p>
          </div>
          <ModernButton variant="gradient" icon={<Plus className="h-5 w-5" />} asChild>
            <Link href="/projects/new">New Project</Link>
          </ModernButton>
        </div>

        {/* Stats Overview */}
        <DashboardStats projects={safeProjects} mockups={safeMockups} />

        {/* Error Messages */}
        {(projectsError || mockupsError) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Some data couldn't be loaded. Please refresh the page or try again later.
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Projects</h2>
              <Link href="/projects">
                <ModernButton variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ModernButton>
              </Link>
            </div>

            {safeProjects.length > 0 ? (
              <div className="grid gap-4">
                {safeProjects.slice(0, 3).map((project) => (
                  <ModernCard key={project.id} variant="glass" interactive className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{project.name || "Untitled Project"}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {project.description || "No description provided"}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>
                            Created{" "}
                            {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Unknown date"}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <ModernButton variant="ghost" size="sm" asChild>
                          <Link href={`/projects/${project.id}/settings`}>
                            <Settings className="h-4 w-4" />
                          </Link>
                        </ModernButton>
                        <ModernButton variant="secondary" size="sm" asChild>
                          <Link href={`/projects/${project.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </ModernButton>
                      </div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            ) : (
              <ModernCard variant="glass" className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">Create your first project to start generating app mockups</p>
                <ModernButton variant="gradient" icon={<Plus className="h-5 w-5" />} asChild>
                  <Link href="/projects/new">Create Project</Link>
                </ModernButton>
              </ModernCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Activity */}
            <RecentActivity mockups={safeMockups} />
          </div>
        </div>
      </div>
    </div>
  )
}
