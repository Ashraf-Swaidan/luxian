import { cn } from "@/lib/utils"

type StoreShellProps = {
  children: React.ReactNode
  className?: string
  narrow?: boolean
}

export function StoreShell({ children, className, narrow }: StoreShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        narrow ? "max-w-3xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  )
}
