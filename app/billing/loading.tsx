import { GlassCard } from "@/components/ui/glass-card"
import { Loader2 } from "lucide-react"

export default function BillingLoading() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      <div className="mb-6 h-10 w-64 bg-muted-foreground/20 rounded"></div>

      <GlassCard className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading subscription details...</p>
      </GlassCard>
    </div>
  )
}
