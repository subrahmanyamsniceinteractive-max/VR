import React, { useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Layers, 
  Eye, 
  Cpu, 
  Battery, 
  Box, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';

export default function ScrollStory({
  onUpdateState,
  onSwitchMode
}) {
  const containerRef = useRef(null);

  const sections = [
    {
      id: 'section-1',
      badge: 'SECTION 01',
      title: 'Meta Quest 3',
      subtitle: 'NEXT-GENERATION SPATIAL COMPUTING',
      desc: 'Engineered with breakthrough pancake optics and next-generation Snapdragon XR2 Gen 2 computing power. A 40% slimmer optical profile paired with dual 4K+ Infinite Display resolution transforms virtual and mixed reality into photorealistic clarity.',
      progress: 0.0,
      cameraPreset: 'front',
      icon: Sparkles
    },
    {
      id: 'section-2',
      badge: 'SECTION 02 — EXTERIOR',
      title: 'Precision Sensor Architecture',
      subtitle: 'SUB-MILLIMETER 6DOF TRACKING & PASSTHROUGH',
      desc: 'Dual 4MP RGB color cameras deliver 18 PPD passthrough visuals, while the central active VCSEL infrared depth projector maps rooms in real time. Angled wide-field corner tracking cameras ensure relentless controller and bare-hand spatial tracking.',
      progress: 0.22,
      cameraPreset: 'iso',
      icon: Box
    },
    {
      id: 'section-3',
      badge: 'SECTION 03 — OPTICS',
      title: 'Folded Pancake Optical Stack',
      subtitle: '2064 x 2208 RESOLUTION PER EYE',
      desc: 'Polarized folded optics bounce incoming light between multi-element polarizing beam splitters and wave plates. Paired with dual Fast-Switch LCD panels running at up to 120Hz, providing an expansive 110-degree field of view with edge-to-edge optical clarity.',
      progress: 0.45,
      cameraPreset: 'internal',
      icon: Eye
    },
    {
      id: 'section-4',
      badge: 'SECTION 04 — COMPUTE',
      title: 'Qualcomm Snapdragon XR2 Gen 2',
      subtitle: '4NM TSMC ARCHITECTURE • 12GB LPDDR5',
      desc: 'Delivers 2.5x the graphic performance of Quest 2 with the Adreno 740 GPU and dedicated dual-core Hexagon neural processing unit (NPU). Real-time spatial depth meshing, dynamic occlusion, and high-framerate PC VR wireless streaming.',
      progress: 0.65,
      cameraPreset: 'top',
      icon: Cpu
    },
    {
      id: 'section-5',
      badge: 'SECTION 05 — POWER & THERMAL',
      title: 'Lithium Pouch & Active Blower',
      subtitle: '5,060 MAH BATTERY • SINTERED COPPER HEAT PIPE',
      desc: 'A curved 19.44 Wh lithium-ion polymer cell is low-slung within the chassis for optimal center of gravity. Sintered copper heat pipes channel thermal energy to an aluminum micro-fin radiator and centrifugal radial blower fan, operating whisper-quietly.',
      progress: 0.82,
      cameraPreset: 'side',
      icon: Battery
    },
    {
      id: 'section-6',
      badge: 'SECTION 06 — EXPLODED VIEW',
      title: 'Complete 18-Part Engineering Array',
      subtitle: 'FULL STRUCTURAL TEARDOWN VISUALIZATION',
      desc: 'All 18 discrete hardware subassemblies separate along their functional mechanical axes. From the front polycarbonate faceplate to the rear ergonomic Y-strap, explore how millimeter-level tolerances unite to form a lightweight spatial computer.',
      progress: 1.0,
      cameraPreset: 'iso',
      icon: Layers
    },
    {
      id: 'section-7',
      badge: 'SECTION 07 — REASSEMBLY',
      title: 'Seamless Reassembly',
      subtitle: 'READY FOR EXPLORATION',
      desc: 'Components smoothly glide back into their calibrated assembled coordinates. Switch anytime to Free 3D Studio Mode to orbit the model at any angle, inspect individual microchips, and control exploded view spread.',
      progress: 0.0,
      cameraPreset: 'front',
      icon: RotateCcw
    }
  ];

  // Scroll listener to update 3D scene state bi-directionally
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / docHeight));

      // Calculate which section is active
      const sectionIndex = Math.min(
        sections.length - 1,
        Math.floor(scrollFraction * sections.length)
      );
      const activeSec = sections[sectionIndex];

      // Smooth interpolation of explode progress
      // Map sections 0..5 (progress 0 -> 1) and section 6 (progress 1 -> 0)
      let calculatedProgress = 0;
      if (scrollFraction < 0.85) {
        calculatedProgress = Math.min(1.0, (scrollFraction / 0.85));
      } else {
        // Section 7 returns to 0
        calculatedProgress = Math.max(0, 1.0 - ((scrollFraction - 0.85) / 0.15));
      }

      onUpdateState({
        progress: calculatedProgress,
        cameraPreset: activeSec.cameraPreset
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative z-20 pointer-events-none">
      {/* Scroll Down Prompt for Hero */}
      <div className="absolute top-[85vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto text-sky-400 font-mono text-xs animate-bounce">
        <span>SCROLL TO EXPLORE TEARDOWN</span>
        <ChevronDown size={18} />
      </div>

      {/* 7 Story Cards */}
      {sections.map((sec, idx) => {
        const Icon = sec.icon;

        return (
          <div
            key={sec.id}
            id={sec.id}
            className="min-h-screen flex items-center px-6 md:px-16 lg:px-24 py-20 pointer-events-none"
          >
            <div className={`w-full max-w-lg pointer-events-auto glass-panel-glow rounded-3xl p-8 border border-sky-500/25 shadow-2xl transition-all duration-500 ${
              idx % 2 === 0 ? 'ml-0' : 'ml-auto'
            }`}>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                    <Icon size={16} />
                  </div>
                  <span className="tech-badge">{sec.badge}</span>
                </div>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  0{idx + 1} / 07
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight mb-1">
                {sec.title}
              </h2>
              <h4 className="text-xs font-mono font-bold text-sky-400 tracking-wider mb-4">
                {sec.subtitle}
              </h4>

              {/* Description */}
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                {sec.desc}
              </p>

              {/* Footer action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono">
                <span className="text-slate-400">PROGRESS: {Math.round(sec.progress * 100)}%</span>
                {idx === sections.length - 1 && (
                  <button
                    onClick={onSwitchMode}
                    className="glass-btn px-4 py-2 rounded-xl text-sky-400 hover:text-white border-sky-500/40"
                  >
                    ENTER FREE 3D STUDIO
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
