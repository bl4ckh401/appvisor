import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input
          type={type}
          className={cn(
            "input-modern w-full",
            icon && "pl-10",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    )
  },
)
ModernInput.displayName = "ModernInput"

export { ModernInput }
