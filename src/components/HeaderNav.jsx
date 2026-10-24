import React from 'react';
import { Layers, Compass, Sparkles, BookOpen } from 'lucide-react';

export default function HeaderNav({
  headsetType = 'vision_pro',
  onSelectHeadset,
  mode = 'studio', // 'studio' | 'story'
  onSwitchMode,
  onOpenDrawer,
  onOpenGuide
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-6 py-5 flex items-center justify-between pointer-events-none">
      {/* Brand & Headset Selector */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
              {headsetType === 'vision_pro' ? ' APPLE VISION PRO' : 'META QUEST 3'}
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="font-mono text-[10px] text-sky-400/80 tracking-widest uppercase">
            Spatial Computing 3D Exploded View
          </span>
        </div>

        {/* Headset Switcher Pill */}
        <div className="hidden sm:flex items-center glass-panel p-1 rounded-full border border-sky-500/20 ml-2">
          <button
            onClick={() => onSelectHeadset('vision_pro')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1 ${
              headsetType === 'vision_pro'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span> VISION PRO</span>
          </button>
          <button
            onClick={() => onSelectHeadset('quest3')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1 ${
              headsetType === 'quest3'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>QUEST 3</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher & Tools */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Mode Toggle Button */}
        <div className="glass-panel p-1 rounded-full flex items-center gap-1 border border-sky-500/20">
          <button
            onClick={() => onSwitchMode('studio')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              mode === 'studio'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={13} />
            <span>3D STUDIO</span>
          </button>

          <button
            onClick={() => onSwitchMode('story')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              mode === 'story'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>STORY TOUR</span>
          </button>
        </div>

        {/* 3D Model Guide */}
        <button
          onClick={onOpenGuide}
          className="glass-btn px-3 h-8 rounded-full text-xs font-mono text-slate-300 hover:text-white gap-1.5"
          title="3D Model Pipeline & Architecture Guide"
        >
          <BookOpen size={13} />
          <span className="hidden md:inline">GUIDE</span>
        </button>

        {/* Parts Directory */}
        <button
          onClick={onOpenDrawer}
          className="glass-btn px-3 h-8 rounded-full text-xs font-mono text-sky-400 border-sky-500/30 hover:border-sky-400 gap-1.5"
        >
          <Layers size={13} />
          <span className="hidden sm:inline">PARTS</span>
        </button>
      </div>
    </header>
  );
}
