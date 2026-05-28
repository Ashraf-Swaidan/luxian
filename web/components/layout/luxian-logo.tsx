import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type LuxianLogoProps = {
  href?: string
  size?: "sm" | "md" | "lg" | "hero"
  className?: string
  showWordmark?: boolean
}

const sizes = {
  sm: { mark: 28, word: "text-sm" },
  md: { mark: 36, word: "text-base" },
  lg: { mark: 44, word: "text-lg" },
  hero: { mark: 88, word: "text-2xl" },
}

export function LuxianLogo({
  href = "/",
  size = "md",
  className,
  showWordmark = false,
}: LuxianLogoProps) {
  const { mark, word } = sizes[size]

  const content = (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <Image
        src="/luxian-logo.png"
        alt="Luxian"
        width={mark}
        height={mark}
        className="shrink-0"
        priority={size === "hero"}
      />
      {showWordmark && (
        <span className={cn("font-medium tracking-wide", word)}>Luxian</span>
      )}
    </span>
  )

  if (!href) {
    return content
  }

  return (
    <Link href={href} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  )
}
