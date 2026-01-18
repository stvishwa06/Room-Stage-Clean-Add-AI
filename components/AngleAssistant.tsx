'use client'

import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

interface AngleAssistantProps {
  onAngleChange: (azimuth: number, elevation: number, distance: number) => void
  azimuth: number
  elevation: number
  distance: number
}

const AnglePicker2D = ({ onUpdate, azimuth, elevation, zoomLevel, getAzimuthLabel, getElevationLabel }: { 
  onUpdate: (azimuth: number, elevation: number) => void
  azimuth: number
  elevation: number
  zoomLevel: number
  getAzimuthLabel: (azimuth: number) => string
  getElevationLabel: (elevation: number) => string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [currentElevation, setCurrentElevation] = useState(elevation)
  const [currentAzimuth, setCurrentAzimuth] = useState(azimuth)

  // Update current elevation and azimuth when props change
  useEffect(() => {
    setCurrentElevation(elevation)
    setCurrentAzimuth(azimuth)
  }, [elevation, azimuth])

  // Convert azimuth and elevation to x, y position
  // Azimuth: 0-360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
  // Elevation: -30 to 90 degrees (-30 = below eye level, 0 = eye level, 90 = ceiling)
  const getPositionFromAngles = () => {
    // Convert azimuth to radians, adjusting for coordinate system
    const azimuthRad = ((azimuth - 90) * Math.PI) / 180
    // Convert elevation to distance from center (0-50)
    // 90° elevation (ceiling) = center (0 distance)
    // 0° elevation (eye level) = edge (50 distance)
    // -30° elevation (below) = beyond edge, clamp to edge
    const normalizedElevation = Math.max(-30, Math.min(90, elevation))
    const distFromCenter = ((90 - normalizedElevation) / 120) * 50
    
    const x = 50 + Math.cos(azimuthRad) * distFromCenter
    const y = 50 + Math.sin(azimuthRad) * distFromCenter
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }

  const pos = getPositionFromAngles()

  const handleMouseDown = () => {
    setIsDragging(true)
    setShowTooltip(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Clamp to circle bounds
    const dx = x - 50
    const dy = y - 50
    const distance = Math.sqrt(dx * dx + dy * dy)
    const clampedDist = Math.min(distance, 50)
    
    // Calculate Azimuth (0-360 degrees)
    let azimuth = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (azimuth < 0) azimuth += 360

    // Calculate Elevation (-30 to 90 degrees)
    // Distance 0 = 90° elevation (ceiling)
    // Distance 50 = 0° elevation (eye level)
    // Distance > 50 = -30° elevation (below eye level)
    const elevation = Math.round(90 - (clampedDist * 2.4))
    const clampedElevation = Math.max(-30, Math.min(90, elevation))

    // Only update azimuth and elevation, not zoom
    const finalAzimuth = Math.round(azimuth)
    const finalElevation = clampedElevation
    setCurrentElevation(finalElevation)
    onUpdate(finalAzimuth, finalElevation)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setShowTooltip(false)
  }

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-64 h-64 rounded-full bg-white/5 border-2 border-white/20 cursor-crosshair overflow-hidden select-none"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Crosshair Grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-full h-px bg-white" />
          <div className="h-full w-px bg-white absolute" />
          <div className="w-32 h-32 rounded-full border border-white" />
          <div className="w-16 h-16 rounded-full border border-white" />
        </div>

        {/* Cardinal direction labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium pointer-events-none select-none">N</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium pointer-events-none select-none">S</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium pointer-events-none select-none">W</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium pointer-events-none select-none">E</div>

        {/* The Camera "Target" - size changes based on zoom level */}
        <div 
          className="absolute bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-200 border-2 border-white/30"
          style={{ 
            left: `${pos.x}%`, 
            top: `${pos.y}%`, 
            transform: 'translate(-50%, -50%)',
            cursor: isDragging ? 'grabbing' : 'grab',
            // Size scales from 1rem (16px) at zoom 0 to 2rem (32px) at zoom 10
            width: `${1 + (zoomLevel / 10) * 1}rem`,
            height: `${1 + (zoomLevel / 10) * 1}rem`,
          }}
        />
        
        {/* Azimuth & Elevation Tooltip for Circle */}
        {showTooltip && isDragging && (
          <div
            className="absolute bg-black/90 border border-white/20 rounded px-2 py-1 text-xs text-white pointer-events-none z-50"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(15px, -100%)',
            }}
          >
            <div className="space-y-0.5">
              <div>A: {currentAzimuth}° - {getAzimuthLabel(currentAzimuth)}</div>
              <div>E: {currentElevation}° - {getElevationLabel(currentElevation)}</div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-4 -mt-px">
              <div className="w-2 h-2 bg-black/90 border-r border-b border-white/20 rotate-45"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <div className="text-sm font-mono text-white/80">
          <p>Azimuth: <span className="text-purple-400 font-semibold">{azimuth}°</span></p>
          <p>Elevation: <span className="text-purple-400 font-semibold">{elevation}°</span></p>
          <p className="text-xs text-white/50 mt-1">(Drag to adjust camera angle)</p>
        </div>
      </div>
    </div>
  )
}

export default function AngleAssistant({
  onAngleChange,
  azimuth,
  elevation,
  distance,
}: AngleAssistantProps) {
  const [localAzimuth, setLocalAzimuth] = useState(azimuth || 0)
  const [localElevation, setLocalElevation] = useState(elevation !== undefined ? elevation : 0)
  const [localDistance, setLocalDistance] = useState(distance || 5)
  const [showSliderTooltip, setShowSliderTooltip] = useState(false)
  const [showAzimuthTooltip, setShowAzimuthTooltip] = useState(false)

  const getElevationLabel = (elevation: number) => {
    if (elevation >= 80) return "Zenith (Ceiling)";
    if (elevation >= 45) return "High Angle";
    if (elevation >= 15) return "Elevated";
    if (elevation >= -15) return "Horizon (Eye-Level)";
    return "Nadir (Floor View)";
  };

  const getAzimuthLabel = (azimuth: number) => {
    // Normalize to 0-360
    const normalized = ((azimuth % 360) + 360) % 360;
    if (normalized === 0 || normalized === 360) return "Front view";
    if (normalized === 90) return "Right side";
    if (normalized === 180) return "Back view";
    if (normalized === 270) return "Left side";
    // For other angles, interpolate
    if (normalized > 0 && normalized < 90) return "Front-Right";
    if (normalized > 90 && normalized < 180) return "Back-Right";
    if (normalized > 180 && normalized < 270) return "Back-Left";
    if (normalized > 270 && normalized < 360) return "Front-Left";
    return "Front view";
  };

  return (
    <div className="w-80 bg-black/40 border-l border-white/10 flex flex-col h-full overflow-x-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white">Angle Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
        {/* Angle Picker */}
        <div>
          <h3 className="text-xs font-medium text-white/60 mb-4 uppercase tracking-wide">
            Camera Angle
          </h3>
          
          <AnglePicker2D
            onUpdate={(az, el) => {
              setLocalAzimuth(az)
              setLocalElevation(el)
              onAngleChange(az, el, localDistance)
            }}
            azimuth={localAzimuth}
            elevation={localElevation}
            zoomLevel={localDistance}
            getAzimuthLabel={getAzimuthLabel}
            getElevationLabel={getElevationLabel}
          />
        </div>

        {/* Manual Input Controls */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-medium text-white/60">
                Azimuth (Horizontal)
              </label>
              <div className="relative group">
                <Info 
                  size={14} 
                  className="text-white/40 hover:text-white/60 cursor-help transition-colors" 
                />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-3 bg-black/90 border border-white/20 rounded-lg text-xs text-white/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white mb-2">Horizontal rotation angle</p>
                    <p className="text-white/60 mb-2">Rotation around the object in degrees:</p>
                    <p><span className="text-purple-400 font-mono">0°</span> = Front view</p>
                    <p><span className="text-purple-400 font-mono">90°</span> = Right side</p>
                    <p><span className="text-purple-400 font-mono">180°</span> = Back view</p>
                    <p><span className="text-purple-400 font-mono">270°</span> = Left side</p>
                    <p><span className="text-purple-400 font-mono">360°</span> = Front view again</p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-px">
                    <div className="w-2 h-2 bg-black/90 border-l border-b border-white/20 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="360"
                value={localAzimuth}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setLocalAzimuth(val)
                  onAngleChange(val, localElevation, localDistance)
                }}
                onMouseEnter={() => setShowAzimuthTooltip(true)}
                onMouseDown={() => setShowAzimuthTooltip(true)}
                onMouseMove={() => setShowAzimuthTooltip(true)}
                onMouseUp={() => setShowAzimuthTooltip(false)}
                onMouseLeave={() => setShowAzimuthTooltip(false)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              {/* Azimuth Tooltip for Slider */}
              {showAzimuthTooltip && (
                <div
                  className="absolute bg-black/90 border border-white/20 rounded px-2 py-1 text-xs text-white pointer-events-none z-[100] whitespace-nowrap"
                  style={{
                    left: `${(localAzimuth / 360) * 100}%`,
                    bottom: '100%',
                    marginBottom: '8px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {getAzimuthLabel(localAzimuth)}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="w-2 h-2 bg-black/90 border-r border-b border-white/20 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>0°</span>
              <span className="text-purple-400 font-mono">{localAzimuth}°</span>
              <span>360°</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-medium text-white/60">
                Elevation (Vertical)
              </label>
              <div className="relative group">
                <Info 
                  size={14} 
                  className="text-white/40 hover:text-white/60 cursor-help transition-colors" 
                />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-3 bg-black/90 border border-white/20 rounded-lg text-xs text-white/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white mb-2">Elevation</p>
                    <p><span className="text-purple-400 font-mono">90°</span> = <span className="text-white/90">Zenith / Top-Down</span><br />The "God View." Looking straight down from the ceiling.</p>
                    <p><span className="text-purple-400 font-mono">60°</span> = <span className="text-white/90">High Angle</span><br />Looking down from a ladder; shows the floor and furniture tops.</p>
                    <p><span className="text-purple-400 font-mono">30°</span> = <span className="text-white/90">Elevated</span><br />Professional real estate photo height; clear view of depth.</p>
                    <p><span className="text-purple-400 font-mono">0°</span> = <span className="text-white/90">Horizon / Eye-Level</span><br />Natural human view. Looking straight ahead.</p>
                    <p><span className="text-purple-400 font-mono">-30°</span> = <span className="text-white/90">Nadir / Low Angle</span><br />The "Hero Shot." Looking up from the floor.</p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-px">
                    <div className="w-2 h-2 bg-black/90 border-l border-b border-white/20 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min="-30"
                max="90"
                value={localElevation}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setLocalElevation(val)
                  onAngleChange(localAzimuth, val, localDistance)
                }}
                onMouseEnter={() => setShowSliderTooltip(true)}
                onMouseDown={() => setShowSliderTooltip(true)}
                onMouseMove={() => setShowSliderTooltip(true)}
                onMouseUp={() => setShowSliderTooltip(false)}
                onMouseLeave={() => setShowSliderTooltip(false)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              {/* Elevation Tooltip for Slider */}
              {showSliderTooltip && (
                <div
                  className="absolute bg-black/90 border border-white/20 rounded px-2 py-1 text-xs text-white pointer-events-none z-[100] whitespace-nowrap"
                  style={{
                    left: `${((localElevation + 30) / 120) * 100}%`,
                    bottom: '100%',
                    marginBottom: '8px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {getElevationLabel(localElevation)}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="w-2 h-2 bg-black/90 border-r border-b border-white/20 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>-30° (Below)</span>
              <span className="text-purple-400 font-mono">{localElevation}°</span>
              <span>90° (Ceiling)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-medium text-white/60">
                Zoom Level
              </label>
              <div className="relative group">
                <Info 
                  size={14} 
                  className="text-white/40 hover:text-white/60 cursor-help transition-colors" 
                />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-3 bg-black/90 border border-white/20 rounded-lg text-xs text-white/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white mb-2">Camera zoom/distance</p>
                    <p><span className="text-purple-400 font-mono">0</span> = Wide shot (far away)</p>
                    <p><span className="text-purple-400 font-mono">5</span> = Medium shot (normal)</p>
                    <p><span className="text-purple-400 font-mono">10</span> = Close-up (very close)</p>
                    <p className="pt-1.5 border-t border-white/10 text-white/60">Default value: 5</p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-px">
                    <div className="w-2 h-2 bg-black/90 border-l border-b border-white/20 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={localDistance}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setLocalDistance(val)
                onAngleChange(localAzimuth, localElevation, val)
              }}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>0</span>
              <span className="text-purple-400 font-mono">{localDistance % 1 === 0 ? localDistance : localDistance.toFixed(1)}</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <p className="text-xs text-white/60 leading-relaxed">
              Adjust the camera angle to view the room from different perspectives. 
              Drag the purple dot or use the sliders to fine-tune the angle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
