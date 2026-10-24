import React from 'react';

export default function LoadingScreen({ progress = 0 }) {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 select-none transition-colors duration-300">
      {/* Subtle Glow Ambient Effect */}
      <div className="absolute w-96 h-96 rounded-full bg-[var(--gradient-glow)]/35 blur-3xl pointer-events-none" />

      {/* Title */}
      <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight mb-1 relative z-10">
        Spatial Architecture
      </h1>
      <p className="text-xs font-mono text-[var(--text-secondary)] tracking-wider mb-8 uppercase relative z-10">
        Calibrating Photorealistic 3D Subassemblies
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs flex flex-col gap-2 relative z-10">
        <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--accent-color)]/30">
          <div
            className="h-full bg-[var(--accent-color)] shadow-[0_0_12px_var(--accent-color)] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-secondary)]">
          <span>HARDWARE ASSETS</span>
          <span className="text-[var(--accent-color)] font-semibold">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
