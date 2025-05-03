import { Loader2 } from "lucide-react"

export default function SubscriptionUsageLoading() {
  return (
    <div className="container py-10 flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <p>Loading subscription usage...</p>
    </div>
  )
}
