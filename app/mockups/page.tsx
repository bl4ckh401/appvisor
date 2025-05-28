import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Plus } from "lucide-react"
import Image from "next/image"

export default async function MockupsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth?redirectedFrom=/mockups")
  }

  // Fetch all mockups for the user
  const { data: mockups, error } = await supabase
    .from("mockups")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching mockups:", error)
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-glow">My Mockups</h1>
        <Link href="/editor">
          <GlassButton className="glossy-button">
            <Plus className="mr-2 h-4 w-4" />
            Create New Mockup
          </GlassButton>
        </Link>
      </div>

      {mockups && mockups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockups.map((mockup) => (
            <Link key={mockup.id} href={`/mockups/${mockup.id}`}>
              <GlassCard className="h-full glossy-card hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  {mockup.image_url ? (
                    <Image
                      src={mockup.image_url || "/placeholder.svg"}
                      alt={mockup.name || "Mockup"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=300"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">No image</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-medium truncate">{mockup.name || "Untitled Mockup"}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(mockup.created_at).toLocaleDateString()}
                  </p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <h2 className="text-xl font-medium mb-2">No mockups yet</h2>
          <p className="text-muted-foreground mb-6">Create your first mockup to get started.</p>
          <Link href="/editor">
            <GlassButton className="glossy-button">
              <Plus className="mr-2 h-4 w-4" />
              Create New Mockup
            </GlassButton>
          </Link>
        </GlassCard>
      )}
    </div>
  )
}
