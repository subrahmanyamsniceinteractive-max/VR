import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
  const controlsRef = useRef(null);
  const meshesMapRef = useRef(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const defaultCameraPos = useRef(new THREE.Vector3(0, 2.5, 24));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));
  const [screenLabels, setScreenLabels] = useState([]);
  const animFrameIdRef = useRef(null);
  const isInteractingRef = useRef(false);

  // 1. Initialize Scene & Renderer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070913);
    scene.fog = new THREE.FogExp2(0x070913, 0.018);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.copy(defaultCameraPos.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 7;
    controls.maxDistance = 45;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.minPolarAngle = 0.08;
    controls.target.copy(defaultTarget.current);
    controlsRef.current = controls;

    controls.addEventListener('start', () => { isInteractingRef.current = true; });
    controls.addEventListener('end', () => { isInteractingRef.current = false; });

    // Studio Lighting
    // 1. Key directional light
    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 2.4);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    scene.add(keyLight);

    // 2. Rim/Back light for edge silhouette
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-14, 12, -16);
    scene.add(rimLight);

    // 3. Fill light (violet tint for futuristic studio feel)
    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    fillLight.position.set(-15, -6, 12);
    scene.add(fillLight);

    // 4. Soft ambient light
    const hemiLight = new THREE.HemisphereLight(0x1e293b, 0x020617, 0.9);
    scene.add(hemiLight);

    // 5. Internal exploded core light
    const coreLight = new THREE.PointLight(0x38bdf8, 1.8, 22);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // Subtle floor shadow plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0, 12, 30, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 12, 30, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 32),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -9.2;
    scene.add(shadowPlane);

    // Load Procedural Textures
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

        // Process all 18 components
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

            // Material upgrades for realistic PBR
            if (compId === 'exterior_faceplate') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xf8fafc,
                roughness: 0.32,
                metalness: 0.02,
                map: textures.faceplate,
                envMapIntensity: 1.2
              });
            } else if (compId === 'exterior_housing') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xf1f5f9,
                roughness: 0.38,
                metalness: 0.04
              });
            } else if (compId === 'optics_lens_left' || compId === 'optics_lens_right') {
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0x0f172a,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.88,
                ior: 1.54,
                thickness: 1.2,
                specularIntensity: 1.0,
                specularColor: new THREE.Color(0x38bdf8),
                transparent: true,
                opacity: 0.92
              });
            } else if (compId === 'optics_displays') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x090d16,
                map: textures.display,
                emissive: new THREE.Color(0x00f0ff),
                emissiveIntensity: 0.45,
                roughness: 0.2,
                metalness: 0.5
              });
            } else if (compId === 'electronics_motherboard') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x142018,
                map: textures.pcb,
                roughness: 0.35,
                metalness: 0.45
              });
            } else if (compId === 'electronics_snapdragon_xr2') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x181a20,
                map: textures.chip,
                roughness: 0.22,
                metalness: 0.85
              });
            } else if (compId === 'power_battery') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xd8dee9,
                map: textures.battery,
                roughness: 0.28,
                metalness: 0.82
              });
            } else if (compId === 'electronics_cooling_fan_heatsink') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xcd7f32, // copper tone
                roughness: 0.25,
                metalness: 0.95
              });
            } else if (compId === 'electronics_flex_cables') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xdf9a24, // Amber Kapton
                roughness: 0.3,
                metalness: 0.5,
                transparent: true,
                opacity: 0.92
              });
            } else if (compId === 'comfort_head_strap' || compId === 'comfort_cushion_padding') {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x222630,
                map: textures.strap,
                roughness: 0.9,
                metalness: 0.02
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
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Controls damping update
      controls.update();

      // Gentle floating oscillation when assembled
      if (sceneRef.current) {
        const root = sceneRef.current.getObjectByName('Quest3_Root');
        if (root && !isInteractingRef.current) {
          // Slow floating idle
          root.position.y = Math.sin(elapsedTime * 1.2) * 0.25;
          root.rotation.y = Math.sin(elapsedTime * 0.4) * 0.05;
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
            
            // Project 3D to 2D screen coordinates
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

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
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

      // Smooth interpolation
      const targetPos = new THREE.Vector3().lerpVectors(assembled, exploded, explodeProgress);

      gsap.to(mesh.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 0.6,
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

        // Calculate offset camera position
        const dist = compMeta.cameraDist || 14;
        const camOffset = new THREE.Vector3(
          targetWorldPos.x + 3.0,
          targetWorldPos.y + 2.0,
          targetWorldPos.z + dist
        );

        // Smooth camera tween
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

        // Highlight selected mesh & dim others
        meshesMapRef.current.forEach((mesh, id) => {
          if (id === selectedComponentId) {
            if (mesh.material.emissive) {
              gsap.to(mesh.material.emissive, {
                r: 0.1,
                g: 0.35,
                b: 0.6,
                duration: 0.3
              });
              mesh.material.emissiveIntensity = 0.8;
            }
          } else {
            // Dim other parts
            if (mesh.material.opacity !== undefined) {
              mesh.material.transparent = true;
              gsap.to(mesh.material, { opacity: 0.35, duration: 0.3 });
            }
          }
        });
      }
    } else {
      // Restore all meshes to normal
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
            .filter((_, idx) => idx % 2 === 0 || selectedComponentId) // limit label density for elegance
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
                  <div className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 shadow-lg border backdrop-blur-md ${
                    isSelected 
                      ? 'bg-sky-500/30 border-sky-400 text-white shadow-sky-500/20' 
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-sky-400/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-400 animate-ping' : 'bg-sky-500'}`} />
                    <span className="font-mono font-medium tracking-tight text-[11px] whitespace-nowrap">{lbl.name}</span>
                  </div>
                  {/* Subtle connector stem */}
                  <div className="w-px h-3 bg-gradient-to-b from-sky-400/80 to-transparent mx-auto" />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
