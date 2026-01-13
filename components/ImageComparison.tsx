'use client'

import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { Sliders } from 'lucide-react'

interface ImageComparisonProps {
  beforeImage?: string | null
  afterImage?: string | null
  loading?: boolean
  sliderMode?: boolean
  onToggleSlider?: () => void
}

export default function ImageComparison({ 
  beforeImage, 
  afterImage, 
  loading = false,
  sliderMode = false,
  onToggleSlider
}: ImageComparisonProps) {
  const showComparison = beforeImage && afterImage
  const showBeforeOnly = beforeImage && !afterImage
  const showAfterOnly = afterImage && !beforeImage

  return (
    <div 
      className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-black"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/80 text-sm">Processing...</p>
          </div>
        </div>
      )}

      {showComparison && (
        <>
          {sliderMode ? (
            /* Slider view using react-compare-slider */
            <div className="w-full h-full flex items-center justify-center">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={beforeImage!}
                    alt="Before"
                    style={{ objectFit: 'contain' }}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={afterImage!}
                    alt="After"
                    style={{ objectFit: 'contain' }}
                  />
                }
                position={50}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                className="w-full h-full"
              />
            </div>
          ) : (
            /* Split view: Before on left, After on right */
            <div className="flex w-full h-full">
              {/* Left side - Before */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden border-r border-white/20 scrollbar-gutter-stable">
                <div className="flex justify-center">
                  <img
                    src={beforeImage!}
                    alt="Before"
                    className="max-w-full h-auto object-contain"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
              
              {/* Right side - After */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-gutter-stable">
                <div className="flex justify-center">
                  <img
                    src={afterImage!}
                    alt="After"
                    className="max-w-full h-auto object-contain"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded text-xs font-medium text-white">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded text-xs font-medium text-white">
            After
          </div>

          {/* Toggle Slider Button - Only show when both images are present */}
          {onToggleSlider && (
            <button
              onClick={onToggleSlider}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 px-3 py-1.5 rounded text-xs font-medium text-white flex items-center gap-2 transition-colors z-10"
              title={sliderMode ? 'Switch to Split View' : 'Switch to Slider View'}
            >
              <Sliders size={14} />
              <span>{sliderMode ? 'Split View' : 'Slider View'}</span>
            </button>
          )}
        </>
      )}

      {showBeforeOnly && (
        <div className="relative w-full h-full flex">
          {/* Left side - Before */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden border-r border-white/20 scrollbar-gutter-stable">
            <div className="flex justify-center">
              <img
                src={beforeImage}
                alt="Before"
                className="max-w-full h-auto object-contain"
                style={{ display: 'block' }}
              />
            </div>
          </div>
          
          {/* Right side - Empty placeholder */}
          <div className="flex-1 flex items-center justify-center bg-black/20">
            <p className="text-white/40 text-sm">Select an image for "After"</p>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded text-xs font-medium text-white">
            Before
          </div>
        </div>
      )}

      {showAfterOnly && (
        <div className="relative w-full h-full flex">
          {/* Left side - Empty placeholder */}
          <div className="flex-1 flex items-center justify-center bg-black/20 border-r border-white/20">
            <p className="text-white/40 text-sm">Select an image for "Before"</p>
          </div>
          
          {/* Right side - After */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-gutter-stable">
            <div className="flex justify-center">
              <img
                src={afterImage}
                alt="After"
                className="max-w-full h-auto object-contain"
                style={{ display: 'block' }}
              />
            </div>
          </div>
          
          <div className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded text-xs font-medium text-white">
            After
          </div>
        </div>
      )}
    </div>
  )
}

