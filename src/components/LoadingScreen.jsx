import React from 'react';

export default function LoadingScreen({ progress = 0 }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#071426] flex flex-col items-center justify-center p-6 select-none">
      {/* Subtle Blue Glow Ambient Effect */}
      <div className="absolute w-96 h-96 rounded-full bg-[#174A83]/20 blur-3xl pointer-events-none" />

      {/* Title */}
      <h1 className="text-xl font-semibold text-[#F4F8FF] tracking-tight mb-1 relative z-10">
        Spatial Architecture
      </h1>
      <p className="text-xs font-mono text-[#A9BCD5] tracking-wider mb-8 uppercase relative z-10">
        Calibrating Photorealistic 3D Subassemblies
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs flex flex-col gap-2 relative z-10">
        <div className="w-full h-1.5 bg-[#102A4C] rounded-full overflow-hidden border border-[#2589FF]/30">
          <div
            className="h-full bg-[#2589FF] shadow-[0_0_12px_#2589FF] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-[#A9BCD5]">
          <span>HARDWARE ASSETS</span>
          <span className="text-[#2589FF] font-semibold">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}