"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card3D } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Text3D } from "@/components/ui/text-3d"
import { Background3D } from "@/components/ui/background-3d"

export function MockupExamples() {
  const [activeIndex, setActiveIndex] = useState(0)

  const examples = [
    {
      title: "Quit Any Addiction",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250422_213402_Google%20Play%20Store.jpg-PYCiYQRDL5MUCFqlPz1LEMdUDlRMvJ.jpeg",
      description: "Track your sobriety journey with beautiful visualizations and progress tracking.",
    },
    {
      title: "Fitness Tracker Pro",
      image: "/placeholder.svg?height=600&width=300",
      description: "Monitor your workouts, nutrition, and progress all in one place.",
    },
    {
      title: "Meditation App",
      image: "/placeholder.svg?height=600&width=300",
      description: "Find peace with guided meditations and sleep stories.",
    },
  ]

  return (
    <Background3D className="py-16" color1="rgba(138, 43, 226, 0.03)" color2="rgba(63, 81, 181, 0.03)">
      <div className="container">
        <div className="text-center mb-12">
          <Text3D as="h2" className="text-3xl font-bold mb-4" intensity="medium">
            Create Professional App Store Mockups
          </Text3D>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your screenshots and transform them into stunning app store listings in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-8">
              {examples.map((example, index) => (
                <motion.div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card3D
                    className={`p-6 transition-all cursor-pointer ${activeIndex === index ? "border-primary" : ""}`}
                    intensity={activeIndex === index ? "high" : "low"}
                    glowColor={activeIndex === index ? "rgba(138, 43, 226, 0.3)" : "rgba(138, 43, 226, 0.1)"}
                    depth={activeIndex === index ? 2 : 1}
                    hoverEffect={activeIndex !== index}
                  >
                    <h3 className="text-xl font-bold mb-2">{example.title}</h3>
                    <p className="text-muted-foreground">{example.description}</p>
                  </Card3D>
                </motion.div>
              ))}

              <Button3D variant="gradient" asChild className="mt-6">
                <Link href="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button3D>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />

              <Card3D
                className="relative z-10 p-0 overflow-hidden"
                intensity="high"
                glowColor="rgba(138, 43, 226, 0.3)"
                depth={3}
              >
                <img
                  src={examples[activeIndex].image || "/placeholder.svg"}
                  alt={examples[activeIndex].title}
                  className="max-h-[600px] rounded-lg shadow-xl"
                />
              </Card3D>
            </motion.div>
          </div>
        </div>
      </div>
    </Background3D>
  )
}
