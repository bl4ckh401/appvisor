"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import {
  Loader2,
  Sparkles,
  Download,
  Plus,
  AlertCircle,
  Upload,
  ImageIcon,
  Wand2,
  Lightbulb,
  Palette,
  X,
  Sliders,
  Info,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { planFeatures } from "@/lib/plan-restrictions"

interface GPTImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

export function GPTImageGenerator({ onImageGenerated }: GPTImageGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedMask, setUploadedMask] = useState<File | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [size, setSize] = useState<"1024x1024" | "1792x1024" | "1024x1792">("1024x1024")
  const [quality, setQuality] = useState<"low" | "medium" | "high" | "auto">("auto")
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png")
  const [compression, setCompression] = useState(75)
  const [showPromptIdeas, setShowPromptIdeas] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maskInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { checkFeatureAccess, PremiumModal } = useFeatureAccess()

  const [usageCount, setUsageCount] = useState<number>(0)
  const [usageLimit, setUsageLimit] = useState<number>(5) // Default to free tier
  const [usageLoading, setUsageLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setUsageLoading(true)
        const supabase = createClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Get user's subscription
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        const plan = subscription?.plan || "free"

        // Set the limit based on plan
        setUsageLimit(planFeatures[plan as "free" | "pro" | "team"].gptImageGenerationsPerMonth)

        // Get current month's usage
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const { data: usageData, error } = await supabase
          .from("feature_usage")
          .select("count")
          .eq("user_id", user.id)
          .eq("feature", "gpt_image_generation")
          .gte("timestamp", firstDayOfMonth.toISOString())
          .single()

        if (!error && usageData) {
          setUsageCount(usageData.count)
        } else {
          // If no record exists, count is 0
          setUsageCount(0)
        }
      } catch (error) {
        console.error("Error fetching usage data:", error)
      } finally {
        setUsageLoading(false)
      }
    }

    fetchUsageData()
  }, [])

  // Creative prompt suggestions
  const promptSuggestions = [
    "A sleek fitness app with workout tracking, dark theme with neon green accents",
    "A minimalist meditation app with calming blue gradients and zen-inspired UI",
    "A food delivery app with vibrant food photography and intuitive ordering flow",
    "A productivity app with kanban boards, clean layout, and subtle animations",
    "A travel booking app with immersive destination imagery and smooth booking process",
  ]

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description")
      return
    }

    // Check if user has reached their monthly limit
    if (usageCount >= usageLimit && usageLimit !== Number.POSITIVE_INFINITY) {
      toast({
        title: "Usage limit reached",
        description: `You've used all ${usageLimit} GPT image generations for this month. Upgrade your plan for more.`,
        variant: "destructive",
      })
      return
    }

    // Check if user has access to this premium feature
    if (!checkFeatureAccess("gptImageGeneration")) {
      return // The feature access hook will handle showing the premium modal
    }

    try {
      setLoading(true)
      setError(null)

      // Prepare request body - keep it minimal
      const requestBody = {
        prompt: prompt.trim(),
        size,
        quality,
        format,
      }

      // Make API call
      const response = await fetch("/api/gpt-image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      // Handle response
      if (!response.ok) {
        const errorStatus = `${response.status} ${response.statusText}`

        // Try to get error details without consuming the body stream twice
        let errorMessage = `Failed to generate image: ${errorStatus}`

        try {
          const contentType = response.headers.get("content-type") || ""

          if (contentType.includes("application/json")) {
            // It's JSON, we can safely parse it
            const errorData = await response.json()
            if (errorData && errorData.error) {
              errorMessage = errorData.error
            }
          } else {
            // Not JSON, treat as text
            errorMessage = `Server error (${errorStatus}). Please try again later.`
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
          // Use default error message with status
          errorMessage = `Server error (${errorStatus}). Please try again later.`
        }

        throw new Error(errorMessage)
      }

      // Parse successful JSON response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Invalid response format from server")
      }

      if (!data.url) {
        throw new Error("No image URL returned from the API")
      }

      // Track usage after successful generation
      await trackFeatureUsage("gpt_image_generation", {
        quality,
        size,
        format,
      })

      // Update local usage count
      setUsageCount((prev) => prev + 1)

      setGeneratedImage(data.url)

      toast({
        title: "Image generated!",
        description: "Your mockup has been created successfully with DALL-E.",
      })
    } catch (err) {
      console.error("GPT Image generation error:", err)
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

  const editImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description")
      return
    }

    if (!uploadedImage) {
      setError("Please upload an image to edit")
      return
    }

    // Check if user has reached their monthly limit
    if (usageCount >= usageLimit && usageLimit !== Number.POSITIVE_INFINITY) {
      toast({
        title: "Usage limit reached",
        description: `You've used all ${usageLimit} GPT image generations for this month. Upgrade your plan for more.`,
        variant: "destructive",
      })
      return
    }

    // Check if user has access to this premium feature
    if (!checkFeatureAccess("gptImageEditing")) {
      return // The feature access hook will handle showing the premium modal
    }

    setError("Image editing is temporarily unavailable. Please try again later.")
    toast({
      title: "Feature unavailable",
      description: "Image editing is temporarily unavailable. Please try again later.",
      variant: "destructive",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB")
      return
    }

    setUploadedImage(file)
    setError(null)
  }

  const handleMaskUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for the mask")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Mask file size should be less than 5MB")
      return
    }

    setUploadedMask(file)
  }

  const useGeneratedImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage)
      setGeneratedImage(null)
      setPrompt("")
      setUploadedImage(null)
      setUploadedMask(null)
    }
  }

  const handlePromptIdeaClick = (idea: string) => {
    setPrompt(idea)
    setShowPromptIdeas(false)
  }

  return (
    <GlassCard className="p-4 glossy-card" intensity="medium">
      <h3 className="text-lg font-medium mb-4 flex items-center text-glow">
        <Sparkles className="h-4 w-4 text-primary mr-2" />
        DALL-E Image Generator
        <Badge className="ml-2 bg-primary/10 text-xs" variant="outline">
          New
        </Badge>
      </h3>
      {!usageLoading && usageLimit !== Number.POSITIVE_INFINITY && (
        <div className="text-xs text-muted-foreground mb-4 flex items-center">
          <span className="mr-1">Usage:</span>
          <span className={usageCount >= usageLimit ? "text-destructive font-medium" : ""}>
            {usageCount} / {usageLimit}
          </span>
          <span className="ml-1">this month</span>
        </div>
      )}

      <Tabs defaultValue="generate">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="generate" className="flex-1">
            <Wand2 className="h-4 w-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1">
            <ImageIcon className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">Describe the image you want</Label>
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
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A fitness app dashboard showing workout progress with a dark theme and lime green accents"
              className="bg-background/30 backdrop-blur-sm border-border/40 glossy"
              rows={3}
            />

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

          <div className="flex justify-between items-center">
            <GlassButton variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs">
              <Sliders className="h-3 w-3 mr-1 text-primary" />
              {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
            </GlassButton>
          </div>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Size</Label>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mr-1" />
                    DALL-E 3 supported sizes
                  </div>
                </div>
                <Select value={size} onValueChange={(value) => setSize(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                    <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                    <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Quality</Label>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mr-1" />
                    HD may use more credits
                  </div>
                </div>
                <Select value={quality} onValueChange={(value) => setQuality(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Standard</SelectItem>
                    <SelectItem value="high">HD (Higher Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(value) => setFormat(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(format === "jpeg" || format === "webp") && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Compression: {compression}%</Label>
                  </div>
                  <Slider
                    value={[compression]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setCompression(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values = smaller file size, higher values = better quality
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="flex justify-end">
            <GlassButton onClick={generateImage} disabled={loading || !prompt.trim()} className="glossy-button">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with DALL-E
                </>
              )}
            </GlassButton>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md mb-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Image editing is temporarily unavailable while we update our integration with the latest DALL-E API.
                Please use the Generate tab instead.
              </p>
            </div>
          </div>

          <div className="space-y-2 opacity-60">
            <Label htmlFor="edit-prompt">Describe the changes you want</Label>
            <Textarea
              id="edit-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Change the background to a beach scene, add a sunset"
              className="bg-background/30 backdrop-blur-sm border-border/40 glossy"
              rows={3}
              disabled
            />
          </div>

          <div className="space-y-2 opacity-60">
            <Label>Upload Image to Edit</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-not-allowed hover:bg-background/50 transition-colors glossy">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Click to upload your image to edit</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max. 5MB)</p>
            </div>
          </div>

          <div className="flex justify-end">
            <GlassButton disabled={true} className="glossy-button opacity-60">
              <Wand2 className="mr-2 h-4 w-4" />
              Edit with DALL-E
            </GlassButton>
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4"
          >
            <div className="relative rounded-lg overflow-hidden image-pop neon-border">
              <img
                src={generatedImage || "/placeholder.svg"}
                alt="Generated image"
                className="w-full h-auto object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                  setError("Failed to load the generated image")
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent">
                <GlassButton size="sm" variant="outline" onClick={useGeneratedImage} className="glossy">
                  <Plus className="mr-1 h-3 w-3" />
                  Use Image
                </GlassButton>
                <GlassButton size="sm" variant="outline" asChild className="glossy">
                  <a
                    href={generatedImage}
                    download="dalle-image-generation.png"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </a>
                </GlassButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render the premium modal */}
      <PremiumModal />
    </GlassCard>
  )
}
