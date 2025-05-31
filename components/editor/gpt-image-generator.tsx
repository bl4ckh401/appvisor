"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import { 
  Loader2, Sparkles, Download, Plus, AlertCircle, Upload, 
  Image as ImageIcon, Wand2, Lightbulb, Palette, X, RefreshCw,
  Settings, Eye, Smartphone, Monitor, Tablet, Type, Layers
} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface GPTImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

export function GPTImageGenerator({ onImageGenerated }: GPTImageGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [usageStats, setUsageStats] = useState<{ current: number, limit: number | string }>({ current: 0, limit: 5 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Basic settings
  const [caption, setCaption] = useState("")
  const [subCaption, setSubCaption] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"1024x1024" | "1024x1536" | "1536x1024">("1024x1536")
  
  // Background settings
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a")
  const [backgroundColorEnd, setBackgroundColorEnd] = useState("#3a3a3a")
  const [backgroundStyle, setBackgroundStyle] = useState("gradient")
  const [gradientDirection, setGradientDirection] = useState("diagonal")
  const [backgroundPattern, setBackgroundPattern] = useState("none")
  
  // Device settings
  const [deviceType, setDeviceType] = useState("phone")
  const [deviceColor, setDeviceColor] = useState("black")
  const [deviceOrientation, setDeviceOrientation] = useState("portrait")
  const [showDeviceFrame, setShowDeviceFrame] = useState(true)
  const [deviceBrand, setDeviceBrand] = useState("apple")
  
  // Visual effects
  const [shadowIntensity, setShadowIntensity] = useState([50])
  const [reflectionIntensity, setReflectionIntensity] = useState([30])
  const [glowEffect, setGlowEffect] = useState(false)
  const [glowColor, setGlowColor] = useState("#00ff00")
  const [blur3DEffect, setBlur3DEffect] = useState(false)
  const [floatingEffect, setFloatingEffect] = useState(true)
  
  // Typography settings
  const [fontStyle, setFontStyle] = useState("modern")
  const [textColor, setTextColor] = useState("#ffffff")
  const [textAlignment, setTextAlignment] = useState("center")
  const [textSize, setTextSize] = useState("large")
  
  // Layout settings
  const [layoutStyle, setLayoutStyle] = useState("hero")
  const [showBadges, setShowBadges] = useState(false)
  const [badgeText, setBadgeText] = useState("")
  const [showAppIcon, setShowAppIcon] = useState(false)
  const [screenPosition, setScreenPosition] = useState("center")
  
  // Advanced settings
  const [artStyle, setArtStyle] = useState("professional")
  const [lightingStyle, setLightingStyle] = useState("studio")
  const [perspective, setPerspective] = useState("front")
  const [environmentReflections, setEnvironmentReflections] = useState(false)

  const { toast } = useToast()
  const { subscription, checkFeatureAccess, getFeatureLimit, getRemaining, PremiumModal } = useFeatureAccess()

  // Get usage stats on component mount
  useEffect(() => {
    const fetchUsage = async () => {
      if (!subscription) return;
      
      try {
        const remaining = await getRemaining("gptImageGenerationsPerMonth");
        const limit = getFeatureLimit("gptImageGenerationsPerMonth");
        
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
  }, [subscription, getRemaining, getFeatureLimit]);

  const constructDetailedPrompt = () => {
    // Build a comprehensive prompt from all settings
    let fullPrompt = "";

    // CRITICAL: First instruction about using the uploaded image
    fullPrompt += `IMPORTANT: Use the uploaded image as the ACTUAL SCREEN CONTENT displayed on the device. The uploaded screenshot must be what's shown on the device's screen - do not replace it with text or other content.\n\n`;

    // Start with custom prompt if provided
    if (customPrompt.trim()) {
      fullPrompt += customPrompt + "\n\n";
    }

    // Add base instruction
    fullPrompt += `Create an absolutely stunning ${artStyle} app store mockup that makes people stop scrolling.\n\n`;

    // Caption and text - these are OUTSIDE the device, not on the screen
    if (caption) {
      fullPrompt += `Text overlay (NOT on the device screen): "${caption}" - Make this headline ${textSize.toUpperCase()} and BOLD. `;
      fullPrompt += `Place this text OUTSIDE the device as a marketing headline. `;
      fullPrompt += `Use ${fontStyle} typography, ${textAlignment} aligned, in ${textColor} color. `;
      fullPrompt += `Think Apple Keynote style with incredible presence and weight.\n`;
    }
    
    if (subCaption) {
      fullPrompt += `Include subtitle (also OUTSIDE the device): "${subCaption}" in a complementary smaller size below the main headline.\n`;
    }

    // Device specifications
    fullPrompt += `\nDevice and Screen Content:\n`;
    if (showDeviceFrame) {
      fullPrompt += `- Show a ${deviceColor} ${deviceBrand} ${deviceType} in ${deviceOrientation} orientation\n`;
      fullPrompt += `- The uploaded screenshot must be displayed ON THE DEVICE SCREEN\n`;
      fullPrompt += `- Make the device look premium and expensive - like it's worth $1000+\n`;
      fullPrompt += `- Position the device ${screenPosition} of the composition\n`;
      fullPrompt += `- The screen should show the EXACT uploaded image, not any other content\n`;
    } else {
      fullPrompt += `- Show the uploaded screenshot without device frame, floating in space\n`;
      fullPrompt += `- The uploaded image is the main focus - display it exactly as provided\n`;
    }

    // Background details
    fullPrompt += `\nBackground: Create a ${backgroundStyle} background `;
    if (backgroundStyle === "gradient") {
      fullPrompt += `flowing ${gradientDirection}ly from ${backgroundColor} to ${backgroundColorEnd}. `;
      fullPrompt += `Make it flow like silk with smooth transitions. `;
    } else if (backgroundStyle === "mesh") {
      fullPrompt += `with mesh gradient using ${backgroundColor} as primary and ${backgroundColorEnd} as secondary colors. `;
    } else {
      fullPrompt += `using ${backgroundColor} color. `;
    }
    
    if (backgroundPattern !== "none") {
      fullPrompt += `Add subtle ${backgroundPattern} pattern overlay. `;
    }

    // Visual effects
    fullPrompt += `\nVisual Effects:\n`;
    fullPrompt += `- Shadow intensity: ${shadowIntensity[0]}% - create ${shadowIntensity[0] > 70 ? 'dramatic deep' : shadowIntensity[0] > 30 ? 'balanced' : 'subtle'} shadows\n`;
    fullPrompt += `- Reflection: ${reflectionIntensity[0]}% intensity ${reflectionIntensity[0] > 0 ? 'on surface below' : ''}\n`;
    
    if (glowEffect) {
      fullPrompt += `- Add ${glowColor} glow effect around the device edges\n`;
    }
    
    if (blur3DEffect) {
      fullPrompt += `- Apply depth of field blur to create 3D depth\n`;
    }
    
    if (floatingEffect) {
      fullPrompt += `- Make the device appear floating with perspective\n`;
    }

    // Lighting
    fullPrompt += `\nLighting: ${lightingStyle} lighting setup`;
    if (environmentReflections) {
      fullPrompt += ` with environmental reflections on the screen glass (but keep the uploaded content visible)`;
    }
    fullPrompt += `.\n`;

    // Layout specifics
    if (layoutStyle === "hero") {
      fullPrompt += `\nLayout: Hero composition with device as the main focus.\n`;
    } else if (layoutStyle === "multi") {
      fullPrompt += `\nLayout: Show multiple angles or screens of the app, all displaying the uploaded screenshot.\n`;
    } else if (layoutStyle === "context") {
      fullPrompt += `\nLayout: Show app in real-world context/environment.\n`;
    } else if (layoutStyle === "showcase") {
      fullPrompt += `\nLayout: Feature showcase composition highlighting the uploaded app screenshot.\n`;
    }

    // Additional elements
    if (showBadges && badgeText) {
      fullPrompt += `Include badge/label: "${badgeText}" as an overlay element (not on the device screen).\n`;
    }
    
    if (showAppIcon) {
      fullPrompt += `Show app icon in the composition (separate from the device screen).\n`;
    }

    // Perspective
    if (perspective !== "front") {
      fullPrompt += `\nPerspective: ${perspective} view angle.\n`;
    }

    // Quality directives based on art style
    fullPrompt += `\nStyle inspiration: `;
    switch(artStyle) {
      case "professional":
        fullPrompt += `Apple's app store features, Stripe's marketing pages, Linear's product shots`;
        break;
      case "playful":
        fullPrompt += `Spotify's colorful campaigns, Discord's vibrant marketing, Duolingo's fun approach`;
        break;
      case "minimal":
        fullPrompt += `Notion's clean aesthetic, Medium's simplicity, Japanese minimalism`;
        break;
      case "bold":
        fullPrompt += `Nike's bold campaigns, gaming industry marketing, high-impact visuals`;
        break;
      case "futuristic":
        fullPrompt += `Cyberpunk aesthetics, holographic effects, sci-fi interfaces`;
        break;
      case "vintage":
        fullPrompt += `Retro computing aesthetics, nostalgic design, classic advertising`;
        break;
    }

    fullPrompt += `.\n\nREMINDER: The uploaded image must be used as the screen content. Do not generate different screen content.\n`;
    fullPrompt += `Make it photorealistic and highly detailed. Every pixel should be intentional. The kind of image that makes other designers jealous.`;

    return fullPrompt;
  };

  const generateAppStoreMockup = async () => {
    if (!uploadedImage) {
      setError("Please upload a screenshot first")
      return
    }

    if (!caption.trim() && !customPrompt.trim()) {
      setError("Please enter a caption or custom prompt for your mockup")
      return
    }
    
    if (typeof usageStats.limit === 'number' && usageStats.current >= usageStats.limit) {
      setError("You've reached your monthly GPT image generation limit. Upgrade your plan to create more mockups.")
      return;
    }

    try {
      setLoading(true)
      setError(null)

      // Track usage
      try {
        await trackFeatureUsage("gpt_image_editing", {
          has_screenshot: true,
          aspect_ratio: aspectRatio,
          device_type: deviceType,
          background_style: backgroundStyle,
          effects_enabled: {
            glow: glowEffect,
            blur3d: blur3DEffect,
            floating: floatingEffect,
            reflections: reflectionIntensity[0] > 0
          }
        })
      } catch (trackingError) {
        console.warn("Failed to track usage:", trackingError)
      }

      const mockupPrompt = constructDetailedPrompt();

      // Convert data URL to File object for the API
      const imageResponse = await fetch(uploadedImage);
      const blob = await imageResponse.blob();
      const imageFile = new File([blob], "screenshot.png", { type: blob.type });

      // Prepare form data
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("prompt", mockupPrompt)
      formData.append("size", aspectRatio)
      formData.append("quality", "high")
      formData.append("format", "png")
      formData.append("background", "auto")

      const response = await fetch("/api/gpt-image/edit", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to generate mockup: ${response.status} ${response.statusText}`)
      }

      if (!data.url) {
        throw new Error("No image URL returned from the API")
      }

      setGeneratedImage(data.url)
      setRetryCount(0)
      
      setUsageStats(prev => ({
        current: prev.current + 1,
        limit: prev.limit
      }))

      toast({
        title: "Mockup generated!",
        description: "Your custom app store mockup has been created successfully.",
      })
    } catch (err: any) {
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
    generateAppStoreMockup()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("File size should be less than 25MB")
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
      setUploadedImage(null)
      setCaption("")
      setSubCaption("")
      setCustomPrompt("")
    }
  }

  const isFreeTier = !subscription || subscription.plan === "free";
  const showUpgradeNeeded = isFreeTier && typeof usageStats.limit === 'number' && usageStats.current >= usageStats.limit;

  return (
    <GlassCard className="p-4 glossy-card" intensity="medium">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center text-glow">
          <Sparkles className="h-4 w-4 text-primary mr-2" />
          Advanced Mockup Generator
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <Label className="text-sm">Usage</Label>
            <div className="text-xs text-muted-foreground">
              {usageStats.current} / {usageStats.limit}
            </div>
          </div>
          {isFreeTier && (
            <GlassButton size="sm" variant="outline" asChild>
              <Link href="/subscribe">Upgrade</Link>
            </GlassButton>
          )}
        </div>
      </div>

      {showUpgradeNeeded && (
        <div className="p-3 rounded-md bg-amber-500/10 text-amber-500 text-sm flex items-center mb-4">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <div className="flex-1">
            You've reached your limit. <Link href="/subscribe" className="font-medium hover:underline">Upgrade for more →</Link>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-background/50 transition-colors glossy mb-4"
        onClick={() => !showUpgradeNeeded && fileInputRef.current?.click()}
      >
        {uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Uploaded screenshot"
              className="max-h-32 mx-auto rounded-md"
            />
            <GlassButton 
              size="sm" 
              variant="secondary" 
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Change Screenshot
            </GlassButton>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {showUpgradeNeeded ? "Upgrade to upload" : "Upload your app screenshot"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max. 25MB)</p>
          </>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="text" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="text"><Type className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="background"><Palette className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="device"><Smartphone className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="effects"><Sparkles className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="advanced"><Settings className="h-4 w-4" /></TabsTrigger>
        </TabsList>

        {/* Text & Caption Tab */}
        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label>Main Caption</Label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g., Track Your Progress"
              className="glossy"
              disabled={showUpgradeNeeded}
            />
          </div>

          <div className="space-y-2">
            <Label>Sub Caption (Optional)</Label>
            <Input
              value={subCaption}
              onChange={(e) => setSubCaption(e.target.value)}
              placeholder="e.g., The smartest way to reach your goals"
              className="glossy"
              disabled={showUpgradeNeeded}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Style</Label>
              <Select value={fontStyle} onValueChange={setFontStyle} disabled={showUpgradeNeeded}>
                <SelectTrigger className="glossy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text Size</Label>
              <Select value={textSize} onValueChange={setTextSize} disabled={showUpgradeNeeded}>
                <SelectTrigger className="glossy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="huge">Huge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 p-1"
                  disabled={showUpgradeNeeded}
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 glossy"
                  disabled={showUpgradeNeeded}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <Select value={textAlignment} onValueChange={setTextAlignment} disabled={showUpgradeNeeded}>
                <SelectTrigger className="glossy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Prompt (Optional)</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add your own creative instructions here. This will be combined with the settings you choose..."
              className="glossy min-h-[100px]"
              disabled={showUpgradeNeeded}
            />
            <p className="text-xs text-muted-foreground">Your custom prompt will be enhanced with our optimization</p>
          </div>
        </TabsContent>

        {/* Background Tab */}
        <TabsContent value="background" className="space-y-4">
          <div className="space-y-2">
            <Label>Background Style</Label>
            <RadioGroup value={backgroundStyle} onValueChange={setBackgroundStyle}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gradient" id="bg-gradient" disabled={showUpgradeNeeded} />
                <Label htmlFor="bg-gradient">Gradient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solid" id="bg-solid" disabled={showUpgradeNeeded} />
                <Label htmlFor="bg-solid">Solid Color</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mesh" id="bg-mesh" disabled={showUpgradeNeeded} />
                <Label htmlFor="bg-mesh">Mesh Gradient</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 p-1"
                  disabled={showUpgradeNeeded}
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 glossy"
                  disabled={showUpgradeNeeded}
                />
              </div>
            </div>

            {backgroundStyle !== "solid" && (
              <div className="space-y-2">
                <Label>End Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={backgroundColorEnd}
                    onChange={(e) => setBackgroundColorEnd(e.target.value)}
                    className="w-12 h-10 p-1"
                    disabled={showUpgradeNeeded}
                  />
                  <Input
                    type="text"
                    value={backgroundColorEnd}
                    onChange={(e) => setBackgroundColorEnd(e.target.value)}
                    className="flex-1 glossy"
                    disabled={showUpgradeNeeded}
                  />
                </div>
              </div>
            )}
          </div>

          {backgroundStyle === "gradient" && (
            <div className="space-y-2">
              <Label>Gradient Direction</Label>
              <Select value={gradientDirection} onValueChange={setGradientDirection} disabled={showUpgradeNeeded}>
                <SelectTrigger className="glossy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="diagonal">Diagonal</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Background Pattern</Label>
            <Select value={backgroundPattern} onValueChange={setBackgroundPattern} disabled={showUpgradeNeeded}>
              <SelectTrigger className="glossy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="waves">Waves</SelectItem>
                <SelectItem value="noise">Noise</SelectItem>
                <SelectItem value="geometric">Geometric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Device Tab */}
        <TabsContent value="device" className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="show-device"
              checked={showDeviceFrame}
              onCheckedChange={setShowDeviceFrame}
              disabled={showUpgradeNeeded}
            />
            <Label htmlFor="show-device">Show Device Frame</Label>
          </div>

          {showDeviceFrame && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select value={deviceType} onValueChange={setDeviceType} disabled={showUpgradeNeeded}>
                    <SelectTrigger className="glossy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="watch">Smart Watch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Device Brand</Label>
                  <Select value={deviceBrand} onValueChange={setDeviceBrand} disabled={showUpgradeNeeded}>
                    <SelectTrigger className="glossy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="samsung">Samsung</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="generic">Generic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Color</Label>
                  <Select value={deviceColor} onValueChange={setDeviceColor} disabled={showUpgradeNeeded}>
                    <SelectTrigger className="glossy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="custom">Custom Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select value={deviceOrientation} onValueChange={setDeviceOrientation} disabled={showUpgradeNeeded}>
                    <SelectTrigger className="glossy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Screen Position</Label>
                <Select value={screenPosition} onValueChange={setScreenPosition} disabled={showUpgradeNeeded}>
                  <SelectTrigger className="glossy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-4">
          <div className="space-y-2">
            <Label>Shadow Intensity</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={shadowIntensity}
                onValueChange={setShadowIntensity}
                max={100}
                step={10}
                className="flex-1"
                disabled={showUpgradeNeeded}
              />
              <span className="text-sm text-muted-foreground w-12">{shadowIntensity[0]}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reflection Intensity</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={reflectionIntensity}
                onValueChange={setReflectionIntensity}
                max={100}
                step={10}
                className="flex-1"
                disabled={showUpgradeNeeded}
              />
              <span className="text-sm text-muted-foreground w-12">{reflectionIntensity[0]}%</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="glow-effect"
                  checked={glowEffect}
                  onCheckedChange={setGlowEffect}
                  disabled={showUpgradeNeeded}
                />
                <Label htmlFor="glow-effect">Glow Effect</Label>
              </div>
              {glowEffect && (
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={glowColor}
                    onChange={(e) => setGlowColor(e.target.value)}
                    className="w-12 h-8 p-1"
                    disabled={showUpgradeNeeded}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="blur-3d"
                checked={blur3DEffect}
                onCheckedChange={setBlur3DEffect}
                disabled={showUpgradeNeeded}
              />
              <Label htmlFor="blur-3d">3D Depth Blur</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="floating"
                checked={floatingEffect}
                onCheckedChange={setFloatingEffect}
                disabled={showUpgradeNeeded}
              />
              <Label htmlFor="floating">Floating Effect</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="env-reflections"
                checked={environmentReflections}
                onCheckedChange={setEnvironmentReflections}
                disabled={showUpgradeNeeded}
              />
              <Label htmlFor="env-reflections">Environment Reflections</Label>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <Label>Art Style</Label>
            <Select value={artStyle} onValueChange={setArtStyle} disabled={showUpgradeNeeded}>
              <SelectTrigger className="glossy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="futuristic">Futuristic</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lighting Style</Label>
            <Select value={lightingStyle} onValueChange={setLightingStyle} disabled={showUpgradeNeeded}>
              <SelectTrigger className="glossy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="dramatic">Dramatic</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
                <SelectItem value="neon">Neon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Perspective</Label>
            <Select value={perspective} onValueChange={setPerspective} disabled={showUpgradeNeeded}>
              <SelectTrigger className="glossy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Front View</SelectItem>
                <SelectItem value="angled">Angled View</SelectItem>
                <SelectItem value="side">Side View</SelectItem>
                <SelectItem value="top-down">Top Down</SelectItem>
                <SelectItem value="isometric">Isometric</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Layout Style</Label>
            <Select value={layoutStyle} onValueChange={setLayoutStyle} disabled={showUpgradeNeeded}>
              <SelectTrigger className="glossy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">Hero (Single Focus)</SelectItem>
                <SelectItem value="multi">Multiple Screens</SelectItem>
                <SelectItem value="context">In Context</SelectItem>
                <SelectItem value="showcase">Feature Showcase</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-badges"
                  checked={showBadges}
                  onCheckedChange={setShowBadges}
                  disabled={showUpgradeNeeded}
                />
                <Label htmlFor="show-badges">Add Badge/Label</Label>
              </div>
            </div>
            
            {showBadges && (
              <Input
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g., NEW, #1 App, Editor's Choice"
                className="glossy"
                disabled={showUpgradeNeeded}
              />
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="show-app-icon"
                checked={showAppIcon}
                onCheckedChange={setShowAppIcon}
                disabled={showUpgradeNeeded}
              />
              <Label htmlFor="show-app-icon">Include App Icon</Label>
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
                <RadioGroupItem value="1024x1024" id="ratio-square" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-square">Square</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1536x1024" id="ratio-landscape" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-landscape">Landscape</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1024x1536" id="ratio-portrait" disabled={showUpgradeNeeded} />
                <Label htmlFor="ratio-portrait">Portrait</Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview of settings */}
      <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-4 w-4" />
          <span className="font-medium">Preview Settings</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>Style: {artStyle}</div>
          <div>Device: {showDeviceFrame ? `${deviceType} (${deviceColor})` : 'No frame'}</div>
          <div>Background: {backgroundStyle}</div>
          <div>Effects: {[glowEffect && 'Glow', blur3DEffect && '3D Blur', floatingEffect && 'Floating'].filter(Boolean).join(', ') || 'None'}</div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <div className="flex-1">{error}</div>
          <div className="flex gap-2">
            {retryCount < 3 && !showUpgradeNeeded && (
              <GlassButton size="sm" variant="outline" onClick={handleRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </GlassButton>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <GlassButton
          onClick={generateAppStoreMockup}
          disabled={loading || showUpgradeNeeded || !uploadedImage || (!caption.trim() && !customPrompt.trim())}
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
                alt="Generated app mockup"
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
                    download="app-mockup.png"
                    onClick={async (e) => {
                      if (generatedImage.startsWith('data:')) {
                        return;
                      }
                      
                      e.preventDefault();
                      try {
                        const response = await fetch(generatedImage);
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'app-mockup.png';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Download failed:', error);
                        window.open(generatedImage, '_blank');
                      }
                    }}
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
