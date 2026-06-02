/** @type {import('next').NextConfig} */
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST?.trim()

/**
 * UploadThing hosts (utfs.io / *.ufs.sh) use `StoreImage` with unoptimized=true
 * because the Next image optimizer often times out fetching those URLs server-side.
 */
const remotePatterns = [
  {
    protocol: "https",
    hostname: "utfs.io",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.ufs.sh",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
]

if (imageHost) {
  remotePatterns.push({
    protocol: "https",
    hostname: imageHost,
    pathname: "/**",
  })
}

/** Nest API origin for rewrites, e.g. https://luxian.onrender.com (no /api/v1 suffix). */
function getApiUpstream() {
  const raw = process.env.API_UPSTREAM?.trim()
  if (!raw) {
    return null
  }
  return raw.replace(/\/$/, "")
}

const nextConfig = {
  images: {
    remotePatterns,
  },
  async rewrites() {
    const upstream = getApiUpstream()
    if (!upstream) {
      return []
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${upstream}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
