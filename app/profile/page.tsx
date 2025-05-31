"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { ModernInput } from "@/components/ui/modern-input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Camera, Save, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

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

      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Error updating profile. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">My Profile</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <GlassCard className="p-6 sm:p-8 text-center">
                <div className="space-y-6">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mx-auto ring-4 ring-primary/20">
                      <AvatarImage src={avatarUrl || "/placeholder.svg?height=128&width=128"} />
                      <AvatarFallback className="text-2xl sm:text-3xl">
                        {fullName?.charAt(0) || user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full shadow-lg">
                      <Camera className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">{fullName || "User"}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Profile Form Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <GlassCard className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="h-6 w-6 text-primary" />
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Profile Information</h3>
                  </div>

                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                          Full Name
                        </Label>
                        <ModernInput
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          icon={<User className="h-4 w-4" />}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email Address
                        </Label>
                        <ModernInput
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          icon={<Mail className="h-4 w-4" />}
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl" className="text-sm font-medium text-foreground">
                        Avatar URL
                      </Label>
                      <ModernInput
                        id="avatarUrl"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        icon={<Camera className="h-4 w-4" />}
                      />
                      <p className="text-xs text-muted-foreground">Provide a URL to your profile picture</p>
                    </div>

                    {/* Message Display */}
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl border ${
                          message.type === "error"
                            ? "bg-destructive/10 border-destructive/20 text-destructive"
                            : "bg-green-500/10 border-green-500/20 text-green-600"
                        }`}
                      >
                        <p className="text-sm font-medium">{message.text}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <GlassButton type="submit" disabled={saving} className="min-w-[140px]">
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </GlassButton>
                    </div>
                  </form>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
