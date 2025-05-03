"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Card3D } from "@/components/ui/card-3d"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, User, Mail, Key, LogOut, CreditCard } from "lucide-react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
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

        setUser(user)

        // Get user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile(profileData)
        }

        // Get subscription
        const { data: subscriptionData } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (subscriptionData) {
          setSubscription(subscriptionData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, supabase])

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
          <GlassButton asChild>
            <Link href="/auth">Sign In</Link>
          </GlassButton>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card3D className="p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{profile?.full_name || user.email.split("@")[0]}</h2>
            <p className="text-muted-foreground mb-4">{user.email}</p>
            <GlassButton variant="destructive" onClick={handleSignOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </GlassButton>
          </Card3D>
        </div>

        <div className="md:col-span-2 space-y-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Member Since</label>
                <div className="flex items-center">
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <GlassButton variant="outline" asChild>
                  <Link href="/auth/reset-password">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Link>
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Subscription</h2>
            {subscription ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Current Plan</label>
                  <div className="flex items-center">
                    <span className="capitalize">{subscription.plan}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Billing Cycle</label>
                  <div className="flex items-center">
                    <span>{subscription.is_annual ? "Annual" : "Monthly"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Next Billing Date</label>
                  <div className="flex items-center">
                    <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex gap-2">
                  <GlassButton variant="outline" asChild>
                    <Link href="/subscription-usage">
                      <CreditCard className="mr-2 h-4 w-4" />
                      View Usage
                    </Link>
                  </GlassButton>
                  <GlassButton asChild>
                    <Link href="/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </Link>
                  </GlassButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">You are currently on the Free plan.</p>
                <GlassButton asChild>
                  <Link href="/pricing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Link>
                </GlassButton>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
