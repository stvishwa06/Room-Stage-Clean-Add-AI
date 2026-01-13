'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import ImageComparison from '@/components/ImageComparison'
import ImageSelector from '@/components/ImageSelector'
import Toolbar from '@/components/Toolbar'
import CreativeAssistant from '@/components/CreativeAssistant'
import GeneratedVersions from '@/components/GeneratedVersions'
import { Upload, X, Type, MousePointer2 } from 'lucide-react'
import { 
  uploadToFalStorage, 
  saveImage, 
  loadAllImages, 
  deleteImage, 
  getImageById,
  saveSelections,
  loadSelections,
  type StoredImage,
  type SelectionState
} from '@/lib/imageStorage'

type PolygonPoint = {
  x: number
  y: number
}

type SelectionType = 'clean' | 'before' | 'after' | 'staging' | 'add-item' | 'view'
type ActionType = 'clean' | 'stage' | 'add-item'

// Reusable Loading Overlay Component
const LoadingOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-white/80 text-sm">Processing...</p>
    </div>
  </div>
)

// Reusable Prompt Input Component
const PromptInput = ({ 
  label, 
  value, 
  onChange, 
  onClear, 
  placeholder, 
  onEnter 
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder: string
  onEnter?: () => void
}) => (
  <div className="px-6 py-3 border-b border-white/10 bg-black/20">
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-white/60 whitespace-nowrap">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
      />
      {value && (
        <button
          onClick={onClear}
          className="text-white/40 hover:text-white/60 text-xs px-2 flex items-center gap-1"
        >
          <X size={12} />
          <span>Clear</span>
        </button>
      )}
    </div>
  </div>
)

export default function Home() {
  // Grouped state
  const [storedImages, setStoredImages] = useState<StoredImage[]>([])
  const [selections, setSelections] = useState({
    before: null as string | null,
    after: null as string | null,
    clean: null as string | null,
    staging: null as string | null,
    addItem: null as string | null,
    view: null as string | null,
  })
  const [prompts, setPrompts] = useState({
    clean: '',
    staging: '',
    addItem: '',
  })
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    action: null as string | null,
    isUploading: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string>('matimalust')
  const [addItemMode, setAddItemMode] = useState<'prompt' | 'reference'>('prompt')
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selection, setSelection] = useState<PolygonPoint[] | null>(null)
  const [sliderMode, setSliderMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const referenceImageInputRef = useRef<HTMLInputElement>(null)

  // Helper function to get image URL
  const getImageUrl = (imageId: string | null): string | null => {
    if (!imageId) return null
    const image = getImageById(imageId)
    return image?.url || null
  }

  // Computed image URLs
  const imageUrls = useMemo(() => ({
    before: getImageUrl(selections.before),
    after: getImageUrl(selections.after),
    clean: getImageUrl(selections.clean),
    staging: getImageUrl(selections.staging),
    addItem: getImageUrl(selections.addItem),
    view: getImageUrl(selections.view),
  }), [selections, storedImages])

  const displayImageUrl = imageUrls.staging || imageUrls.addItem || imageUrls.clean || imageUrls.view
  const isComparisonMode = !!selections.before

  // Helper to handle API response
  const handleAPIResponse = (action: ActionType, data: any, originalImageId: string, prompt?: string, selection?: PolygonPoint[] | null) => {
    const typeMap = {
      'clean': 'cleaned' as const,
      'stage': 'staged' as const,
      'add-item': 'added' as const,
    }
    
    const storedImage = saveImage({
      url: data.imageUrl,
      type: typeMap[action],
      metadata: { prompt, selection: selection || undefined },
    })
    
    setStoredImages(prev => [...prev, storedImage])
    
    // Update selections: original becomes "Before", generated becomes "After"
    const selectionKey = action === 'clean' ? 'clean' : action === 'stage' ? 'staging' : 'addItem'
    setSelections(prev => ({
      ...prev,
      before: originalImageId,
      after: storedImage.id,
      [selectionKey]: null,
    }))
    
    // Save to localStorage
    saveSelections({
      selectedBefore: originalImageId,
      selectedAfter: storedImage.id,
      selectedForClean: action === 'clean' ? null : selections.clean,
      selectedForStaging: action === 'stage' ? null : selections.staging,
      selectedForAddItem: action === 'add-item' ? null : selections.addItem,
      selectedForView: selections.view,
    })
    
    // Clear prompt for add-item
    if (action === 'add-item') {
      setPrompts(prev => ({ ...prev, addItem: '' }))
    }
  }

  // Initialize from localStorage
  useEffect(() => {
    const images = loadAllImages()
    setStoredImages(images)
    const savedSelections = loadSelections()
    
    const validateAndSet = (imageId: string | null, images: StoredImage[]) => {
      return imageId && images.find(img => img.id === imageId) ? imageId : null
    }
    
    setSelections({
      before: validateAndSet(savedSelections.selectedBefore, images),
      after: validateAndSet(savedSelections.selectedAfter, images),
      clean: validateAndSet(savedSelections.selectedForClean, images),
      staging: validateAndSet(savedSelections.selectedForStaging, images),
      addItem: validateAndSet(savedSelections.selectedForAddItem, images),
      view: validateAndSet(savedSelections.selectedForView, images),
    })
    
    // Auto-select first image as "View" if no selection exists
    if (images.length > 0 && 
        !savedSelections.selectedForView && 
        !savedSelections.selectedForClean && 
        !savedSelections.selectedForStaging && 
        !savedSelections.selectedForAddItem && 
        !savedSelections.selectedBefore) {
      setImageSelection('view', images[0].id)
    }
    
    // Restore selection mode if add item is selected
    if (savedSelections.selectedForAddItem && images.find(img => img.id === savedSelections.selectedForAddItem)) {
      setSelectionMode(true)
    }
  }, [])

  // Reset slider mode when before/after images change
  useEffect(() => {
    if (!selections.before || !selections.after) {
      setSliderMode(false)
    }
  }, [selections.before, selections.after])

  // Enable selection mode when Add Item or Clean is selected
  useEffect(() => {
    if (selections.addItem || selections.clean) {
      setSelectionMode(true)
    }
  }, [selections.addItem, selections.clean])

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoadingState({ isLoading: true, action: null, isUploading: true })
    setError(null)

    try {
      const url = await uploadToFalStorage(file)
      const storedImage = saveImage({ url, type: 'original' })
      setStoredImages(prev => [storedImage, ...prev])
      setImageSelection('view', storedImage.id)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setLoadingState({ isLoading: false, action: null, isUploading: false })
    }
  }

  // Reference image upload handler
  const handleReferenceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Don't set isLoading for reference uploads to avoid double overlay
    setLoadingState({ isLoading: false, action: null, isUploading: true })
    setError(null)

    try {
      const url = await uploadToFalStorage(file)
      const storedImage = saveImage({ url, type: 'reference' })
      setStoredImages(prev => [storedImage, ...prev])
      setReferenceImageUrl(url)
    } catch (err: any) {
      setError(err.message || 'Failed to upload reference image')
    } finally {
      setLoadingState({ isLoading: false, action: null, isUploading: false })
    }
  }

  // API call handler
  const callAPI = async (action: ActionType, imageUrl: string, prompt?: string, selection?: PolygonPoint[] | null, referenceImageUrl?: string | null) => {
    setLoadingState({ isLoading: true, action, isUploading: false })
    setError(null)

    try {
      const promptToUse = prompt || 
        (action === 'clean' ? prompts.clean : 
         action === 'add-item' ? prompts.addItem : 
         prompts.staging) || 
        selectedStyle

      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          imageUrl,
          prompt: promptToUse,
          selection: selection || undefined,
          referenceImageUrl: referenceImageUrl || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process request')
      }

      const data = await response.json()
      const originalImageId = action === 'clean' ? selections.clean : 
                             action === 'stage' ? selections.staging : 
                             selections.addItem

      if (originalImageId) {
        handleAPIResponse(action, data, originalImageId, prompt, selection)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoadingState({ isLoading: false, action: null, isUploading: false })
    }
  }

  // Action handlers
  const handleClean = () => {
    const imageToUse = selections.clean ? imageUrls.clean : null
    if (!imageToUse) {
      setError('Please select an image for cleaning first')
      return
    }
    if (selectionMode && !selection) {
      setError('Please select an area to remove first, or switch to prompt mode')
      return
    }
    callAPI('clean', imageToUse, prompts.clean, selection)
    setSelection(null)
    setSelectionMode(false)
  }

  const handleAddItem = () => {
    const imageToUse = selections.addItem ? imageUrls.addItem : null
    if (!imageToUse) {
      setError('Please select an image for adding items first')
      return
    }
    if (!selection || selection.length < 3) {
      setError('Please select an area using polygon selection first')
      return
    }
    if (!prompts.addItem.trim()) {
      setError('Please enter a prompt describing the item to add')
      return
    }
    if (addItemMode === 'reference' && !referenceImageUrl) {
      setError('Please upload a reference image or switch to prompt-only mode')
      return
    }
    callAPI('add-item', imageToUse, prompts.addItem, selection, referenceImageUrl)
    setSelection(null)
    setSelectionMode(false)
  }

  const handleStage = () => {
    const imageToUse = selections.staging ? imageUrls.staging : null
    if (!imageToUse) {
      setError('Please select an image for staging first')
      return
    }
    const prompt = prompts.staging || selectedStyle || 'modern'
    callAPI('stage', imageToUse, prompt)
  }

  // Delete image handler
  const handleDeleteImage = (imageId: string) => {
    const imageToDelete = getImageById(imageId)
    
    if (deleteImage(imageId)) {
      setStoredImages(prev => prev.filter(img => img.id !== imageId))
      
      if (imageToDelete && imageToDelete.url === referenceImageUrl) {
        setReferenceImageUrl(null)
      }
      
      // Clear selections if deleted image was selected
      const newSelections = {
        before: selections.before === imageId ? null : selections.before,
        after: selections.after === imageId ? null : selections.after,
        clean: selections.clean === imageId ? null : selections.clean,
        staging: selections.staging === imageId ? null : selections.staging,
        addItem: selections.addItem === imageId ? null : selections.addItem,
        view: selections.view === imageId ? null : selections.view,
      }
      
      setSelections(newSelections)
      saveSelections({
        selectedBefore: newSelections.before,
        selectedAfter: newSelections.after,
        selectedForClean: newSelections.clean,
        selectedForStaging: newSelections.staging,
        selectedForAddItem: newSelections.addItem,
        selectedForView: newSelections.view,
      })
    }
  }

  // Set image selection with state management
  const setImageSelection = (type: SelectionType, imageId: string) => {
    const currentState = selections.clean ? 'clean' : 
                         selections.staging ? 'staging' : 
                         selections.addItem ? 'add-item' : 
                         selections.view ? 'view' : 
                         selections.before ? 'before' :
                         selections.after ? 'after' :
                         null
    
    // Clear polygon when switching states
    if (currentState !== null && currentState !== type) {
      setSelection(null)
      setSelectionMode(type === 'add-item' || type === 'clean')
    } else if (currentState !== null && currentState === type) {
      setSelection(null)
    }
    
    // Create new selections object
    const newSelections = {
      before: type === 'before' ? imageId : (type === 'after' ? selections.before : null),
      after: type === 'after' ? imageId : (type === 'before' ? selections.after : null),
      clean: type === 'clean' ? imageId : null,
      staging: type === 'staging' ? imageId : null,
      addItem: type === 'add-item' ? imageId : null,
      view: type === 'view' ? imageId : null,
    }
    
    // Handle mutual exclusivity for before/after
    if (type === 'before' && selections.after === imageId) {
      newSelections.after = null
    }
    if (type === 'after' && selections.before === imageId) {
      newSelections.before = null
    }
    
    setSelections(newSelections)
    saveSelections({
      selectedBefore: newSelections.before,
      selectedAfter: newSelections.after,
      selectedForClean: newSelections.clean,
      selectedForStaging: newSelections.staging,
      selectedForAddItem: newSelections.addItem,
      selectedForView: newSelections.view,
    })
  }

  // Style and prompt handlers
  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style)
    setPrompts(prev => ({ ...prev, staging: '' }))
  }

  const handlePromptChange = (prompt: string) => {
    setPrompts(prev => ({ ...prev, staging: prompt }))
    if (prompt) {
      setSelectedStyle('')
    }
  }

  // Validation helpers
  const canClean = !!selections.clean && (
    selectionMode 
      ? !!selection && selection.length >= 3
      : !!prompts.clean.trim()
  )
  const canAddItem = !!selections.addItem && !!selection && selection.length >= 3 && !!prompts.addItem.trim() && 
    (addItemMode === 'prompt' || (addItemMode === 'reference' && referenceImageUrl !== null))
  const canStage = !!selections.staging && !!prompts.staging.trim()

  // Selection handlers factory
  const createSelectionHandler = (type: SelectionType) => (imageId: string | null) => {
    if (imageId) {
      setImageSelection(type, imageId)
    } else {
      const newSelections = { ...selections, [type === 'before' ? 'before' : type === 'after' ? 'after' : type === 'clean' ? 'clean' : type === 'staging' ? 'staging' : type === 'add-item' ? 'addItem' : 'view']: null }
      setSelections(newSelections)
      saveSelections({
        selectedBefore: newSelections.before,
        selectedAfter: newSelections.after,
        selectedForClean: newSelections.clean,
        selectedForStaging: newSelections.staging,
        selectedForAddItem: newSelections.addItem,
        selectedForView: newSelections.view,
      })
    }
  }

  return (
    <main className="h-screen w-screen flex bg-[#0a0a0a] text-white overflow-hidden">
      <Toolbar
        onClean={handleClean}
        onAddItem={handleAddItem}
        onStage={handleStage}
        canClean={canClean}
        canAddItem={canAddItem}
        canStage={canStage}
        loading={loadingState.isLoading}
      />

      <div className="flex-1 flex flex-col">
        <header className={`h-16 border-b border-white/10 flex items-center justify-between px-6 transition-all duration-300 ${selections.staging ? 'pr-[340px]' : 'pr-6'}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-sm font-semibold">RoomForge AI</h1>
          </div>
          {storedImages.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors bg-white/10 text-white/60 hover:bg-white/15 flex items-center gap-2"
                title="Upload another image"
              >
                <Upload size={14} />
                <span>Upload</span>
              </button>
              {selections.clean && !selections.addItem && !selections.view && (
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode)
                    if (!selectionMode) {
                      setSelection(null)
                    }
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectionMode
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/15'
                  }`}
                >
                  {selectionMode ? (
                    <>
                      <MousePointer2 size={14} />
                      <span>Selection Mode</span>
                    </>
                  ) : (
                    <>
                      <Type size={14} />
                      <span>Prompt Mode</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </header>

        {displayImageUrl && !selectionMode && selections.clean && !selections.addItem && !selections.view && (
          <PromptInput
            label="Remove objects:"
            value={prompts.clean}
            onChange={(value) => setPrompts(prev => ({ ...prev, clean: value }))}
            onClear={() => setPrompts(prev => ({ ...prev, clean: '' }))}
            placeholder="e.g., furniture, clutter, decor, or specific items..."
            onEnter={canClean ? handleClean : undefined}
          />
        )}

        {displayImageUrl && selections.staging && !selections.clean && !selections.addItem && !selections.view && (
          <PromptInput
            label="Staging style:"
            value={prompts.staging}
            onChange={handlePromptChange}
            onClear={() => setPrompts(prev => ({ ...prev, staging: '' }))}
            placeholder="e.g., modern, industrial, scandinavian, boho..."
            onEnter={canStage ? handleStage : undefined}
          />
        )}

        {selections.addItem && imageUrls.addItem && (
          <div className="px-6 py-3 border-b border-white/10 bg-black/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white/60 whitespace-nowrap">Mode:</span>
              <button
                onClick={() => {
                  setAddItemMode('prompt')
                  setReferenceImageUrl(null)
                }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  addItemMode === 'prompt'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                Prompt Only
              </button>
              <button
                onClick={() => setAddItemMode('reference')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  addItemMode === 'reference'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                Prompt + Reference
              </button>
              {addItemMode === 'reference' && (
                <div className="flex items-center gap-2 ml-2">
                  {referenceImageUrl ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={referenceImageUrl}
                        alt="Reference"
                        className="w-8 h-8 object-cover rounded border border-white/20"
                        title="Reference image"
                      />
                      <button
                        onClick={() => {
                          const referenceImage = storedImages.find(img => img.url === referenceImageUrl && img.type === 'reference')
                          if (referenceImage) {
                            handleDeleteImage(referenceImage.id)
                          } else {
                            setReferenceImageUrl(null)
                          }
                        }}
                        className="text-white/40 hover:text-white/60 text-xs px-2 flex items-center gap-1"
                        title="Delete reference image"
                      >
                        <X size={12} />
                        <span>Clear</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => referenceImageInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors flex items-center gap-1"
                      title="Upload reference image"
                    >
                      <Upload size={12} />
                      <span>Upload Reference</span>
                    </button>
                  )}
                  <input
                    ref={referenceImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
            <PromptInput
              label="Add item:"
              value={prompts.addItem}
              onChange={(value) => setPrompts(prev => ({ ...prev, addItem: value }))}
              onClear={() => setPrompts(prev => ({ ...prev, addItem: '' }))}
              placeholder="e.g., a blue sofa, modern chair, coffee table..."
              onEnter={canAddItem ? handleAddItem : undefined}
            />
          </div>
        )}

        <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {isComparisonMode ? (
              <ImageComparison
                beforeImage={imageUrls.before}
                afterImage={imageUrls.after}
                loading={loadingState.isLoading}
                sliderMode={sliderMode && !!imageUrls.before && !!imageUrls.after}
                onToggleSlider={() => setSliderMode(!sliderMode)}
              />
            ) : selectionMode && (displayImageUrl || imageUrls.before) && !selections.view ? (
              <ImageSelector
                key={`${selections.clean ? 'clean' : selections.addItem ? 'add-item' : 'none'}-${displayImageUrl || imageUrls.before}`}
                imageUrl={displayImageUrl || imageUrls.before || ''}
                onSelectionChange={setSelection}
                disabled={loadingState.isLoading}
                onProcess={undefined}
                showProcessButton={false}
                isProcessing={loadingState.isLoading && loadingState.action === 'clean'}
              />
            ) : displayImageUrl ? (
              <div className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-black">
                {loadingState.isLoading && <LoadingOverlay />}
                <div className="flex justify-center">
                  <img
                    src={displayImageUrl}
                    alt="Image"
                    className="max-w-full h-auto object-contain"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            ) : imageUrls.before ? (
              <div className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-black">
                {loadingState.isLoading && <LoadingOverlay />}
                <div className="flex justify-center">
                  <img
                    src={imageUrls.before}
                    alt="Before"
                    className="max-w-full h-auto object-contain"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Only show upload overlay for main upload (when no image is displayed) */}
          {loadingState.isUploading && !displayImageUrl && !imageUrls.before && <LoadingOverlay />}

          {!displayImageUrl && !imageUrls.before && !loadingState.isLoading && !loadingState.isUploading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center pointer-events-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload size={20} />
                  <span>Upload Image</span>
                </button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded text-sm z-50">
              {error}
            </div>
          )}
        </div>

        <div className="h-32 border-t border-white/10 flex items-center px-6 gap-4">
          <span className="text-xs font-medium text-white/60">Generated Versions</span>
          <GeneratedVersions
            images={storedImages}
            selectedBefore={selections.before}
            selectedAfter={selections.after}
            selectedForClean={selections.clean}
            selectedForStaging={selections.staging}
            selectedForAddItem={selections.addItem}
            selectedForView={selections.view}
            onSetImageSelection={setImageSelection}
            onSelectBefore={createSelectionHandler('before')}
            onSelectAfter={createSelectionHandler('after')}
            onSelectForClean={createSelectionHandler('clean')}
            onSelectForStaging={createSelectionHandler('staging')}
            onDelete={handleDeleteImage}
          />
        </div>
      </div>

      <div
        className={`
          fixed right-0 top-0 h-full z-40
          transition-all duration-300 ease-in-out
          ${selections.staging
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none'
          }
        `}
      >
        <CreativeAssistant
          onStyleSelect={handleStyleSelect}
          onPromptChange={handlePromptChange}
          selectedStyle={selectedStyle}
          customPrompt={prompts.staging}
        />
      </div>
    </main>
  )
}
