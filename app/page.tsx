"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [showPricing, setShowPricing] = useState(false);

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Pricing toggle animation
  const pricingToggle = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: {
          duration: 0.4
        },
        opacity: {
          duration: 0.3,
          delay: 0.1
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full pt-20 pb-16 md:py-28 lg:py-36 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              className="flex flex-col justify-center space-y-5"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-2 flex-wrap"
              >
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                  <Sparkles className="mr-1 h-3 w-3" /> AI-Powered App Mockups
                </div>
                <div className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500 backdrop-blur-sm">
                  <Star className="mr-1 h-3 w-3" /> Try Free For 14 Days
                </div>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl/none font-bold tracking-tight">
                Transform App Screenshots into{" "}
                <span className="text-gradient bg-gradient-to-r from-purple-600 to-indigo-600">Professional</span> Store
                Listings
              </h1>

              <motion.p
                className="max-w-[600px] text-muted-foreground md:text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                AppVisor helps developers and designers create stunning app store mockups in minutes, not hours. 
                Use AI to generate professional marketing assets that convert.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md font-medium flex items-center justify-center hover:opacity-90 transition-all"
                  onClick={() => setShowPricing(!showPricing)}
                >
                  View Pricing Plans
                  {showPricing ? null : <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
                <Link 
                  href="/auth"
                  className="px-6 py-3 bg-background border border-border rounded-md font-medium flex items-center justify-center hover:bg-muted/30 transition-all"
                >
                  Get Started Free
                </Link>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 text-sm text-muted-foreground pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=32&width=32&text=${i}`}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <span className="font-medium text-foreground">500+</span> developers trust AppVisor
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mx-auto lg:mx-0 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative h-[400px] w-full sm:h-[450px] lg:h-[550px]">
                <div className="absolute top-0 left-0 w-full h-full rounded-lg" />
                <div className="absolute w-[80%] h-[80%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-xl rounded-xl overflow-hidden">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250422_213402_Google%20Play%20Store.jpg-PYCiYQRDL5MUCFqlPz1LEMdUDlRMvJ.jpeg"
                    alt="App mockup preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Pricing Section - Animated */}
      <motion.section
        className="w-full bg-muted/30 py-8"
        variants={pricingToggle}
        initial="hidden"
        animate={showPricing ? "visible" : "hidden"}
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground mt-2">Choose the plan that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Free</h3>
                <div className="mt-2 space-y-2 h-32">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>5 mockups per month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Basic templates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Standard export formats</span>
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold">$0</div>
                <div className="mt-4">
                  <Link 
                    href="/auth"
                    className="w-full py-2 bg-background border border-border rounded-md font-medium flex items-center justify-center hover:bg-muted/30 transition-all"
                  >
                    Start Free
                  </Link>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-background border-2 border-primary rounded-lg overflow-hidden shadow-md relative">
              <div className="absolute top-0 right-0 bg-primary text-xs text-primary-foreground px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">Pro</h3>
                <div className="mt-2 space-y-2 h-32">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Unlimited mockups</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>All templates & export formats</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Bulk generation (up to 10)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Priority support</span>
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="mt-4">
                  <Link 
                    href="/subscribe?plan=pro"
                    className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium flex items-center justify-center hover:bg-primary/90 transition-all"
                  >
                    Start 14-Day Trial
                  </Link>
                </div>
              </div>
            </div>

            {/* Team Plan */}
            <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Team</h3>
                <div className="mt-2 space-y-2 h-32">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Team collaboration (5 members)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>Bulk generation (up to 50)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1" />
                    <span>API access & white labeling</span>
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="mt-4">
                  <Link 
                    href="/subscribe?plan=team"
                    className="w-full py-2 bg-background border border-border rounded-md font-medium flex items-center justify-center hover:bg-muted/30 transition-all"
                  >
                    Start 14-Day Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/pricing"
              className="text-primary hover:underline flex items-center justify-center"
            >
              View full pricing details
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Example Showcase Section */}
      <section className="w-full py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Create Professional App Store Mockups</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your screenshots and transform them into stunning app store listings in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 p-6 rounded-xl">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250422_213402_Google%20Play%20Store.jpg-PYCiYQRDL5MUCFqlPz1LEMdUDlRMvJ.jpeg"
                  alt="App mockup example"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">How It Works</h3>
                <p className="text-muted-foreground">
                  Creating professional app store mockups has never been easier
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Upload Screenshot</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload your app screenshot or generate one with our AI tools
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Customize Mockup</h4>
                    <p className="text-sm text-muted-foreground">
                      Add captions, choose colors, and customize the background style
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 text-primary">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Export & Share</h4>
                    <p className="text-sm text-muted-foreground">
                      Download your professional mockups in high resolution for app stores
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link 
                  href="/auth"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium inline-flex items-center hover:bg-primary/90 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your App Store Presence?</h2>
            <p className="text-lg mb-8">
              Join thousands of developers and designers who are creating stunning app store listings with AppVisor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/subscribe?plan=pro"
                className="px-6 py-3 bg-white text-purple-600 rounded-md font-medium flex items-center justify-center hover:bg-white/90 transition-all"
              >
                Start Pro Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/auth"
                className="px-6 py-3 bg-transparent border border-white text-white rounded-md font-medium flex items-center justify-center hover:bg-white/10 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
