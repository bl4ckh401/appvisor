import { GlassCard } from "@/components/ui/glass-card"
import { Loader2 } from "lucide-react"

export default function MockupLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        <div className="h-8 w-48 ml-4 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GlassCard className="p-4 glossy-card">
            <div className="aspect-square md:aspect-[4/3] w-full rounded-md bg-muted animate-pulse flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard className="p-6 glossy-card mb-6">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-6"></div>
            <div className="space-y-6">
              <div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-5 w-full bg-muted rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-20 w-full bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 glossy-card">
            <div className="h-6 w-24 bg-muted rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
