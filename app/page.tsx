"use client"

import Link from "next/link"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { MockupExamples } from "@/components/landing/mockup-examples"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { Text3D } from "@/components/ui/text-3d"
import { Background3D } from "@/components/ui/background-3d"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Smartphone,
  FlaskConical,
  CuboidIcon as Cube,
  Package,
  Plug2,
  Users,
  Code,
  Rocket,
  Building,
  Check,
} from "lucide-react"

export default function Home() {
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

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Mockup Examples Section */}
        <MockupExamples />

        {/* How It Works Section */}
        <Background3D
          className="w-full py-16 md:py-24 lg:py-32"
          color1="rgba(63, 81, 181, 0.05)"
          color2="rgba(138, 43, 226, 0.05)"
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  How It Works
                </motion.div>

                <Text3D as="h2" className="text-3xl md:text-4xl" intensity="medium">
                  Create App Store Mockups in 3 Simple Steps
                </Text3D>

                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered platform makes it easy to create professional app store mockups
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card3D className="p-6 h-full" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <Smartphone className="h-8 w-8 text-primary" />
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">1. Upload Screenshot</h3>
                    <p className="text-muted-foreground">
                      Upload your app screenshot or generate one with our AI tools
                    </p>
                  </div>
                </Card3D>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card3D className="p-6 h-full" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <motion.div
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <Cube className="h-8 w-8 text-primary" />
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">2. Customize Mockup</h3>
                    <p className="text-muted-foreground">
                      Add captions, choose colors, and customize the background style
                    </p>
                  </div>
                </Card3D>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card3D className="p-6 h-full" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <Package className="h-8 w-8 text-primary" />
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">3. Export & Share</h3>
                    <p className="text-muted-foreground">
                      Download your professional mockups in high resolution for app stores
                    </p>
                  </div>
                </Card3D>
              </motion.div>
            </div>
          </div>
        </Background3D>

        {/* Core Features Section */}
        <FeaturesSection />

        {/* Pro Features Section */}
        <Background3D
          className="w-full py-16 md:py-24 lg:py-32"
          color1="rgba(63, 81, 181, 0.05)"
          color2="rgba(138, 43, 226, 0.05)"
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Pro Features
                </motion.div>

                <Text3D as="h2" className="text-3xl md:text-4xl" intensity="medium">
                  Advanced Tools for Power Users
                </Text3D>

                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Take your app store listings to the next level with our premium features.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 mt-12"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <ProFeatureCard
                icon={<FlaskConical />}
                title="A/B Testing Mockups"
                description="Create two variants and simulate user preference based on AI-trained models."
              />
              <ProFeatureCard
                icon={<Cube />}
                title="3D Device Frames"
                description="Add extra polish with photorealistic 3D mockups."
              />
              <ProFeatureCard
                icon={<Package />}
                title="Bulk Generation"
                description="For apps with many screens, auto-generate entire sets of listing mockups."
              />
              <ProFeatureCard
                icon={<Plug2 />}
                title="Integration"
                description="Figma, Adobe XD, or Sketch plugin to import designs directly."
              />
            </motion.div>
          </div>
        </Background3D>

        {/* Target Audience Section */}
        <Background3D
          className="w-full py-16 md:py-24 lg:py-32"
          color1="rgba(138, 43, 226, 0.03)"
          color2="rgba(63, 81, 181, 0.03)"
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Who It's For
                </motion.div>

                <Text3D as="h2" className="text-3xl md:text-4xl" intensity="medium">
                  Perfect for App Creators of All Sizes
                </Text3D>

                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  AppVisor is designed to help anyone creating mobile apps showcase their work beautifully.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <AudienceCard
                icon={<Code />}
                title="Indie Developers"
                description="Create professional app store listings without design skills."
              />
              <AudienceCard
                icon={<Building />}
                title="App Design Agencies"
                description="Streamline your workflow and deliver more value to clients."
              />
              <AudienceCard
                icon={<Users />}
                title="UI/UX Designers"
                description="Showcase your designs in realistic device mockups."
              />
              <AudienceCard
                icon={<Rocket />}
                title="Startups"
                description="Launch your MVP with professional-looking app store presence."
              />
              <AudienceCard
                icon={<Smartphone />}
                title="Marketing Teams"
                description="Create compelling visuals for app marketing campaigns."
              />
            </motion.div>
          </div>
        </Background3D>

        {/* Pricing Section */}
        <Background3D
          className="w-full py-16 md:py-24 lg:py-32"
          color1="rgba(63, 81, 181, 0.05)"
          color2="rgba(138, 43, 226, 0.05)"
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Pricing
                </motion.div>

                <Text3D as="h2" className="text-3xl md:text-4xl" intensity="medium">
                  Simple, Transparent Pricing
                </Text3D>

                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works best for you and your team.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <PricingCard
                title="Free"
                price="$0"
                description="Perfect for trying out AppVisor"
                features={["5 mockups per month", "Basic templates", "Standard export formats", "Community support"]}
                buttonText="Get Started"
                buttonVariant="outline"
              />
              <PricingCard
                title="Pro"
                price="$19"
                period="/month"
                description="Everything you need for regular use"
                features={["Unlimited mockups", "All core features", "Priority support", "Brand style matching"]}
                buttonText="Start Free Trial"
                buttonVariant="gradient"
                highlighted={true}
              />
              <PricingCard
                title="Team"
                price="$49"
                period="/month"
                description="For design teams and agencies"
                features={[
                  "All Pro features",
                  "All advanced features",
                  "Team collaboration",
                  "API access",
                  "Dedicated support",
                ]}
                buttonText="Contact Sales"
                buttonVariant="outline"
              />
            </motion.div>
          </div>
        </Background3D>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <Text3D
                  as="h2"
                  className="text-3xl md:text-4xl text-white"
                  intensity="high"
                  shadowColor="rgba(0, 0, 0, 0.3)"
                >
                  Ready to Transform Your App Store Presence?
                </Text3D>

                <p className="max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of developers and designers who are creating stunning app store listings with AppVisor.
                </p>
              </div>

              <motion.div
                className="flex flex-col gap-2 min-[400px]:flex-row"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Button3D
                  className="bg-white text-purple-600 hover:bg-white/90 border-white/20 shadow-[0_4px_0px_0px] shadow-black/20"
                  asChild
                >
                  <Link href="/auth">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button3D>

                <Button3D
                  variant="outline"
                  className="text-white border-white/40 hover:bg-white/10 shadow-[0_4px_0px_0px] shadow-black/20"
                  asChild
                >
                  <Link href="/contact">Schedule a Demo</Link>
                </Button3D>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}

function ProFeatureCard({ icon, title, description }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
    >
      <Card3D className="p-6" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">{icon}</div>
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card3D>
    </motion.div>
  )
}

function AudienceCard({ icon, title, description }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
    >
      <Card3D className="p-6 h-full" intensity="medium" glowColor="rgba(138, 43, 226, 0.2)">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </Card3D>
    </motion.div>
  )
}

function PricingCard({
  title,
  price,
  period = "",
  description,
  features,
  buttonText,
  buttonVariant,
  highlighted = false,
}) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
    >
      <Card3D
        className={`p-6 h-full ${highlighted ? "border-primary" : ""}`}
        intensity={highlighted ? "high" : "medium"}
        glowColor={highlighted ? "rgba(138, 43, 226, 0.3)" : "rgba(138, 43, 226, 0.2)"}
        depth={highlighted ? 3 : 2}
      >
        {highlighted && (
          <div className="absolute -top-4 right-4 z-10">
            <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Popular</div>
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
          <Button3D className="w-full" variant={buttonVariant} asChild>
            <Link href="/auth">{buttonText}</Link>
          </Button3D>
        </div>
      </Card3D>
    </motion.div>
  )
}
