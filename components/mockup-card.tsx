import { getSafeImageUrl, handleImageError } from "@/lib/image-utils"
import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface MockupCardProps {
  id: string
  name: string | null
  imageUrl: string | null
  className?: string
}

export function MockupCard({ id, name, imageUrl, className = "" }: MockupCardProps) {
  const safeImageUrl = getSafeImageUrl(imageUrl)

  return (
    <Link href={`/mockups/${id}`}>
      <div
        className={`group relative aspect-square rounded-lg overflow-hidden border border-border/40 glossy ${className}`}
      >
        {safeImageUrl !== "/placeholder.svg?height=300&width=300" ? (
          <div className="relative w-full h-full">
            <Image
              src={safeImageUrl || "/placeholder.svg"}
              alt={name || "App mockup"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={false}
              onError={(e) => handleImageError(e)}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-2 w-full">
            <p className="text-white text-sm truncate">{name || "Untitled Mockup"}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
