import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Plus, Smartphone, Layers, Clock } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Fetch user's projects
  const { data: projects } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <GlassButton asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Total Projects</h3>
              <p className="text-3xl font-bold mt-2">{projects?.length || 0}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <Layers className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Total Mockups</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <p className="text-3xl font-bold mt-2">-</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Projects</h2>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <NewProjectCard />
        </div>
      ) : (
        <div className="text-center py-12">
          <GlassCard className="p-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Create your first project to get started with AppVisor.</p>
            <GlassButton asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </GlassButton>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="h-40 bg-muted/50 flex items-center justify-center">
        <Smartphone className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold">{project.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description || "No description"}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
          <GlassButton size="sm" asChild>
            <Link href={`/projects/${project.id}`}>Open</Link>
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}

function NewProjectCard() {
  return (
    <GlassCard className="flex flex-col items-center justify-center p-8 h-full border-dashed">
      <Plus className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-bold mb-2">Create New Project</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">Start creating app store mockups</p>
      <GlassButton asChild>
        <Link href="/projects/new">Create Project</Link>
      </GlassButton>
    </GlassCard>
  )
}
