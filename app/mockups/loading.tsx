import { GlassCard } from "@/components/ui/glass-card"

export default function MockupsLoading() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
        <div className="h-10 w-48 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <GlassCard key={i} className="h-full glossy-card">
            <div className="aspect-square bg-muted animate-pulse"></div>
            <div className="p-4">
              <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
