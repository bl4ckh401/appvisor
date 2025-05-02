"use client"

import { useState } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Sparkles, AlertCircle, Layers, Download, Check } from "lucide-react"
import { motion } from "framer-motion"
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
  const { toast } = useToast()

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

    const promptList = prompts
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, count)

    if (promptList.length === 0) {
      setError("Please enter at least one valid prompt")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setGeneratedImages([])

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

  return (
    <Card3D className="p-4 glossy-card" intensity="medium">
      <h3 className="text-lg font-medium mb-4 flex items-center text-glow">
        <Layers className="h-4 w-4 text-primary mr-2" />
        Bulk Mockup Generator
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
            <Sparkles className="mr-2 h-4 w-4" />
            Gemini
          </GlassButton>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="prompts" className="mb-2 block">
            Enter one prompt per line (max {count})
          </Label>
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

        <div>
          <Label className="mb-2 block">Prompt Suggestions</Label>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion, index) => (
              <GlassButton
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addPromptSuggestion(suggestion)}
                className="text-xs"
              >
                + {suggestion.substring(0, 20)}...
              </GlassButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Number of Mockups: {count}</Label>
          </div>
          <Slider
            value={[count]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setCount(value[0])}
            className="my-4"
          />
          <p className="text-xs text-muted-foreground">
            Generate up to 10 mockups at once. Free accounts are limited to 3 mockups per batch.
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
    </Card3D>
  )
}
