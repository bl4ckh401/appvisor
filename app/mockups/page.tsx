import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Plus, ImageIcon } from "lucide-react"
import { MockupCard } from "@/components/mockup-card"

export default async function MockupsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your mockups</div>
  }

  // Fetch user's mockups
  const { data: mockups } = await supabase
    .from("mockups")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-glow">Your Mockups</h1>
        <Link href="/editor">
          <GlassButton className="glossy-button">
            <Plus className="mr-2 h-4 w-4" />
            New Mockup
          </GlassButton>
        </Link>
      </div>

      {mockups && mockups.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mockups.map((mockup) => (
            <MockupCard key={mockup.id} id={mockup.id} name={mockup.name} imageUrl={mockup.image_url} />
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center glossy-card">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No mockups yet</h2>
          <p className="text-muted-foreground mb-6">Create your first mockup using our AI-powered generator</p>
          <Link href="/editor">
            <GlassButton className="glossy-button">
              <Plus className="mr-2 h-4 w-4" />
              Create Mockup
            </GlassButton>
          </Link>
        </GlassCard>
      )}
    </div>
  )
}
