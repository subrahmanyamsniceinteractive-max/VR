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
    <div className="fixed inset-y-0 left-0 z-40 w-full max-w-md apple-glass border-r border-white/10 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">{title}</h2>
            <p className="text-[10px] font-mono text-zinc-400">{dataList.length} Precision Subassemblies</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="apple-pill-btn w-7 h-7 rounded-full text-zinc-400 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search optics, silicon, battery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
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
                  ? 'bg-white/10 border-white/30 shadow-md'
                  : 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="spec-tag text-zinc-400">
                  {comp.category}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <h4 className={`text-xs font-semibold tracking-tight mb-1 ${
                isSelected ? 'text-white' : 'text-zinc-200'
              }`}>
                {comp.name}
              </h4>

              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                {comp.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
