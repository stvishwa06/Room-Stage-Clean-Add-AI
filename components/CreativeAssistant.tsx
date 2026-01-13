'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StylePreset {
  id: string
  name: string
  thumbnail: string
  prompt: string
}

interface CreativeAssistantProps {
  onStyleSelect: (style: string) => void
  onPromptChange: (prompt: string) => void
  selectedStyle?: string
  customPrompt: string
}

const stylePresets: StylePreset[] = [
  {
    id: 'industrial',
    name: 'Industrial',
    thumbnail: '/images/styles/industrial.png',
    prompt: 'exposed brick, matte black metal accents, raw wood textures, leather furniture, Edison bulb lighting',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    thumbnail: '/images/styles/scandinavian.png',
    prompt: 'light oak wood, minimalist design, neutral light palette, cozy textiles, natural sunlight',
  },
  {
    id: 'mid-century',
    name: 'Mid-Century',
    thumbnail: '/images/styles/mid-century.png',
    prompt: 'tapered furniture legs, walnut wood, geometric patterns, mustard and teal accents',
  },
  {
    id: 'boho',
    name: 'Bohemian',
    thumbnail: '/images/styles/boho.png',
    prompt: 'rattan furniture, many indoor green plants, woven macramé, layered rugs, earthy tones',
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    thumbnail: '/images/styles/art-deco.png',
    prompt: 'luxurious emerald green velvet, polished gold and brass accents, geometric wall molding, sunburst patterns, high-gloss marble surfaces, opulent lighting',
  }
]

export default function CreativeAssistant({
  onStyleSelect,
  onPromptChange,
  selectedStyle,
}: CreativeAssistantProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleStyleSelect = (styleId: string) => {
    onStyleSelect(styleId)
    const style = stylePresets.find(s => s.id === styleId)
    if (style) {
      onPromptChange(style.prompt)
    }
  }

  const nextStyle = () => {
    setCurrentIndex((prev) => (prev + 1) % stylePresets.length)
  }

  const prevStyle = () => {
    setCurrentIndex((prev) => (prev - 1 + stylePresets.length) % stylePresets.length)
  }

  const currentStyle = stylePresets[currentIndex]

  return (
    <div className="w-80 bg-black/40 border-l border-white/10 flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white">Creative Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Style Presets - Carousel */}
        <div>
          <h3 className="text-xs font-medium text-white/60 mb-3 uppercase tracking-wide">
            Design Style
          </h3>
          
          {/* Carousel Container */}
          <div className="relative mb-4">
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-white/20">
              <img
                src={currentStyle.thumbnail}
                alt={currentStyle.name}
                className="w-full h-full object-cover"
              />
              
              {/* Style Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2">
                <p className="text-white text-sm font-medium text-center">{currentStyle.name}</p>
              </div>
              
              {/* Navigation Buttons */}
              <button
                onClick={prevStyle}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                aria-label="Previous style"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextStyle}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                aria-label="Next style"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-3">
              {stylePresets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-6'
                      : 'bg-white/30 w-1.5 hover:bg-white/50'
                  }`}
                  aria-label={`Go to ${stylePresets[index].name}`}
                />
              ))}
            </div>
            
            {/* Select Style Button */}
            <button
              onClick={() => handleStyleSelect(currentStyle.id)}
              className={`w-full mt-3 px-4 py-2 rounded text-sm font-medium transition-all ${
                selectedStyle === currentStyle.id
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {selectedStyle === currentStyle.id ? 'Selected' : 'Select Style'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

