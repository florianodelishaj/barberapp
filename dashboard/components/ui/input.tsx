import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary pointer-events-none shrink-0">
            {icon}
          </div>
          <InputPrimitive
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "h-13.5 w-full min-w-0 rounded-[1.75rem] border border-white/10 bg-card pl-14 pr-4 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
              className
            )}
            {...props}
          />
        </div>
      )
    }

    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-13.5 w-full min-w-0 rounded-[1.75rem] border border-white/10 bg-card px-4 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
