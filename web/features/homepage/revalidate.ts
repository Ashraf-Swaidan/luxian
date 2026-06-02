export async function revalidatePublicHomepage() {
  const response = await fetch("/api/cache/revalidate", {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Public page may take a moment to refresh")
  }

  return response.json() as Promise<{ revalidated: true }>
}
