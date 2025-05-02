import { Skeleton } from "@/components/ui/skeleton"

export default function PricingLoading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-lime-300/20 rounded-xl p-6 backdrop-blur-sm bg-black/50 shadow-lg shadow-lime-500/10"
          >
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-6" />

            <div className="space-y-4 mb-8">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center">
                  <Skeleton className="h-5 w-5 rounded-full mr-3" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>

            <Skeleton className="h-12 w-full rounded-md mt-6" />
          </div>
        ))}
      </div>
    </div>
  )
}
