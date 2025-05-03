"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import Link from "next/link"
import { Loader2, Plus, Settings, Trash2, ArrowLeft, ImageIcon } from "lucide-react"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [mockups, setMockups] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  // Fetch project and mockups
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const projectId = params.id

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .eq("user_id", user.id)
          .single()

        if (projectError || !projectData) {
          console.error("Error fetching project:", projectError)
          router.push("/dashboard")
          return
        }

        setProject(projectData)

        // Fetch mockups for this project
        const { data: mockupsData } = await supabase
          .from("mockups")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })

        if (mockupsData) {
          setMockups(mockupsData)
        }
      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, router, supabase])

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!project || !confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(true)

      // Delete all mockups associated with this project
      await supabase.from("mockups").delete().eq("project_id", project.id)

      // Delete the project
      await supabase.from("projects").delete().eq("id", project.id)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting project:", error)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <GlassButton asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </GlassButton>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-1">{project.description || "No description"}</p>
        </div>

        <div className="flex gap-2">
          <GlassButton asChild variant="outline">
            <Link href={`/projects/${project.id}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </GlassButton>

          <GlassButton variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </>
            )}
          </GlassButton>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Mockups</h2>
          <GlassButton asChild>
            <Link href={`/editor?project=${project.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Mockup
            </Link>
          </GlassButton>
        </div>

        {mockups.length === 0 ? (
          <Card3D className="p-8 text-center">
            <h3 className="text-xl font-medium mb-4">No Mockups Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first mockup for this project.</p>
            <GlassButton asChild>
              <Link href={`/editor?project=${project.id}`}>
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
