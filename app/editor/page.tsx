"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ExportMockup } from "@/components/editor/export-mockup"
import { GPTImageGenerator } from "@/components/editor/gpt-image-generator"
import {
  Smartphone,
  Tablet,
  Download,
  Save,
  Sparkles,
  CuboidIcon as Cube,
  Loader2,
  Settings,
  ImageIcon,
  LayoutGrid,
  Menu,
  X,
  ChevronLeft,
  Layers,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const projectId = searchParams.get("project")
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const [loading, setLoading] = useState(true)
  const [mockupName, setMockupName] = useState("Untitled Mockup")
  const [deviceType, setDeviceType] = useState("iphone")
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a")
  const [use3D, setUse3D] = useState(false)
  const [generatingMockup, setGeneratingMockup] = useState(false)
  const [mockupImage, setMockupImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mockups, setMockups] = useState<string[]>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile)
  const [activeTab, setActiveTab] = useState("mockup")
  const mockupRef = useRef(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  // Add this function to handle image load
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  }

  // Load template or project data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Initialize Supabase client with error handling
        let supabase
        try {
          supabase = createClient()
        } catch (supabaseError) {
          console.error("Error initializing Supabase client:", supabaseError)
          setError("Database connection failed. Please check your configuration.")
          setLoading(false)
          return
        }

        // Load template data if templateId is provided
        if (templateId) {
          try {
            console.log("Loading template:", templateId)

            // Check if we can connect to Supabase first
            const { data: healthCheck, error: healthError } = await supabase
              .from("templates")
              .select("count")
              .limit(1)
              .maybeSingle()

            if (healthError) {
              console.log("Templates table not accessible:", healthError.message)
              // Continue without template data
            } else {
              // Load template data from the database
              const { data: template, error } = await supabase
                .from("templates")
                .select("*")
                .eq("id", templateId)
                .maybeSingle()

              if (error) {
                console.error("Error loading template:", error)
                // Don't throw, just log and continue
              } else if (template) {
                setMockupName(`${template.name} Mockup`)
                // Set device type based on platform if available
                if (template.platform === "ios") {
                  setDeviceType("iphone")
                } else if (template.platform === "android") {
                  setDeviceType("android")
                }
              }
            }
          } catch (templateError) {
            console.error("Error loading template:", templateError)
            // Continue without template data
          }
        }

        // Load project/mockup data if projectId is provided
        if (projectId) {
          const mockupId = searchParams.get("mockup")

          if (mockupId) {
            try {
              console.log("Loading mockup:", mockupId)

              // Check if mockups table exists
              const { data: mockupHealthCheck, error: mockupHealthError } = await supabase
                .from("mockups")
                .select("count")
                .limit(1)
                .maybeSingle()

              if (mockupHealthError) {
                console.log("Mockups table not accessible:", mockupHealthError.message)
                // Continue with default values
              } else {
                const { data: mockup, error } = await supabase
                  .from("mockups")
                  .select("*")
                  .eq("id", mockupId)
                  .maybeSingle()

                if (error) {
                  console.error("Error loading mockup:", error)
                  // Continue with default values
                } else if (mockup) {
                  setMockupName(mockup.name || "Untitled Mockup")
                  setDeviceType(mockup.device_type || "iphone")
                  setBackgroundColor(mockup.background_color || "#1a1a1a")
                  setUse3D(mockup.settings?.use3D || false)

                  // Load mockup image if available
                  if (mockup.background_image_url) {
                    setMockupImage(mockup.background_image_url)
                  }

                  // Load mockups array if available
                  if (mockup.settings?.mockups && Array.isArray(mockup.settings.mockups)) {
                    setMockups(mockup.settings.mockups)
                  }
                }
              }
            } catch (mockupError) {
              console.error("Error loading mockup:", mockupError)
              // Continue with default values
            }
          }
        }

        // Set default project name if we have a projectId but no specific mockup name
        if (projectId && mockupName === "Untitled Mockup") {
          setMockupName(`Project ${projectId} Mockup`)
        }
      } catch (err) {
        console.error("Error in loadData:", err)
        setError("Failed to load editor data. You can still use the editor with default settings.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [templateId, projectId, searchParams])

  // Handle mobile sidebar state
  useEffect(() => {
    if (isMobile) {
      setLeftSidebarOpen(false)
      setRightSidebarOpen(false)
    } else {
      setLeftSidebarOpen(true)
      setRightSidebarOpen(true)
    }
  }, [isMobile])

  const handleImageGenerated = (imageUrl: string) => {
    setMockupImage(imageUrl)
    // Add to mockups array if it's a new image
    if (!mockups.includes(imageUrl)) {
      setMockups([...mockups, imageUrl])
    }

    // Save the mockup automatically
    saveMockup(imageUrl)

    // Show success toast
    toast({
      title: "Image generated!",
      description: "Your mockup has been generated and saved.",
    })
  }

  const saveMockup = async (imageUrl = mockupImage) => {
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to save mockups",
          variant: "destructive",
        })
        return
      }

      if (!projectId) {
        toast({
          title: "No project selected",
          description: "Please create or select a project first.",
          variant: "destructive",
        })
        return
      }

      // Check if we're updating an existing mockup
      const mockupId = searchParams.get("mockup")

      const mockupData = {
        name: mockupName,
        project_id: projectId,
        device_type: deviceType,
        background_color: backgroundColor,
        background_image_url: imageUrl,
        settings: {
          use3D,
          mockups: mockups,
        },
      }

      try {
        let result

        if (mockupId) {
          // Update existing mockup
          result = await supabase.from("mockups").update(mockupData).eq("id", mockupId).select()
        } else {
          // Create new mockup
          result = await supabase.from("mockups").insert([mockupData]).select()
        }

        const { data, error } = result

        if (error) {
          if (error.message.includes("relation") && error.message.includes("does not exist")) {
            // Create the mockups table if it doesn't exist
            toast({
              title: "Database setup required",
              description: "The mockups table doesn't exist yet. Please run the database setup script.",
            })
            return
          }
          throw error
        }

        toast({
          title: "Success!",
          description: "Mockup saved successfully!",
        })

        // If this was a new mockup, update the URL to include the mockup ID
        if (!mockupId && data && data[0]) {
          router.push(`/editor?project=${projectId}&mockup=${data[0].id}`)
        }
      } catch (dbError) {
        console.error("Database error:", dbError)
        toast({
          title: "Database error",
          description: "There was an issue saving to the database.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving mockup:", error)
      toast({
        title: "Error",
        description: "Failed to save mockup. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBackToProject = () => {
    if (projectId) {
      router.push(`/projects/${projectId}`)
    } else {
      router.push("/dashboard")
    }
  }

  const handle3DToggle = () => {
    toast({
      title: "Coming Soon",
      description: "3D mode will be available soon!",
    })
  }

  const handleBulkGeneration = () => {
    toast({
      title: "Coming Soon",
      description: "Bulk generation will be available soon!",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card3D className="p-8 text-center glossy-card" intensity="medium">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading editor...</p>
        </Card3D>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card3D className="p-8 text-center glossy-card max-w-md" intensity="medium">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Loading Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <GlassButton onClick={() => window.location.reload()} className="glossy-button">
            Retry
          </GlassButton>
        </Card3D>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Toolbar */}
      <motion.div
        className="h-16 border-b border-border/30 bg-background/50 backdrop-blur-md flex items-center justify-between px-4 glossy z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <GlassButton variant="ghost" size="icon" onClick={handleBackToProject} className="md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </GlassButton>

          <GlassButton
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </GlassButton>

          <Input
            value={mockupName}
            onChange={(e) => setMockupName(e.target.value)}
            className="w-40 md:w-64 bg-background/30 backdrop-blur-sm border-border/40 glossy"
          />
        </div>

        <div className="flex items-center gap-2">
          <GlassButton variant="outline" size="sm" onClick={() => saveMockup()} className="glossy-button">
            <Save className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </GlassButton>

          <GlassButton size="sm" className="glossy-button" onClick={() => setRightSidebarOpen(!rightSidebarOpen)}>
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </GlassButton>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Tools */}
        <motion.div
          className={`${
            leftSidebarOpen ? "w-16 md:w-20" : "w-0"
          } border-r border-border/30 bg-background/50 backdrop-blur-md flex flex-col items-center py-4 transition-all duration-300 z-10 glossy absolute md:relative h-full`}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {leftSidebarOpen && (
            <>
              <GlassButton
                variant="ghost"
                size="icon"
                title="AI Generate"
                onClick={() => {
                  setRightSidebarOpen(true)
                  setActiveTab("mockup")
                }}
                className="glossy mb-2"
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </GlassButton>

              <div className="relative">
                <GlassButton
                  variant="ghost"
                  size="icon"
                  className="mb-2 glossy opacity-60 cursor-not-allowed"
                  title="3D Mode (Coming Soon)"
                  onClick={handle3DToggle}
                  disabled
                >
                  <Cube className="h-5 w-5" />
                </GlassButton>
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-background text-xs px-1.5 py-0.5 border border-primary"
                >
                  <Clock className="h-3 w-3 mr-1 inline-block" />
                  Soon
                </Badge>
              </div>

              <GlassButton
                variant="ghost"
                size="icon"
                className="mb-2 glossy"
                title="Device Settings"
                onClick={() => {
                  setRightSidebarOpen(true)
                  setActiveTab("device")
                }}
              >
                <Smartphone className="h-5 w-5" />
              </GlassButton>

              <div className="relative">
                <GlassButton
                  variant="ghost"
                  size="icon"
                  className="mb-2 glossy opacity-60 cursor-not-allowed"
                  title="Bulk Generation (Coming Soon)"
                  onClick={handleBulkGeneration}
                  disabled
                >
                  <Layers className="h-5 w-5" />
                </GlassButton>
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-background text-xs px-1.5 py-0.5 border border-primary"
                >
                  <Clock className="h-3 w-3 mr-1 inline-block" />
                  Soon
                </Badge>
              </div>

              <div className="mt-auto">
                <GlassButton
                  variant="ghost"
                  size="icon"
                  title="Export"
                  className="glossy"
                  onClick={() => {
                    setRightSidebarOpen(true)
                    setActiveTab("export")
                  }}
                >
                  <Download className="h-5 w-5" />
                </GlassButton>
              </div>

              {isMobile && (
                <GlassButton
                  variant="ghost"
                  size="icon"
                  className="mt-4 glossy"
                  onClick={() => setLeftSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </GlassButton>
              )}
            </>
          )}
        </motion.div>

        {/* Canvas Area */}
        <motion.div
          className="flex-1 overflow-auto p-4 md:p-8 bg-muted/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            {mockupImage && mockupImage !== "/placeholder.svg" ? (
              <div
                ref={mockupRef}
                className="rounded-lg shadow-lg relative neon-border image-pop"
                style={{
                  width: imageDimensions?.width || "auto",
                  height: imageDimensions?.height || "auto",
                  backgroundColor: backgroundColor,
                  overflow: "hidden",
                  display: imageDimensions ? "block" : "inline-block", // inline-block while loading to fit content
                }}
              >
                <img
                  src={mockupImage || "/placeholder.svg"}
                  alt="App Screenshot"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={(e) => {
                    // Just hide the image if it errors, no placeholder
                    setMockupImage(null)
                    setImageDimensions(null)
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-lg font-medium mb-2">No mockup yet</h3>
                <p className="text-muted-foreground mb-4">Generate your first AI mockup to get started</p>
                <GlassButton
                  onClick={() => {
                    setRightSidebarOpen(true)
                    setActiveTab("mockup")
                  }}
                  className="glossy-button"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Mockup
                </GlassButton>
              </div>
            )}

            {/* Generated Mockups Gallery */}
            {mockups.length > 0 && (
              <div className="mt-8 w-full max-w-3xl">
                <h3 className="text-lg font-medium mb-4 flex items-center text-glow">
                  <LayoutGrid className="h-4 w-4 mr-2 text-primary" />
                  Generated Mockups
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mockups.map((url, index) => (
                    <div
                      key={index}
                      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all image-pop ${
                        mockupImage === url ? "ring-2 ring-primary neon-border" : "hover:opacity-90"
                      }`}
                      onClick={() => setMockupImage(url)}
                    >
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Generated mockup ${index + 1}`}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=100"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Sidebar - Properties */}
        <motion.div
          className={`${
            rightSidebarOpen ? "w-full sm:w-80" : "w-0"
          } border-l border-border/30 bg-background/50 backdrop-blur-md overflow-y-auto transition-all duration-300 z-10 glossy absolute right-0 h-full`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {rightSidebarOpen && (
            <>
              <div className="flex justify-between items-center p-4 border-b border-border/30">
                <h3 className="text-lg font-medium text-glow">Editor Tools</h3>
                <GlassButton variant="ghost" size="icon" onClick={() => setRightSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </GlassButton>
              </div>

              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-background/40 backdrop-blur-md">
                  <TabsTrigger value="mockup" className="flex-1">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Mockup</span>
                  </TabsTrigger>
                  <TabsTrigger value="device" className="flex-1">
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Device</span>
                  </TabsTrigger>
                  <TabsTrigger value="export" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mockup" className="p-4 space-y-4">
                  <Tabs defaultValue="gpt">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="gpt" className="flex-1">
                        <Sparkles className="h-4 w-4 mr-2" />
                        GPT Image
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="gpt">
                      <GPTImageGenerator onImageGenerated={handleImageGenerated} />
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="device" className="p-4 space-y-4">
                  <h3 className="text-lg font-medium text-glow">Device Settings</h3>

                  <div className="space-y-2">
                    <Label>Device Type</Label>
                    <div className="flex gap-2 flex-wrap">
                      <GlassButton
                        variant={deviceType === "iphone" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDeviceType("iphone")}
                        className={deviceType === "iphone" ? "glossy-button" : ""}
                      >
                        <Smartphone className="mr-2 h-4 w-4" />
                        iPhone
                      </GlassButton>
                      <GlassButton
                        variant={deviceType === "android" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDeviceType("android")}
                        className={deviceType === "android" ? "glossy-button" : ""}
                      >
                        <Smartphone className="mr-2 h-4 w-4" />
                        Android
                      </GlassButton>
                      <GlassButton
                        variant={deviceType === "tablet" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDeviceType("tablet")}
                        className={deviceType === "tablet" ? "glossy-button" : ""}
                      >
                        <Tablet className="mr-2 h-4 w-4" />
                        Tablet
                      </GlassButton>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 bg-background/30 backdrop-blur-sm border-border/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="3d-mode">3D Mode</Label>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="3d-mode" className="text-sm text-muted-foreground">
                          Coming Soon
                        </Label>
                        <Switch id="3d-mode" disabled />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      3D mode will show your app in a realistic device frame. You'll be able to rotate and zoom the
                      device.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="export" className="p-4 space-y-4">
                  <ExportMockup mockupRef={mockupRef} mockupName={mockupName} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
