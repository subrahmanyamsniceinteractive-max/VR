import React, { useState, useEffect, useRef } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import HUDControls from './components/HUDControls';
import ComponentInspector from './components/ComponentInspector';
import ComponentDrawer from './components/ComponentDrawer';
import ScrollStory from './components/ScrollStory';
import HeaderNav from './components/HeaderNav';
import LoadingScreen from './components/LoadingScreen';
import EngineeringAssetInspector from './components/EngineeringAssetInspector';
import quest3Data from './data/componentsData.json';
import visionProData from './data/visionProData.json';
import gsap from 'gsap';

export default function App() {
  const [headsetType, setHeadsetType] = useState('quest3'); // 'quest3' | 'vision_pro'
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
  const [filterCategory, setFilterCategory] = useState('all');
  const [customModelUrl, setCustomModelUrl] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const tweenRef = useRef(null);

  const activeData = headsetType === 'vision_pro' ? visionProData : quest3Data;
  const currentTitle = headsetType === 'vision_pro' ? 'Apple Vision Pro' : 'Meta Quest 3';

  // Headset Switcher
  const handleSelectHeadset = (type) => {
    if (type === headsetType) return;
    setIsLoading(true);
    setLoadProgress(10);
    setCustomModelUrl(null);
    setHeadsetType(type);
    setSelectedComponentId(null);
    setExplodeProgress(0.0);
    setFilterCategory('all');
    setCameraPreset('front');
  };

  // Custom Local Model Loading
  const handleCustomModelLoad = (url, fileName) => {
    setIsLoading(true);
    setLoadProgress(20);
    setCustomModelUrl(url);
    setSelectedComponentId(null);
    setExplodeProgress(0.0);
  };

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
    tweenRef.current = gsap.to(proxy, {
      val: 1.0,
      duration: 3.5,
      ease: 'power1.inOut',
      onUpdate: () => setExplodeProgress(proxy.val),
      onComplete: () => {
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
    <div className="relative w-full min-h-screen bg-[#08172B] text-[#F4F7FC] overflow-x-hidden font-sans">
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen progress={loadProgress} />
      )}

      {/* Header Navigation with Headset Switcher & Real-time Verified Stats */}
      <HeaderNav
        headsetType={headsetType}
        onSelectHeadset={handleSelectHeadset}
        mode={mode}
        onSwitchMode={handleSwitchMode}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        modelStats={modelStats}
      />

      {/* 3D Scene Viewport */}
      <div className={`${
        mode === 'story'
          ? 'fixed inset-0 z-0'
          : 'relative w-full h-screen z-10'
      }`}>
        <ThreeCanvas
          headsetType={headsetType}
          explodeProgress={explodeProgress}
          explodeIntensity={explodeIntensity}
          selectedComponentId={selectedComponentId}
          hoveredComponentId={hoveredComponentId}
          onSelectComponent={handleSelectComponent}
          onHoverComponent={setHoveredComponentId}
          cameraPreset={cameraPreset}
          showLabels={showLabels}
          filterCategory={filterCategory}
          customModelUrl={customModelUrl}
          onModelInspected={setModelStats}
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
          componentsCount={modelStats?.meshCount || activeData.length}
          filterCategory={filterCategory}
          onSelectFilterCategory={setFilterCategory}
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
        components={activeData}
      />

      {/* Hardware Subassemblies Drawer */}
      <ComponentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedId={selectedComponentId}
        onSelectComponent={(id) => {
          handleSelectComponent(id);
          setIsDrawerOpen(false);
        }}
        components={activeData}
        title={`${currentTitle} Assembly`}
      />

      {/* 3D Model Engineering Inspection & CAD Ingestion Modal */}
      <EngineeringAssetInspector
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        modelStats={modelStats}
        onCustomModelLoad={handleCustomModelLoad}
      />
    </div>
  );
}