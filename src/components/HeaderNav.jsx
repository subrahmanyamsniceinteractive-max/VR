import React from 'react';
import { Layers, Compass, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HeaderNav({
  headsetType = 'quest3',
  onSelectHeadset,
  mode = 'studio',
  onSwitchMode,
  onOpenDrawer,
  onOpenGuide,
  modelStats
}) {
  const meshCount = modelStats?.meshCount || 18;
  const facesCount = modelStats?.totalFaces ? `${Math.round(modelStats.totalFaces / 1000)}k` : '109k';

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-5 md:px-10 py-5 flex items-center justify-between pointer-events-none">
      {/* Brand & Editorial Title */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-white text-base tracking-tight">
              {headsetType === 'quest3' ? 'Meta Quest 3' : 'Apple Vision Pro'}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase">
            Product Engineering Visualization
          </span>
        </div>

        {/* Headset Switcher */}
        <div className="hidden sm:flex items-center apple-glass p-1 rounded-full ml-1">
          <button
            onClick={() => onSelectHeadset('quest3')}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              headsetType === 'quest3'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Quest 3
          </button>
          <button
            onClick={() => onSelectHeadset('vision_pro')}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              headsetType === 'vision_pro'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Vision Pro
          </button>
        </div>

        {/* Real-time Verified Model Badge */}
        <button
          onClick={onOpenGuide}
          className="hidden lg:flex items-center gap-1.5 apple-glass px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-300 hover:text-white hover:border-zinc-500 transition-all cursor-pointer"
          title="Inspect 3D Model Hierarchy & Polygon Counts"
        >
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>{meshCount} Parts • {facesCount} Polys</span>
        </button>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mode Toggle Button */}
        <div className="apple-glass p-1 rounded-full flex items-center gap-1">
          <button
            onClick={() => onSwitchMode('studio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'studio'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass size={13} />
            <span>Studio</span>
          </button>

          <button
            onClick={() => onSwitchMode('story')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'story'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>Story</span>
          </button>
        </div>

        {/* Model Asset Audit / Specs */}
        <button
          onClick={onOpenGuide}
          className="apple-pill-btn px-3 h-8 rounded-full text-xs text-zinc-300 hover:text-white gap-1.5"
          title="3D Model Engineering Inspection & Specs"
        >
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span className="hidden md:inline">Asset Audit</span>
        </button>

        {/* Component Drawer */}
        <button
          onClick={onOpenDrawer}
          className="apple-pill-btn px-3 h-8 rounded-full text-xs text-zinc-200 hover:text-white gap-1.5"
        >
          <Layers size={13} />
          <span className="hidden sm:inline">Components</span>
        </button>
      </div>
    </header>
  );
}