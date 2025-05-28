import Link from "next/link"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"

export default function MockupNotFound() {
  return (
    <div className="container mx-auto py-8 px-4">
      <GlassCard className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mockup Not Found</h1>
        <p className="mb-6">The mockup you're looking for doesn't exist or has been deleted.</p>
        <Link href="/dashboard">
          <GlassButton className="w-full">Back to Dashboard</GlassButton>
        </Link>
      </GlassCard>
    </div>
  )
}
