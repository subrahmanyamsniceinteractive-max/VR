import React from 'react';

export default function LoadingScreen({ progress = 0 }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#08090c] flex flex-col items-center justify-center p-6 select-none">
      {/* Title */}
      <h1 className="text-xl font-semibold text-white tracking-tight mb-1">
        Spatial Architecture
      </h1>
      <p className="text-xs font-mono text-zinc-500 tracking-wider mb-8 uppercase">
        Initializing 3D Subassemblies
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
          <span>HARDWARE ASSETS</span>
          <span className="text-zinc-300">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
