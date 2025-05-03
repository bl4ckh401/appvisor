"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Smartphone, Pencil, Trash2, Loader2, Settings, Download, Users } from "lucide-react"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [mockups, setMockups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true)

        // Check authentication
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single()

        if (projectError) throw projectError

        // Verify project belongs to user
        if (projectData.user_id !== user.id) {
          throw new Error("You don't have permission to view this project")
        }

        setProject(projectData)

        // Fetch mockups for this project
        try {
          const { data: mockupsData, error: mockupsError } = await supabase
            .from("mockups")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })

          if (mockupsError) {
            if (mockupsError.message.includes("relation") && mockupsError.message.includes("does not exist")) {
              console.log("Mockups table doesn't exist yet, using empty array")
              setMockups([])
            } else {
              throw mockupsError
            }
          } else {
            setMockups(mockupsData || [])
          }
        } catch (mockupsErr) {
          console.error("Error fetching mockups:", mockupsErr)
          setMockups([])
        }
      } catch (err) {
        console.error("Error fetching project:", err)
        setError(err.message || "Failed to load project")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId, router, supabase])

  const deleteMockup = async (mockupId: string) => {
    if (!confirm("Are you sure you want to delete this mockup?")) return

    try {
      const { error } = await supabase.from("mockups").delete().eq("id", mockupId)

      if (error) throw error

      // Update the mockups list
      setMockups(mockups.filter((mockup) => mockup.id !== mockupId))
    } catch (err) {
      console.error("Error deleting mockup:", err)
      alert("Failed to delete mockup: " + err.message)
    }
  }

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading project...</p>
        </GlassCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <GlassCard className="p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <GlassButton asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground mt-1">{project?.description || "No description"}</p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </GlassButton>
          <GlassButton asChild>
            <Link href={`/editor?project=${projectId}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Mockup
            </Link>
          </GlassButton>
        </div>
      </div>

      <Tabs defaultValue="mockups">
        <TabsList className="bg-background/40 backdrop-blur-md mb-6">
          <TabsTrigger value="mockups">Mockups</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="mockups">
          {mockups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockups.map((mockup) => (
                <MockupCard
                  key={mockup.id}
                  mockup={mockup}
                  projectId={projectId}
                  onDelete={() => deleteMockup(mockup.id)}
                />
              ))}
              <NewMockupCard projectId={projectId} />
            </div>
          ) : (
            <div className="text-center py-12">
              <GlassCard className="p-8 max-w-md mx-auto">
                <h3 className="text-xl font-bold mb-2">No mockups yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first mockup to showcase your app in the app store.
                </p>
                <GlassButton asChild>
                  <Link href={`/editor?project=${projectId}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Mockup
                  </Link>
                </GlassButton>
              </GlassCard>
            </div>
          )}
        </TabsContent>

        <TabsContent value="team">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Team Members</h3>
              <GlassButton size="sm">
                <Users className="mr-2 h-4 w-4" />
                Invite Members
              </GlassButton>
            </div>

            <div className="text-center py-8">
              <p className="text-muted-foreground">Team collaboration is available on the Team plan.</p>
              <GlassButton className="mt-4" asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </GlassButton>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="analytics">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Analytics</h3>
              <GlassButton size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </GlassButton>
            </div>

            <div className="text-center py-8">
              <p className="text-muted-foreground">Analytics are available on the Pro and Team plans.</p>
              <GlassButton className="mt-4" asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </GlassButton>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MockupCard({ mockup, projectId, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <GlassCard className="overflow-hidden">
        <div className="h-48 bg-muted/50 flex items-center justify-center relative">
          {mockup.background_image_url ? (
            <img
              src={mockup.background_image_url || "/placeholder.svg"}
              alt={mockup.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=200&width=300"
              }}
            />
          ) : (
            <Smartphone className="h-12 w-12 text-muted-foreground/50" />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold">{mockup.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {mockup.device_type.charAt(0).toUpperCase() + mockup.device_type.slice(1)}
          </p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-muted-foreground">{new Date(mockup.created_at).toLocaleDateString()}</span>
            <div className="flex gap-1">
              <GlassButton size="sm" variant="ghost" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </GlassButton>
              <GlassButton size="sm" variant="ghost" asChild>
                <Link href={`/editor?project=${projectId}&mockup=${mockup.id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </GlassButton>
              <GlassButton size="sm" asChild>
                <Link href={`/mockups/${mockup.id}`}>View</Link>
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function NewMockupCard({ projectId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <GlassCard className="flex flex-col items-center justify-center p-8 h-full border-dashed">
        <Plus className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-bold mb-2">Create New Mockup</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">Generate AI-powered app store mockups</p>
        <GlassButton asChild>
          <Link href={`/editor?project=${projectId}`}>Create Mockup</Link>
        </GlassButton>
      </GlassCard>
    </motion.div>
  )
}
