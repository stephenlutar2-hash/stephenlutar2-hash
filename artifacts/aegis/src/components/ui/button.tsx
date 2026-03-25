import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "link" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
}

const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-display uppercase tracking-widest"

const variantStyles: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
  glow: "bg-primary text-primary-foreground hover:bg-primary/90 box-glow border border-primary/50",
  outline: "border border-primary/50 bg-transparent text-primary hover:bg-primary/10",
  ghost: "hover:bg-secondary hover:text-primary transition-all",
  link: "text-primary underline-offset-4 hover:underline",
}

const sizeStyles: Record<string, string> = {
  default: "h-12 px-6 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-14 rounded-md px-8 text-base",
  icon: "h-10 w-10",
}

export function buttonVariants({ variant = "default", size = "default" }: { variant?: string; size?: string } = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size]);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
