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
  componentsCount = 18
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

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 w-full max-w-3xl px-4 pointer-events-none">
      {/* Upper Timeline Scrubber Bar */}
      <div className="w-full apple-glass rounded-2xl px-5 py-3 pointer-events-auto flex flex-wrap items-center justify-between gap-4">
        {/* Play & Explode / Assemble */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="apple-pill-btn w-8 h-8 rounded-full text-zinc-300 hover:text-white"
            title={isPlaying ? "Pause Disassembly" : "Play Cinematic Disassembly"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          <button
            onClick={onToggleExplode}
            className={`px-3.5 h-8 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 ${
              isExploded 
                ? 'bg-white text-zinc-950 font-semibold shadow-sm' 
                : 'apple-pill-btn text-zinc-200 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>{isExploded ? 'ASSEMBLE' : 'EXPLODE'}</span>
          </button>
        </div>

        {/* Timeline Progress Slider */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Scrub</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-200"
            />
          </div>
          <span className="font-mono text-xs text-zinc-300 min-w-[32px] text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* Separation Distance Multiplier */}
        <div className="hidden sm:flex items-center gap-2 border-l border-zinc-800 pl-4">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Spread</span>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.05"
            value={intensity}
            onChange={(e) => onChangeIntensity(parseFloat(e.target.value))}
            className="w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-white"
            title="Separation Distance Multiplier"
          />
          <span className="font-mono text-[10px] text-zinc-300 min-w-[24px]">
            {intensity.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Lower Dock: Camera Presets & Navigation */}
      <div className="apple-glass rounded-full px-3.5 py-1.5 pointer-events-auto flex items-center gap-1.5 max-w-full overflow-x-auto">
        <button
          onClick={onResetCamera}
          className="apple-pill-btn px-2.5 h-7 rounded-full text-xs text-zinc-300 gap-1"
          title="Reset Camera Position"
        >
          <RotateCcw size={12} />
          <span className="hidden md:inline">Reset</span>
        </button>

        <div className="w-px h-3.5 bg-zinc-800 mx-1" />

        {/* Presets */}
        <div className="flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectCameraPreset(p.id)}
              className={`px-2.5 h-6 rounded-full text-xs transition-all ${
                cameraPreset === p.id 
                  ? 'bg-zinc-200 text-zinc-950 font-medium' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="w-px h-3.5 bg-zinc-800 mx-1" />

        {/* Labels Toggle */}
        <button
          onClick={onToggleLabels}
          className={`apple-pill-btn px-2.5 h-7 rounded-full text-xs gap-1 ${
            showLabels ? 'bg-white/15 text-white' : 'text-zinc-400'
          }`}
          title="Toggle 3D Component Labels"
        >
          <Eye size={12} />
          <span className="hidden sm:inline">Labels</span>
        </button>

        {/* Component Drawer */}
        <button
          onClick={onToggleDrawer}
          className={`apple-pill-btn px-3 h-7 rounded-full text-xs gap-1.5 ${
            isDrawerOpen ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-200'
          }`}
          title="Inspect All Components"
        >
          <Box size={12} />
          <span>Parts ({componentsCount})</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="apple-pill-btn w-7 h-7 rounded-full text-zinc-400 hover:text-white"
          title="Toggle Fullscreen"
        >
          <Maximize2 size={12} />
        </button>
      </div>
    </div>
  );
}
