import React, { useState } from 'react';
import { Search, X, Layers, Box, Check, Cpu, Eye, Battery, Shield, Compass } from 'lucide-react';
import componentsData from '../data/componentsData.json';

export default function ComponentDrawer({
  isOpen,
  onClose,
  selectedId,
  onSelectComponent
}) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('ALL');

  if (!isOpen) return null;

  const groups = [
    { id: 'ALL', label: 'All Parts', count: 18 },
    { id: 'group_exterior', label: 'Exterior', count: 4, icon: Box },
    { id: 'group_optics', label: 'Optics', count: 4, icon: Eye },
    { id: 'group_electronics', label: 'Compute', count: 5, icon: Cpu },
    { id: 'group_power', label: 'Power', count: 2, icon: Battery },
    { id: 'group_comfort', label: 'Fit & Comfort', count: 3, icon: Shield }
  ];

  const filteredComponents = componentsData.filter(comp => {
    const matchesGroup = activeGroup === 'ALL' || comp.group === activeGroup;
    const matchesSearch = comp.name.toLowerCase().includes(search.toLowerCase()) ||
                          comp.specs.toLowerCase().includes(search.toLowerCase()) ||
                          comp.category.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-full max-w-md glass-panel-glow border-r border-sky-500/30 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base">Meta Quest 3 Assembly</h2>
            <p className="text-[11px] font-mono text-slate-400">18 VERIFIED HARDWARE SUBASSEMBLIES</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="glass-btn w-8 h-8 rounded-full text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Snapdragon, pancake optics, battery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeGroup === g.id
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{g.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeGroup === g.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {g.count}
            </span>
          </button>
        ))}
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
                  ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono text-sky-400/90 font-bold uppercase tracking-wider">
                  {comp.groupName.split('—')[1] || comp.groupName}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  PART {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <h4 className={`text-sm font-semibold tracking-tight mb-1 ${
                isSelected ? 'text-white' : 'text-slate-200'
              }`}>
                {comp.name}
              </h4>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {comp.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
