import React from 'react';
import { X, CheckCircle2, ChevronLeft, ChevronRight, Focus, ShieldCheck } from 'lucide-react';
import componentsData from '../data/componentsData.json';

export default function ComponentInspector({
  selectedId,
  onClose,
  onSelectComponent,
  components = []
}) {
  if (!selectedId) return null;

  const dataList = components.length > 0 ? components : componentsData;
  const currentIndex = dataList.findIndex(c => c.id === selectedId);
  const comp = dataList[currentIndex] || dataList[0];

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + dataList.length) % dataList.length;
    onSelectComponent(dataList[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % dataList.length;
    onSelectComponent(dataList[nextIdx].id);
  };

  return (
    <div className="absolute top-20 right-6 z-30 w-full max-w-sm pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="glass-panel-glow rounded-2xl p-5 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background scanner line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

        {/* Header with Group Tag & Close */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="tech-badge">{comp.groupName}</span>
              {comp.verified && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <ShieldCheck size={11} />
                  VERIFIED
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              {comp.category} • PART {String(currentIndex + 1).padStart(2, '0')}/{dataList.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="glass-btn w-7 h-7 rounded-full text-slate-400 hover:text-white"
            title="Deselect Component"
          >
            <X size={14} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white tracking-tight mb-2 font-display">
          {comp.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {comp.description}
        </p>

        {/* Verified Specifications */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 mb-4">
          <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Hardware Architecture & Specifications
          </div>
          <p className="text-[11px] font-mono text-slate-300 leading-normal">
            {comp.specs}
          </p>
        </div>

        {/* Coordinates Telemetry */}
        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[10px]">
          <div className="bg-slate-900/60 rounded p-2 border border-slate-800/80">
            <span className="text-slate-500 block">ASSEMBLED COORD</span>
            <span className="text-slate-300 font-bold">
              X:{comp.assembled[0]} Y:{comp.assembled[1]} Z:{comp.assembled[2]}
            </span>
          </div>
          <div className="bg-slate-900/60 rounded p-2 border border-slate-800/80">
            <span className="text-slate-500 block">EXPLODED COORD</span>
            <span className="text-sky-400 font-bold">
              X:{comp.exploded[0]} Y:{comp.exploded[1]} Z:{comp.exploded[2]}
            </span>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="glass-btn w-8 h-8 rounded-lg text-slate-400 hover:text-white"
              title="Previous Part"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="glass-btn w-8 h-8 rounded-lg text-slate-400 hover:text-white"
              title="Next Part"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="glass-btn px-3 h-8 rounded-lg text-xs font-mono text-slate-300 hover:text-white"
          >
            Return to View
          </button>
        </div>
      </div>
    </div>
  );
}
