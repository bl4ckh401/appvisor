"use client"

import { SubscribePageHandler } from "@/components/payments/subscribe-page-handler"
import { Card3D } from "@/components/ui/card-3d"
import { motion } from "framer-motion"
import { QuoteIcon, MessageSquare } from "lucide-react"

export default function SubscribePage() {
  return (
    <div className="container max-w-4xl py-16 px-4">
      <motion.div 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SubscribePageHandler />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <TestimonialCard 
            quote="AppVisor's mockups have helped us increase our app store conversion rate by 30%. Totally worth the subscription!"
            author="Pavin K."
            role="Mobile App Designer"
          />
          
          <FaqCard
            question="How does the 14-day trial work?"
            answer="You'll have full access to all features for 14 days, after which your card will only be charged if you don't cancel. You can cancel anytime from your account settings."
          />
        </div>
        
        <div className="mt-6">
          <Card3D className="p-6" intensity="low">
            <div className="text-center">
              <h3 className="font-medium mb-2">100% Satisfaction Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                If you're not completely satisfied within 30 days, contact us for a full refund, no questions asked.
              </p>
            </div>
          </Card3D>
        </div>
      </motion.div>
    </div>
  )
}

// Testimonial card component
function TestimonialCard({ quote, author, role }) {
  return (
    <Card3D className="p-6" intensity="low">
      <div className="flex flex-col h-full">
        <QuoteIcon className="h-6 w-6 text-primary mb-2" />
        <p className="text-sm italic flex-grow">{quote}</p>
        <div className="mt-4">
          <p className="font-medium">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </Card3D>
  )
}

// FAQ card component
function FaqCard({ question, answer }) {
  return (
    <Card3D className="p-6" intensity="low">
      <div className="flex flex-col h-full">
        <div className="flex items-start">
          <MessageSquare className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
          <h3 className="font-medium">{question}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-3 flex-grow">{answer}</p>
      </div>
    </Card3D>
  )
}
