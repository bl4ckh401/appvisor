"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Star } from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { Text3D } from "@/components/ui/text-3d"
import { Background3D } from "@/components/ui/background-3d"

export function HeroSection() {
  return (
    <Background3D className="w-full py-20 md:py-28 lg:py-36">
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
              className="flex items-center gap-2"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                <Sparkles className="mr-1 h-3 w-3" /> AI-Powered App Mockups
              </div>
              <div className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500 backdrop-blur-sm">
                <Star className="mr-1 h-3 w-3" /> New: Bulk Generation
              </div>
            </motion.div>

            <Text3D as="h1" className="text-4xl sm:text-5xl xl:text-6xl/none font-bold tracking-tight" intensity="high">
              Transform App Screenshots into{" "}
              <span className="text-gradient bg-gradient-to-r from-purple-600 to-indigo-600">Professional</span> Store
              Listings
            </Text3D>

            <motion.p
              className="max-w-[600px] text-muted-foreground md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              AppVisor helps developers and designers create stunning app store mockups in minutes, not hours. Use AI to
              generate professional marketing assets that convert.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button3D variant="gradient" size="lg" asChild>
                <Link href="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button3D>
              <Button3D variant="outline" size="lg" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button3D>
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
              <motion.div
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                animate={{
                  background: [
                    "linear-gradient(to right, rgba(233, 213, 255, 0.3), rgba(214, 236, 255, 0.3))",
                    "linear-gradient(to right, rgba(214, 236, 255, 0.3), rgba(233, 213, 255, 0.3))",
                    "linear-gradient(to right, rgba(233, 213, 255, 0.3), rgba(214, 236, 255, 0.3))",
                  ],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
              />

              <Card3D
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] p-4"
                intensity="high"
                glowColor="rgba(138, 43, 226, 0.3)"
                depth={3}
              >
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250422_213402_Google%20Play%20Store.jpg-PYCiYQRDL5MUCFqlPz1LEMdUDlRMvJ.jpeg"
                  alt="App mockup preview"
                  className="w-full h-full object-contain rounded"
                />
              </Card3D>

              <Card3D
                className="absolute -bottom-4 -right-4 w-[60%] h-[60%] p-3"
                intensity="medium"
                glowColor="rgba(63, 81, 181, 0.3)"
                depth={2}
              >
                <div className="w-full h-full bg-muted/50 rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Device frame</span>
                </div>
              </Card3D>

              <Card3D
                className="absolute -top-4 -left-4 w-[40%] h-[40%] p-3"
                intensity="medium"
                glowColor="rgba(138, 43, 226, 0.3)"
                depth={2}
              >
                <div className="w-full h-full bg-muted/50 rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Multiple devices</span>
                </div>
              </Card3D>
            </div>
          </motion.div>
        </div>
      </div>
    </Background3D>
  )
}
