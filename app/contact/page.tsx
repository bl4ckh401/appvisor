"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user if logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Submit contact form
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        user_id: user?.id || null,
      })

      if (error) throw error

      // Reset form and show success message
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setSuccess(true)
    } catch (err) {
      console.error("Error submitting contact form:", err)
      setError("Failed to submit your message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions about AppVisor? Need help with your account? We're here to help! Fill out the form and our
            team will get back to you as soon as possible.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-muted-foreground">support@appvisor.com</p>
            </div>

            <div>
              <h3 className="font-medium">Hours</h3>
              <p className="text-muted-foreground">Monday - Friday: 9am - 5pm EST</p>
            </div>

            <div>
              <h3 className="font-medium">Response Time</h3>
              <p className="text-muted-foreground">We typically respond within 24 hours</p>
            </div>
          </div>
        </div>

        <GlassCard className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for contacting us. We'll get back to you as soon as possible.
              </p>
              <GlassButton onClick={() => setSuccess(false)}>Send Another Message</GlassButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>

              {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

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
      </div>
    </div>
  )
}
