import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const loadingSpinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface LoadingSpinnerProps
  extends VariantProps<typeof loadingSpinnerVariants> {
  className?: string
  "aria-label"?: string
}

export default function LoadingSpinner({
  size,
  className,
  "aria-label": ariaLabel = "로딩 중",
  ...props
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(loadingSpinnerVariants({ size }), className)}
      aria-label={ariaLabel}
      role="status"
      {...props}
    />
  )
}

