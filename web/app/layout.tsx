import { Geist_Mono, Outfit } from "next/font/google"
import localFont from "next/font/local"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"

import { uploadRouter } from "@/app/api/uploadthing/core"
import "./globals.css"
import { Providers } from "@/app/providers"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { cn } from "@/lib/utils"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

const clashDisplay = localFont({
  src: [
    {
      path: "../public/fonts/ClashDisplay-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/ClashDisplay-Variable.ttf",
      weight: "200 700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
})

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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        outfit.variable,
        clashDisplay.variable,
      )}
    >
      <body className="flex min-h-svh flex-col">
        <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
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
