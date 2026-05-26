import { ApiPing } from "@/components/api-ping"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="max-w-xl space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Luxian</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Storefront foundation is wired. Phase A proves the browser can reach
          your Nest API on port 3000 while Next runs on 3001.
        </p>
      </div>

      <ApiPing />
    </main>
  )
}
