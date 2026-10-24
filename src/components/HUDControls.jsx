import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Box, 
  Eye, 
  Maximize2
} from 'lucide-react';

export default function HUDControls({
  isExploded,
  onToggleExplode,
  isPlaying,
  onTogglePlay,
  progress,
  onSeek,
  intensity,
  onChangeIntensity,
  cameraPreset,
  onSelectCameraPreset,
  showLabels,
  onToggleLabels,
  onToggleDrawer,
  isDrawerOpen,
  onResetCamera,
  componentsCount = 18,
  filterCategory = 'all',
  onSelectFilterCategory
}) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const presets = [
    { id: 'front', label: 'Front' },
    { id: 'iso', label: 'Iso' },
    { id: 'side', label: 'Side' },
    { id: 'top', label: 'Top' },
    { id: 'internal', label: 'Optics' }
  ];

  const categories = [
    { id: 'all', label: 'All Layers' },
    { id: 'exterior', label: 'Exterior Shell' },
    { id: 'optics', label: 'Pancake Optics' },
    { id: 'electronics', label: 'Compute & Thermal' },
    { id: 'power', label: 'Battery' },
    { id: 'comfort', label: 'Comfort & Strap' }
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-full max-w-3xl px-4 pointer-events-none">
      
      {/* Subassembly Category Selector Tabs */}
      <div className="navy-glass rounded-full px-2 py-1 pointer-events-auto flex items-center gap-1 max-w-full overflow-x-auto text-[11px] font-mono">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectFilterCategory?.(c.id)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
              filterCategory === c.id
                ? 'bg-[var(--accent-color)] text-[#FFFFFF] font-semibold shadow-[0_0_12px_rgba(var(--accent-rgb),0.45)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Upper Timeline Scrubber Bar */}
      <div className="w-full navy-glass rounded-2xl px-5 py-3 pointer-events-auto flex flex-wrap items-center justify-between gap-4">
        {/* Play & Explode / Assemble */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="navy-pill-btn w-8 h-8 rounded-full"
            title={isPlaying ? "Pause Disassembly" : "Play Cinematic Disassembly"}
          >
            {isPlaying ? <Pause size={14} className="text-[var(--accent-color)]" /> : <Play size={14} className="ml-0.5 text-[var(--accent-color)]" />}
          </button>

          <button
            onClick={onToggleExplode}
            className={`px-3.5 h-8 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 ${
              isExploded 
                ? 'bg-[var(--accent-color)] text-[#FFFFFF] font-semibold shadow-[0_0_14px_rgba(var(--accent-rgb),0.5)] border border-white/20' 
                : 'navy-pill-btn'
            }`}
          >
            <Layers size={13} className={isExploded ? 'text-white' : 'text-[var(--accent-color)]'} />
            <span>{isExploded ? 'ASSEMBLE' : 'EXPLODE'}</span>
          </button>
        </div>

        {/* Timeline Progress Slider */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Scrub</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--gradient-glow)]/60 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)] hover:accent-[var(--accent-color)]"
            />
          </div>
          <span className="font-mono text-xs text-[var(--accent-color)] font-semibold min-w-[32px] text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* Separation Distance Multiplier */}
        <div className="hidden sm:flex items-center gap-2 border-l border-[var(--accent-color)]/20 pl-4">
          <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Spread</span>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.05"
            value={intensity}
            onChange={(e) => onChangeIntensity(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-[var(--gradient-glow)]/60 rounded appearance-none cursor-pointer accent-[var(--accent-color)]"
            title="Separation Distance Multiplier"
          />
          <span className="font-mono text-[10px] text-[var(--text-primary)] min-w-[24px]">
            {intensity.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Lower Dock: Camera Presets & Navigation */}
      <div className="navy-glass rounded-full px-3.5 py-1.5 pointer-events-auto flex items-center gap-1.5 max-w-full overflow-x-auto">
        <button
          onClick={onResetCamera}
          className="navy-pill-btn px-2.5 h-7 rounded-full text-xs gap-1"
          title="Reset Camera Position"
        >
          <RotateCcw size={12} className="text-[var(--accent-color)]" />
          <span className="hidden md:inline">Reset</span>
        </button>

        <div className="w-px h-3.5 bg-[var(--accent-color)]/25 mx-1" />

        {/* Presets */}
        <div className="flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectCameraPreset(p.id)}
              className={`px-2.5 h-6 rounded-full text-xs font-medium transition-all ${
                cameraPreset === p.id 
                  ? 'bg-[var(--accent-color)] text-[#FFFFFF] font-semibold shadow-[0_0_10px_rgba(var(--accent-rgb),0.4)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="w-px h-3.5 bg-[var(--accent-color)]/25 mx-1" />

        {/* Labels Toggle */}
        <button
          onClick={onToggleLabels}
          className={`navy-pill-btn px-2.5 h-7 rounded-full text-xs gap-1 ${
            showLabels ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] border-[var(--accent-color)]' : 'text-[var(--text-secondary)]'
          }`}
          title="Toggle 3D Component Labels"
        >
          <Eye size={12} />
          <span className="hidden sm:inline">Labels</span>
        </button>

        {/* Component Drawer */}
        <button
          onClick={onToggleDrawer}
          className={`navy-pill-btn px-3 h-7 rounded-full text-xs gap-1.5 ${
            isDrawerOpen ? 'bg-[var(--accent-color)] text-[#FFFFFF] font-semibold shadow-[0_0_10px_rgba(var(--accent-rgb),0.4)]' : ''
          }`}
          title="Inspect All Components"
        >
          <Box size={12} className="text-[var(--accent-color)]" />
          <span>Parts ({componentsCount})</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="navy-pill-btn w-7 h-7 rounded-full"
          title="Toggle Fullscreen"
        >
          <Maximize2 size={12} />
        </button>
      </div>

    </div>
  );
}
