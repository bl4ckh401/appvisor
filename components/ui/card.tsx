import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

// Modern Card component with enhanced styling
interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "gradient" | "solid"
  interactive?: boolean
  glow?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = "glass", interactive = false, glow = false, children, ...props }, ref) => {
    const baseStyles = "rounded-2xl border backdrop-blur-xl transition-all duration-300"

    const variantStyles = {
      glass: "bg-background/60 border-white/10 shadow-xl",
      gradient: "bg-gradient-to-br from-primary to-accent border-transparent text-white shadow-2xl",
      solid: "bg-background border-border shadow-lg",
    }

    const interactiveStyles = interactive ? "cursor-pointer hover:scale-[1.02] hover:shadow-2xl transform-gpu" : ""
    const glowStyles = glow ? "shadow-[0_0_50px_rgba(139,92,246,0.3)]" : ""

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], interactiveStyles, glowStyles, className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ModernCard.displayName = "ModernCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, ModernCard }
