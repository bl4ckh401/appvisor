"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import Link from "next/link"
import { Loader2, ArrowLeft, Edit, Trash2, Download } from "lucide-react"

export default function MockupPage() {
  const params = useParams()
  const router = useRouter()
  const [mockup, setMockup] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  // Fetch mockup and project
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const mockupId = params.id

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        // Fetch mockup
        const { data: mockupData, error: mockupError } = await supabase
          .from("mockups")
          .select("*")
          .eq("id", mockupId)
          .eq("user_id", user.id)
          .single()

        if (mockupError || !mockupData) {
          console.error("Error fetching mockup:", mockupError)
          router.push("/dashboard")
          return
        }

        setMockup(mockupData)

        // Fetch project if mockup has a project_id
        if (mockupData.project_id) {
          const { data: projectData } = await supabase
            .from("projects")
            .select("*")
            .eq("id", mockupData.project_id)
            .single()

          if (projectData) {
            setProject(projectData)
          }
        }
      } catch (error) {
        console.error("Error fetching mockup data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, router, supabase])

  // Handle mockup deletion
  const handleDeleteMockup = async () => {
    if (!mockup || !confirm("Are you sure you want to delete this mockup? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(true)

      // Delete the mockup
      await supabase.from("mockups").delete().eq("id", mockup.id)

      // Redirect to project or dashboard
      if (project) {
        router.push(`/projects/${project.id}`)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error deleting mockup:", error)
      setDeleting(false)
    }
  }

  // Handle mockup download
  const handleDownloadMockup = () => {
    if (!mockup || !mockup.image_url) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = mockup.image_url
    link.download = `${mockup.name || "mockup"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading mockup...</p>
        </div>
      </div>
    )
  }

  if (!mockup) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Mockup Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The mockup you're looking for doesn't exist or you don't have access to it.
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
          href={project ? `/projects/${project.id}` : "/dashboard"}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {project ? "Project" : "Dashboard"}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{mockup.name || "Untitled Mockup"}</h1>
          {project && <p className="text-muted-foreground mt-1">Project: {project.name}</p>}
        </div>

        <div className="flex gap-2">
          <GlassButton asChild variant="outline">
            <Link href={`/editor?mockup=${mockup.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </GlassButton>

          <GlassButton variant="outline" onClick={handleDownloadMockup} disabled={!mockup.image_url}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </GlassButton>

          <GlassButton variant="destructive" onClick={handleDeleteMockup} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Mockup Preview</h2>
          <div className="aspect-video bg-muted rounded-md overflow-hidden">
            {mockup.image_url ? (
              <img
                src={mockup.image_url || "/placeholder.svg"}
                alt={mockup.name || "App Mockup"}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Preview Available
              </div>
            )}
          </div>
        </GlassCard>

        <Card3D className="p-6">
          <h2 className="text-xl font-bold mb-4">Mockup Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p>{new Date(mockup.created_at).toLocaleString()}</p>
            </div>

            {mockup.updated_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(mockup.updated_at).toLocaleString()}</p>
              </div>
            )}

            {mockup.prompt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Prompt</h3>
                <p className="text-sm">{mockup.prompt}</p>
              </div>
            )}

            {mockup.device_type && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Device Type</h3>
                <p className="capitalize">{mockup.device_type}</p>
              </div>
            )}

            {mockup.provider && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">AI Provider</h3>
                <p className="capitalize">{mockup.provider}</p>
              </div>
            )}
          </div>
        </Card3D>
      </div>
    </div>
  )
}
