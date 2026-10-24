import React, { useState } from 'react';
import { Search, X, Layers } from 'lucide-react';
import componentsData from '../data/componentsData.json';

export default function ComponentDrawer({
  isOpen,
  onClose,
  selectedId,
  onSelectComponent,
  components = [],
  title = "Component Directory"
}) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const dataList = components.length > 0 ? components : componentsData;

  const filteredComponents = dataList.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(search.toLowerCase()) ||
                          comp.specs.toLowerCase().includes(search.toLowerCase()) ||
                          comp.category.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-full max-w-md navy-glass border-r border-[#2589FF]/30 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-[#2589FF]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2589FF]/10 border border-[#2589FF]/30 flex items-center justify-center text-[#2589FF]">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-[#F4F8FF] text-sm">{title}</h2>
            <p className="text-[10px] font-mono text-[#A9BCD5]">{dataList.length} Precision Subassemblies</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="navy-pill-btn w-7 h-7 rounded-full text-[#A9BCD5] hover:text-[#F4F8FF]"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-[#2589FF]/20">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2589FF]" />
          <input
            type="text"
            placeholder="Search optics, silicon, battery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#071426]/70 border border-[#2589FF]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F8FF] placeholder-[#A9BCD5]/60 focus:outline-none focus:border-[#2589FF] font-mono"
          />
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredComponents.map((comp, idx) => {
          const isSelected = comp.id === selectedId;

          return (
            <div
              key={comp.id}
              onClick={() => onSelectComponent(comp.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#2589FF]/20 border-[#2589FF] shadow-[0_0_12px_rgba(37,137,255,0.25)]'
                  : 'bg-[#071426]/50 border-[#2589FF]/15 hover:border-[#2589FF]/40 hover:bg-[#102A4C]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="spec-tag text-[#2589FF] font-semibold">
                  {comp.category}
                </span>
                <span className="text-[10px] font-mono text-[#A9BCD5]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <h4 className={`text-xs font-semibold tracking-tight mb-1 ${
                isSelected ? 'text-[#F4F8FF]' : 'text-[#F4F8FF]/90'
              }`}>
                {comp.name}
              </h4>

              <p className="text-xs text-[#A9BCD5] line-clamp-2 leading-relaxed font-normal">
                {comp.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}