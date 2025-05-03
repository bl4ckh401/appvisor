"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Search, Filter, X } from "lucide-react"
import { useFeatureAccess } from "@/hooks/use-feature-access"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])
  const router = useRouter()
  const supabase = createClient()
  const { getCurrentPlan } = useFeatureAccess()

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        // Get user's plan
        const plan = getCurrentPlan()

        // Fetch templates
        let query = supabase.from("templates").select("*")

        // Filter by plan access
        if (plan === "free") {
          query = query.eq("is_premium", false)
        }

        const { data } = await query.order("name", { ascending: true })

        if (data) {
          setTemplates(data)

          // Extract unique categories
          const uniqueCategories = [...new Set(data.map((template) => template.category).filter(Boolean))]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [router, supabase, getCurrentPlan])

  // Filter templates based on search term and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Templates</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-border rounded-md bg-background appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || selectedCategory) && (
          <GlassButton variant="outline" onClick={clearFilters} className="flex-shrink-0">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </GlassButton>
        )}
      </div>

      {filteredTemplates.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No Templates Found</h2>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
          <GlassButton variant="outline" onClick={clearFilters}>
            Clear Filters
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}

// Template card component
function TemplateCard({ template }) {
  return (
    <Card3D className="p-4 h-full hover:border-primary/50 transition-colors">
      <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
        {template.thumbnail_url ? (
          <img
            src={template.thumbnail_url || "/placeholder.svg"}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Preview</div>
        )}
      </div>

      <h3 className="font-medium truncate">{template.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{template.description || "No description"}</p>

      <div className="mt-auto">
        <GlassButton asChild className="w-full">
          <Link href={`/editor?template=${template.id}`}>Use Template</Link>
        </GlassButton>
      </div>
    </Card3D>
  )
}
