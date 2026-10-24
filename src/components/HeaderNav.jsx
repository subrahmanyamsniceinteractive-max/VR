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
            <h1 className="font-semibold text-[#F4F8FF] text-base tracking-tight">
              {headsetType === 'quest3' ? 'Meta Quest 3' : 'Apple Vision Pro'}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2589FF] shadow-[0_0_8px_#2589FF]" />
          </div>
          <span className="font-mono text-[10px] text-[#A9BCD5] tracking-wider uppercase">
            Product Engineering Visualization
          </span>
        </div>

        {/* Headset Switcher */}
        <div className="hidden sm:flex items-center navy-glass p-1 rounded-full ml-1">
          <button
            onClick={() => onSelectHeadset('quest3')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              headsetType === 'quest3'
                ? 'bg-[#2589FF] text-[#F4F8FF] shadow-[0_0_12px_rgba(37,137,255,0.45)]'
                : 'text-[#A9BCD5] hover:text-[#F4F8FF]'
            }`}
          >
            Quest 3
          </button>
          <button
            onClick={() => onSelectHeadset('vision_pro')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              headsetType === 'vision_pro'
                ? 'bg-[#2589FF] text-[#F4F8FF] shadow-[0_0_12px_rgba(37,137,255,0.45)]'
                : 'text-[#A9BCD5] hover:text-[#F4F8FF]'
            }`}
          >
            Vision Pro
          </button>
        </div>

        {/* Real-time Verified Model Badge */}
        <button
          onClick={onOpenGuide}
          className="hidden lg:flex items-center gap-1.5 navy-glass px-2.5 py-1 rounded-full text-[11px] font-mono text-[#F4F8FF] hover:border-[#2589FF] transition-all cursor-pointer"
          title="Inspect 3D Model Hierarchy & Polygon Counts"
        >
          <ShieldCheck size={12} className="text-[#2589FF]" />
          <span className="text-[#A9BCD5]">{meshCount} Parts • <strong className="text-[#F4F8FF]">{facesCount} Polys</strong></span>
        </button>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mode Toggle Button */}
        <div className="navy-glass p-1 rounded-full flex items-center gap-1">
          <button
            onClick={() => onSwitchMode('studio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'studio'
                ? 'bg-[#2589FF] text-[#F4F8FF] shadow-[0_0_12px_rgba(37,137,255,0.45)]'
                : 'text-[#A9BCD5] hover:text-[#F4F8FF]'
            }`}
          >
            <Compass size={13} />
            <span>Studio</span>
          </button>

          <button
            onClick={() => onSwitchMode('story')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'story'
                ? 'bg-[#2589FF] text-[#F4F8FF] shadow-[0_0_12px_rgba(37,137,255,0.45)]'
                : 'text-[#A9BCD5] hover:text-[#F4F8FF]'
            }`}
          >
            <Sparkles size={13} />
            <span>Story</span>
          </button>
        </div>

        {/* Model Asset Audit / Specs */}
        <button
          onClick={onOpenGuide}
          className="navy-pill-btn px-3 h-8 rounded-full text-xs gap-1.5"
          title="3D Model Engineering Inspection & Specs"
        >
          <CheckCircle2 size={13} className="text-[#2589FF]" />
          <span className="hidden md:inline">Asset Audit</span>
        </button>

        {/* Component Drawer */}
        <button
          onClick={onOpenDrawer}
          className="navy-pill-btn px-3 h-8 rounded-full text-xs gap-1.5"
        >
          <Layers size={13} />
          <span className="hidden sm:inline">Components</span>
        </button>
      </div>
    </header>
  );
}