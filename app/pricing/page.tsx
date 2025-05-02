"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, HelpCircle, X } from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { Text3D } from "@/components/ui/text-3d"
import { Background3D } from "@/components/ui/background-3d"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Background3D
          className="w-full py-16 md:py-24 lg:py-32"
          color1="rgba(138, 43, 226, 0.05)"
          color2="rgba(63, 81, 181, 0.05)"
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial="initial"
              animate="animate"
              variants={fadeIn}
            >
              <div className="space-y-2">
                <Text3D as="h1" className="text-4xl font-bold" intensity="high">
                  Simple, Transparent Pricing
                </Text3D>
                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                  Choose the plan that works best for you and your team. All plans include a 14-day free trial.
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <span className={`text-sm font-medium ${!annual ? "text-primary" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <div className="flex items-center">
                  <Switch id="billing-toggle" checked={annual} onCheckedChange={setAnnual} />
                </div>
                <span className={`text-sm font-medium ${annual ? "text-primary" : "text-muted-foreground"}`}>
                  Annual <span className="text-xs text-emerald-500 font-semibold">Save 20%</span>
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card3D className="p-6 h-full flex flex-col" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold">Free</h3>
                    <p className="text-muted-foreground mt-2">Perfect for trying out AppVisor</p>
                  </div>

                  <div className="mb-5">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <Button3D variant="outline" className="w-full mb-8" asChild>
                    <Link href="/auth">Get Started</Link>
                  </Button3D>

                  <div className="space-y-4 flex-1">
                    <FeatureItem included>5 mockups per month</FeatureItem>
                    <FeatureItem included>Basic templates</FeatureItem>
                    <FeatureItem included>Standard export formats</FeatureItem>
                    <FeatureItem included>Community support</FeatureItem>
                    <FeatureItem>Bulk generation</FeatureItem>
                    <FeatureItem>Custom branding</FeatureItem>
                    <FeatureItem>Priority support</FeatureItem>
                  </div>
                </Card3D>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card3D
                  className="p-6 h-full border-primary flex flex-col relative"
                  intensity="high"
                  glowColor="rgba(138, 43, 226, 0.3)"
                  depth={3}
                >
                  <div className="absolute -top-4 right-4 z-10">
                    <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Popular
                    </div>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-2xl font-bold">Pro</h3>
                    <p className="text-muted-foreground mt-2">Everything you need for regular use</p>
                  </div>

                  <div className="mb-5">
                    <span className="text-4xl font-bold">${annual ? "15" : "19"}</span>
                    <span className="text-muted-foreground">/{annual ? "month, billed annually" : "month"}</span>
                  </div>

                  <Button3D variant="gradient" className="w-full mb-8" asChild>
                    <Link href="/auth?plan=pro">Start Free Trial</Link>
                  </Button3D>

                  <div className="space-y-4 flex-1">
                    <FeatureItem included>Unlimited mockups</FeatureItem>
                    <FeatureItem included>All templates</FeatureItem>
                    <FeatureItem included>All export formats</FeatureItem>
                    <FeatureItem included>
                      Bulk generation
                      <FeatureTooltip content="Generate up to 10 mockups at once" />
                    </FeatureItem>
                    <FeatureItem included>Custom branding</FeatureItem>
                    <FeatureItem included>Priority support</FeatureItem>
                    <FeatureItem>Team collaboration</FeatureItem>
                    <FeatureItem>API access</FeatureItem>
                  </div>
                </Card3D>
              </motion.div>

              {/* Team Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card3D className="p-6 h-full flex flex-col" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold">Team</h3>
                    <p className="text-muted-foreground mt-2">For design teams and agencies</p>
                  </div>

                  <div className="mb-5">
                    <span className="text-4xl font-bold">${annual ? "39" : "49"}</span>
                    <span className="text-muted-foreground">/{annual ? "month, billed annually" : "month"}</span>
                  </div>

                  <Button3D variant="outline" className="w-full mb-8" asChild>
                    <Link href="/auth?plan=team">Start Free Trial</Link>
                  </Button3D>

                  <div className="space-y-4 flex-1">
                    <FeatureItem included>Everything in Pro</FeatureItem>
                    <FeatureItem included>
                      Team collaboration
                      <FeatureTooltip content="Up to 5 team members" />
                    </FeatureItem>
                    <FeatureItem included>
                      Bulk generation
                      <FeatureTooltip content="Generate up to 50 mockups at once" />
                    </FeatureItem>
                    <FeatureItem included>API access</FeatureItem>
                    <FeatureItem included>Dedicated support</FeatureItem>
                    <FeatureItem included>White labeling</FeatureItem>
                    <FeatureItem included>Custom integrations</FeatureItem>
                  </div>
                </Card3D>
              </motion.div>
            </div>

            {/* FAQ Section */}
            <div className="mt-24">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Text3D as="h2" className="text-3xl font-bold" intensity="medium">
                  Frequently Asked Questions
                </Text3D>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
              <Card3D className="p-8 md:p-12" intensity="high" glowColor="rgba(138, 43, 226, 0.3)">
                <Text3D as="h2" className="text-3xl font-bold mb-4" intensity="medium">
                  Ready to transform your app store presence?
                </Text3D>
                <p className="text-xl text-muted-foreground mb-8 max-w-[600px] mx-auto">
                  Join thousands of developers and designers who are creating stunning app store listings with AppVisor.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button3D variant="gradient" size="lg" asChild>
                    <Link href="/auth">Get Started Free</Link>
                  </Button3D>
                  <Button3D variant="outline" size="lg" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button3D>
                </div>
              </Card3D>
            </motion.div>
          </div>
        </Background3D>
      </main>
    </div>
  )
}

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

function FeatureTooltip({ content }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function FaqItem({ question, answer }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card3D className="p-6" intensity="low">
        <h3 className="text-lg font-semibold mb-2">{question}</h3>
        <p className="text-muted-foreground">{answer}</p>
      </Card3D>
    </motion.div>
  )
}
