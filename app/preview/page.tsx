"use client"

import { useRouter } from "next/navigation"
import { PreviewMode } from "@/components/preview-mode"

export default function PreviewPage() {
  const router = useRouter()
  const handleExitPreview = () => {
    router.push("/")
  }

  // If not authenticated, don't render anything (will redirect)
  
  return <PreviewMode onExitPreview={handleExitPreview} />
}
