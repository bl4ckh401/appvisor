import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Plus, ArrowRight, ImageIcon, Settings } from "lucide-react"
import { MockupCard } from "@/components/mockup-card"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your dashboard</div>
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's recent mockups
  const { data: mockups } = await supabase
    .from("mockups")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6)

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8 text-glow">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-glow">Your Projects</h2>
            <Link href="/projects/new">
              <GlassButton size="sm" className="glossy-button">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </GlassButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects && projects.length > 0 ? (
              projects.slice(0, 3).map((project) => (
                <GlassCard key={project.id} className="p-4 glossy-card">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-glow">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.description || "No description provided"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/projects/${project.id}`}>
                        <GlassButton variant="outline" size="sm" className="glossy">
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">View Project</span>
                        </GlassButton>
                      </Link>
                      <Link href={`/projects/${project.id}/settings`}>
                        <GlassButton variant="outline" size="sm" className="glossy">
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Project Settings</span>
                        </GlassButton>
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-6 text-center glossy-card">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-2">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project to start generating app mockups
                </p>
                <Link href="/projects/new">
                  <GlassButton className="glossy-button">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </GlassButton>
                </Link>
              </GlassCard>
            )}

            {projects && projects.length > 3 && (
              <Link href="/projects" className="text-center block mt-2">
                <GlassButton variant="link" className="text-primary">
                  View all projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlassButton>
              </Link>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-glow">Recent Mockups</h2>
            <Link href="/editor">
              <GlassButton size="sm" className="glossy-button">
                <Plus className="mr-2 h-4 w-4" />
                New Mockup
              </GlassButton>
            </Link>
          </div>

          {mockups && mockups.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockups.map((mockup) => (
                <MockupCard key={mockup.id} id={mockup.id} name={mockup.name} imageUrl={mockup.image_url} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-6 text-center glossy-card">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-2">No mockups yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first mockup using our AI-powered generator
              </p>
              <Link href="/editor">
                <GlassButton className="glossy-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Mockup
                </GlassButton>
              </Link>
            </GlassCard>
          )}

          {mockups && mockups.length > 6 && (
            <div className="text-center mt-4">
              <Link href="/mockups">
                <GlassButton variant="link" className="text-primary">
                  View all mockups
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlassButton>
              </Link>
            </div>
          )}
        </section>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-glow">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/editor">
            <GlassCard className="p-6 h-full glossy-card hover:border-primary/40 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Generate Mockup</h3>
                <p className="text-sm text-muted-foreground">Create app mockups with our AI-powered generator</p>
              </div>
            </GlassCard>
          </Link>

          <Link href="/templates">
            <GlassCard className="p-6 h-full glossy-card hover:border-primary/40 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Browse Templates</h3>
                <p className="text-sm text-muted-foreground">Explore our collection of app design templates</p>
              </div>
            </GlassCard>
          </Link>

          <Link href="/projects/new">
            <GlassCard className="p-6 h-full glossy-card hover:border-primary/40 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">New Project</h3>
                <p className="text-sm text-muted-foreground">Create a new project to organize your mockups</p>
              </div>
            </GlassCard>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-glow">Usage Statistics</h2>
        <GlassCard className="p-6 glossy-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-glow">{projects?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Mockups</p>
              <p className="text-3xl font-bold text-glow">{mockups?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Subscription</p>
              <Link href="/pricing">
                <GlassButton variant="outline" size="sm" className="glossy">
                  Upgrade Plan
                </GlassButton>
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
