"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { DeviceFrame3D } from "@/components/editor/device-frame-3d"
import { ExportMockup } from "@/components/editor/export-mockup"
import { ArrowLeft, Download, Pencil, Smartphone, Tablet, Loader2, CuboidIcon as Cube } from "lucide-react"

export default function MockupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const mockupId = params.id as string
  const [mockup, setMockup] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [use3D, setUse3D] = useState(false)
  const mockupRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchMockupData = async () => {
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

        // Fetch mockup details
        const { data: mockupData, error: mockupError } = await supabase
          .from("mockups")
          .select("*")
          .eq("id", mockupId)
          .single()

        if (mockupError) throw mockupError

        setMockup(mockupData)
        setUse3D(mockupData.settings?.use3D || false)

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", mockupData.project_id)
          .single()

        if (projectError) throw projectError

        // Verify project belongs to user
        if (projectData.user_id !== user.id) {
          throw new Error("You don't have permission to view this mockup")
        }

        setProject(projectData)
      } catch (err) {
        console.error("Error fetching mockup:", err)
        setError(err.message || "Failed to load mockup")
      } finally {
        setLoading(false)
      }
    }

    fetchMockupData()
  }, [mockupId, router, supabase])

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading mockup...</p>
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
          href={`/projects/${mockup.project_id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{mockup.name}</h1>
          <p className="text-muted-foreground mt-1">
            {project?.name} • {mockup.device_type.charAt(0).toUpperCase() + mockup.device_type.slice(1)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton variant="outline" size="sm" onClick={() => setUse3D(!use3D)}>
            <Cube className="mr-2 h-4 w-4" />
            {use3D ? "2D View" : "3D View"}
          </GlassButton>
          <GlassButton variant="outline" size="sm" asChild>
            <Link href={`/editor?project=${mockup.project_id}&mockup=${mockup.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </GlassButton>
          <GlassButton size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-6 flex items-center justify-center">
            <div ref={mockupRef} className="relative">
              {use3D ? (
                <DeviceFrame3D
                  deviceType={mockup.device_type}
                  screenshotUrl={mockup.background_image_url || "/placeholder.svg?height=600&width=300"}
                  width={400}
                  height={600}
                />
              ) : (
                <div
                  className="rounded-lg shadow-lg relative"
                  style={{
                    width: 300,
                    height: 600,
                    backgroundColor: mockup.background_color || "#ffffff",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={mockup.background_image_url || "/placeholder.svg?height=600&width=300"}
                    alt={mockup.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=600&width=300"
                    }}
                  />
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Mockup Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Device Type</h3>
                <p className="flex items-center mt-1">
                  {mockup.device_type === "tablet" ? (
                    <Tablet className="mr-2 h-4 w-4" />
                  ) : (
                    <Smartphone className="mr-2 h-4 w-4" />
                  )}
                  {mockup.device_type.charAt(0).toUpperCase() + mockup.device_type.slice(1)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p>{new Date(mockup.created_at).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(mockup.updated_at).toLocaleDateString()}</p>
              </div>

              {mockup.settings?.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-sm">{mockup.settings.description}</p>
                </div>
              )}
            </div>
          </GlassCard>

          <ExportMockup mockupRef={mockupRef} mockupName={mockup.name} />
        </div>
      </div>
    </div>
  )
}
