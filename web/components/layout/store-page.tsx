import { StoreShell } from "@/components/layout/store-shell"
import { cn } from "@/lib/utils"

type StorePageProps = {
  children: React.ReactNode
  title?: string
  description?: string
  narrow?: boolean
  className?: string
}

export function StorePage({
  children,
  title,
  description,
  narrow,
  className,
}: StorePageProps) {
  return (
    <main className={cn("py-8 sm:py-12", className)}>
      <StoreShell narrow={narrow}>
        {(title || description) && (
          <header className="mb-8 space-y-1">
            {title && <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{title}</h1>}
            {description && (
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
            )}
          </header>
        )}
        {children}
      </StoreShell>
    </main>
  )
}
