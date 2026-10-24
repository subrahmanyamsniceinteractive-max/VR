import React, { useState } from 'react';
import { 
  Palette, 
  X, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Sliders, 
  SunMedium, 
  Layers,
  Box,
  Eye
} from 'lucide-react';
import { 
  THEME_PRESETS, 
  DEFAULT_THEME, 
  isValidHex, 
  normalizeHex 
} from '../utils/themeManager';

export default function ThemeCustomizer({
  currentTheme,
  onUpdateTheme,
  onResetTheme
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'

  // Temporary local string state for text inputs so users can type freely before validating
  const [hexInputs, setHexInputs] = useState({
    mainBg: currentTheme.mainBg,
    secondaryBg: currentTheme.secondaryBg,
    accentColor: currentTheme.accentColor,
    textPrimary: currentTheme.textPrimary,
    sceneBg: currentTheme.sceneBg,
    glowColor: currentTheme.glowColor
  });

  // Keep hexInputs in sync if currentTheme changes externally (e.g. preset clicked)
  React.useEffect(() => {
    setHexInputs({
      mainBg: currentTheme.mainBg,
      secondaryBg: currentTheme.secondaryBg,
      accentColor: currentTheme.accentColor,
      textPrimary: currentTheme.textPrimary,
      sceneBg: currentTheme.sceneBg,
      glowColor: currentTheme.glowColor
    });
  }, [currentTheme]);

  const handleColorChange = (key, value) => {
    setHexInputs(prev => ({ ...prev, [key]: value }));
    if (isValidHex(value)) {
      const normalized = normalizeHex(value);
      onUpdateTheme({
        ...currentTheme,
        id: 'custom',
        name: 'Custom Theme',
        [key]: normalized
      });
    }
  };

  const handlePresetSelect = (preset) => {
    onUpdateTheme(preset);
  };

  const colorItems = [
    {
      key: 'mainBg',
      label: 'Main Background',
      desc: 'Primary website backdrop & body background',
      icon: <Layers size={14} />
    },
    {
      key: 'secondaryBg',
      label: 'Secondary Surface',
      desc: 'Cards, navigation bars, drawer & panel backgrounds',
      icon: <Box size={14} />
    },
    {
      key: 'accentColor',
      label: 'Accent Highlight',
      desc: 'Interactive buttons, active toggles & rim lighting',
      icon: <Sparkles size={14} />
    },
    {
      key: 'textPrimary',
      label: 'Heading & Text',
      desc: 'Primary typography & high-contrast titles',
      icon: <Eye size={14} />
    },
    {
      key: 'sceneBg',
      label: '3D Scene Background',
      desc: 'Three.js outer perimeter & atmospheric fog',
      icon: <SunMedium size={14} />
    },
    {
      key: 'glowColor',
      label: 'Studio Lighting & Glow',
      desc: 'Radial studio core & ambient lighting fill',
      icon: <Sliders size={14} />
    }
  ];

  return (
    <>
      {/* Floating Palette Trigger Button on the right side */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="navy-glass w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-[var(--accent-color)]/40 hover:border-[var(--accent-color)]"
          title="Customize Website & 3D Studio Colors"
          aria-label="Open Theme Customizer"
        >
          <Palette 
            size={20} 
            className="text-[var(--accent-color)] group-hover:rotate-45 transition-transform duration-300" 
          />
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none navy-glass text-[var(--text-primary)] border border-[var(--accent-color)]/30 shadow-lg">
            Theme Customizer
          </span>
        </button>
      </div>

      {/* Slide-out / Floating Customization Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-3 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Click to Close */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsOpen(false)} 
            aria-hidden="true" 
          />

          <div 
            className="relative w-full max-w-sm sm:max-w-md navy-glass rounded-3xl p-5 sm:p-6 border border-[var(--accent-color)]/30 shadow-2xl max-h-[92vh] flex flex-col z-10 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--accent-color)]/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/30 flex items-center justify-center text-[var(--accent-color)]">
                  <Palette size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
                      Theme Customizer
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[var(--accent-color)]/15 text-[var(--accent-color)] font-semibold border border-[var(--accent-color)]/30 uppercase">
                      Live Preview
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                    Real-time Studio & UI Palette Engine
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="navy-pill-btn w-8 h-8 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Close Customizer"
              >
                <X size={15} />
              </button>
            </div>

            {/* View Selector Tabs (Presets vs Fine-Tuning) */}
            <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-primary)]/50 rounded-xl my-4 border border-[var(--accent-color)]/20 shrink-0 text-xs font-medium">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-[var(--accent-color)] text-[#FFFFFF] font-semibold shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles size={13} />
                <span>Preset Themes (5)</span>
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'custom'
                    ? 'bg-[var(--accent-color)] text-[#FFFFFF] font-semibold shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sliders size={13} />
                <span>Custom Color Pickers</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              {/* Tab 1: One-Click Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-wider px-1">
                    <span>Curated Aesthetic Presets</span>
                    <span>1-Click Live Sync</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {THEME_PRESETS.map((preset) => {
                      const isActive = currentTheme.id === preset.id || 
                        (currentTheme.mainBg === preset.mainBg && currentTheme.accentColor === preset.accentColor);

                      return (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isActive
                              ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)] shadow-[0_0_16px_rgba(var(--accent-rgb),0.3)]'
                              : 'bg-[var(--bg-primary)]/40 border-[var(--accent-color)]/15 hover:border-[var(--accent-color)]/40 hover:bg-[var(--bg-secondary)]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Preset 4-Color Swatch Circles */}
                            <div className="flex items-center -space-x-1.5 shrink-0 p-1 bg-[var(--bg-primary)]/80 rounded-full border border-[var(--accent-color)]/20">
                              {preset.swatches.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`text-xs font-semibold tracking-tight ${
                                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]/90'
                                }`}>
                                  {preset.name}
                                </h4>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--text-secondary)] font-normal line-clamp-1 mt-0.5">
                                {preset.description}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isActive ? (
                              <div className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center shadow">
                                <Check size={13} />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-[var(--accent-color)]/30 flex items-center justify-center opacity-40 hover:opacity-100">
                                <div className="w-2 h-2 rounded-full bg-[var(--text-secondary)]" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Custom Live Color Pickers */}
              {activeTab === 'custom' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-wider px-1">
                    <span>Precision Hex & Color Controls</span>
                    <span>Real-time DOM & WebGL</span>
                  </div>

                  <div className="space-y-2">
                    {colorItems.map((item) => {
                      const currentColor = currentTheme[item.key] || '#000000';
                      const inputVal = hexInputs[item.key] || currentColor;

                      return (
                        <div
                          key={item.key}
                          className="p-3 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--accent-color)]/20 hover:border-[var(--accent-color)]/40 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center shrink-0 border border-[var(--accent-color)]/20">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-medium text-[var(--text-primary)] block truncate">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                                {item.desc}
                              </span>
                            </div>
                          </div>

                          {/* Color Swatch Picker + Manual HEX Input */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Color Swatch with overlaid input type="color" */}
                            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/20 shadow-inner shrink-0 cursor-pointer group">
                              <div
                                className="w-full h-full"
                                style={{ backgroundColor: isValidHex(currentColor) ? currentColor : '#000000' }}
                              />
                              <input
                                type="color"
                                value={isValidHex(currentColor) ? currentColor : '#000000'}
                                onChange={(e) => handleColorChange(item.key, e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                title={`Pick ${item.label}`}
                              />
                            </div>

                            {/* Manual Hex Input */}
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={7}
                                value={inputVal}
                                onChange={(e) => handleColorChange(item.key, e.target.value)}
                                className="w-20 px-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--accent-color)]/30 text-xs font-mono text-[var(--text-primary)] text-center focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Informational Live Sync Note */}
              <div className="p-3 rounded-xl bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--accent-color)] shrink-0" />
                <span>
                  All changes immediately update CSS variables, 3D radial studio lighting, and persistent browser storage.
                </span>
              </div>

            </div>

            {/* Footer with Reset and Done Buttons */}
            <div className="pt-4 mt-3 border-t border-[var(--accent-color)]/20 flex items-center justify-between shrink-0 gap-3">
              <button
                onClick={onResetTheme}
                className="navy-pill-btn px-3.5 py-2 rounded-xl text-xs gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Reset to Factory Midnight Blue Theme"
              >
                <RotateCcw size={12} className="text-[var(--accent-color)]" />
                <span>Reset to Default</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="blue-action-btn px-5 py-2 rounded-xl text-xs"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
