import React, { useEffect, useRef } from 'react';
import { ChevronDown, ArrowRight, ShieldCheck, Eye, Cpu, Zap, Layers } from 'lucide-react';

export default function ScrollStory({
  onUpdateState,
  onSwitchMode
}) {
  const containerRef = useRef(null);

  const sections = [
    {
      id: 'section-1',
      number: '01',
      theme: 'dark-hero',
      title: 'Meta Quest 3',
      subtitle: 'Next-Generation Spatial Computing Architecture',
      desc: 'Engineered with precision folded pancake optics and the Qualcomm Snapdragon XR2 Gen 2 platform. A 40% slimmer optical stack paired with dual 4K+ Infinite Display resolution transforms mixed reality into photorealistic immersion.',
      badge: 'FLAGSHIP SPATIAL ARCHITECTURE',
      metrics: [
        { label: 'OPTICAL PROFILE', val: '-40% SLIMMER' },
        { label: 'PLATFORM', val: 'QUALCOMM 4NM' },
        { label: 'REFRESH RATE', val: 'UP TO 120HZ' }
      ],
      progress: 0.0,
      cameraPreset: 'front'
    },
    {
      id: 'section-2',
      number: '02',
      theme: 'light-tech',
      title: 'Perception Sensory Cluster',
      subtitle: 'Stereoscopic Color Passthrough & Active Depth',
      desc: 'Dual 4MP RGB color cameras deliver 18 PPD passthrough visuals, while the central active VCSEL infrared depth projector maps rooms in real time. Angled wide-field corner tracking cameras ensure relentless controller and bare-hand spatial tracking.',
      badge: 'PERCEPTION HARDWARE',
      metrics: [
        { label: 'RGB PASSTHROUGH', val: 'DUAL 4MP (18 PPD)' },
        { label: 'ACTIVE DEPTH', val: 'VCSEL IR ARRAY' },
        { label: 'TRACKING CAMERAS', val: '4X ULTRA-WIDE' }
      ],
      progress: 0.22,
      cameraPreset: 'iso'
    },
    {
      id: 'section-3',
      number: '03',
      theme: 'dark-secondary',
      title: 'Folded Pancake Optics',
      subtitle: '2064 × 2208 Resolution Per Eye',
      desc: 'Polarized folded optics bounce incoming light between multi-element polarizing beam splitters and quarter-wave plates. Paired with dual Fast-Switch LCD panels running up to 120Hz, providing an expansive 110-degree field of view with edge-to-edge optical clarity.',
      badge: 'OPTICAL ENGINEERING',
      metrics: [
        { label: 'RESOLUTION', val: '2064 × 2208 / EYE' },
        { label: 'FIELD OF VIEW', val: '110° DIAGONAL' },
        { label: 'IPD RANGE', val: '58MM — 71MM' }
      ],
      progress: 0.45,
      cameraPreset: 'internal'
    },
    {
      id: 'section-4',
      number: '04',
      theme: 'light-tech',
      title: 'Snapdragon XR2 Gen 2',
      subtitle: '4nm TSMC Node • 12GB LPDDR5 Memory',
      desc: 'Delivers 2.5x the graphic processing performance of Quest 2 with the Adreno 740 GPU and dedicated dual-core Hexagon neural processing unit (NPU). Real-time spatial depth meshing, dynamic occlusion, and high-framerate PC VR wireless streaming.',
      badge: 'SILICON PERFORMANCE',
      metrics: [
        { label: 'GRAPHICS GPU', val: 'ADRENO 740 (2.5X)' },
        { label: 'MEMORY', val: '12GB LPDDR5' },
        { label: 'PROCESS NODE', val: '4NM TSMC FINFET' }
      ],
      progress: 0.65,
      cameraPreset: 'top'
    },
    {
      id: 'section-5',
      number: '05',
      theme: 'dark-hero',
      title: 'Thermal Dynamics & Power',
      subtitle: 'Sintered Copper Heat Pipe • 5,060 mAh Energy',
      desc: 'A curved 19.44 Wh lithium-ion polymer cell is low-slung within the chassis for optimal center of gravity. Sintered copper heat pipes channel thermal energy to an aluminum micro-fin radiator and centrifugal radial blower fan, operating whisper-quietly.',
      badge: 'POWER & THERMAL MANAGEMENT',
      metrics: [
        { label: 'BATTERY CAPACITY', val: '5,060 MAH (19.44 WH)' },
        { label: 'HEAT PIPE', val: 'SINTERED PURE COPPER' },
        { label: 'RUNTIME', val: '2.2 — 2.9 HOURS' }
      ],
      progress: 0.82,
      cameraPreset: 'side'
    },
    {
      id: 'section-6',
      number: '06',
      theme: 'light-tech',
      title: '18 Precision Subassemblies',
      subtitle: 'Millimeter-Calibrated Mechanical Disassembly',
      desc: 'Every hardware subassembly separates along its functional mechanical axis. From the front polycarbonate faceplate to the rear ergonomic Y-strap, explore how 109,342 CAD polygons unite to form an ultra-compact spatial computer.',
      badge: 'MECHANICAL TEARDOWN',
      metrics: [
        { label: 'DISCRETE PARTS', val: '18 SUBASSEMBLIES' },
        { label: 'CAD POLYGONS', val: '109,342 FACES' },
        { label: 'WEIGHT', val: '515 GRAMS' }
      ],
      progress: 1.0,
      cameraPreset: 'iso'
    },
    {
      id: 'section-7',
      number: '07',
      theme: 'dark-secondary',
      title: 'Precision Spatial Assembly',
      subtitle: 'Form Follows Precision Engineering',
      desc: 'Subassemblies smoothly return to their calibrated assembled coordinates. Enter Free Studio Mode anytime to freely orbit the model at any angle, inspect individual microchips, and control exploded view spread.',
      badge: 'SYSTEM INTEGRATION',
      metrics: [
        { label: 'TRACKING LATENCY', val: '< 12MS PASS-THROUGH' },
        { label: 'AUDIO SYSTEM', val: '3D SPATIAL HRTF' },
        { label: 'WI-FI CONNECT', val: 'WI-FI 6E / BT 5.2' }
      ],
      progress: 0.0,
      cameraPreset: 'front'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / docHeight));

      const sectionIndex = Math.min(
        sections.length - 1,
        Math.floor(scrollFraction * sections.length)
      );
      const activeSec = sections[sectionIndex];

      let calculatedProgress = 0;
      if (scrollFraction < 0.85) {
        calculatedProgress = Math.min(1.0, (scrollFraction / 0.85));
      } else {
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
      {/* Scroll Down Prompt */}
      <div className="absolute top-[88vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-auto text-[#A9BCD5] font-mono text-[11px] tracking-wider uppercase">
        <span>Scroll to inspect architecture</span>
        <ChevronDown size={14} className="text-[#2589FF] animate-bounce" />
      </div>

      {/* Story Sections: Alternating Deep Navy & Ice-White Technical Sections */}
      {sections.map((sec, idx) => {
        const isLight = sec.theme === 'light-tech';
        const isHeroDark = sec.theme === 'dark-hero';

        return (
          <div
            key={sec.id}
            id={sec.id}
            className="min-h-screen flex items-center px-6 md:px-16 lg:px-24 py-24 pointer-events-none"
          >
            <div className={`w-full max-w-xl pointer-events-auto rounded-3xl p-8 md:p-9 transition-all duration-500 ${
              idx % 2 === 0 ? 'ml-0' : 'ml-auto'
            } ${
              isLight
                ? 'light-tech-card'
                : isHeroDark
                  ? 'navy-glass'
                  : 'bg-[#102A4C]/85 backdrop-blur-2xl border border-[rgba(37,137,255,0.25)] shadow-2xl shadow-[#071426]/80 text-[#F4F8FF]'
            }`}>
              
              {/* Category & Badge Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-current/10">
                <span className={`font-mono text-[10px] tracking-wider uppercase font-semibold ${
                  isLight ? 'text-[#2589FF]' : 'text-[#A9BCD5]'
                }`}>
                  {sec.badge}
                </span>
                <span className={`font-mono text-xs font-semibold ${
                  isLight ? 'text-[#10233B]/60' : 'text-[#A9BCD5]/70'
                }`}>
                  0{idx + 1} / 07
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight mb-1.5 ${
                isLight ? 'text-[#10233B]' : 'text-[#F4F8FF]'
              }`}>
                {sec.title}
              </h2>
              <h4 className={`text-xs font-mono tracking-wide mb-4 font-medium ${
                isLight ? 'text-[#2589FF]' : 'text-[#A9BCD5]'
              }`}>
                {sec.subtitle}
              </h4>

              {/* Narrative Prose */}
              <p className={`text-xs md:text-sm leading-relaxed mb-6 font-normal ${
                isLight ? 'text-[#10233B]/80' : 'text-[#A9BCD5]'
              }`}>
                {sec.desc}
              </p>

              {/* Technical Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {sec.metrics.map((m, mIdx) => (
                  <div 
                    key={mIdx} 
                    className={`p-2.5 rounded-xl border ${
                      isLight 
                        ? 'bg-white/80 border-[#2589FF]/20 text-[#10233B]' 
                        : 'bg-[#071426]/60 border-[rgba(37,137,255,0.18)] text-[#F4F8FF]'
                    }`}
                  >
                    <span className={`block text-[9px] font-mono tracking-wider mb-0.5 ${
                      isLight ? 'text-[#10233B]/60' : 'text-[#A9BCD5]'
                    }`}>
                      {m.label}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#2589FF]">
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Progress & CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-current/10 text-xs font-mono">
                <span className={isLight ? 'text-[#10233B]/60' : 'text-[#A9BCD5]'}>
                  Disassembly: {Math.round(sec.progress * 100)}%
                </span>
                {idx === sections.length - 1 ? (
                  <button
                    onClick={onSwitchMode}
                    className="blue-action-btn px-4 py-2 rounded-xl text-xs gap-1.5"
                  >
                    <span>Enter 3D Studio</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <span className={`text-[10px] tracking-wider uppercase font-semibold ${
                    isLight ? 'text-[#2589FF]' : 'text-[#A9BCD5]'
                  }`}>
                    Scroll to continue →
                  </span>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}