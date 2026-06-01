import { getAccessToken } from "@/lib/auth-storage"

export async function revalidatePublicHomepage() {
  const token = getAccessToken()
  const response = await fetch("/api/cache/revalidate", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    throw new Error("Public page may take a moment to refresh")
  }

  return response.json() as Promise<{ revalidated: true }>
}
