import React, { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ScrollStory({
  onUpdateState,
  onSwitchMode
}) {
  const containerRef = useRef(null);

  const sections = [
    {
      id: 'section-1',
      number: '01',
      title: 'Meta Quest 3',
      subtitle: 'Next-Generation Spatial Architecture',
      desc: 'Engineered with precision folded pancake optics and the Qualcomm Snapdragon XR2 Gen 2 platform. A 40% slimmer optical profile paired with dual 4K+ Infinite Display resolution transforms mixed reality into photorealistic immersion.',
      progress: 0.0,
      cameraPreset: 'front'
    },
    {
      id: 'section-2',
      number: '02',
      title: 'Perception Sensory Cluster',
      subtitle: 'Stereoscopic Color Passthrough & Active Depth',
      desc: 'Dual 4MP RGB color cameras deliver 18 PPD passthrough visuals, while the central active VCSEL infrared depth projector maps rooms in real time. Angled wide-field corner tracking cameras ensure relentless controller and bare-hand spatial tracking.',
      progress: 0.22,
      cameraPreset: 'iso'
    },
    {
      id: 'section-3',
      number: '03',
      title: 'Folded Pancake Optics',
      subtitle: '2064 × 2208 Resolution Per Eye',
      desc: 'Polarized folded optics bounce incoming light between multi-element polarizing beam splitters and quarter-wave plates. Paired with dual Fast-Switch LCD panels running up to 120Hz, providing an expansive 110-degree field of view with edge-to-edge optical clarity.',
      progress: 0.45,
      cameraPreset: 'internal'
    },
    {
      id: 'section-4',
      number: '04',
      title: 'Snapdragon XR2 Gen 2',
      subtitle: '4nm TSMC Node • 12GB LPDDR5 Memory',
      desc: 'Delivers 2.5x the graphic processing performance of Quest 2 with the Adreno 740 GPU and dedicated dual-core Hexagon neural processing unit (NPU). Real-time spatial depth meshing, dynamic occlusion, and high-framerate PC VR wireless streaming.',
      progress: 0.65,
      cameraPreset: 'top'
    },
    {
      id: 'section-5',
      number: '05',
      title: 'Thermal Dynamics & Power',
      subtitle: 'Sintered Copper Heat Pipe • 5,060 mAh Energy',
      desc: 'A curved 19.44 Wh lithium-ion polymer cell is low-slung within the chassis for optimal center of gravity. Sintered copper heat pipes channel thermal energy to an aluminum micro-fin radiator and centrifugal radial blower fan, operating whisper-quietly.',
      progress: 0.82,
      cameraPreset: 'side'
    },
    {
      id: 'section-6',
      number: '06',
      title: 'Mechanical Disassembly',
      subtitle: '18 Precision Engineering Subassemblies',
      desc: 'Every hardware subassembly separates along its functional mechanical axis. From the front polycarbonate faceplate to the rear ergonomic Y-strap, explore how millimeter-level tolerances unite to form a lightweight spatial computer.',
      progress: 1.0,
      cameraPreset: 'iso'
    },
    {
      id: 'section-7',
      number: '07',
      title: 'Form Follows Precision',
      subtitle: 'Integrated Spatial Computing',
      desc: 'Subassemblies smoothly return to their calibrated assembled coordinates. Enter Free Studio Mode anytime to freely orbit the model at any angle, inspect individual microchips, and control exploded view spread.',
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
      <div className="absolute top-[88vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-auto text-zinc-400 font-mono text-[11px] tracking-wider uppercase">
        <span>Scroll to explore architecture</span>
        <ChevronDown size={14} className="text-zinc-500" />
      </div>

      {/* Story Sections */}
      {sections.map((sec, idx) => (
        <div
          key={sec.id}
          id={sec.id}
          className="min-h-screen flex items-center px-6 md:px-16 lg:px-24 py-20 pointer-events-none"
        >
          <div className={`w-full max-w-lg pointer-events-auto apple-glass rounded-3xl p-8 transition-all duration-500 ${
            idx % 2 === 0 ? 'ml-0' : 'ml-auto'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="spec-tag text-zinc-400">
                ARCHITECTURE CHAPTER {sec.number}
              </span>
              <span className="font-mono text-xs text-zinc-500">
                0{idx + 1} / 07
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-1">
              {sec.title}
            </h2>
            <h4 className="text-xs font-mono text-zinc-400 tracking-wide mb-4">
              {sec.subtitle}
            </h4>

            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
              {sec.desc}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500">Separation: {Math.round(sec.progress * 100)}%</span>
              {idx === sections.length - 1 && (
                <button
                  onClick={onSwitchMode}
                  className="apple-pill-btn px-4 py-2 rounded-xl text-white bg-white/10"
                >
                  Enter 3D Studio
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
