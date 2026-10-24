import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="absolute top-20 right-6 z-30 w-full max-w-sm pointer-events-auto">
      <div className="apple-glass rounded-2xl p-6 border border-white/10 shadow-2xl relative">
        {/* Category Header & Close */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col">
            <span className="spec-tag text-zinc-400">
              {comp.groupName.split('—')[1] || comp.groupName} • {String(currentIndex + 1).padStart(2, '0')}/{dataList.length}
            </span>
            <span className="text-xs text-zinc-400 font-medium tracking-tight mt-0.5">
              {comp.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="apple-pill-btn w-6 h-6 rounded-full text-zinc-400 hover:text-white"
            title="Deselect Component"
          >
            <X size={13} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
          {comp.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed mb-4 font-normal">
          {comp.description}
        </p>

        {/* Engineering Architecture & Specifications */}
        <div className="bg-zinc-950/70 rounded-xl p-3.5 border border-zinc-800/80 mb-4">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">
            Engineering Specifications
          </div>
          <p className="text-[11px] font-mono text-zinc-300 leading-relaxed">
            {comp.specs}
          </p>
        </div>

        {/* Coordinate Offsets */}
        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[10px]">
          <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800">
            <span className="text-zinc-500 block">ASSEMBLED [XYZ]</span>
            <span className="text-zinc-300">
              {comp.assembled[0]}, {comp.assembled[1]}, {comp.assembled[2]}
            </span>
          </div>
          <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800">
            <span className="text-zinc-500 block">EXPLODED [XYZ]</span>
            <span className="text-zinc-100 font-medium">
              {comp.exploded[0]}, {comp.exploded[1]}, {comp.exploded[2]}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="apple-pill-btn w-7 h-7 rounded-lg text-zinc-400 hover:text-white"
              title="Previous Component"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNext}
              className="apple-pill-btn w-7 h-7 rounded-lg text-zinc-400 hover:text-white"
              title="Next Component"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="apple-pill-btn px-3 h-7 rounded-lg text-xs font-mono text-zinc-300 hover:text-white"
          >
            Return to Assembly
          </button>
        </div>
      </div>
    </div>
  );
}
