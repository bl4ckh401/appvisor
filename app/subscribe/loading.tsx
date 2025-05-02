import { Card3D } from "@/components/ui/card-3d"
import { Loader2 } from "lucide-react"

export default function SubscribeLoading() {
  return (
    <div className="container max-w-4xl py-16 px-4">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card3D className="p-8 text-center glossy-card" intensity="medium">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading subscription details...</p>
        </Card3D>
      </div>
    </div>
  )
}
