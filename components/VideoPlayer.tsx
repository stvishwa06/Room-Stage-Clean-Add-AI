'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  sourceImageUrl?: string
}

export default function VideoPlayer({ videoUrl, sourceImageUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      setIsLoading(true)
      setHasError(false)
      videoRef.current.load()
    }
  }, [videoUrl])

  const handleLoadedData = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError && sourceImageUrl) {
    // Fallback to source image if video fails to load
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <img
          src={sourceImageUrl}
          alt="Video source"
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/80 text-sm">Loading video...</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        controls
        className="max-w-full max-h-full w-auto h-auto object-contain"
        onLoadedData={handleLoadedData}
        onError={handleError}
      />
    </div>
  )
}
