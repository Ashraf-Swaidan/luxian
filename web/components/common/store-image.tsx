import Image, { type ImageProps } from "next/image"

import { shouldBypassImageOptimizer } from "@/lib/is-cdn-image"

type StoreImageProps = ImageProps & {
  src: string
}

export function StoreImage({ src, unoptimized, ...props }: StoreImageProps) {
  const bypass = shouldBypassImageOptimizer(src)

  return <Image {...props} src={src} unoptimized={unoptimized ?? bypass} />
}
