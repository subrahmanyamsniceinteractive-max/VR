import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import gsap from 'gsap';
import componentsData from '../data/componentsData.json';

export default function ThreeCanvas({
  explodeProgress = 0,
  explodeIntensity = 1.0,
  selectedComponentId = null,
  hoveredComponentId = null,
  onSelectComponent,
  onHoverComponent,
  cameraPreset = null,
  showLabels = true,
  onLoadProgress,
  onLoaded
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const controlsRef = useRef(null);
  const meshesMapRef = useRef(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const defaultCameraPos = useRef(new THREE.Vector3(0, 1.8, 22));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));
  const [screenLabels, setScreenLabels] = useState([]);
  const animFrameIdRef = useRef(null);
  const isInteractingRef = useRef(false);

  // 1. Initialize Photorealistic Scene, Studio Environment & Post-Processing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060811);
    scene.fog = new THREE.FogExp2(0x060811, 0.016);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.copy(defaultCameraPos.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-Processing Pipeline (Bloom & Cinematic Tone Mapping)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.32,  // subtle bloom strength
      0.5,   // radius
      0.82   // threshold for specular glints
    );
    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    composerRef.current = composer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 42;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.minPolarAngle = 0.08;
    controls.target.copy(defaultTarget.current);
    controlsRef.current = controls;

    controls.addEventListener('start', () => { isInteractingRef.current = true; });
    controls.addEventListener('end', () => { isInteractingRef.current = false; });

    // Procedural Studio HDRI Environment Map (creates authentic specular highlights on plastic, metal & glass)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x060914);

    // Studio Softbox 1: Main Upper Softbox
    const sb1 = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    sb1.position.set(14, 20, 16);
    sb1.lookAt(0, 0, 0);
    envScene.add(sb1);

    // Studio Softbox 2: Cool Cyan Lateral Strip Light
    const sb2 = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 28),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    sb2.position.set(-20, 8, -14);
    sb2.lookAt(0, 0, 0);
    envScene.add(sb2);

    // Studio Softbox 3: Deep Violet Accent Strip
    const sb3 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 22),
      new THREE.MeshBasicMaterial({ color: 0x818cf8 })
    );
    sb3.position.set(-16, -6, 14);
    sb3.lookAt(0, 0, 0);
    envScene.add(sb3);

    const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envTexture;

    // Physical Studio Lighting Rig
    // 1. Key Keylight
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.6);
    keyLight.position.set(14, 18, 16);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -16;
    scene.add(keyLight);

    // 2. Razor-sharp Silhouette Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    rimLight.position.set(-16, 14, -18);
    scene.add(rimLight);

    // 3. Fill Light (Soft Violet)
    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    fillLight.position.set(-16, -8, 14);
    scene.add(fillLight);

    // 4. Subtle Ambient Atmosphere
    const hemiLight = new THREE.HemisphereLight(0x1e293b, 0x05070f, 0.95);
    scene.add(hemiLight);

    // 5. Internal Core Accent Light (illuminates internals when exploded)
    const coreLight = new THREE.PointLight(0x38bdf8, 2.2, 24);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // High-Fidelity Studio Contact Ground Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, 'rgba(0, 8, 24, 0.85)');
    grad.addColorStop(0.35, 'rgba(0, 8, 24, 0.45)');
    grad.addColorStop(0.7, 'rgba(0, 8, 24, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -9.2;
    scene.add(shadowPlane);

    // High-Resolution Procedural PBR Textures
    const textureLoader = new THREE.TextureLoader();
    const textures = {
      pcb: textureLoader.load('/textures/motherboard_pcb.png'),
      chip: textureLoader.load('/textures/snapdragon_xr2.png'),
      battery: textureLoader.load('/textures/battery_label.png'),
      lens: textureLoader.load('/textures/lens_ring.png'),
      display: textureLoader.load('/textures/display_screen.png'),
      faceplate: textureLoader.load('/textures/faceplate.png'),
      strap: textureLoader.load('/textures/fabric_strap.png')
    };
    Object.values(textures).forEach(t => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    });

    // GLTF Loading
    const loader = new GLTFLoader();
    onLoadProgress?.(15);

    loader.load(
      '/models/quest3_exploded.glb',
      (gltf) => {
        onLoadProgress?.(85);
        const model = gltf.scene;
        model.name = 'Quest3_Root';
        scene.add(model);

        // Process all 18 components with advanced photorealistic materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const compMeta = componentsData.find(c => c.id === child.name || c.id === child.parent?.name);
            const compId = compMeta ? compMeta.id : child.name;

            child.userData.componentId = compId;
            child.userData.originalPos = child.position.clone();
            child.userData.originalRot = child.rotation.clone();
            child.userData.assembledPos = compMeta ? new THREE.Vector3(...compMeta.assembled) : child.position.clone();
            child.userData.explodedPos = compMeta ? new THREE.Vector3(...compMeta.exploded) : child.position.clone();

            // Photorealistic Material Assignments
            if (compId === 'exterior_faceplate') {
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                roughness: 0.24,
                metalness: 0.02,
                clearcoat: 0.45,
                clearcoatRoughness: 0.15,
                sheen: 0.35,
                sheenRoughness: 0.2,
                map: textures.faceplate,
                envMapIntensity: 1.4
              });
            } else if (compId === 'exterior_housing') {
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0xf8f9fa,
                roughness: 0.30,
                metalness: 0.03,
                clearcoat: 0.30,
                clearcoatRoughness: 0.2,
                envMapIntensity: 1.2
              });
            } else if (compId === 'optics_lens_left' || compId === 'optics_lens_right') {
              // Real Multi-Element Optical Glass with Folded Polarizing Transmission
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0x050d1a,
                roughness: 0.03,
                metalness: 0.08,
                transmission: 0.94,
                ior: 1.55,
                thickness: 1.6,
                specularIntensity: 1.4,
                specularColor: new THREE.Color(0x38bdf8), // cyan anti-reflective glint
                transparent: true,
                opacity: 0.92,
                envMapIntensity: 2.2
              });
            } else if (compId === 'optics_displays') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x070b14,
                map: textures.display,
                emissive: new THREE.Color(0x00f0ff),
                emissiveIntensity: 0.55,
                roughness: 0.18,
                metalness: 0.65,
                envMapIntensity: 1.2
              });
            } else if (compId === 'exterior_sensors') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x111318,
                roughness: 0.20,
                metalness: 0.92,
                envMapIntensity: 1.6
              });
            } else if (compId === 'electronics_motherboard') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x121c16,
                map: textures.pcb,
                roughness: 0.32,
                metalness: 0.45,
                envMapIntensity: 1.3
              });
            } else if (compId === 'electronics_snapdragon_xr2') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x181a20,
                map: textures.chip,
                roughness: 0.18,
                metalness: 0.95,
                envMapIntensity: 2.0
              });
            } else if (compId === 'power_battery') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                map: textures.battery,
                roughness: 0.24,
                metalness: 0.88,
                envMapIntensity: 1.6
              });
            } else if (compId === 'electronics_cooling_fan_heatsink') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xdf7a40, // pure sintered copper tone
                roughness: 0.20,
                metalness: 0.98,
                envMapIntensity: 2.2
              });
            } else if (compId === 'electronics_flex_cables') {
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0xdf9a24, // Amber Kapton polyimide
                roughness: 0.25,
                metalness: 0.65,
                transmission: 0.3,
                transparent: true,
                opacity: 0.94,
                envMapIntensity: 1.5
              });
            } else if (compId === 'comfort_head_strap' || compId === 'comfort_cushion_padding') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x22252c,
                map: textures.strap,
                roughness: 0.92,
                metalness: 0.02,
                envMapIntensity: 0.6
              });
            } else if (compId === 'comfort_facial_interface') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x1a1d24,
                roughness: 0.65,
                metalness: 0.08,
                envMapIntensity: 0.8
              });
            } else if (compId === 'optics_brackets') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x717985, // Magnesium-aluminum alloy
                roughness: 0.25,
                metalness: 0.90,
                envMapIntensity: 1.8
              });
            }

            child.userData.baseMaterial = child.material.clone();
            meshesMapRef.current.set(compId, child);
          }
        });

        onLoadProgress?.(100);
        onLoaded?.();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 70) + 15;
          onLoadProgress?.(pct);
        }
      },
      (err) => {
        console.error('Failed to load Quest 3 GLB model:', err);
        onLoadProgress?.(100);
        onLoaded?.();
      }
    );

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera || !composer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render & Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Subtle organic floating oscillation when assembled
      if (sceneRef.current) {
        const root = sceneRef.current.getObjectByName('Quest3_Root');
        if (root && !isInteractingRef.current) {
          root.position.y = Math.sin(elapsedTime * 1.1) * 0.22;
          root.rotation.y = Math.sin(elapsedTime * 0.35) * 0.04;
        }
      }

      // Update Screen Coordinates for 3D Technical Labels
      if (camera && container) {
        const labels = [];
        const w = container.clientWidth;
        const h = container.clientHeight;

        componentsData.forEach((comp) => {
          const mesh = meshesMapRef.current.get(comp.id);
          if (mesh) {
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            
            const screenPos = worldPos.clone().project(camera);
            const isVisible = screenPos.z < 1.0 && screenPos.x >= -1.0 && screenPos.x <= 1.0 && screenPos.y >= -1.0 && screenPos.y <= 1.0;

            if (isVisible) {
              const x = (screenPos.x * 0.5 + 0.5) * w;
              const y = (-(screenPos.y * 0.5) + 0.5) * h;
              labels.push({
                id: comp.id,
                name: comp.name,
                category: comp.category,
                x,
                y,
                dist: camera.position.distanceTo(worldPos)
              });
            }
          }
        });
        setScreenLabels(labels);
      }

      // Render through post-processing composer
      composer.render();
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. Handle Explode Progress & Intensity
  useEffect(() => {
    meshesMapRef.current.forEach((mesh, compId) => {
      const compMeta = componentsData.find(c => c.id === compId);
      if (!compMeta) return;

      const assembled = new THREE.Vector3(...compMeta.assembled);
      const exploded = new THREE.Vector3(...compMeta.exploded).multiplyScalar(explodeIntensity);

      const targetPos = new THREE.Vector3().lerpVectors(assembled, exploded, explodeProgress);

      gsap.to(mesh.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 0.65,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  }, [explodeProgress, explodeIntensity]);

  // 3. Handle Component Selection & Camera Framing
  useEffect(() => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (selectedComponentId) {
      const compMeta = componentsData.find(c => c.id === selectedComponentId);
      const targetMesh = meshesMapRef.current.get(selectedComponentId);

      if (compMeta && targetMesh) {
        const targetWorldPos = new THREE.Vector3();
        targetMesh.getWorldPosition(targetWorldPos);

        const dist = compMeta.cameraDist || 14;
        const camOffset = new THREE.Vector3(
          targetWorldPos.x + 2.5,
          targetWorldPos.y + 1.8,
          targetWorldPos.z + dist
        );

        gsap.to(controls.target, {
          x: targetWorldPos.x,
          y: targetWorldPos.y,
          z: targetWorldPos.z,
          duration: 1.2,
          ease: 'power3.inOut'
        });

        gsap.to(camera.position, {
          x: camOffset.x,
          y: camOffset.y,
          z: camOffset.z,
          duration: 1.2,
          ease: 'power3.inOut'
        });

        // Highlight selected mesh with subtle cyan edge glow & dim others
        meshesMapRef.current.forEach((mesh, id) => {
          if (id === selectedComponentId) {
            if (mesh.material.emissive) {
              gsap.to(mesh.material.emissive, {
                r: 0.08,
                g: 0.35,
                b: 0.65,
                duration: 0.3
              });
              mesh.material.emissiveIntensity = 0.85;
            }
          } else {
            if (mesh.material.opacity !== undefined) {
              mesh.material.transparent = true;
              gsap.to(mesh.material, { opacity: 0.32, duration: 0.3 });
            }
          }
        });
      }
    } else {
      meshesMapRef.current.forEach((mesh) => {
        if (mesh.userData.baseMaterial) {
          if (mesh.material.emissive) {
            gsap.to(mesh.material.emissive, { r: 0, g: 0, b: 0, duration: 0.3 });
            mesh.material.emissiveIntensity = 0;
          }
          if (mesh.material.opacity !== undefined) {
            gsap.to(mesh.material, { opacity: mesh.userData.baseMaterial.opacity || 1.0, duration: 0.3 });
          }
        }
      });
    }
  }, [selectedComponentId]);

  // 4. Handle Camera Presets
  useEffect(() => {
    if (!cameraPreset) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    let targetCam = defaultCameraPos.current.clone();
    let targetLook = defaultTarget.current.clone();

    switch (cameraPreset) {
      case 'front':
        targetCam = new THREE.Vector3(0, 0, 22);
        targetLook = new THREE.Vector3(0, 0, 0);
        break;
      case 'iso':
        targetCam = new THREE.Vector3(18, 12, 20);
        targetLook = new THREE.Vector3(0, 0, 0);
        break;
      case 'side':
        targetCam = new THREE.Vector3(24, 0, 0);
        targetLook = new THREE.Vector3(0, 0, -2);
        break;
      case 'top':
        targetCam = new THREE.Vector3(0, 28, 0.1);
        targetLook = new THREE.Vector3(0, 0, 0);
        break;
      case 'internal':
        targetCam = new THREE.Vector3(-4, 4, 12);
        targetLook = new THREE.Vector3(-2, 1, 0);
        break;
      case 'rear':
        targetCam = new THREE.Vector3(0, 2, -24);
        targetLook = new THREE.Vector3(0, 0, -6);
        break;
      case 'reset':
      default:
        targetCam = defaultCameraPos.current.clone();
        targetLook = defaultTarget.current.clone();
        break;
    }

    gsap.to(camera.position, {
      x: targetCam.x,
      y: targetCam.y,
      z: targetCam.z,
      duration: 1.1,
      ease: 'power2.inOut'
    });

    gsap.to(controls.target, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 1.1,
      ease: 'power2.inOut'
    });
  }, [cameraPreset]);

  // 5. Mouse Raycasting for Interactive Hover & Selection
  const handlePointerDown = (e) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const meshes = Array.from(meshesMapRef.current.values());
    const intersects = raycasterRef.current.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      let hitMesh = intersects[0].object;
      while (hitMesh && !hitMesh.userData.componentId && hitMesh.parent) {
        hitMesh = hitMesh.parent;
      }
      const compId = hitMesh?.userData?.componentId;
      if (compId) {
        onSelectComponent?.(compId);
      }
    }
  };

  const handlePointerMove = (e) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const meshes = Array.from(meshesMapRef.current.values());
    const intersects = raycasterRef.current.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      let hitMesh = intersects[0].object;
      while (hitMesh && !hitMesh.userData.componentId && hitMesh.parent) {
        hitMesh = hitMesh.parent;
      }
      const compId = hitMesh?.userData?.componentId;
      onHoverComponent?.(compId || null);
      container.style.cursor = 'pointer';
    } else {
      onHoverComponent?.(null);
      container.style.cursor = 'default';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-tech-grid"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* 3D Floating Interactive Technical Labels */}
      {showLabels && explodeProgress > 0.25 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {screenLabels
            .filter((_, idx) => idx % 2 === 0 || selectedComponentId)
            .map((lbl) => {
              const isSelected = lbl.id === selectedComponentId;
              const isHovered = lbl.id === hoveredComponentId;
              const show = isSelected || isHovered || (!selectedComponentId && explodeProgress > 0.5);

              if (!show) return null;

              return (
                <div
                  key={lbl.id}
                  style={{
                    position: 'absolute',
                    left: `${lbl.x}px`,
                    top: `${lbl.y}px`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'auto'
                  }}
                  className={`transition-all duration-200 cursor-pointer ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponent?.(lbl.id);
                  }}
                >
                  <div className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-xl border backdrop-blur-md ${
                    isSelected 
                      ? 'bg-sky-500/30 border-sky-400 text-white shadow-sky-500/25 ring-2 ring-sky-400/40' 
                      : 'bg-slate-900/85 border-slate-700/80 text-slate-300 hover:border-sky-400/70 hover:text-white'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-400 animate-ping' : 'bg-sky-500'}`} />
                    <span className="font-mono font-medium tracking-tight text-[11px] whitespace-nowrap">{lbl.name}</span>
                  </div>
                  <div className="w-px h-3 bg-gradient-to-b from-sky-400/80 to-transparent mx-auto" />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
