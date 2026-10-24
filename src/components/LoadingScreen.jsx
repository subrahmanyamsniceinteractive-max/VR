import React from 'react';

export default function LoadingScreen({ progress = 0 }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#08172B] flex flex-col items-center justify-center p-6 select-none">
      {/* Subtle Blue Glow Ambient Effect */}
      <div className="absolute w-96 h-96 rounded-full bg-[#173B65]/35 blur-3xl pointer-events-none" />

      {/* Title */}
      <h1 className="text-xl font-semibold text-[#F4F7FC] tracking-tight mb-1 relative z-10">
        Spatial Architecture
      </h1>
      <p className="text-xs font-mono text-[#B5C5DA] tracking-wider mb-8 uppercase relative z-10">
        Calibrating Photorealistic 3D Subassemblies
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs flex flex-col gap-2 relative z-10">
        <div className="w-full h-1.5 bg-[#102744] rounded-full overflow-hidden border border-[#398BFF]/30">
          <div
            className="h-full bg-[#398BFF] shadow-[0_0_12px_#398BFF] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-[#B5C5DA]">
          <span>HARDWARE ASSETS</span>
          <span className="text-[#398BFF] font-semibold">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
