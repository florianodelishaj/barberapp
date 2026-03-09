import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap border border-transparent transition-colors",
  {
    variants: {
      variant: {
        // Semantic appointment/user status variants
        pending:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
        confirmed:   "bg-success/10 text-success",
        completed:   "bg-muted-foreground/10 text-muted-foreground",
        cancelled:   "bg-primary/10 text-primary border-primary/20",
        rejected:    "bg-primary/10 text-primary border-primary/20",
        approved:    "bg-success/10 text-success",
        // Generic variants
        default:     "bg-primary text-primary-foreground",
        secondary:   "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        outline:     "border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const PULSING_VARIANTS = new Set(["pending", "confirmed", "approved"])
const SEMANTIC_VARIANTS = new Set(["pending", "confirmed", "completed", "cancelled", "rejected", "approved"])

function Badge({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  const isSemantic = SEMANTIC_VARIANTS.has(variant as string)
  const isPulsing = PULSING_VARIANTS.has(variant as string)

  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {isSemantic && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full bg-current shrink-0",
            isPulsing && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
