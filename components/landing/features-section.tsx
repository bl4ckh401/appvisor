"use client"

import { motion } from "framer-motion"
import { Card3D } from "@/components/ui/card-3d"
import { Text3D } from "@/components/ui/text-3d"
import { Background3D } from "@/components/ui/background-3d"
import { Sparkles, Palette, MousePointerClick, MessageSquare, Globe, CuboidIcon as Cube, FileImage } from "lucide-react"

export function FeaturesSection() {
  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
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
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
          }}
        >
          <div className="space-y-2">
            <motion.div
              className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Core Features
            </motion.div>

            <Text3D as="h2" className="text-3xl md:text-4xl" intensity="medium">
              Everything You Need to Create Perfect App Store Listings
            </Text3D>

            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              AppVisor provides all the tools you need to create professional app store mockups quickly and easily.
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
          <FeatureCard
            icon={<Sparkles />}
            title="AI Mockup Generator"
            description="Upload app screenshots and generate professional store listings with AI."
          />
          <FeatureCard
            icon={<Palette />}
            title="Custom Styling"
            description="Choose colors, backgrounds, and styles to match your brand identity."
          />
          <FeatureCard
            icon={<MousePointerClick />}
            title="Easy to Use"
            description="No design skills needed - our intuitive interface makes it simple."
          />
          <FeatureCard
            icon={<MessageSquare />}
            title="AI Caption Generator"
            description="Generate compelling captions and feature descriptions with AI."
          />
          <FeatureCard
            icon={<Globe />}
            title="Localization Support"
            description="Automatically translate and generate mockups in multiple languages."
          />
          <FeatureCard
            icon={<Cube />}
            title="3D Device Frames"
            description="Add extra polish with photorealistic 3D device mockups."
          />
          <FeatureCard
            icon={<FileImage />}
            title="Export Formats"
            description="PNG, JPG, and exact App Store/Play Store resolution sizes for easy upload."
            className="lg:col-start-2"
          />
        </motion.div>
      </div>
    </Background3D>
  )
}

function FeatureCard({ icon, title, description, className = "" }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
      className={className}
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
