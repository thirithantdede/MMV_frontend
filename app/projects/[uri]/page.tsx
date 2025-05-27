'use client'

import { use } from 'react'
import { PreviewMode } from '@/components/preview-mode'
import { useCallback, useState } from 'react'
import { UserLoadingScreen } from '@/components/user-loading-screen'

// Async `params` need to be unwrapped with `use()` in client components
export default function Page({ params }: { params: Promise<{ uri: string }> }) {
  const { uri } = use(params) // ✅ unwrap params with `use`

  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <UserLoadingScreen onComplete={handleLoadingComplete} project_uri={uri} />
  }

  const handleExitPreview = () => {}

  return <PreviewMode onExitPreview={handleExitPreview} isGuestView={true} />
}
