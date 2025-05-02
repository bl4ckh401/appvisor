"use client"

import type React from "react"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Share2, FileImage, FileCode } from "lucide-react"
import html2canvas from "html2canvas"

interface ExportMockupProps {
  mockupRef: React.RefObject<HTMLDivElement>
  mockupName: string
}

export function ExportMockup({ mockupRef, mockupName }: ExportMockupProps) {
  const [format, setFormat] = useState<"png" | "jpg">("png")
  const [quality, setQuality] = useState<"standard" | "high">("standard")
  const [includeFrame, setIncludeFrame] = useState(true)
  const [loading, setLoading] = useState(false)

  const exportMockup = async () => {
    if (!mockupRef.current) return

    try {
      setLoading(true)

      const scale = quality === "high" ? 2 : 1

      const canvas = await html2canvas(mockupRef.current, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          format === "png" ? "image/png" : "image/jpeg",
          format === "jpg" ? 0.9 : undefined,
        )
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${mockupName.replace(/\s+/g, "-").toLowerCase()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting mockup:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="p-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Download className="h-4 w-4 text-primary mr-2" />
        Export Mockup
      </h3>

      <Tabs defaultValue="image">
        <TabsList className="w-full bg-background/40 backdrop-blur-md mb-4">
          <TabsTrigger value="image" className="flex-1">
            <FileImage className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
          <TabsTrigger value="code" className="flex-1">
            <FileCode className="h-4 w-4 mr-2" />
            HTML/CSS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="space-y-4">
          <div className="space-y-2">
            <Label>Format</Label>
            <RadioGroup
              defaultValue={format}
              onValueChange={(value) => setFormat(value as "png" | "jpg")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="png" />
                <Label htmlFor="png">PNG</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpg" id="jpg" />
                <Label htmlFor="jpg">JPG</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Quality</Label>
            <RadioGroup
              defaultValue={quality}
              onValueChange={(value) => setQuality(value as "standard" | "high")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard">Standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High Resolution</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="include-frame" checked={includeFrame} onCheckedChange={setIncludeFrame} />
            <Label htmlFor="include-frame">Include device frame</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <GlassButton onClick={exportMockup} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export as {format.toUpperCase()}
                </>
              )}
            </GlassButton>
          </div>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your mockup as HTML and CSS code that you can embed in your website.
          </p>

          <div className="flex justify-end space-x-2">
            <GlassButton variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Copy Embed Code
            </GlassButton>
            <GlassButton>
              <Download className="mr-2 h-4 w-4" />
              Download HTML/CSS
            </GlassButton>
          </div>
        </TabsContent>
      </Tabs>
    </GlassCard>
  )
}
