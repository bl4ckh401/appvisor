"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        throw new Error("You must be logged in to create a project")
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name,
            description,
            user_id: userData.user.id,
          },
        ])
        .select()

      if (error) {
        throw new Error(error.message)
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Project</h1>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App"
                required
                className="bg-background/30 backdrop-blur-sm border-border/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your project"
                rows={4}
                className="bg-background/30 backdrop-blur-sm border-border/40"
              />
            </div>

            {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive">{error}</div>}

            <div className="flex justify-end space-x-4">
              <GlassButton variant="outline" type="button" asChild>
                <Link href="/dashboard">Cancel</Link>
              </GlassButton>
              <GlassButton type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
