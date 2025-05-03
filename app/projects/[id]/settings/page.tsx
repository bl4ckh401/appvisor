"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import Link from "next/link"
import { Loader2, Save, ArrowLeft } from "lucide-react"

export default function ProjectSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    app_name: "",
    app_category: "",
    platform: "ios",
  })
  const supabase = createClient()

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
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
        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          app_name: projectData.app_name || "",
          app_category: projectData.app_category || "",
          platform: projectData.platform || "ios",
        })
      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id, router, supabase])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!project) return

    try {
      setSaving(true)

      // Update project
      const { error } = await supabase
        .from("projects")
        .update({
          name: formData.name,
          description: formData.description,
          app_name: formData.app_name,
          app_category: formData.app_category,
          platform: formData.platform,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (error) {
        console.error("Error updating project:", error)
        return
      }

      // Redirect to project page
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error("Error saving project:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading project settings...</p>
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
          href={`/projects/${project.id}`}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Project Settings</h1>

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>

            <div>
              <label htmlFor="app_name" className="block text-sm font-medium mb-1">
                App Name
              </label>
              <input
                type="text"
                id="app_name"
                name="app_name"
                value={formData.app_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>

            <div>
              <label htmlFor="app_category" className="block text-sm font-medium mb-1">
                App Category
              </label>
              <select
                id="app_category"
                name="app_category"
                value={formData.app_category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Select a category</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Finance">Finance</option>
                <option value="Games">Games</option>
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Music">Music</option>
                <option value="Navigation">Navigation</option>
                <option value="Productivity">Productivity</option>
                <option value="Social Networking">Social Networking</option>
                <option value="Utilities">Utilities</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="platform"
                    value="ios"
                    checked={formData.platform === "ios"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  iOS
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="platform"
                    value="android"
                    checked={formData.platform === "android"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Android
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="platform"
                    value="both"
                    checked={formData.platform === "both"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Both
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <GlassButton type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
