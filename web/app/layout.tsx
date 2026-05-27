import { Geist, Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { Providers } from "@/app/providers"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable)}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <Providers>
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
