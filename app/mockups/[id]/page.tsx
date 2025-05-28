import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { ArrowLeft, Download, Edit, Trash2 } from "lucide-react"
import { MockupImage } from "@/components/mockup-detail/mockup-image"

export default async function MockupDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth?redirectedFrom=/mockups/" + params.id)
  }

  // Fetch mockup details
  const { data: mockup, error } = await supabase.from("mockups").select("*").eq("id", params.id).single()

  // If there's an error or no mockup found, check if it exists but belongs to another user
  if (error || !mockup) {
    console.error("Error fetching mockup:", error?.message || "Mockup not found")

    // Check if mockup exists but belongs to another user
    const { data: anyMockup } = await supabase.from("mockups").select("user_id").eq("id", params.id).single()

    if (anyMockup && anyMockup.user_id !== user.id) {
      return (
        <div className="container mx-auto py-8 px-4">
          <GlassCard className="p-6">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-4">You don't have permission to view this mockup.</p>
            <Link href="/dashboard">
              <GlassButton>Back to Dashboard</GlassButton>
            </Link>
          </GlassCard>
        </div>
      )
    }

    // If mockup truly doesn't exist
    notFound()
  }

  // Get safe image URL
  const safeImageUrl = mockup.image_url || "/placeholder.svg?height=300&width=300"

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard">
          <GlassButton variant="outline" size="sm" className="glossy mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </GlassButton>
        </Link>
        <h1 className="text-2xl font-bold text-glow">{mockup.name || "Untitled Mockup"}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GlassCard className="p-4 glossy-card">
            <div className="relative aspect-square md:aspect-[4/3] w-full rounded-md overflow-hidden">
              <MockupImage src={safeImageUrl} alt={mockup.name || "App mockup"} />
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard className="p-6 glossy-card mb-6">
            <h2 className="text-lg font-medium mb-4 text-glow">Mockup Details</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{mockup.name || "Untitled Mockup"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{new Date(mockup.created_at).toLocaleDateString()}</p>
              </div>

              {mockup.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{mockup.description}</p>
                </div>
              )}

              {mockup.prompt && (
                <div>
                  <p className="text-sm text-muted-foreground">Prompt</p>
                  <p className="text-sm">{mockup.prompt}</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6 glossy-card">
            <h2 className="text-lg font-medium mb-4 text-glow">Actions</h2>

            <div className="space-y-3">
              <Link href={`/editor?mockupId=${mockup.id}`} className="w-full block">
                <GlassButton className="w-full glossy-button">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Mockup
                </GlassButton>
              </Link>

              {mockup.image_url && (
                <Link href={mockup.image_url} target="_blank" rel="noopener noreferrer" className="w-full block">
                  <GlassButton variant="outline" className="w-full glossy">
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </GlassButton>
                </Link>
              )}

              <Link href={`/dashboard`} className="w-full block">
                <GlassButton variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Mockup
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
