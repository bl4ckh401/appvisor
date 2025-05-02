"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, CreditCard, LogOut } from "lucide-react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error("User not found")

        setUser(user)

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setProfile(data)
          setFullName(data.full_name || "")
          setAvatarUrl(data.avatar_url || "")
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [supabase])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage(null)

      if (!user) throw new Error("User not found")

      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        email: user.email,
        updated_at: new Date().toISOString(),
      }

      // If profile doesn't exist, insert it, otherwise update it
      let error

      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert([updates])
        error = insertError
      } else {
        const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id)
        error = updateError
      }

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Error updating profile. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="container py-10">
        <GlassCard className="p-8 max-w-md mx-auto text-center">
          <p>Loading profile...</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <GlassCard className="p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={avatarUrl || "/placeholder.svg?height=96&width=96"} />
                <AvatarFallback>{fullName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{fullName || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>

              <div className="w-full mt-6 space-y-2">
                <GlassButton variant="outline" className="w-full justify-start" asChild>
                  <a href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </GlassButton>
                <GlassButton variant="outline" className="w-full justify-start" asChild>
                  <a href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </a>
                </GlassButton>
                <GlassButton variant="outline" className="w-full justify-start" asChild>
                  <a href="/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </a>
                </GlassButton>
                <GlassButton
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="bg-background/40 backdrop-blur-md mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <GlassCard className="p-6">
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="bg-background/30 backdrop-blur-sm border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email}
                      disabled
                      className="bg-background/30 backdrop-blur-sm border-border/40"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-background/30 backdrop-blur-sm border-border/40"
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-md ${
                        message.type === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <GlassButton type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </GlassButton>
                  </div>
                </form>
              </GlassCard>
            </TabsContent>

            <TabsContent value="account">
              <GlassCard className="p-6">
                <h3 className="text-lg font-medium mb-4">Account Settings</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-background/30 backdrop-blur-sm border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-background/30 backdrop-blur-sm border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-background/30 backdrop-blur-sm border-border/40"
                    />
                  </div>

                  <div className="flex justify-end">
                    <GlassButton>Update Password</GlassButton>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
