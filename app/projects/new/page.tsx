"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Smartphone, Monitor, Tablet } from "lucide-react"
import Link from "next/link"

const APP_CATEGORIES = [
  { value: "business", label: "Business & Productivity" },
  { value: "social", label: "Social Networking" },
  { value: "entertainment", label: "Entertainment" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health & Fitness" },
  { value: "finance", label: "Finance" },
  { value: "shopping", label: "Shopping" },
  { value: "travel", label: "Travel" },
  { value: "food", label: "Food & Drink" },
  { value: "games", label: "Games" },
  { value: "utilities", label: "Utilities" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "news", label: "News" },
  { value: "photography", label: "Photography" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "weather", label: "Weather" },
  { value: "other", label: "Other" },
]

const PLATFORMS = [
  { value: "ios", label: "iOS", icon: <Smartphone className="h-4 w-4" /> },
  { value: "android", label: "Android", icon: <Smartphone className="h-4 w-4" /> },
  { value: "web", label: "Web App", icon: <Monitor className="h-4 w-4" /> },
  { value: "tablet", label: "Tablet", icon: <Tablet className="h-4 w-4" /> },
]

const TARGET_AUDIENCES = [
  { value: "general", label: "General Audience" },
  { value: "teens", label: "Teenagers (13-19)" },
  { value: "young-adults", label: "Young Adults (20-35)" },
  { value: "adults", label: "Adults (36-55)" },
  { value: "seniors", label: "Seniors (55+)" },
  { value: "professionals", label: "Business Professionals" },
  { value: "students", label: "Students" },
  { value: "parents", label: "Parents" },
]

const APP_TYPES = [
  { value: "native", label: "Native App" },
  { value: "hybrid", label: "Hybrid App" },
  { value: "web", label: "Web Application" },
  { value: "pwa", label: "Progressive Web App" },
]

const COLOR_SCHEMES = [
  { value: "modern", label: "Modern & Minimal" },
  { value: "vibrant", label: "Vibrant & Colorful" },
  { value: "dark", label: "Dark Theme" },
  { value: "light", label: "Light Theme" },
  { value: "gradient", label: "Gradient Based" },
  { value: "monochrome", label: "Monochrome" },
  { value: "brand", label: "Brand Colors" },
]

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    platform: "",
    target_audience: "",
    app_type: "",
    color_scheme: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        throw new Error("You must be logged in to create a project")
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: formData.name,
            description: formData.description || null,
            category: formData.category,
            platform: formData.platform,
            target_audience: formData.target_audience || null,
            app_type: formData.app_type || null,
            color_scheme: formData.color_scheme || null,
            user_id: userData.user.id,
          },
        ])
        .select()

      if (error) {
        throw new Error(error.message)
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setLoading(false)
    }
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

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Project</h1>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="My Awesome App"
                  required
                  className="bg-background/30 backdrop-blur-sm border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="A brief description of your project"
                  rows={3}
                  className="bg-background/30 backdrop-blur-sm border-border/40"
                />
              </div>
            </div>

            {/* App Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">App Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="bg-background/30 backdrop-blur-sm border-border/40">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {APP_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Platform *</Label>
                  <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                    <SelectTrigger className="bg-background/30 backdrop-blur-sm border-border/40">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center gap-2">
                            {platform.icon}
                            {platform.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={formData.target_audience}
                    onValueChange={(value) => handleInputChange("target_audience", value)}
                  >
                    <SelectTrigger className="bg-background/30 backdrop-blur-sm border-border/40">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_AUDIENCES.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>App Type</Label>
                  <Select value={formData.app_type} onValueChange={(value) => handleInputChange("app_type", value)}>
                    <SelectTrigger className="bg-background/30 backdrop-blur-sm border-border/40">
                      <SelectValue placeholder="Select app type" />
                    </SelectTrigger>
                    <SelectContent>
                      {APP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select
                  value={formData.color_scheme}
                  onValueChange={(value) => handleInputChange("color_scheme", value)}
                >
                  <SelectTrigger className="bg-background/30 backdrop-blur-sm border-border/40">
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_SCHEMES.map((scheme) => (
                      <SelectItem key={scheme.value} value={scheme.value}>
                        {scheme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive">{error}</div>}

            <div className="flex justify-end space-x-4">
              <GlassButton variant="outline" type="button" asChild>
                <Link href="/dashboard">Cancel</Link>
              </GlassButton>
              <GlassButton
                type="submit"
                disabled={loading || !formData.name || !formData.category || !formData.platform}
              >
                {loading ? "Creating..." : "Create Project"}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
