"use client"

import { useState, useEffect } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { Badge } from "@/components/ui/badge"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import {
  Loader2,
  Sparkles,
  AlertCircle,
  Layers,
  Download,
  Check,
  Zap,
  Lightbulb,
  Palette,
  X,
  Clock,
  Lock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface BulkGeneratorProps {
  onImagesGenerated: (imageUrls: string[]) => void
}

export function BulkGenerator({ onImagesGenerated }: BulkGeneratorProps) {
  const [prompts, setPrompts] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [count, setCount] = useState(3)
  const [provider, setProvider] = useState<"openai" | "gemini">("gemini")
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9" | "9:16">("9:16")
  const [showPromptIdeas, setShowPromptIdeas] = useState(false)
  const { toast } = useToast()
  
  // Get feature access details
  const { subscription, canAccess, checkFeatureAccess, getFeatureLimit, PremiumModal } = useFeatureAccess()

  // Initialize count based on subscription
  useEffect(() => {
    // Set initial count based on subscription bulk generation limit
    if (!subscription || subscription.plan === "free") {
      // Free plan limit
      setCount(Math.min(count, 3))
    } else {
      const bulkLimit = getFeatureLimit("bulkGeneration")
      // Don't reduce if already below limit
      if (count > bulkLimit) {
        setCount(bulkLimit)
      }
    }
  }, [subscription])

  // Creative prompt suggestions
  const promptSuggestions = [
    "A sleek fitness app with workout tracking, dark theme with neon green accents",
    "A minimalist meditation app with calming blue gradients and zen-inspired UI",
    "A food delivery app with vibrant food photography and intuitive ordering flow",
    "A productivity app with kanban boards, clean layout, and subtle animations",
    "A travel booking app with immersive destination imagery and smooth booking process",
  ]

  const addPromptSuggestion = (suggestion: string) => {
    const currentPrompts = prompts.trim()
    const newPrompts = currentPrompts ? `${currentPrompts}\n${suggestion}` : suggestion
    setPrompts(newPrompts)
  }

  const generateImages = async () => {
    if (!prompts.trim()) {
      setError("Please enter at least one prompt")
      return
    }

    // Check if user has access to bulk generation feature
    if (!checkFeatureAccess("bulkGeneration")) {
      return // The feature access hook will handle showing the premium modal
    }

    // Get the limit based on subscription
    const bulkLimit = getFeatureLimit("bulkGeneration")
    
    // Limit the number of prompts based on subscription
    const promptList = prompts
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, bulkLimit)

    if (promptList.length === 0) {
      setError("Please enter at least one valid prompt")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setGeneratedImages([])

      // Track usage of the bulk generation feature
      await trackFeatureUsage("bulk_generation", { count: promptList.length })

      // Choose API endpoint based on selected provider
      const endpoint = provider === "openai" ? "/api/generate-image" : "/api/gemini/generate-image"

      // Generate images in parallel
      const imagePromises = promptList.map(async (prompt) => {
        try {
          const enhancedPrompt = `Create a professional, high-quality app screenshot for: ${prompt}. Make it visually stunning with realistic UI elements, vibrant colors, and modern design.`

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: enhancedPrompt,
              size: "512x512", // For OpenAI
              aspectRatio: aspectRatio, // For Gemini
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || `Failed to generate image: ${response.status}`)
          }

          return data.url || null
        } catch (err) {
          console.error(`Error generating image for prompt: ${prompt}`, err)
          return null
        }
      })

      const results = await Promise.all(imagePromises)
      const successfulImages = results.filter((url) => url !== null) as string[]

      if (successfulImages.length === 0) {
        throw new Error("Failed to generate any images. Please try again with different prompts.")
      }

      setGeneratedImages(successfulImages)
      onImagesGenerated(successfulImages)

      toast({
        title: "Bulk generation complete!",
        description: `Successfully generated ${successfulImages.length} out of ${promptList.length} images.`,
      })
    } catch (err) {
      console.error("Bulk image generation error:", err)
      setError(err.message || "An error occurred during bulk generation")

      toast({
        title: "Generation failed",
        description: err.message || "Failed to generate images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadAllImages = () => {
    // Create a function to download a single image
    const downloadImage = (url: string, index: number) => {
      const link = document.createElement("a")
      link.href = url
      link.download = `mockup-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Download each image with a slight delay to prevent browser issues
    generatedImages.forEach((url, index) => {
      setTimeout(() => downloadImage(url, index), index * 300)
    })

    toast({
      title: "Downloading images",
      description: `Downloading ${generatedImages.length} images to your device.`,
    })
  }

  // Get bulk generation limit based on subscription
  const getBulkGenerationLimit = () => {
    if (!subscription) return 3 // Default to free tier limit
    
    if (subscription.plan === "pro") return 10
    if (subscription.plan === "team") return 50
    
    return 3 // Free tier
  }

  const maxBulkCount = getBulkGenerationLimit()
  const isPremium = subscription && subscription.plan !== "free"

  return (
    <Card3D className="p-4 glossy-card" intensity="medium">
      <h3 className="text-lg font-medium mb-4 flex items-center text-glow">
        <Layers className="h-4 w-4 text-primary mr-2" />
        Bulk Mockup Generator
        {!isPremium && (
          <Badge className="ml-2 bg-primary/10 text-xs" variant="outline">
            <Lock className="h-3 w-3 mr-1" /> Premium
          </Badge>
        )}
      </h3>

      <div className="mb-4">
        <Label className="mb-2 block">AI Provider</Label>
        <div className="flex gap-2">
          <GlassButton
            type="button"
            size="sm"
            variant={provider === "openai" ? "default" : "outline"}
            onClick={() => setProvider("openai")}
            className={`flex-1 ${provider === "openai" ? "glossy-button" : ""}`}
            disabled={true}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            OpenAI
          </GlassButton>
          <GlassButton
            type="button"
            size="sm"
            variant={provider === "gemini" ? "default" : "outline"}
            onClick={() => setProvider("gemini")}
            className={`flex-1 ${provider === "gemini" ? "glossy-button" : ""}`}
          >
            <Zap className="mr-2 h-4 w-4" />
            Gemini
          </GlassButton>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="prompts" className="mb-2 block">
              Enter one prompt per line (max {count})
            </Label>
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
            id="prompts"
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            placeholder="Enter one app description per line. Example:
A fitness app with workout tracking
A meditation app with calming UI
A food delivery app with vibrant colors"
            className="bg-background/30 backdrop-blur-sm border-border/40 min-h-[120px]"
          />
        </div>

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

            <div className="space-y-1">
              {promptSuggestions.map((idea, i) => (
                <div
                  key={i}
                  className="text-xs p-1.5 rounded hover:bg-background/70 cursor-pointer flex items-start"
                  onClick={() => addPromptSuggestion(idea)}
                >
                  <Palette className="h-3 w-3 mr-1.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{idea}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Number of Mockups: {count}</Label>
            {isPremium ? (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary">
                Max {maxBulkCount}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                Free Limit: 3
              </Badge>
            )}
          </div>
          <Slider
            value={[count]}
            min={1}
            max={maxBulkCount}
            step={1}
            onValueChange={(value) => setCount(value[0])}
            className="my-4"
          />
          <p className="text-xs text-muted-foreground">
            Generate up to {maxBulkCount} mockups at once. {!isPremium && "Free accounts are limited to 3 mockups per batch."}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Aspect Ratio</Label>
          <RadioGroup
            value={aspectRatio}
            onValueChange={(value) => setAspectRatio(value as any)}
            className="flex flex-wrap gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1:1" id="ratio-1-1-bulk" />
              <Label htmlFor="ratio-1-1-bulk">1:1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4:3" id="ratio-4-3-bulk" />
              <Label htmlFor="ratio-4-3-bulk">4:3</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3:4" id="ratio-3-4-bulk" />
              <Label htmlFor="ratio-3-4-bulk">3:4</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="16:9" id="ratio-16-9-bulk" />
              <Label htmlFor="ratio-16-9-bulk">16:9</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="9:16" id="ratio-9-16-bulk" />
              <Label htmlFor="ratio-9-16-bulk">9:16</Label>
            </div>
          </RadioGroup>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="flex justify-end">
          <GlassButton onClick={generateImages} disabled={loading} className="glossy-button">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating {count} mockups...
              </>
            ) : (
              <>
                <Layers className="mr-2 h-4 w-4" />
                Generate {count} Mockups
              </>
            )}
          </GlassButton>
        </div>
      </div>

      {generatedImages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-glow">Generated Mockups</h4>
            <GlassButton size="sm" variant="outline" onClick={downloadAllImages}>
              <Download className="mr-1 h-3 w-3" />
              Download All
            </GlassButton>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {generatedImages.map((url, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden image-pop">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Generated mockup ${index + 1}`}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=200&width=100"
                  }}
                />
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-sm text-muted-foreground">
            <Check className="inline-block h-4 w-4 mr-1 text-primary" />
            All mockups have been added to your gallery
          </div>
        </motion.div>
      )}
      
      {/* Render the premium modal component */}
      <PremiumModal />
    </Card3D>
  )
}
