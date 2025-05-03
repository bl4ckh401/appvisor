"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  RefreshCw,
  Zap,
  Lightbulb,
  Palette,
  X,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import {GlassCard} from "@/components/ui/glass-card"

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

export function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a")
  const [style, setStyle] = useState("gradient")
  const [retryCount, setRetryCount] = useState(0)
  const [provider, setProvider] = useState<"openai" | "gemini">("gemini")
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9" | "9:16">("9:16")
  const [showPromptIdeas, setShowPromptIdeas] = useState(false)
  const [usageStats, setUsageStats] = useState<{ current: number, limit: number | string }>({ current: 0, limit: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const { subscription, checkFeatureAccess, getFeatureLimit, getRemaining, PremiumModal } = useFeatureAccess()

  // Creative prompt suggestions
  const promptSuggestions = [
    "A sleek fitness app with workout tracking, dark theme with neon green accents",
    "A minimalist meditation app with calming blue gradients and zen-inspired UI",
    "A food delivery app with vibrant food photography and intuitive ordering flow",
    "A productivity app with kanban boards, clean layout, and subtle animations",
    "A travel booking app with immersive destination imagery and smooth booking process",
  ]

  // Get usage stats on component mount
  useEffect(() => {
    const fetchUsage = async () => {
      if (!subscription) return;
      
      try {
        // Get remaining mockups this month
        const remaining = await getRemaining("mockupsPerMonth");
        const limit = getFeatureLimit("mockupsPerMonth");
        
        if (limit === Number.POSITIVE_INFINITY) {
          setUsageStats({ current: 0, limit: "Unlimited" });
        } else {
          const used = limit - remaining;
          setUsageStats({ current: used, limit });
        }
      } catch (error) {
        console.error("Error fetching usage stats:", error);
      }
    };
    
    fetchUsage();
  }, [subscription]);

  const enhancePrompt = (basePrompt: string): string => {
    const enhancers = [
      "Create a professional, high-quality app screenshot with",
      "Design a visually stunning mobile interface featuring",
      "Generate a realistic app mockup showcasing",
      "Produce a detailed app UI visualization with",
      "Create an elegant mobile application screen with",
    ]

    const visualEnhancements = [
      "3D elements that pop out of the screen",
      "realistic shadows and lighting effects",
      "depth and perspective in the UI elements",
      "subtle gradients and color transitions",
      "professional typography and spacing",
      "glossy and reflective surfaces",
      "glass morphism effects with blur and transparency",
    ]

    const qualityDirectives = [
      "Make it photorealistic and highly detailed.",
      "Ensure it looks like a professional app design.",
      "Create a UI that appears three-dimensional and tactile.",
      "Design it to look like a screenshot from a real device.",
      "Render it with high fidelity and attention to detail.",
    ]

    // Randomly select enhancers
    const selectedEnhancer = enhancers[Math.floor(Math.random() * enhancers.length)]
    const selectedVisualEnhancement = visualEnhancements[Math.floor(Math.random() * visualEnhancements.length)]
    const selectedQualityDirective = qualityDirectives[Math.floor(Math.random() * qualityDirectives.length)]

    return `${selectedEnhancer} ${basePrompt}. Include ${selectedVisualEnhancement}. ${selectedQualityDirective}`
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description")
      return
    }

    // Check if we've reached the mockup limit for this month
    if (typeof usageStats.limit === 'number' && usageStats.current >= usageStats.limit) {
      setError("You've reached your monthly mockup limit. Upgrade your plan to create more mockups.")
      return;
    }

    try {
      setLoading(true)
      setError(null)

      // Track usage of mockup generation
      await trackFeatureUsage("mockup_generation", {
        provider,
        prompt_length: prompt.length,
        aspect_ratio: aspectRatio
      })

      // Enhanced prompt with better instructions
      const enhancedPrompt = enhancePrompt(prompt)

      // Choose API endpoint based on selected provider
      const endpoint = provider === "openai" ? "/api/generate-image" : "/api/gemini/generate-image"

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
        throw new Error(data.error || `Failed to generate image: ${response.status} ${response.statusText}`)
      }

      if (!data.url) {
        throw new Error("No image URL returned from the API")
      }

      setGeneratedImage(data.url)
      setRetryCount(0) // Reset retry count on success
      
      // Update usage stats
      setUsageStats(prev => ({
        current: prev.current + 1,
        limit: prev.limit
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
    
    // Check if we've reached the mockup limit for this month
    if (typeof usageStats.limit === 'number' && usageStats.current >= usageStats.limit) {
      setError("You've reached your monthly mockup limit. Upgrade your plan to create more mockups.")
      return;
    }

    try {
      setLoading(true)
      setError(null)

      // Track usage of mockup generation
      await trackFeatureUsage("mockup_generation", {
        provider,
        has_screenshot: true,
        aspect_ratio: aspectRatio
      })

      const mockupPrompt = `Create a professional app store screenshot mockup with the following caption: "${caption}". 
      Use a ${style === "gradient" ? "gradient" : "solid"} background with the base color ${backgroundColor}. 
      Make the screenshot pop out of the background with 3D effects and realistic shadows.
      Add depth and perspective to create a visually stunning presentation.
      The mockup should look professional and similar to Apple App Store or Google Play Store listings.`

      // Choose API endpoint based on selected provider
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
          style,
          prompt: mockupPrompt,
          aspectRatio: aspectRatio, // For Gemini
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to generate mockup: ${response.status} ${response.statusText}`)
      }

      setGeneratedImage(data.url)
      setRetryCount(0) // Reset retry count on success
      
      // Update usage stats
      setUsageStats(prev => ({
        current: prev.current + 1,
        limit: prev.limit
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
      setPrompt("")
    }
  }

  // Fallback to a placeholder if we've tried multiple times and still have errors
  const useFallbackImage = () => {
    // Create a fallback image URL based on the prompt or caption
    const fallbackUrl = `/placeholder.svg?height=512&width=512&text=${encodeURIComponent(
      prompt || caption || "App Mockup",
    )}`
    setGeneratedImage(fallbackUrl)
    setError(null)
  }

  const handlePromptIdeaClick = (idea: string) => {
    setPrompt(idea)
    setShowPromptIdeas(false)
  }

  // Determine if free tier and show usage limits
  const isFreeTier = !subscription || subscription.plan === "free";
  const showUpgradeNeeded = isFreeTier && typeof usageStats.limit === 'number' && usageStats.current >= usageStats.limit;

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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">Describe the app screenshot you want</Label>
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
              disabled={showUpgradeNeeded}
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

                {promptSuggestions.map((category, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-1.5 rounded hover:bg-background/70 cursor-pointer flex items-start"
                    onClick={() => handlePromptIdeaClick(category)}
                  >
                    <Palette className="h-3 w-3 mr-1.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{category}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <RadioGroup
              value={aspectRatio}
              onValueChange={(value) => setAspectRatio(value as any)}
              className="flex flex-wrap gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1:1" id="ratio-1-1-ai" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-1-1-ai">1:1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4:3" id="ratio-4-3-ai" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-4-3-ai">4:3</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3:4" id="ratio-3-4-ai" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-3-4-ai">3:4</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="16:9" id="ratio-16-9-ai" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-16-9-ai">16:9</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9:16" id="ratio-9-16-ai" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-9-16-ai">9:16</Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="flex-1">{error}</div>
              <div className="flex gap-2">
                {retryCount < 3 && !showUpgradeNeeded && (
                  <GlassButton size="sm" variant="outline" onClick={handleRetry}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </GlassButton>
                )}
                {retryCount >= 3 && !showUpgradeNeeded && (
                  <GlassButton size="sm" variant="outline" onClick={useFallbackImage}>
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Use Fallback
                  </GlassButton>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <GlassButton 
              onClick={generateImage} 
              disabled={loading || showUpgradeNeeded || !prompt.trim()} 
              className="glossy-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </GlassButton>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-background/50 transition-colors glossy"
              onClick={() => !showUpgradeNeeded && fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded screenshot"
                    className="max-h-48 mx-auto rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <GlassButton size="sm" variant="secondary" className="glossy-button" disabled={showUpgradeNeeded}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Change Image
                    </GlassButton>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {showUpgradeNeeded ? "Upgrade your plan to upload images" : "Click to upload your app screenshot"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max. 5MB)</p>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g., Quit Any Addiction"
                className="bg-background/30 backdrop-blur-sm border-border/40 glossy"
                disabled={showUpgradeNeeded}
              />
              <p className="text-xs text-muted-foreground">This will appear as the headline above your screenshot</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="background-color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 p-1"
                    disabled={showUpgradeNeeded}
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 bg-background/30 backdrop-blur-sm border-border/40 glossy"
                    disabled={showUpgradeNeeded}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Style</Label>
                <div className="flex gap-2">
                  <GlassButton
                    type="button"
                    size="sm"
                    variant={style === "gradient" ? "default" : "outline"}
                    onClick={() => setStyle("gradient")}
                    className={`flex-1 ${style === "gradient" ? "glossy-button" : ""}`}
                    disabled={showUpgradeNeeded}
                  >
                    Gradient
                  </GlassButton>
                  <GlassButton
                    type="button"
                    size="sm"
                    variant={style === "solid" ? "default" : "outline"}
                    onClick={() => setStyle("solid")}
                    className={`flex-1 ${style === "solid" ? "glossy-button" : ""}`}
                    disabled={showUpgradeNeeded}
                  >
                    Solid
                  </GlassButton>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <RadioGroup
                value={aspectRatio}
                onValueChange={(value) => setAspectRatio(value as any)}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1:1" id="ratio-1-1" disabled={showUpgradeNeeded} />
                  <Label htmlFor="ratio-1-1">1:1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4:3" id="ratio-4-3" disabled={showUpgradeNeeded} />
                  <Label htmlFor="ratio-4-3">4:3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3:4" id="ratio-3-4" disabled={showUpgradeNeeded} />
                  <Label htmlFor="ratio-3-4">3:4</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="16:9" id="ratio-16-9" disabled={showUpgradeNeeded} />
                  <Label htmlFor="ratio-16-9">16:9</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="9:16" id="ratio-9-16" disabled={showUpgradeNeeded} />
                  <Label htmlFor="ratio-9-16">9:16</Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="flex-1">{error}</div>
                <div className="flex gap-2">
                  {retryCount < 3 && !showUpgradeNeeded && (
                    <GlassButton size="sm" variant="outline" onClick={handleRetry}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </GlassButton>
                  )}
                  {retryCount >= 3 && !showUpgradeNeeded && (
                    <GlassButton size="sm" variant="outline" onClick={useFallbackImage}>
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Use Fallback
                    </GlassButton>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <GlassButton
                onClick={generateAppStoreMockup}
                disabled={loading || showUpgradeNeeded || !uploadedImage || !caption.trim()}
                className="glossy-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Mockup
                  </>
                )}
              </GlassButton>
            </div>
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
                alt="Generated app screenshot"
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
                    download="generated-screenshot.png"
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
