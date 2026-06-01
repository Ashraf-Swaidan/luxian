export function extractUploadThingKey(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const isUploadThing =
      host === 'utfs.io' ||
      host.endsWith('.utfs.io') ||
      host.endsWith('.ufs.sh');

    if (!isUploadThing) {
      return null;
    }

    const match = parsed.pathname.match(/\/f\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
