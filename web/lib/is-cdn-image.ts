/** UploadThing and similar CDNs — load in the browser, not via `/_next/image` (avoids server fetch timeouts). */
export function shouldBypassImageOptimizer(src: string): boolean {
  try {
    const { hostname } = new URL(src)
    return (
      hostname === "utfs.io" ||
      hostname.endsWith(".utfs.io") ||
      hostname.endsWith(".ufs.sh")
    )
  } catch {
    return false
  }
}
