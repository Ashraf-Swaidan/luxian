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

const nextConfig = {
  images: {
    remotePatterns,
  },
}

export default nextConfig
