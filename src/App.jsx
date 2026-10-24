import React, { useState, useEffect, useRef } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import HUDControls from './components/HUDControls';
import ComponentInspector from './components/ComponentInspector';
import ComponentDrawer from './components/ComponentDrawer';
import ScrollStory from './components/ScrollStory';
import HeaderNav from './components/HeaderNav';
import LoadingScreen from './components/LoadingScreen';
import ModelReplacementGuide from './components/ModelReplacementGuide';
import gsap from 'gsap';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(10);
  const [mode, setMode] = useState('studio'); // 'studio' | 'story'
  const [explodeProgress, setExplodeProgress] = useState(0.0);
  const [explodeIntensity, setExplodeIntensity] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [hoveredComponentId, setHoveredComponentId] = useState(null);
  const [cameraPreset, setCameraPreset] = useState('front');
  const [showLabels, setShowLabels] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const tweenRef = useRef(null);

  // Smooth Explode / Assemble Transitions
  const handleToggleExplode = () => {
    if (tweenRef.current) tweenRef.current.kill();
    setIsPlaying(false);

    const target = explodeProgress > 0.5 ? 0.0 : 1.0;
    const duration = 1.4;

    const proxy = { val: explodeProgress };
    tweenRef.current = gsap.to(proxy, {
      val: target,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        setExplodeProgress(proxy.val);
      }
    });
  };

  // Cinematic Play / Pause Loop
  const handleTogglePlay = () => {
    if (isPlaying) {
      if (tweenRef.current) tweenRef.current.kill();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      runPlayLoop();
    }
  };

  const runPlayLoop = () => {
    if (tweenRef.current) tweenRef.current.kill();

    const proxy = { val: explodeProgress };
    // Play to full explode
    tweenRef.current = gsap.to(proxy, {
      val: 1.0,
      duration: 3.5,
      ease: 'power1.inOut',
      onUpdate: () => setExplodeProgress(proxy.val),
      onComplete: () => {
        // Hold at exploded view briefly, then reverse assemble
        tweenRef.current = gsap.to(proxy, {
          val: 0.0,
          duration: 3.5,
          delay: 1.2,
          ease: 'power1.inOut',
          onUpdate: () => setExplodeProgress(proxy.val),
          onComplete: () => {
            setIsPlaying(false);
          }
        });
      }
    });
  };

  // Manual Seek
  const handleSeek = (val) => {
    if (tweenRef.current) tweenRef.current.kill();
    setIsPlaying(false);
    setExplodeProgress(val);
  };

  // Component Selection
  const handleSelectComponent = (id) => {
    setSelectedComponentId(id);
    if (id && explodeProgress < 0.4) {
      // Auto-separate slightly so internal component is accessible
      if (tweenRef.current) tweenRef.current.kill();
      const proxy = { val: explodeProgress };
      tweenRef.current = gsap.to(proxy, {
        val: 0.75,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => setExplodeProgress(proxy.val)
      });
    }
  };

  const handleResetCamera = () => {
    setSelectedComponentId(null);
    setCameraPreset('reset');
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setSelectedComponentId(null);
    if (newMode === 'story') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070913] text-slate-100 overflow-x-hidden font-sans">
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen progress={loadProgress} />
      )}

      {/* Header Navigation */}
      <HeaderNav
        mode={mode}
        onSwitchMode={handleSwitchMode}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* 3D Scene Container (Sticky background in story mode, full viewport in studio mode) */}
      <div className={`${
        mode === 'story'
          ? 'fixed inset-0 z-0'
          : 'relative w-full h-screen z-10'
      }`}>
        <ThreeCanvas
          explodeProgress={explodeProgress}
          explodeIntensity={explodeIntensity}
          selectedComponentId={selectedComponentId}
          hoveredComponentId={hoveredComponentId}
          onSelectComponent={handleSelectComponent}
          onHoverComponent={setHoveredComponentId}
          cameraPreset={cameraPreset}
          showLabels={showLabels}
          onLoadProgress={(p) => setLoadProgress(p)}
          onLoaded={() => setTimeout(() => setIsLoading(false), 400)}
        />
      </div>

      {/* Mode A: 3D Studio HUD Controls */}
      {mode === 'studio' && (
        <HUDControls
          isExploded={explodeProgress > 0.5}
          onToggleExplode={handleToggleExplode}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          progress={explodeProgress}
          onSeek={handleSeek}
          intensity={explodeIntensity}
          onChangeIntensity={setExplodeIntensity}
          cameraPreset={cameraPreset}
          onSelectCameraPreset={setCameraPreset}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
          isDrawerOpen={isDrawerOpen}
          onResetCamera={handleResetCamera}
        />
      )}

      {/* Mode B: Scroll Storytelling Narrative */}
      {mode === 'story' && (
        <ScrollStory
          onUpdateState={({ progress, cameraPreset: preset }) => {
            setExplodeProgress(progress);
            if (preset) setCameraPreset(preset);
          }}
          onSwitchMode={() => handleSwitchMode('studio')}
        />
      )}

      {/* Component Telemetry Inspector Modal */}
      <ComponentInspector
        selectedId={selectedComponentId}
        onClose={() => setSelectedComponentId(null)}
        onSelectComponent={handleSelectComponent}
      />

      {/* 18-Component Drawer Directory */}
      <ComponentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedId={selectedComponentId}
        onSelectComponent={(id) => {
          handleSelectComponent(id);
          setIsDrawerOpen(false);
        }}
      />

      {/* 3D Model Replacement Guide */}
      <ModelReplacementGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
