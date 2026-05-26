import { Geist, Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { Providers } from "@/app/providers"
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
      <body>
        <ThemeProvider>
          <Providers>
            <SiteHeader />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
