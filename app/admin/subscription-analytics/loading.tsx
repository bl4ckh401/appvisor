import { GlassCard } from "@/components/ui/glass-card"

export default function SubscriptionAnalyticsLoading() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Subscription Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="animate-pulse flex justify-between items-start">
                <div>
                  <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-muted-foreground/20 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-muted-foreground/20 rounded"></div>
              </div>
            </GlassCard>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="h-6 w-40 bg-muted-foreground/20 rounded mb-6"></div>
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="h-6 w-20 bg-muted-foreground/20 rounded"></div>
                      <div className="h-6 w-8 bg-muted-foreground/20 rounded"></div>
                    </div>
                  ))}
              </div>
            </GlassCard>
          ))}
      </div>

      <GlassCard className="p-6">
        <div className="h-6 w-40 bg-muted-foreground/20 rounded mb-6"></div>
        <div className="animate-pulse">
          <div className="h-10 w-full bg-muted-foreground/20 rounded mb-4"></div>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted-foreground/20 rounded mb-2"></div>
            ))}
        </div>
      </GlassCard>
    </div>
  )
}
