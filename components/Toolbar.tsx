'use client'

import { Sparkles, Sofa, Plus } from 'lucide-react'

interface ToolbarProps {
  onClean: () => void
  onAddItem: () => void
  onStage: () => void
  canClean: boolean
  canAddItem: boolean
  canStage: boolean
  loading?: boolean
}

export default function Toolbar({ 
  onClean,
  onAddItem,
  onStage,
  canClean,
  canAddItem,
  canStage,
  loading = false 
}: ToolbarProps) {
  const buttons = [
    {
      id: 'clean',
      label: 'Clean',
      icon: Sparkles,
      onClick: onClean,
      enabled: canClean && !loading,
    },
    {
      id: 'add-item',
      label: 'Add Item',
      icon: Plus,
      onClick: onAddItem,
      enabled: canAddItem && !loading,
    },
    {
      id: 'stage',
      label: 'Staging',
      icon: Sofa,
      onClick: onStage,
      enabled: canStage && !loading,
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4">
      {buttons.map((button) => {
        const Icon = button.icon
        return (
          <button
            key={button.id}
            onClick={button.onClick}
            disabled={!button.enabled}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center
              transition-all duration-200
              ${button.enabled
                ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
              }
            `}
            title={button.label}
          >
            <Icon size={20} />
          </button>
        )
      })}
    </div>
  )
}

