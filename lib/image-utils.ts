import type React from "react"
/**
 * Utility functions for handling images
 */

/**
 * Gets a safe image URL that can be used in the application
 * Handles blob URLs and provides fallbacks
 */
export function getSafeImageUrl(url?: string | null): string {
  if (!url) {
    return "/placeholder.svg?height=300&width=300"
  }

  // Check if it's a blob URL (which might cause issues)
  if (url.startsWith("blob:")) {
    console.warn("Blob URL detected, using placeholder instead:", url)
    return "/placeholder.svg?height=300&width=300"
  }

  return url
}

/**
 * Handles image loading errors by setting a fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const target = event.target as HTMLImageElement
  console.warn("Image failed to load:", target.src)
  target.src = "/placeholder.svg?height=300&width=300"
  target.onerror = null // Prevent infinite error loop
}

/**
 * Checks if a URL is a valid image URL
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false

  // Check for blob URLs
  if (url.startsWith("blob:")) return false

  // Check for common image extensions
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
  return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}
