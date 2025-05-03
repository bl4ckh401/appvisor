"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    app_name: "",
    app_category: "",
    platform: "ios",
  })
  const supabase = createClient()

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

    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      // Create project
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: formData.name,
          description: formData.description,
          app_name: formData.app_name,
          app_category: formData.app_category,
          platform: formData.platform,
          user_id: user.id,
        })
        .select()

      if (error) {
        console.error("Error creating project:", error)
        return
      }

      // Redirect to project page
      router.push(`/projects/${data[0].id}`)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setLoading(false)
    }
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

      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>

      <GlassCard className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="My Awesome App"
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
                placeholder="A brief description of your project"
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
                placeholder="The name of your app"
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
              <GlassButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </GlassButton>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
