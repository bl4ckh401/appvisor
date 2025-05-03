import Link from "next/link"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Apple, SmartphoneIcon as Android, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"

export default async function TemplatesPage() {
  const supabase = createClient()

  // Fetch templates from the database
  const { data: templates, error } = await supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching templates:", error)
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground mt-1">Choose a template to get started</p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8 bg-background/30 backdrop-blur-sm border-border/40"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-background/40 backdrop-blur-md mb-8">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="ios">
            <Apple className="mr-2 h-4 w-4" />
            iOS
          </TabsTrigger>
          <TabsTrigger value="android">
            <Android className="mr-2 h-4 w-4" />
            Android
          </TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates && templates.map((template) => <TemplateCard key={template.id} template={template} />)}
          </div>
        </TabsContent>

        <TabsContent value="ios" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates &&
              templates
                .filter((template) => template.platform === "ios" || template.platform === "both")
                .map((template) => <TemplateCard key={template.id} template={template} />)}
          </div>
        </TabsContent>

        <TabsContent value="android" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates &&
              templates
                .filter((template) => template.platform === "android" || template.platform === "both")
                .map((template) => <TemplateCard key={template.id} template={template} />)}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates &&
              templates
                .filter((template) => template.featured)
                .map((template) => <TemplateCard key={template.id} template={template} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TemplateCard({ template }) {
  return (
    <Card3D className="overflow-hidden" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
      <div
        className="h-48 bg-cover bg-center"
        style={{
          backgroundImage: `url(${template.thumbnail_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{template.name}</h3>
          {template.is_premium && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Premium</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{template.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            {template.platform === "ios" && <Apple className="h-4 w-4" />}
            {template.platform === "android" && <Android className="h-4 w-4" />}
            {template.platform === "both" && (
              <>
                <Apple className="h-4 w-4" />
                <Android className="h-4 w-4" />
              </>
            )}
          </div>
          <GlassButton size="sm" asChild>
            <Link href={`/editor?template=${template.id}`}>Use Template</Link>
          </GlassButton>
        </div>
      </div>
    </Card3D>
  )
}
