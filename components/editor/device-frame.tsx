import { getSafeImageUrl, handleImageError } from "@/lib/image-utils"
import Image from "next/image"

interface DeviceFrameProps {
  imageUrl: string | null
  deviceType: "phone" | "tablet" | "desktop"
  className?: string
}

export function DeviceFrame({ imageUrl, deviceType, className = "" }: DeviceFrameProps) {
  const safeImageUrl = getSafeImageUrl(imageUrl)

  return (
    <div className={`relative ${className}`}>
      <div className={`device-frame device-${deviceType}`}>
        <div className="device-screen">
          {safeImageUrl !== "/placeholder.svg?height=300&width=300" ? (
            <Image
              src={safeImageUrl || "/placeholder.svg"}
              alt="App mockup"
              fill
              className="object-cover"
              onError={(e) => handleImageError(e)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-400 text-sm">No image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
