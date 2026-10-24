import React from 'react';
import { X, FileCode, CheckCircle, UploadCloud, Terminal } from 'lucide-react';

export default function ModelReplacementGuide({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel-glow rounded-3xl p-6 md:p-8 border border-sky-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">3D Model Pipeline & Replacement Guide</h2>
              <p className="text-xs font-mono text-slate-400">HOW TO INTEGRATE CUSTOM CAD OR GLB MODELS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-btn w-8 h-8 rounded-full text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Instructions Body */}
        <div className="space-y-6 text-xs text-slate-300">
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle size={15} className="text-sky-400" />
              1. Asset File Location & Format
            </h3>
            <p className="leading-relaxed text-slate-300 mb-2">
              The primary 3D asset is stored at <code className="bg-slate-900 px-2 py-0.5 rounded text-sky-300 font-mono">public/models/quest3_exploded.glb</code>. 
              The application utilizes standard glTF 2.0 binary (<code className="text-sky-300 font-mono">.glb</code>) with physically based rendering (PBR) materials.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FileCode size={15} className="text-sky-400" />
              2. Required Mesh Node Naming Convention
            </h3>
            <p className="leading-relaxed mb-3">
              To ensure individual component selection, exploded view translation, and camera focusing function properly, your replacement model should contain discrete meshes named with the following IDs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-sky-400 block font-bold mb-1">GROUP A & B</span>
                <ul className="space-y-1 text-slate-400">
                  <li>• <code className="text-slate-200">exterior_faceplate</code></li>
                  <li>• <code className="text-slate-200">exterior_housing</code></li>
                  <li>• <code className="text-slate-200">exterior_sensors</code></li>
                  <li>• <code className="text-slate-200">exterior_side_arms</code></li>
                  <li>• <code className="text-slate-200">optics_lens_left</code></li>
                  <li>• <code className="text-slate-200">optics_lens_right</code></li>
                  <li>• <code className="text-slate-200">optics_displays</code></li>
                  <li>• <code className="text-slate-200">optics_brackets</code></li>
                </ul>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-sky-400 block font-bold mb-1">GROUP C, D & E</span>
                <ul className="space-y-1 text-slate-400">
                  <li>• <code className="text-slate-200">electronics_motherboard</code></li>
                  <li>• <code className="text-slate-200">electronics_snapdragon_xr2</code></li>
                  <li>• <code className="text-slate-200">electronics_connectivity_rf</code></li>
                  <li>• <code className="text-slate-200">electronics_flex_cables</code></li>
                  <li>• <code className="text-slate-200">electronics_cooling_fan_heatsink</code></li>
                  <li>• <code className="text-slate-200">power_battery</code></li>
                  <li>• <code className="text-slate-200">power_connectors</code></li>
                  <li>• <code className="text-slate-200">comfort_facial_interface</code></li>
                  <li>• <code className="text-slate-200">comfort_head_strap</code></li>
                  <li>• <code className="text-slate-200">comfort_cushion_padding</code></li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Terminal size={15} className="text-sky-400" />
              3. Python Procedural Generator
            </h3>
            <p className="leading-relaxed mb-2">
              You can regenerate textures or adjust geometry parameters anytime using the bundled generator:
            </p>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto">
              python scripts/generate_quest3_glb.py
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2">
              4. Customizing Exploded Coordinates
            </h3>
            <p className="leading-relaxed">
              Target separation coordinates and hardware specifications can be modified directly in <code className="bg-slate-900 px-2 py-0.5 rounded text-sky-300 font-mono">src/data/componentsData.json</code>. The 3D animation timeline automatically reads new values without recompiling shaders.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="glass-btn px-6 py-2.5 rounded-xl font-mono text-xs font-semibold text-white bg-sky-500/20 border-sky-400 hover:bg-sky-500/30"
          >
            Got it, return to 3D View
          </button>
        </div>
      </div>
    </div>
  );
}
