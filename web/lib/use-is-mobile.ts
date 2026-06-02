"use client"

import { useEffect, useState } from "react"

const DEFAULT_BREAKPOINT = 640

/** SSR-safe mobile breakpoint hook (false until mounted). */
export function useIsMobile(breakpoint = DEFAULT_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = `(max-width: ${breakpoint - 1}px)`
    const media = window.matchMedia(query)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [breakpoint])

  return isMobile
}
