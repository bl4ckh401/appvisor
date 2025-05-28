"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import { Loader2, Sparkles, Download, Plus, AlertCircle, Upload, Image as ImageIcon, Wand2, Lightbulb, Palette, X, Sliders, Info } from 'lucide-react'
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
  const [size, setSize] = useState<"1024x1024" | "1792x1024" | "1024x1792">("1024x1792") // Portrait by default
  const [quality, setQuality] = useState<"hd" | "standard">("standard")
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png")
  const [background, setBackground] = useState<"transparent" | "opaque" | "auto">("auto")
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
        const { data: usageData, error } = await supabase
          .from("feature_usage")
          .select("count")
          .eq("user_id", user.id)
          .eq("feature", "gpt_image_generation")
          .gte("timestamp", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
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

      // Prepare request body
      const requestBody = {
        prompt: prompt.trim(),
        size,
        quality,
        format,
        background,
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
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to generate image: ${response.status} ${response.statusText}`)
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

    try {
      setLoading(true)
      setError(null)

      // Prepare form data
      const formData = new FormData()
      formData.append("prompt", prompt.trim())
      formData.append("size", size)
      formData.append("quality", quality)
      formData.append("format", format)
      formData.append("background", background)
      formData.append("image", uploadedImage)

      if (uploadedMask) {
        formData.append("mask", uploadedMask)
      }

      // Make API call
      const response = await fetch("/api/gpt-image/edit", {
        method: "POST",
        body: formData,
      })

      // Handle response
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to edit image: ${response.status} ${response.statusText}`)
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

      // Track feature usage after successful generation
      await trackFeatureUsage("gpt_image_editing", {
        quality,
        size,
        format,
      })

      // Update local usage count
      setUsageCount((prev) => prev + 1)

      setGeneratedImage(data.url)

      toast({
        title: "Image edited!",
        description: "Your image has been edited successfully with DALL-E.",
      })
    } catch (err) {
      console.error("GPT Image editing error:", err)
      setError(err.message || "An error occurred while editing the image")

      toast({
        title: "Editing failed",
        description: err.message || "Failed to edit image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Check file size (max 25MB for gpt-image-1)
    if (file.size > 25 * 1024 * 1024) {
      setError("File size should be less than 25MB")
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

    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError("Mask file size should be less than 4MB")
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
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD (Higher Quality)</SelectItem>
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
          <div className="space-y-2">
            <Label htmlFor="edit-prompt">Describe the changes you want</Label>
            <Textarea
              id="edit-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Change the background to a beach scene, add a sunset"
              className="bg-background/30 backdrop-blur-sm border-border/40 glossy"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Image to Edit</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-background/50 transition-colors glossy"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{uploadedImage.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedImage(null)
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </GlassButton>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload an image to edit
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPEG, or WebP (max 25MB)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Mask (Optional)</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-background/50 transition-colors glossy"
              onClick={() => maskInputRef.current?.click()}
            >
              {uploadedMask ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{uploadedMask.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(uploadedMask.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedMask(null)
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </GlassButton>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Upload a mask to specify edit areas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG with transparent areas (max 4MB)
                  </p>
                </>
              )}
            </div>
            <input
              ref={maskInputRef}
              type="file"
              accept="image/png"
              onChange={handleMaskUpload}
              className="hidden"
            />
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
                    Output image size
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
                <Label>Quality</Label>
                <Select value={quality} onValueChange={(value) => setQuality(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD (Higher Quality)</SelectItem>
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
            </motion.div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="flex justify-end">
            <GlassButton 
              onClick={editImage} 
              disabled={loading || !prompt.trim() || !uploadedImage} 
              className="glossy-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Editing...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Edit with DALL-E
                </>
              )}
            </GlassButton>
          </div>
        </TabsContent>
      </Tabs>

      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-3"
        >
          <div className="relative rounded-lg overflow-hidden glossy">
            <img
              src={generatedImage}
              alt="Generated image"
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2">
            <GlassButton
              onClick={useGeneratedImage}
              className="flex-1 glossy-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Use This Image
            </GlassButton>
            <GlassButton
              variant="outline"
              onClick={() => {
                const link = document.createElement('a')
                link.href = generatedImage
                link.download = `dall-e-${Date.now()}.${format}`
                link.click()
              }}
              className="glossy-button"
            >
              <Download className="h-4 w-4" />
            </GlassButton>
          </div>
        </motion.div>
      )}

      <PremiumModal />
    </GlassCard>
  )
}
