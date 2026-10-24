import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Box, 
  Eye, 
  Maximize2, 
  Sliders, 
  Compass, 
  ArrowRightLeft,
  Info
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
  componentsCount = 14
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
    { id: 'iso', label: '3/4 Iso' },
    { id: 'side', label: 'Profile' },
    { id: 'top', label: 'Top' },
    { id: 'internal', label: 'Optics' },
    { id: 'rear', label: 'Rear' }
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 w-full max-w-4xl px-4 pointer-events-none">
      {/* Upper Micro-HUD: Timeline Scrubber & Intensity */}
      <div className="w-full glass-panel rounded-2xl px-5 py-3 pointer-events-auto flex flex-wrap items-center justify-between gap-4 border border-sky-500/20 shadow-2xl">
        {/* Play/Pause & Assemble/Disassemble */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="glass-btn w-9 h-9 rounded-xl text-sky-400 hover:text-white"
            title={isPlaying ? "Pause Disassembly Sequence" : "Play Cinematic Disassembly"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <button
            onClick={onToggleExplode}
            className={`px-3.5 h-9 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 transition-all ${
              isExploded 
                ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30' 
                : 'glass-btn text-sky-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>{isExploded ? 'ASSEMBLE' : 'EXPLODE'}</span>
          </button>
        </div>

        {/* Timeline Progress Slider */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <span className="font-mono text-[11px] text-slate-400">DISASSEMBLY</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300"
            />
          </div>
          <span className="font-mono text-xs font-bold text-sky-400 min-w-[36px] text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* Intensity Adjustment */}
        <div className="hidden sm:flex items-center gap-2 border-l border-slate-700/60 pl-4">
          <span className="font-mono text-[11px] text-slate-400">SPREAD</span>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.05"
            value={intensity}
            onChange={(e) => onChangeIntensity(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-sky-400"
            title="Separation Distance Multiplier"
          />
          <span className="font-mono text-[11px] text-slate-300 min-w-[28px]">
            {intensity.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Lower Dock: Camera Presets & Utilities */}
      <div className="glass-panel rounded-full px-4 py-2 pointer-events-auto flex items-center gap-1.5 border border-sky-500/20 shadow-xl overflow-x-auto max-w-full">
        {/* Reset Camera */}
        <button
          onClick={onResetCamera}
          className="glass-btn px-3 h-8 rounded-full text-xs font-mono text-slate-300 gap-1.5"
          title="Reset Camera Position"
        >
          <RotateCcw size={12} />
          <span className="hidden md:inline">RESET</span>
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        {/* Presets */}
        <div className="flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectCameraPreset(p.id)}
              className={`px-2.5 h-7 rounded-full text-[11px] font-mono transition-all ${
                cameraPreset === p.id 
                  ? 'bg-sky-500/25 text-sky-300 border border-sky-400/50' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        {/* Labels Toggle */}
        <button
          onClick={onToggleLabels}
          className={`glass-btn px-2.5 h-8 rounded-full text-xs font-mono gap-1.5 ${
            showLabels ? 'text-sky-400 border-sky-500/40 bg-sky-500/10' : 'text-slate-400'
          }`}
          title="Toggle 3D Technical Labels"
        >
          <Eye size={13} />
          <span className="hidden sm:inline">LABELS</span>
        </button>

        {/* Component Drawer Toggle */}
        <button
          onClick={onToggleDrawer}
          className={`glass-btn px-3 h-8 rounded-full text-xs font-mono gap-1.5 ${
            isDrawerOpen ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-300'
          }`}
          title="Inspect All Hardware Components"
        >
          <Box size={13} />
          <span>PARTS ({componentsCount})</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="glass-btn w-8 h-8 rounded-full text-slate-400 hover:text-white"
          title="Toggle Fullscreen"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
}
