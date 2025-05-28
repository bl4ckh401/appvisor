"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { ModernInput } from "@/components/ui/modern-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({
          type: "success",
          text: "Check your email for the confirmation link!",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <ModernCard variant="glass" className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mr-3">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">AppVisor</h1>
            </div>
            <p className="text-muted-foreground">Welcome back! Please sign in to your account.</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 backdrop-blur-xl">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <ModernInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="glass"
                  icon={<Mail className="h-4 w-4" />}
                />

                <ModernInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="glass"
                  icon={<Lock className="h-4 w-4" />}
                />

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center ${
                      message.type === "error"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {message.type === "error" ? (
                      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </motion.div>
                )}

                <ModernButton type="submit" variant="gradient" className="w-full" loading={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </ModernButton>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
                <ModernInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="glass"
                  icon={<Mail className="h-4 w-4" />}
                />

                <ModernInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="glass"
                  icon={<Lock className="h-4 w-4" />}
                />

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center ${
                      message.type === "error"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {message.type === "error" ? (
                      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </motion.div>
                )}

                <ModernButton type="submit" variant="gradient" className="w-full" loading={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </ModernButton>
              </form>
            </TabsContent>
          </Tabs>
        </ModernCard>
      </motion.div>
    </div>
  )
}
