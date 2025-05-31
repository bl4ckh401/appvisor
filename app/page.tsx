"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Star, Zap, Palette, Upload, Edit3, Brain, Wand2 } from "lucide-react"
import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"

export default function LandingPage() {
  const [showPricing, setShowPricing] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const coreFeatures = [
    {
      icon: <Upload className="h-5 w-5" />,
      title: "Smart Upload System",
      description:
        "Drag & drop screenshots or upload from device. Supports PNG, JPG, and batch uploads up to 50 files.",
      details: "Our intelligent upload system automatically detects device types and optimizes images for processing.",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI analyzes your screenshots and suggests optimal layouts, colors, and positioning.",
      details: "Machine learning algorithms trained on thousands of successful app store listings.",
    },
    {
      icon: <Wand2 className="h-5 w-5" />,
      title: "One-Click Generation",
      description: "Generate professional mockups instantly with customizable templates and smart automation.",
      details: "Choose from 50+ templates or let AI create custom layouts based on your app category.",
    },
    {
      icon: <Edit3 className="h-5 w-5" />,
      title: "Advanced Customization",
      description: "Fine-tune colors, backgrounds, text, and device frames to match your brand perfectly.",
      details: "Full control over every design element with real-time preview and undo/redo functionality.",
    },
  ]

  const integrations = [
    {
      name: "App Store Connect",
      logo: "/placeholder.svg?height=40&width=40",
      description: "Direct publishing to App Store",
    },
    {
      name: "Google Play Console",
      logo: "/placeholder.svg?height=40&width=40",
      description: "Seamless Play Store integration",
    },
    { name: "Figma", logo: "/placeholder.svg?height=40&width=40", description: "Import designs directly" },
    { name: "Sketch", logo: "/placeholder.svg?height=40&width=40", description: "Native Sketch support" },
    { name: "Adobe XD", logo: "/placeholder.svg?height=40&width=40", description: "XD file compatibility" },
    { name: "Canva", logo: "/placeholder.svg?height=40&width=40", description: "Enhanced with Canva assets" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 md:px-6 md:py-16 lg:py-20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="container relative z-10 max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              className="flex flex-col justify-center space-y-6"
              initial="initial"
              animate="animate"
              variants={staggerChildren}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-xl">
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  AI-Powered Mockups
                </div>
                <div className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 backdrop-blur-xl">
                  <Star className="mr-1.5 h-3 w-3" />
                  Free 14-Day Trial
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                  Transform App Screenshots into{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Professional
                  </span>{" "}
                  Store Listings
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  AppVisor is the ultimate AI-powered platform for creating stunning app store mockups. Generate
                  professional marketing assets in minutes, not hours, with our intelligent design system that
                  understands what converts.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
                <ModernButton variant="gradient" size="default" icon={<Sparkles className="h-4 w-4" />} asChild>
                  <Link href="/auth">Start Free Trial</Link>
                </ModernButton>

                <ModernButton variant="secondary" size="default" onClick={() => setShowPricing(!showPricing)}>
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ModernButton>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent overflow-hidden"
                    >
                      <img
                        src={`/placeholder.svg?height=32&width=32&text=${i}`}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-foreground">2,500+</span>
                  <span className="text-muted-foreground ml-1">developers trust AppVisor</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative max-w-md mx-auto">
                {/* Main mockup display */}
                <ModernCard variant="glass" className="p-6">
                  <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-xl">
                    <img
                      src="https://xihisyxduimzjfaxiupk.supabase.co/storage/v1/object/public/assets/dd83a76f-80ff-4072-bbb5-d82095aa18c6/edited-images/Design-an-absolutely-4f414abc.png"
                      alt="App mockup preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </ModernCard>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg flex items-center justify-center"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Zap className="h-6 w-6 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -right-4 w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl shadow-lg flex items-center justify-center"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <Palette className="h-5 w-5 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Functionalities Section */}
      <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 md:px-6">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Core Functionalities
              </span>{" "}
              That Drive Results
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the powerful features that make AppVisor the go-to platform for app store optimization
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              {coreFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ModernCard
                    variant={activeFeature === index ? "gradient" : "glass"}
                    className={`p-4 cursor-pointer transition-all duration-300 ${
                      activeFeature === index ? "scale-105" : ""
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activeFeature === index
                            ? "bg-white/20 text-white"
                            : "bg-gradient-to-r from-primary to-accent text-white"
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-semibold mb-1 ${
                            activeFeature === index ? "text-white" : "text-foreground"
                          }`}
                        >
                          {feature.title}
                        </h3>
                        <p className={`text-sm ${activeFeature === index ? "text-white/90" : "text-muted-foreground"}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ModernCard variant="glass" className="p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white">
                    {coreFeatures[activeFeature].icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{coreFeatures[activeFeature].title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{coreFeatures[activeFeature].details}</p>
                  </div>
                  <ModernButton variant="gradient" asChild>
                    <Link href="/auth">Try This Feature</Link>
                  </ModernButton>
                </div>
              </ModernCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showcase Gallery Section */}
      <section className="py-16 md:py-20 lg:py-24 px-4 md:px-6">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-xl mb-4">
              <Sparkles className="mr-1.5 h-3 w-3" />
              Showcase Gallery
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              See What's Possible with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AppVisor</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              From fitness apps to productivity tools, our AI creates stunning mockups for every category
            </p>
          </motion.div>

          {/* Bento Grid Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
            {/* Large Featured Item */}
            <motion.div
              className="col-span-2 md:col-span-2 lg:col-span-3 row-span-2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ModernCard variant="glass" className="h-full overflow-hidden group cursor-pointer">
                <div className="relative h-full">
                  <img
                    src="https://xihisyxduimzjfaxiupk.supabase.co/storage/v1/object/public/assets/dd83a76f-80ff-4072-bbb5-d82095aa18c6/edited-images/Design-an-absolutely-4f414abc.png"
                    alt="Featured mockup"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-lg font-bold mb-1">Fitness Tracker Pro</h3>
                      <p className="text-white/80 text-sm">Health & Fitness</p>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* Medium Items */}
            <motion.div
              className="col-span-1 md:col-span-1 lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ModernCard variant="glass" className="h-full overflow-hidden group cursor-pointer">
                <div className="relative h-full">
                  <img
                    src="/placeholder.svg?height=300&width=200&text=Meditation"
                    alt="Meditation app mockup"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white font-medium text-sm">Mindful Moments</span>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            <motion.div
              className="col-span-1 md:col-span-1 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ModernCard variant="glass" className="h-full overflow-hidden group cursor-pointer">
                <div className="relative h-full">
                  <img
                    src="/placeholder.svg?height=200&width=150&text=Todo"
                    alt="Todo app mockup"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white font-medium text-sm">TaskMaster</span>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* Small Items Grid */}
            {[
              { name: "Food Delivery", color: "from-orange-500/80" },
              { name: "Travel Planner", color: "from-blue-500/80" },
              { name: "Finance Tracker", color: "from-green-500/80" },
              { name: "Music Player", color: "from-purple-500/80" },
              { name: "Weather App", color: "from-cyan-500/80" },
              { name: "Social Network", color: "from-pink-500/80" },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                className="col-span-1"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
              >
                <ModernCard variant="glass" className="aspect-square overflow-hidden group cursor-pointer">
                  <div className="relative h-full">
                    <img
                      src={`/placeholder.svg?height=150&width=150&text=${item.name.split(" ")[0]}`}
                      alt={`${item.name} mockup`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${item.color} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2`}
                    >
                      <span className="text-white text-xs font-medium">{item.name}</span>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>

          {/* Infinite Scroll Carousel */}
          <motion.div
            className="relative mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold text-center mb-6">Trending Designs This Week</h3>
            <div className="relative overflow-hidden">
              <div className="flex gap-3 animate-scroll">
                {/* Duplicate for infinite scroll effect */}
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-3">
                    {[
                      "Gaming Console",
                      "E-Learning",
                      "Dating App",
                      "Crypto Wallet",
                      "Video Editor",
                      "News Reader",
                      "Recipe Book",
                      "Workout Timer",
                    ].map((name, index) => (
                      <div key={`${setIndex}-${index}`} className="flex-shrink-0 w-48">
                        <ModernCard variant="glass" className="overflow-hidden">
                          <img
                            src={`/placeholder.svg?height=300&width=200&text=${name}`}
                            alt={`${name} mockup`}
                            className="w-full h-60 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-sm">{name}</h4>
                            <p className="text-xs text-muted-foreground">Premium Template</p>
                          </div>
                        </ModernCard>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Interactive Category Buttons */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-6">Browse by Category</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["All", "Health", "Productivity", "Social", "Entertainment", "Education", "Finance"].map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    category === "All"
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <ModernButton variant="gradient" size="default" asChild>
              <Link href="/templates">Explore All Templates</Link>
            </ModernButton>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 md:px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />

        <div className="container relative z-10 max-w-4xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                App Store Presence?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
              Join thousands of developers and designers who are creating stunning app store listings with AppVisor.
              Start your free trial today and see the difference professional mockups can make.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ModernButton variant="gradient" size="default" icon={<Sparkles className="h-4 w-4" />} asChild>
                <Link href="/subscribe?plan=pro">Start Pro Trial</Link>
              </ModernButton>
              <ModernButton variant="secondary" size="default" asChild>
                <Link href="/auth">Get Started Free</Link>
              </ModernButton>
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
