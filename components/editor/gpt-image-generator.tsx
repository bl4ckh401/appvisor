"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Wand2, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { Smartphone, Monitor, Tablet, Square } from "lucide-react"

// GPT Image Generator component for creating AI-generated mockups
interface GPTImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

// Style presets for quick selection
const stylePresets = [
  { id: "modern", name: "Modern", description: "Clean, minimalist design" },
  { id: "vibrant", name: "Vibrant", description: "Bold colors and energy" },
  { id: "professional", name: "Professional", description: "Corporate and sleek" },
  { id: "playful", name: "Playful", description: "Fun and engaging" },
  { id: "dark", name: "Dark Mode", description: "Dark themed interface" },
  { id: "glassmorphism", name: "Glassmorphism", description: "Translucent glass effects" },
]

// Device presets
const devicePresets = [
  { id: "iphone15", name: "iPhone 15 Pro", icon: <Smartphone className="h-4 w-4" /> },
  { id: "pixel8", name: "Google Pixel 8", icon: <Smartphone className="h-4 w-4" /> },
  { id: "ipadpro", name: "iPad Pro", icon: <Tablet className="h-4 w-4" /> },
  { id: "macbook", name: "MacBook Pro", icon: <Monitor className="h-4 w-4" /> },
  { id: "none", name: "No Device", icon: <Square className="h-4 w-4" /> },
]

// Color themes
const colorThemes = [
  { id: "blue", name: "Blue Ocean", colors: ["#0EA5E9", "#2563EB", "#3B82F6"] },
  { id: "purple", name: "Purple Dream", colors: ["#8B5CF6", "#7C3AED", "#6D28D9"] },
  { id: "green", name: "Fresh Green", colors: ["#10B981", "#059669", "#047857"] },
  { id: "red", name: "Warm Red", colors: ["#EF4444", "#DC2626", "#B91C1C"] },
  { id: "gradient", name: "Gradient Mix", colors: ["#8B5CF6", "#EC4899", "#F97316"] },
  { id: "custom", name: "Custom", colors: [] },
]

export function GPTImageGenerator({ onImageGenerated }: GPTImageGeneratorProps) {
  // Core states
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [provider, setProvider] = useState<"openai" | "gemini">("gemini")
  const [usageStats, setUsageStats] = useState<{ current: number; limit: number | string }>({ current: 0, limit: 5 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Generation Settings
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9" | "9:16">("9:16")
  const [imageQuality, setImageQuality] = useState<"standard" | "high" | "ultra">("high")
  const [stylePreset, setStylePreset] = useState("modern")
  const [deviceFrame, setDeviceFrame] = useState("iphone15")
  const [colorTheme, setColorTheme] = useState("blue")
  const [customColors, setCustomColors] = useState({
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#F97316",
    background: "#1a1a1a",
  })

  // Upload & Mockup Settings
  const [caption, setCaption] = useState("")
  const [subheading, setSubheading] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a")
  const [backgroundStyle, setBackgroundStyle] = useState<"solid" | "gradient" | "pattern">("gradient")
  const [backgroundPattern, setBackgroundPattern] = useState<"dots" | "grid" | "waves" | "none">("none")
  const [shadowIntensity, setShadowIntensity] = useState(50)
  const [blurAmount, setBlurAmount] = useState(0)
  const [deviceColor, setDeviceColor] = useState<"black" | "white" | "silver" | "gold">("black")

  // Advanced Settings
  const [includeReflection, setIncludeReflection] = useState(false)
  const [include3DEffect, setInclude3DEffect] = useState(true)
  const [includeGlow, setIncludeGlow] = useState(false)
  const [perspective, setPerspective] = useState<"front" | "angled" | "side">("front")
  const [lighting, setLighting] = useState<"studio" | "natural" | "dramatic">("studio")

  // UI States
  const [showPromptIdeas, setShowPromptIdeas] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const { toast } = useToast()
  const { subscription, checkFeatureAccess, getFeatureLimit, getRemaining, PremiumModal } = useFeatureAccess()

  // Creative prompt suggestions
  const promptSuggestions = [
    "A sleek fitness app with workout tracking, dark theme with neon green accents",
    "A minimalist meditation app with calming blue gradients and zen-inspired UI",
    "A food delivery app with vibrant food photography and intuitive ordering flow",
    "A productivity app with kanban boards, clean layout, and subtle animations",
    "A travel booking app with immersive destination imagery and smooth booking process",
    "A banking app with secure feel, trust indicators, and clear financial data visualization",
    "A social media app with engaging content feed and interactive story features",
    "An e-learning platform with course cards, progress tracking, and achievement badges",
  ]

  // Get usage stats on component mount
  useEffect(() => {
    const fetchUsage = async () => {
      if (!subscription) return

      try {
        const remaining = await getRemaining("mockupsPerMonth")
        const limit = getFeatureLimit("mockupsPerMonth")

        if (limit === Number.POSITIVE_INFINITY) {
          setUsageStats({ current: 0, limit: "Unlimited" })
        } else {
          const used = limit - remaining
          setUsageStats({ current: used, limit })
        }
      } catch (error) {
        console.error("Error fetching usage stats:", error)
      }
    }

    fetchUsage()
  }, [subscription])

  const buildEnhancedPrompt = (): string => {
    let enhancedPrompt = ""

    // Start with the user's custom prompt if provided
    if (prompt.trim()) {
      enhancedPrompt = prompt.trim() + ". "
    }

    // Add style preset details
    const styleDetails = stylePresets.find((s) => s.id === stylePreset)
    if (styleDetails) {
      enhancedPrompt += `Design style: ${styleDetails.name} - ${styleDetails.description}. `
    }

    // Add color theme information
    if (colorTheme !== "custom") {
      const theme = colorThemes.find((t) => t.id === colorTheme)
      if (theme) {
        enhancedPrompt += `Color scheme: ${theme.name} with colors ${theme.colors.join(", ")}. `
      }
    } else {
      enhancedPrompt += `Custom color scheme: Primary ${customColors.primary}, Secondary ${customColors.secondary}, Accent ${customColors.accent}. `
    }

    // Add device frame details
    const device = devicePresets.find((d) => d.id === deviceFrame)
    if (device && device.id !== "none") {
      enhancedPrompt += `Display on ${device.name} in ${deviceColor} color. `
    }

    // Add quality and technical details
    enhancedPrompt += `Quality: ${imageQuality} quality rendering. `

    // Add 3D and effects
    if (include3DEffect) {
      enhancedPrompt += `Add 3D depth and perspective (${perspective} view). `
    }

    if (includeReflection) {
      enhancedPrompt += "Include realistic reflections. "
    }

    if (includeGlow) {
      enhancedPrompt += "Add glowing effects around important elements. "
    }

    // Add lighting
    enhancedPrompt += `Lighting: ${lighting} lighting setup. `

    // Add final quality directives
    enhancedPrompt += "Create a professional, high-quality app mockup that looks photorealistic and polished. "
    enhancedPrompt += "Make it suitable for app store listings and marketing materials."

    return enhancedPrompt
  }

  const buildMockupPrompt = (): string => {
    let mockupPrompt = `Create a professional app store screenshot mockup. `

    // Add captions
    if (caption.trim()) {
      mockupPrompt += `Main caption: "${caption}" displayed prominently. `
    }

    if (subheading.trim()) {
      mockupPrompt += `Subheading: "${subheading}" displayed below the main caption. `
    }

    // Add background style
    mockupPrompt += `Background: ${backgroundStyle} style with ${backgroundColor} as the base color. `

    if (backgroundStyle === "gradient") {
      mockupPrompt += `Create a smooth gradient effect. `
    }

    if (backgroundPattern !== "none") {
      mockupPrompt += `Include subtle ${backgroundPattern} pattern in the background. `
    }

    // Add shadow and blur effects
    mockupPrompt += `Shadow intensity: ${shadowIntensity}% for depth. `

    if (blurAmount > 0) {
      mockupPrompt += `Apply ${blurAmount}% background blur for focus. `
    }

    // Add all other settings from buildEnhancedPrompt
    mockupPrompt += buildEnhancedPrompt()

    return mockupPrompt
  }

  const generateImage = async () => {
    if (!prompt.trim() && stylePreset === "modern" && colorTheme === "blue") {
      toast({
        title: "Please enter a description or customize the settings",
        description: "You need to provide a description or customize the settings to generate an image.",
        variant: "destructive",
      })
      return
    }

    if (typeof usageStats.limit === "number" && usageStats.current >= usageStats.limit) {
      toast({
        title: "Monthly limit reached",
        description: "You've reached your monthly mockup limit. Upgrade your plan to create more mockups.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating(true)
      toast({
        title: "Generating image...",
        description: "Your mockup is being generated. Please wait.",
      })

      await trackFeatureUsage("mockup_generation", {
        provider,
        prompt_length: prompt.length,
        aspect_ratio: aspectRatio,
        style_preset: stylePreset,
        quality: imageQuality,
      })

      const enhancedPrompt = buildEnhancedPrompt()
      console.log("Enhanced prompt:", enhancedPrompt)

      const endpoint = provider === "openai" ? "/api/generate-image" : "/api/gemini/generate-image"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          size: "512x512",
          aspectRatio: aspectRatio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to generate image: ${response.status} ${response.statusText}`)
      }

      if (!data.url) {
        throw new Error("No image URL returned from the API")
      }

      setGeneratedImage(data.url)
      setRetryCount(0)

      setUsageStats((prev) => ({
        current: prev.current + 1,
        limit: prev.limit,
      }))

      toast({
        title: "Image generated!",
        description: "Your mockup has been created successfully.",
      })

      // Call the callback to pass the image to the parent component
      if (onImageGenerated) {
        onImageGenerated(data.url)
      }
    } catch (err) {
      console.error("Image generation error:", err)
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAppStoreMockup = async () => {
    if (!uploadedImage) {
      toast({
        title: "Please upload a screenshot first",
        description: "You need to upload a screenshot before generating a mockup.",
        variant: "destructive",
      })
      return
    }

    if (!caption.trim()) {
      toast({
        title: "Please enter a caption for your mockup",
        description: "You need to provide a caption for your mockup.",
        variant: "destructive",
      })
      return
    }

    if (typeof usageStats.limit === "number" && usageStats.current >= usageStats.limit) {
      toast({
        title: "Monthly limit reached",
        description: "You've reached your monthly mockup limit. Upgrade your plan to create more mockups.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating(true)
      toast({
        title: "Generating mockup...",
        description: "Your app store mockup is being generated. Please wait.",
      })

      await trackFeatureUsage("mockup_generation", {
        provider,
        has_screenshot: true,
        aspect_ratio: aspectRatio,
        style_preset: stylePreset,
        quality: imageQuality,
      })

      const mockupPrompt = buildMockupPrompt()
      console.log("Mockup prompt:", mockupPrompt)

      const endpoint = provider === "openai" ? "/api/generate-app-mockup" : "/api/gemini/generate-mockup"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          screenshot: uploadedImage,
          caption,
          backgroundColor,
          style: backgroundStyle,
          prompt: mockupPrompt,
          aspectRatio: aspectRatio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to generate mockup: ${response.status} ${response.statusText}`)
      }

      setGeneratedImage(data.url)
      setRetryCount(0)

      setUsageStats((prev) => ({
        current: prev.current + 1,
        limit: prev.limit,
      }))

      toast({
        title: "Mockup generated!",
        description: "Your app store mockup has been created successfully.",
      })

      // Call the callback to pass the image to the parent component
      if (onImageGenerated) {
        onImageGenerated(data.url)
      }
    } catch (err) {
      console.error("Mockup generation error:", err)
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Failed to generate mockup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(retryCount + 1)
    if (uploadedImage) {
      generateAppStoreMockup()
    } else {
      generateImage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File size too large",
        description: "File size should be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      await trackFeatureUsage("export", {
        type: "image_download",
        format: "png",
      })

      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `app-mockup-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Downloaded!",
        description: "Your mockup has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRegenerate = () => {
    setGeneratedImage(null)
    generateImage()
  }

  const handlePromptIdeaClick = (idea: string) => {
    setPrompt(idea)
    setShowPromptIdeas(false)
  }

  const handleColorThemeChange = (themeId: string) => {
    setColorTheme(themeId)
    if (themeId !== "custom") {
      const theme = colorThemes.find((t) => t.id === themeId)
      if (theme && theme.colors.length > 0) {
        setCustomColors({
          primary: theme.colors[0] || "#8B5CF6",
          secondary: theme.colors[1] || "#EC4899",
          accent: theme.colors[2] || "#F97316",
          background: backgroundColor,
        })
      }
    }
  }

  const isFreeTier = !subscription || subscription.plan === "free"
  const showUpgradeNeeded = isFreeTier && typeof usageStats.limit === "number" && usageStats.current >= usageStats.limit

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">App Description</Label>
          <Textarea
            id="prompt"
            placeholder="Describe your app mockup (e.g., 'A fitness tracking app with a dashboard showing daily steps, calories burned, and workout history')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isGenerating}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={generateImage} disabled={isGenerating || !prompt.trim()} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Mockup
              </>
            )}
          </Button>

          {generatedImage && (
            <>
              <Button variant="outline" onClick={handleRegenerate} disabled={isGenerating}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={isGenerating}>
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {generatedImage && (
          <div className="mt-4">
            <img
              src={generatedImage || "/placeholder.svg"}
              alt="Generated app mockup"
              className="w-full rounded-lg border"
              onError={(e) => {
                console.error("Error loading generated image")
                e.currentTarget.src = "/placeholder.svg?height=400&width=300"
              }}
            />
          </div>
        )}
      </Card>

      {/* Render the PremiumModal from useFeatureAccess hook */}
      <PremiumModal />
    </>
  )
}
