"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { GlassCard } from "@/components/ui/glass-card"
import { Loader2 } from "lucide-react"

interface DeviceFrame3DProps {
  deviceType: "iphone" | "android" | "tablet"
  screenshotUrl: string
  width?: number
  height?: number
}

export function DeviceFrame3D({ deviceType, screenshotUrl, width = 300, height = 500 }: DeviceFrame3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Set up scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)

    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 5

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)

    // Use the new color space API instead of the deprecated encoding
    renderer.outputColorSpace = THREE.SRGBColorSpace

    containerRef.current.appendChild(renderer.domElement)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Load device model based on deviceType
    const modelPath = `/models/${deviceType}.glb`
    const loader = new GLTFLoader()

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene
        scene.add(model)

        // Load screenshot texture
        const textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = "anonymous"

        textureLoader.load(
          screenshotUrl,
          (texture) => {
            // Update texture color space to match renderer
            texture.colorSpace = THREE.SRGBColorSpace

            // Find the screen mesh in the model and apply texture
            model.traverse((child) => {
              if (child instanceof THREE.Mesh && child.name.includes("screen")) {
                const material = new THREE.MeshBasicMaterial({ map: texture })
                child.material = material
              }
            })

            setLoading(false)
          },
          undefined,
          (err) => {
            console.error("Error loading texture:", err)
            setError("Failed to load screenshot")
            setLoading(false)
          },
        )

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 3 / maxDim
        model.scale.multiplyScalar(scale)
      },
      undefined,
      (err) => {
        console.error("Error loading model:", err)
        setError("Failed to load 3D model")
        setLoading(false)
      },
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [deviceType, screenshotUrl, width, height])

  return (
    <GlassCard className="overflow-hidden" animate={false}>
      <div ref={containerRef} style={{ width, height, position: "relative" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <p className="text-destructive">{error}</p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
