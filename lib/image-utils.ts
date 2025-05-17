import type React from "react"
/**
 * Utility function to get a safe image URL with fallback
 * @param url The original image URL
 * @param fallbackUrl The fallback URL to use if the original fails
 * @returns A safe image URL
 */
export function getSafeImageUrl(
  url: string | null | undefined,
  fallbackUrl = "/placeholder.svg?height=300&width=300",
): string {
  if (!url) return fallbackUrl

  // Check if the URL is a blob URL (which might be problematic)
  if (url.startsWith("blob:")) {
    console.warn("Blob URL detected, using fallback instead:", url)
    return fallbackUrl
  }

  return url
}

/**
 * Handle image loading errors by replacing with a fallback
 * @param event The error event
 * @param fallbackUrl The fallback URL to use
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl = "/placeholder.svg?height=300&width=300",
): void {
  const target = event.currentTarget
  if (target.src !== fallbackUrl) {
    console.warn("Image failed to load, using fallback:", target.src)
    target.src = fallbackUrl
  }
}
