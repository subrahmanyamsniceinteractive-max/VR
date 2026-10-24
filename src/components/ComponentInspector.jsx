import React from 'react';
import { X, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
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
      <div className="navy-glass rounded-2xl p-6 border border-[#2589FF]/30 shadow-2xl relative">
        {/* Category Header & Close */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col">
            <span className="spec-tag text-[#A9BCD5]">
              {comp.groupName.split('—')[1] || comp.groupName} • {String(currentIndex + 1).padStart(2, '0')}/{dataList.length}
            </span>
            <span className="text-xs text-[#2589FF] font-semibold tracking-tight mt-0.5">
              {comp.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="navy-pill-btn w-6 h-6 rounded-full text-[#A9BCD5] hover:text-[#F4F8FF]"
            title="Deselect Component"
          >
            <X size={13} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#F4F8FF] tracking-tight mb-2">
          {comp.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#A9BCD5] leading-relaxed mb-4 font-normal">
          {comp.description}
        </p>

        {/* Engineering Architecture & Specifications in Ice-White Tech Card */}
        <div className="light-tech-card rounded-xl p-3.5 mb-4">
          <div className="text-[10px] font-mono text-[#2589FF] uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5">
            <Cpu size={12} />
            <span>Engineering Specifications</span>
          </div>
          <p className="text-[11px] font-mono text-[#10233B] leading-relaxed font-medium">
            {comp.specs}
          </p>
        </div>

        {/* Coordinate Offsets */}
        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[10px]">
          <div className="bg-[#071426]/70 rounded p-2 border border-[#2589FF]/20">
            <span className="text-[#A9BCD5] block text-[9px]">ASSEMBLED [XYZ]</span>
            <span className="text-[#F4F8FF]">
              {comp.assembled[0]}, {comp.assembled[1]}, {comp.assembled[2]}
            </span>
          </div>
          <div className="bg-[#071426]/70 rounded p-2 border border-[#2589FF]/20">
            <span className="text-[#A9BCD5] block text-[9px]">EXPLODED [XYZ]</span>
            <span className="text-[#2589FF] font-semibold">
              {comp.exploded[0]}, {comp.exploded[1]}, {comp.exploded[2]}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#2589FF]/20">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="navy-pill-btn w-7 h-7 rounded-lg text-[#A9BCD5] hover:text-[#F4F8FF]"
              title="Previous Component"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNext}
              className="navy-pill-btn w-7 h-7 rounded-lg text-[#A9BCD5] hover:text-[#F4F8FF]"
              title="Next Component"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="navy-pill-btn px-3 h-7 rounded-lg text-xs font-mono text-[#F4F8FF] hover:border-[#2589FF]"
          >
            Return to Assembly
          </button>
        </div>
      </div>
    </div>
  );
}