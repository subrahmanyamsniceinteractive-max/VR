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
    <div className="fixed inset-y-0 left-0 z-40 w-full max-w-md navy-glass border-r border-[var(--accent-color)]/30 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-[var(--accent-color)]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 flex items-center justify-center text-[var(--accent-color)]">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)] text-sm">{title}</h2>
            <p className="text-[10px] font-mono text-[var(--text-secondary)]">{dataList.length} Precision Subassemblies</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="navy-pill-btn w-7 h-7 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-[var(--accent-color)]/20">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-color)]" />
          <input
            type="text"
            placeholder="Search optics, silicon, battery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-primary)]/70 border border-[var(--accent-color)]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--accent-color)] font-mono"
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
                  ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)] shadow-[0_0_12px_rgba(var(--accent-rgb),0.25)]'
                  : 'bg-[var(--bg-primary)]/50 border-[var(--accent-color)]/15 hover:border-[var(--accent-color)]/40 hover:bg-[var(--bg-secondary)]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="spec-tag text-[var(--accent-color)] font-semibold">
                  {comp.category}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <h4 className={`text-xs font-semibold tracking-tight mb-1 ${
                isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]/90'
              }`}>
                {comp.name}
              </h4>

              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-normal">
                {comp.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
