"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { AIImageGenerator } from "@/components/editor/ai-image-generator"
import { BulkGenerator } from "@/components/editor/bulk-generator"
import { ExportMockup } from "@/components/editor/export-mockup"
import { DeviceFrame3D } from "@/components/editor/device-frame-3d"
import Link from "next/link"
import { Loader2, ArrowLeft, Save, Smartphone, Tablet, CuboidIcon as Cube } from "lucide-react"

export default function EditorPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [mockup, setMockup] = useState<any>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [mockupName, setMockupName] = useState("New Mockup")
  const [deviceType, setDeviceType] = useState<"iphone" | "android" | "tablet">("iphone")
  const [use3D, setUse3D] = useState(false)
  const mockupRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const projectId = searchParams.get("project")
  const mockupId = searchParams.get("mockup")
  const templateId = searchParams.get("template")

  // Fetch project, mockup, or template data
  useEffect(() => {
    const fetchData = async () => {
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

        // If mockupId is provided, fetch mockup data
        if (mockupId) {
          const { data: mockupData, error: mockupError } = await supabase
            .from("mockups")
            .select("*")
            .eq("id", mockupId)
            .eq("user_id", user.id)
            .single()

          if (mockupError) {
            console.error("Error fetching mockup:", mockupError)
          } else if (mockupData) {
            setMockup(mockupData)
            setMockupName(mockupData.name || "Untitled Mockup")
            setBackgroundImage(mockupData.image_url || null)
            setDeviceType(mockupData.device_type || "iphone")
            setUse3D(mockupData.settings?.use3D || false)

            // If mockup has a project, fetch project data
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
          }
        }
        // If projectId is provided, fetch project data
        else if (projectId) {
          const { data: projectData, error: projectError } = await supabase
            .from("projects")
            .select("*")
            .eq("id", projectId)
            .eq("user_id", user.id)
            .single()

          if (projectError) {
            console.error("Error fetching project:", projectError)
          } else if (projectData) {
            setProject(projectData)
          }
        }
        // If templateId is provided, fetch template data
        else if (templateId) {
          const { data: templateData, error: templateError } = await supabase
            .from("templates")
            .select("*")
            .eq("id", templateId)
            .single()

          if (templateError) {
            console.error("Error fetching template:", templateError)
          } else if (templateData) {
            setMockupName(templateData.name || "New Mockup from Template")
            setBackgroundImage(templateData.thumbnail_url || null)
            setDeviceType(templateData.device_type || "iphone")
          }
        }
      } catch (error) {
        console.error("Error in editor setup:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [mockupId, projectId, templateId, router, supabase])

  // Handle image selection from AI generator
  const handleImageGenerated = (imageUrl: string) => {
    setBackgroundImage(imageUrl)
  }

  // Handle bulk image generation
  const handleBulkImagesGenerated = (imageUrls: string[]) => {
    if (imageUrls.length > 0) {
      setBackgroundImage(imageUrls[0])
    }
  }

  // Handle mockup save
  const handleSaveMockup = async () => {
    try {
      setSaving(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const mockupData = {
        name: mockupName,
        image_url: backgroundImage,
        device_type: deviceType,
        user_id: user.id,
        project_id: project?.id || null,
        settings: {
          use3D,
        },
        updated_at: new Date().toISOString(),
      }

      // If editing existing mockup
      if (mockup) {
        const { error } = await supabase.from("mockups").update(mockupData).eq("id", mockup.id)

        if (error) {
          console.error("Error updating mockup:", error)
          return
        }

        // Redirect to mockup page
        router.push(`/mockups/${mockup.id}`)
      }
      // Creating new mockup
      else {
        const { data, error } = await supabase
          .from("mockups")
          .insert({
            ...mockupData,
            created_at: new Date().toISOString(),
          })
          .select()

        if (error) {
          console.error("Error creating mockup:", error)
          return
        }

        // Redirect to mockup page
        router.push(`/mockups/${data[0].id}`)
      }
    } catch (error) {
      console.error("Error saving mockup:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading editor...</p>
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
          <input
            type="text"
            value={mockupName}
            onChange={(e) => setMockupName(e.target.value)}
            className="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
            placeholder="Mockup Name"
          />
          {project && <p className="text-muted-foreground mt-1">Project: {project.name}</p>}
        </div>

        <div className="flex gap-2">
          <GlassButton variant="outline" size="sm" onClick={() => setUse3D(!use3D)}>
            <Cube className="mr-2 h-4 w-4" />
            {use3D ? "2D View" : "3D View"}
          </GlassButton>

          <GlassButton onClick={handleSaveMockup} disabled={saving || !backgroundImage}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Mockup
              </>
            )}
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-6">
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                <GlassButton
                  variant={deviceType === "iphone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeviceType("iphone")}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  iPhone
                </GlassButton>
                <GlassButton
                  variant={deviceType === "android" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeviceType("android")}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Android
                </GlassButton>
                <GlassButton
                  variant={deviceType === "tablet" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeviceType("tablet")}
                >
                  <Tablet className="mr-2 h-4 w-4" />
                  Tablet
                </GlassButton>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div ref={mockupRef} className="relative">
                {use3D ? (
                  <DeviceFrame3D
                    deviceType={deviceType}
                    screenshotUrl={backgroundImage || "/placeholder.svg?height=600&width=300"}
                    width={400}
                    height={600}
                  />
                ) : (
                  <div
                    className="rounded-lg shadow-lg relative"
                    style={{
                      width: 300,
                      height: 600,
                      backgroundColor: "#ffffff",
                      overflow: "hidden",
                    }}
                  >
                    {backgroundImage ? (
                      <img
                        src={backgroundImage || "/placeholder.svg"}
                        alt="App Screenshot"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=600&width=300"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Generate or upload an image
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {backgroundImage && <ExportMockup mockupRef={mockupRef} mockupName={mockupName} />}
        </div>

        <div className="space-y-8">
          <AIImageGenerator onImageGenerated={handleImageGenerated} />
          <BulkGenerator onImagesGenerated={handleBulkImagesGenerated} />
        </div>
      </div>
    </div>
  )
}
