"use client"

import Image from "next/image"
import { useState } from "react"

interface MockupImageProps {
  src: string
  alt: string
}

export function MockupImage({ src, alt }: MockupImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
    setImgSrc("/placeholder.svg?height=300&width=300")
  }

  if (error || !src || src === "/placeholder.svg?height=300&width=300") {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No image available</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        fill
        className="object-contain"
        priority
        onError={handleError}
      />
    </div>
  )
}
