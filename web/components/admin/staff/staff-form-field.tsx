import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function StaffFormField({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </Label>
        {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}

export const staffInputClass =
  "h-11 border-0 border-b border-border/80 bg-transparent px-0 text-sm shadow-none rounded-none focus-visible:ring-0 focus-visible:border-neutral-950"
