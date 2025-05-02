"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Check, HelpCircle, X, ChevronRight, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { planFeatures } from "@/lib/plan-restrictions"

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "team" | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { subscription } = useFeatureAccess()

  // Set initial plan selection from query params
  useEffect(() => {
    const planParam = searchParams.get("plan")
    if (planParam === "pro" || planParam === "team") {
      setSelectedPlan(planParam)
    }
  }, [searchParams])

  // Check authentication and current subscription
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Get current subscription
          const { data: sub } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single()

          if (sub) {
            setCurrentPlan(sub.plan)
          } else {
            setCurrentPlan("free")
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Handle plan selection
  const handleSelectPlan = (plan: "free" | "pro" | "team") => {
    if (plan === "free") {
      // Free plan - just redirect to auth page
      router.push("/auth")
      return
    }

    setSelectedPlan(plan)

    // If user is not logged in, redirect to auth with plan parameter
    if (!user) {
      router.push(`/auth?redirect=/subscribe?plan=${plan}${annual ? '&billing=annual' : ''}`)
      return
    }

    // If user is on the same plan already, redirect to dashboard
    if (currentPlan === plan) {
      toast({
        title: "Already Subscribed",
        description: `You're already subscribed to the ${plan.toUpperCase()} plan.`,
      })
      router.push("/dashboard")
      return
    }

    // Redirect to subscription page with plan parameter
    router.push(`/subscribe?plan=${plan}${annual ? '&billing=annual' : ''}`)
  }

  // Get price for plan
  const getPlanPrice = (plan: "free" | "pro" | "team") => {
    if (plan === "free") return "$0"
    if (plan === "pro") return annual ? "$15" : "$19"
    if (plan === "team") return annual ? "$39" : "$49"
    return "$0"
  }

  // Check if plan is current plan
  const isCurrentPlan = (plan: string) => currentPlan === plan

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial="initial"
              animate="animate"
              variants={fadeIn}
            >
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Simple Pricing
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold">
                  Choose the Perfect Plan for Your Needs
                </h1>

                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  All plans include a 14-day free trial with no credit card required.
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <span className={`text-sm font-medium ${!annual ? "text-primary" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      checked={annual}
                      onChange={() => setAnnual(!annual)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <span className={`text-sm font-medium ${annual ? "text-primary" : "text-muted-foreground"}`}>
                  Annual <span className="text-xs text-emerald-500 font-semibold">Save 20%</span>
                </span>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              viewport={{ once: true }}
            >
              {/* Free Plan */}
              <PricingCard
                title="Free"
                price="$0"
                description="Perfect for trying out AppVisor"
                features={[
                  `${planFeatures.free.mockupsPerMonth} mockups per month`,
                  "Basic templates",
                  `${planFeatures.free.exportFormats.join(", ")} export formats`,
                  "Community support"
                ]}
                buttonText={isCurrentPlan("free") ? "Current Plan" : "Get Started"}
                buttonVariant="outline"
                onSelect={() => handleSelectPlan("free")}
                current={isCurrentPlan("free")}
              />

              {/* Pro Plan */}
              <PricingCard
                title="Pro"
                price={getPlanPrice("pro")}
                period={annual ? "/month, billed annually" : "/month"}
                description="Everything you need for regular use"
                features={[
                  "Unlimited mockups",
                  "All templates", 
                  `All export formats (${planFeatures.pro.exportFormats.length})`,
                  `Bulk generation (up to ${planFeatures.pro.bulkGeneration})`,
                  "Custom branding",
                  "Priority support"
                ]}
                buttonText={
                  isCurrentPlan("pro") 
                    ? "Current Plan" 
                    : loading 
                      ? "Loading..." 
                      : "Start Free Trial"
                }
                buttonVariant="gradient"
                highlighted={true}
                onSelect={() => handleSelectPlan("pro")}
                current={isCurrentPlan("pro")}
              />

              {/* Team Plan */}
              <PricingCard
                title="Team"
                price={getPlanPrice("team")}
                period={annual ? "/month, billed annually" : "/month"}
                description="For design teams and agencies"
                features={[
                  "Everything in Pro",
                  `Team collaboration (${planFeatures.team.teamMembers} members)`,
                  `Bulk generation (up to ${planFeatures.team.bulkGeneration})`,
                  "API access",
                  "Dedicated support",
                  "White labeling"
                ]}
                buttonText={
                  isCurrentPlan("team") 
                    ? "Current Plan" 
                    : loading 
                      ? "Loading..." 
                      : "Start Free Trial"
                }
                buttonVariant="outline"
                onSelect={() => handleSelectPlan("team")}
                current={isCurrentPlan("team")}
              />
            </motion.div>

            {/* FAQ Section */}
            <div className="mt-24">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                <FaqItem
                  question="How does the free trial work?"
                  answer="All paid plans include a 14-day free trial. No credit card required. You can upgrade, downgrade, or cancel at any time."
                />
                <FaqItem
                  question="Can I change plans later?"
                  answer="Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the end of your current billing cycle."
                />
                <FaqItem
                  question="What payment methods do you accept?"
                  answer="We accept all major credit cards and debit cards through our secure payment processor, Paystack."
                />
                <FaqItem
                  question="Is there a limit to how many mockups I can create?"
                  answer="Free plans are limited to 5 mockups per month. Pro and Team plans include unlimited mockups."
                />
                <FaqItem
                  question="Do you offer refunds?"
                  answer="Yes, we offer a 30-day money-back guarantee. If you're not satisfied with AppVisor, contact us for a full refund."
                />
                <FaqItem
                  question="What is bulk generation?"
                  answer="Bulk generation allows you to create multiple mockups at once. Pro plans can generate up to 10 mockups at once, while Team plans can generate up to 50."
                />
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              className="mt-24 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 md:p-12 max-w-5xl mx-auto text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your App Store Presence?</h2>
                <p className="text-xl mb-8 max-w-[600px] mx-auto">
                  Join thousands of developers and designers who are creating stunning app store listings with AppVisor.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => handleSelectPlan("pro")}
                    className="px-6 py-3 bg-white text-purple-600 rounded-md font-medium flex items-center justify-center hover:bg-white/90 transition-all"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Pro Trial
                  </button>
                  <Link
                    href="/auth"
                    className="px-6 py-3 bg-transparent border border-white text-white rounded-md font-medium flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}

// Plan features display component
function FeatureItem({ children, included = false }) {
  return (
    <div className="flex items-center">
      {included ? (
        <Check className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
      )}
      <span className={included ? "" : "text-muted-foreground"}>{children}</span>
    </div>
  )
}

// Tooltip component for features
function FeatureTooltip({ content }) {
  return (
    <div className="group relative">
      <HelpCircle className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 invisible group-hover:visible bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg w-48 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <p>{content}</p>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
      </div>
    </div>
  )
}

// Pricing card component
function PricingCard({ 
  title, 
  price, 
  period = "", 
  description, 
  features, 
  buttonText, 
  buttonVariant,
  highlighted = false,
  onSelect,
  current = false
}) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
    >
      <div 
        className={`p-6 h-full rounded-lg overflow-hidden shadow-sm ${
          highlighted 
            ? "border-2 border-primary bg-primary/5" 
            : "border border-border bg-background"
        } ${current ? "ring-2 ring-primary" : ""}`}
      >
        {highlighted && (
          <div className="absolute -top-4 right-4 z-10">
            <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Popular
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{price}</span>
            {period && <span className="text-muted-foreground">{period}</span>}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <ul className="mt-6 space-y-2 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <button
            className={`w-full py-2 rounded-md font-medium flex items-center justify-center transition-all ${
              buttonVariant === "gradient" 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90" 
                : buttonVariant === "outline"
                  ? "bg-background border border-border hover:bg-muted/30"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
            } ${current ? "cursor-default opacity-70" : ""}`}
            onClick={onSelect}
            disabled={current}
          >
            {current && <Check className="mr-2 h-4 w-4" />}
            {buttonText}
            {!current && buttonVariant === "gradient" && <ChevronRight className="ml-2 h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// FAQ item component
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-border overflow-hidden"
    >
      <button
        className="w-full px-5 py-4 text-left font-medium flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <ChevronRight className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-5 py-4 border-t border-border bg-muted/10">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      )}
    </motion.div>
  )
}
