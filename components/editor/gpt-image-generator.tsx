"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  AlertCircle,
  Upload,
  Wand2,
  Zap,
  Lightbulb,
  Palette,
  X,
  Clock,
  Sliders,
  Smartphone,
  Monitor,
  Tablet,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Settings2,
} from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { GlassCard } from "@/components/ui/glass-card"
import Badge from "@/components/ui/badge"
import { useFeatureAccess } from "@/hooks/use-feature-access" // Import useFeatureAccess

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
  const [userPrompt, setUserPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    if (userPrompt.trim()) {
      enhancedPrompt = userPrompt.trim() + ". "
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
    if (!userPrompt.trim() && stylePreset === "modern" && colorTheme === "blue") {
      setError("Please enter a description or customize the settings")
      return
    }

    if (typeof usageStats.limit === "number" && usageStats.current >= usageStats.limit) {
      setError("You've reached your monthly mockup limit. Upgrade your plan to create more mockups.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      //await trackFeatureUsage("mockup_generation", {
      //  provider,
      //  prompt_length: userPrompt.length,
      //  aspect_ratio: aspectRatio,
      //  style_preset: stylePreset,
      //  quality: imageQuality,
      //})

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
    } catch (err) {
      console.error("Image generation error:", err)
      setError(err.message || "An error occurred while generating the image")

      toast({
        title: "Generation failed",
        description: err.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAppStoreMockup = async () => {
    if (!uploadedImage) {
      setError("Please upload a screenshot first")
      return
    }

    if (!caption.trim()) {
      setError("Please enter a caption for your mockup")
      return
    }

    if (typeof usageStats.limit === "number" && usageStats.current >= usageStats.limit) {
      setError("You've reached your monthly mockup limit. Upgrade your plan to create more mockups.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      //await trackFeatureUsage("mockup_generation", {
      //  provider,
      //  has_screenshot: true,
      //  aspect_ratio: aspectRatio,
      //  style_preset: stylePreset,
      //  quality: imageQuality,
      //})

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
    } catch (err) {
      console.error("Mockup generation error:", err)
      setError(err.message || "An error occurred while generating the mockup")

      toast({
        title: "Generation failed",
        description: err.message || "Failed to generate mockup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(retryCount + 1)
    setError(null)
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
      setError("Please upload an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const useGeneratedImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage)
      setGeneratedImage(null)
      setUserPrompt("")
    }
  }

  const useFallbackImage = () => {
    const fallbackUrl = `/placeholder.svg?height=512&width=512&text=${encodeURIComponent(
      userPrompt || caption || "App Mockup",
    )}`
    setGeneratedImage(fallbackUrl)
    setError(null)
  }

  const handlePromptIdeaClick = (idea: string) => {
    setUserPrompt(idea)
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
    <GlassCard className="p-4 glossy-card" intensity="medium">
      <h3 className="text-lg font-medium mb-4 flex items-center text-glow">
        <Sparkles className="h-4 w-4 text-primary mr-2" />
        AI Mockup Generator
      </h3>

      {/* Usage stats */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <Label className="text-sm">Monthly Usage</Label>
          <div className="text-xs text-muted-foreground">
            {usageStats.current} / {usageStats.limit} mockups
          </div>
        </div>

        {isFreeTier && (
          <GlassButton size="sm" variant="outline" asChild>
            <Link href="/subscribe">Upgrade</Link>
          </GlassButton>
        )}
      </div>

      {showUpgradeNeeded && (
        <div className="p-3 rounded-md bg-amber-500/10 text-amber-500 text-sm flex items-center mb-4">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <div className="flex-1">
            You've reached your free tier limit of {usageStats.limit} mockups this month.
            <Link href="/subscribe" className="block mt-1 font-medium hover:underline">
              Upgrade to Pro for unlimited mockups →
            </Link>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Label className="mb-2 block">AI Provider</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <GlassButton
              type="button"
              size="sm"
              variant={provider === "openai" ? "default" : "outline"}
              onClick={() =>
                toast({
                  title: "Coming Soon",
                  description: "OpenAI integration will be available soon!",
                })
              }
              className="w-full opacity-60 cursor-not-allowed"
              disabled
            >
              <Sparkles className="mr-2 h-4 w-4" />
              OpenAI
            </GlassButton>
            <Badge
              variant="outline"
              className="absolute -top-2 -right-2 bg-background text-xs px-1.5 py-0.5 border border-primary"
            >
              <Clock className="h-3 w-3 mr-1 inline-block" />
              Soon
            </Badge>
          </div>
          <GlassButton type="button" size="sm" variant="default" className="flex-1 glossy-button">
            <Zap className="mr-2 h-4 w-4" />
            Gemini
          </GlassButton>
        </div>
      </div>

      <Tabs defaultValue="ai">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="ai" className="flex-1">
            <Wand2 className="h-4 w-4 mr-2" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload Screenshot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          {/* User Prompt */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">Your Custom Description (Optional)</Label>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setShowPromptIdeas(!showPromptIdeas)}
                className="text-xs"
              >
                <Lightbulb className="h-3 w-3 mr-1 text-primary" />
                Ideas
              </GlassButton>
            </div>
            <Textarea
              id="prompt"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe specific features or elements you want in your app mockup..."
              className="bg-background/30 backdrop-blur-sm border-border/40 glossy"
              rows={3}
              disabled={showUpgradeNeeded}
            />
            <p className="text-xs text-muted-foreground">
              This will be combined with your style settings below to create the perfect mockup
            </p>

            {showPromptIdeas && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 p-3 rounded-md bg-background/50 backdrop-blur-md border border-border/40 glossy"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-glow">Prompt Ideas</h4>
                  <GlassButton variant="ghost" size="sm" onClick={() => setShowPromptIdeas(false)}>
                    <X className="h-3 w-3" />
                  </GlassButton>
                </div>

                {promptSuggestions.map((idea, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-1.5 rounded hover:bg-background/70 cursor-pointer flex items-start"
                    onClick={() => handlePromptIdeaClick(idea)}
                  >
                    <Palette className="h-3 w-3 mr-1.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{idea}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <Separator />

          {/* Style Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center">
              <Palette className="h-4 w-4 mr-2 text-primary" />
              Style & Appearance
            </h4>

            {/* Style Preset */}
            <div className="space-y-2">
              <Label>Style Preset</Label>
              <Select value={stylePreset} onValueChange={setStylePreset} disabled={showUpgradeNeeded}>
                <SelectTrigger className="bg-background/30 backdrop-blur-sm border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stylePresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">{preset.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Theme */}
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-2 rounded-md border cursor-pointer transition-all ${
                      colorTheme === theme.id ? "border-primary bg-primary/10" : "border-border/40"
                    }`}
                    onClick={() => !showUpgradeNeeded && handleColorThemeChange(theme.id)}
                  >
                    <div className="text-xs font-medium mb-1">{theme.name}</div>
                    {theme.colors.length > 0 && (
                      <div className="flex gap-1">
                        {theme.colors.map((color, idx) => (
                          <div key={idx} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Colors (when custom theme is selected) */}
            {colorTheme === "custom" && (
              <div className="space-y-2">
                <Label>Custom Colors</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Primary</Label>
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                        className="w-10 h-8 p-1"
                        disabled={showUpgradeNeeded}
                      />
                      <Input
                        type="text"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                        className="flex-1 text-xs"
                        disabled={showUpgradeNeeded}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Secondary</Label>
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={customColors.secondary}
                        onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                        className="w-10 h-8 p-1"
                        disabled={showUpgradeNeeded}
                      />
                      <Input
                        type="text"
                        value={customColors.secondary}
                        onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                        className="flex-1 text-xs"
                        disabled={showUpgradeNeeded}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Quality */}
            <div className="space-y-2">
              <Label>Image Quality</Label>
              <RadioGroup
                value={imageQuality}
                onValueChange={(value) => setImageQuality(value as any)}
                className="flex gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="quality-standard" disabled={showUpgradeNeeded} />
                  <Label htmlFor="quality-standard" className="text-xs">
                    Standard
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="quality-high" disabled={showUpgradeNeeded} />
                  <Label htmlFor="quality-high" className="text-xs">
                    High
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ultra" id="quality-ultra" disabled={showUpgradeNeeded} />
                  <Label htmlFor="quality-ultra" className="text-xs">
                    Ultra
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Device Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center">
              <Smartphone className="h-4 w-4 mr-2 text-primary" />
              Device Frame
            </h4>

            {/* Device Selection */}
            <div className="space-y-2">
              <Label>Device Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {devicePresets.map((device) => (
                  <div
                    key={device.id}
                    className={`p-2 rounded-md border cursor-pointer transition-all flex items-center gap-2 ${
                      deviceFrame === device.id ? "border-primary bg-primary/10" : "border-border/40"
                    }`}
                    onClick={() => !showUpgradeNeeded && setDeviceFrame(device.id)}
                  >
                    {device.icon}
                    <span className="text-xs">{device.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Color (if device is selected) */}
            {deviceFrame !== "none" && (
              <div className="space-y-2">
                <Label>Device Color</Label>
                <RadioGroup
                  value={deviceColor}
                  onValueChange={(value) => setDeviceColor(value as any)}
                  className="flex flex-wrap gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="black" id="device-black" disabled={showUpgradeNeeded} />
                    <Label htmlFor="device-black" className="text-xs">
                      Black
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="device-white" disabled={showUpgradeNeeded} />
                    <Label htmlFor="device-white" className="text-xs">
                      White
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="silver" id="device-silver" disabled={showUpgradeNeeded} />
                    <Label htmlFor="device-silver" className="text-xs">
                      Silver
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gold" id="device-gold" disabled={showUpgradeNeeded} />
                    <Label htmlFor="device-gold" className="text-xs">
                      Gold
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`p-2 rounded-md border cursor-pointer transition-all flex flex-col items-center ${
                    aspectRatio === "1:1" ? "border-primary bg-primary/10" : "border-border/40"
                  }`}
                  onClick={() => !showUpgradeNeeded && setAspectRatio("1:1")}
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span className="text-xs">1:1</span>
                </div>
                <div
                  className={`p-2 rounded-md border cursor-pointer transition-all flex flex-col items-center ${
                    aspectRatio === "16:9" ? "border-primary bg-primary/10" : "border-border/40"
                  }`}
                  onClick={() => !showUpgradeNeeded && setAspectRatio("16:9")}
                >
                  <RectangleHorizontal className="h-4 w-4 mb-1" />
                  <span className="text-xs">16:9</span>
                </div>
                <div
                  className={`p-2 rounded-md border cursor-pointer transition-all flex flex-col items-center ${
                    aspectRatio === "9:16" ? "border-primary bg-primary/10" : "border-border/40"
                  }`}
                  onClick={() => !showUpgradeNeeded && setAspectRatio("9:16")}
                >
                  <RectangleVertical className="h-4 w-4 mb-1" />
                  <span className="text-xs">9:16</span>
                </div>
                <div
                  className={`p-2 rounded-md border cursor-pointer transition-all flex flex-col items-center ${
                    aspectRatio === "4:3" ? "border-primary bg-primary/10" : "border-border/40"
                  }`}
                  onClick={() => !showUpgradeNeeded && setAspectRatio("4:3")}
                >
                  <RectangleHorizontal className="h-4 w-4 mb-1" />
                  <span className="text-xs">4:3</span>
                </div>
                <div
                  className={`p-2 rounded-md border cursor-pointer transition-all flex flex-col items-center ${
                    aspectRatio === "3:4" ? "border-primary bg-primary/10" : "border-border/40"
                  }`}
                  onClick={() => !showUpgradeNeeded && setAspectRatio("3:4")}
                >
                  <RectangleVertical className="h-4 w-4 mb-1" />
                  <span className="text-xs">3:4</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center">
                <Settings2 className="h-4 w-4 mr-2 text-primary" />
                Advanced Settings
              </h4>
              <GlassButton variant="ghost" size="sm" onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                {showAdvancedSettings ? <X className="h-3 w-3" /> : <Sliders className="h-3 w-3" />}
              </GlassButton>
            </div>

            {showAdvancedSettings && (
              <div className="space-y-3">
                {/* 3D Effect */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="3d-effect" className="text-xs">
                    3D Effect
                  </Label>
                  <Switch
                    id="3d-effect"
                    checked={include3DEffect}
                    onCheckedChange={setInclude3DEffect}
                    disabled={showUpgradeNeeded}
                  />
                </div>

                {/* Perspective (if 3D is enabled) */}
                {include3DEffect && (
                  <div className="space-y-2">
                    <Label className="text-xs">Perspective</Label>
                    <RadioGroup
                      value={perspective}
                      onValueChange={(value) => setPerspective(value as any)}
                      className="flex gap-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="front" id="persp-front" disabled={showUpgradeNeeded} />
                        <Label htmlFor="persp-front" className="text-xs">
                          Front
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="angled" id="persp-angled" disabled={showUpgradeNeeded} />
                        <Label htmlFor="persp-angled" className="text-xs">
                          Angled
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="side" id="persp-side" disabled={showUpgradeNeeded} />
                        <Label htmlFor="persp-side" className="text-xs">
                          Side
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Reflections */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="reflections" className="text-xs">
                    Reflections
                  </Label>
                  <Switch
                    id="reflections"
                    checked={includeReflection}
                    onCheckedChange={setIncludeReflection}
                    disabled={showUpgradeNeeded}
                  />
                </div>

                {/* Glow Effect */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="glow" className="text-xs">
                    Glow Effect
                  </Label>
                  <Switch
                    id="glow"
                    checked={includeGlow}
                    onCheckedChange={setIncludeGlow}
                    disabled={showUpgradeNeeded}
                  />
                </div>

                {/* Lighting */}
                <div className="space-y-2">
                  <Label className="text-xs">Lighting</Label>
                  <RadioGroup
                    value={lighting}
                    onValueChange={(value) => setLighting(value as any)}
                    className="flex gap-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="studio" id="light-studio" disabled={showUpgradeNeeded} />
                      <Label htmlFor="light-studio" className="text-xs">
                        Studio
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="natural" id="light-natural" disabled={showUpgradeNeeded} />
                      <Label htmlFor="light-natural" className="text-xs">
                        Natural
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="dramatic" id="light-dramatic" disabled={showUpgradeNeeded} />
                      <Label htmlFor="light-dramatic" className="text-xs">
                        Dramatic
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </GlassCard>
  )
}
