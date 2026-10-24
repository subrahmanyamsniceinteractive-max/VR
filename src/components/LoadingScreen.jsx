import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function LoadingScreen({ progress = 0 }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#070913] flex flex-col items-center justify-center p-6 select-none">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />

      {/* Futuristic Spinner Reticle */}
      <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 border-r-sky-500/40 animate-spin" />
        {/* Counter rotating ring */}
        <div className="absolute inset-2 rounded-full border border-transparent border-b-indigo-400 border-l-indigo-500/30 animate-[spin_3s_linear_infinite_reverse]" />
        {/* Inner pulsing core */}
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/20">
          <Cpu size={24} className="animate-pulse" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight mb-2">
        META QUEST 3
      </h1>
      <p className="text-xs font-mono text-sky-400 tracking-wider mb-8 uppercase">
        Interactive 3D Exploded View • Hardware Teardown
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(56,189,248,0.5)]"
            style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
          <span>INITIALIZING 3D GLB ASSETS</span>
          <span className="text-sky-400 font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Telemetry info */}
      <div className="mt-12 flex items-center gap-4 text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-sky-500" /> 18 MESH NODES
        </span>
        <span>•</span>
        <span>PBR TEXTURE BUFFERS</span>
        <span>•</span>
        <span>WEBGL 2.0 READY</span>
      </div>
    </div>
  );
}
