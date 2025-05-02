"use client"

import type React from "react"

import { useState } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Mail, MessageSquare, Phone, Send, Loader2 } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out all fields")
      return
    }

    setLoading(true)
    setError(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setName("")
      setEmail("")
      setMessage("")
    }, 1500)
  }

  return (
    <div className="container py-16 md:py-24">
      <motion.div
        className="text-center max-w-3xl mx-auto mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground">Have questions or need help? We're here for you.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-8 h-full">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

            {success ? (
              <div className="text-center py-8">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6">
                  <p>Thank you for your message! We'll get back to you soon.</p>
                </div>
                <GlassButton onClick={() => setSuccess(false)}>Send Another Message</GlassButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-background/30 backdrop-blur-sm border-border/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="bg-background/30 backdrop-blur-sm border-border/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    className="bg-background/30 backdrop-blur-sm border-border/40"
                  />
                </div>

                {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive">{error}</div>}

                <GlassButton type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </GlassButton>
              </form>
            )}
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-8">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">support@appvisor.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-muted-foreground">Available Monday-Friday, 9am-5pm EST</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium">How does AI mockup generation work?</h3>
                  <p className="text-muted-foreground mt-1">
                    Our AI technology analyzes your app description and generates realistic mockups based on design
                    principles and trends. You can then customize these mockups to fit your specific needs.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Can I export my mockups in different formats?</h3>
                  <p className="text-muted-foreground mt-1">
                    Yes, you can export your mockups in PNG, JPG, and other formats suitable for app store listings and
                    marketing materials.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Do you offer custom enterprise plans?</h3>
                  <p className="text-muted-foreground mt-1">
                    Yes, we offer custom plans for larger teams and enterprises. Contact our sales team to discuss your
                    specific requirements.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
