"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Trash2, Loader2, AlertTriangle } from "lucide-react"

export default function ProjectSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
          throw new Error("You don't have permission to edit this project")
        }

        setProject(projectData)
        setName(projectData.name)
        setDescription(projectData.description || "")
      } catch (err) {
        console.error("Error fetching project:", err)
        setError(err.message || "Failed to load project")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId, router, supabase])

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase
        .from("projects")
        .update({
          name,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)

      if (error) throw error

      alert("Project updated successfully!")
    } catch (err) {
      console.error("Error updating project:", err)
      setError(err.message || "Failed to update project")
    } finally {
      setSaving(false)
    }
  }

  const deleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)

      // Delete all mockups associated with this project
      const { error: mockupsError } = await supabase.from("mockups").delete().eq("project_id", projectId)

      if (mockupsError) throw mockupsError

      // Delete the project
      const { error: projectError } = await supabase.from("projects").delete().eq("id", projectId)

      if (projectError) throw projectError

      router.push("/dashboard")
    } catch (err) {
      console.error("Error deleting project:", err)
      setError(err.message || "Failed to delete project")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading project settings...</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Project Settings</h1>

      <div className="max-w-2xl">
        <Tabs defaultValue="general">
          <TabsList className="bg-background/40 backdrop-blur-md mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GlassCard className="p-6">
              <form onSubmit={updateProject} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome App"
                    required
                    className="bg-background/30 backdrop-blur-sm border-border/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of your project"
                    rows={4}
                    className="bg-background/30 backdrop-blur-sm border-border/40"
                  />
                </div>

                {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive">{error}</div>}

                <div className="flex justify-end">
                  <GlassButton type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </TabsContent>

          <TabsContent value="danger">
            <GlassCard className="p-6 border-destructive/20">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-destructive">Delete Project</h3>
                    <p className="text-muted-foreground">
                      This action cannot be undone. This will permanently delete the project and all associated mockups.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <GlassButton variant="destructive" onClick={deleteProject} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </>
                    )}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
