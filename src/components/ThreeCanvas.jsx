import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import gsap from 'gsap';
import quest3Data from '../data/componentsData.json';
import visionProData from '../data/visionProData.json';

export default function ThreeCanvas({
  headsetType = 'quest3', // 'quest3' | 'vision_pro'
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

  const activeComponentsData = headsetType === 'quest3' ? quest3Data : visionProData;
  const activeModelPath = headsetType === 'quest3' 
    ? '/models/quest3_exploded.glb' 
    : '/models/vision_pro_exploded.glb';

  // 1. Initialize Scene, Studio Lighting & Post-Processing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene with dark graphite studio background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0f);
    scene.fog = new THREE.FogExp2(0x090a0f, 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.copy(defaultCameraPos.current);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      depth: true
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

    // Post-Processing Pipeline
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.22,  // subtle threshold bloom for specular glints
      0.4,
      0.86
    );
    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    composerRef.current = composer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI * 0.90;
    controls.minPolarAngle = 0.10;
    controls.target.copy(defaultTarget.current);
    controlsRef.current = controls;

    controls.addEventListener('start', () => { isInteractingRef.current = true; });
    controls.addEventListener('end', () => { isInteractingRef.current = false; });

    // Procedural Studio HDRI Environment Map (Industrial Product Photography)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x090a0f);

    // Studio Softbox 1: Large Overhead Softbox
    const sb1 = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 22),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    sb1.position.set(12, 22, 16);
    sb1.lookAt(0, 0, 0);
    envScene.add(sb1);

    // Studio Softbox 2: Diffused Side Daylight Fill
    const sb2 = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 30),
      new THREE.MeshBasicMaterial({ color: 0xf1f5f9 })
    );
    sb2.position.set(-22, 10, -12);
    sb2.lookAt(0, 0, 0);
    envScene.add(sb2);

    // Studio Softbox 3: Subtle Rim Strip
    const sb3 = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 24),
      new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
    );
    sb3.position.set(-16, -8, 16);
    sb3.lookAt(0, 0, 0);
    envScene.add(sb3);

    const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envTexture;

    // Physical Studio Lighting Rig (Neutral 5500K)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
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

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(-16, 14, -18);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 1.2);
    fillLight.position.set(-16, -8, 14);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0x27272a, 0x090a0f, 0.85);
    scene.add(hemiLight);

    // Contact Ground Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.82)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.42)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
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

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const textures = {
      pcb: textureLoader.load('/textures/motherboard_pcb.png'),
      chip: textureLoader.load('/textures/snapdragon_xr2.png'),
      battery: textureLoader.load('/textures/battery_label.png'),
      lens: textureLoader.load('/textures/lens_ring.png'),
      display: textureLoader.load('/textures/display_screen.png'),
      faceplate: textureLoader.load('/textures/faceplate.png'),
      strap: textureLoader.load('/textures/fabric_strap.png'),
      // Vision Pro Textures
      eyesight: textureLoader.load('/textures/vision_eyesight.png'),
      visionSilicon: textureLoader.load('/textures/vision_silicon.png'),
      soloKnit: textureLoader.load('/textures/vision_solo_knit.png'),
      microOled: textureLoader.load('/textures/vision_micro_oled.png')
    };
    Object.values(textures).forEach(t => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    });

    // Load Model
    const loader = new GLTFLoader();
    onLoadProgress?.(15);
    meshesMapRef.current.clear();

    loader.load(
      activeModelPath,
      (gltf) => {
        onLoadProgress?.(85);
        const model = gltf.scene;
        model.name = 'Headset_Root';
        scene.add(model);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const compMeta = activeComponentsData.find(c => c.id === child.name || c.id === child.parent?.name);
            const compId = compMeta ? compMeta.id : child.name;

            child.userData.componentId = compId;
            child.userData.originalPos = child.position.clone();
            child.userData.originalRot = child.rotation.clone();
            child.userData.assembledPos = compMeta ? new THREE.Vector3(...compMeta.assembled) : child.position.clone();
            child.userData.explodedPos = compMeta ? new THREE.Vector3(...compMeta.exploded) : child.position.clone();

            // Calibrated Industrial PBR Materials
            if (headsetType === 'quest3') {
              if (compId === 'exterior_faceplate') {
                // Satin matte injection-molded polymer
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0xfafafa,
                  roughness: 0.35,
                  metalness: 0.02,
                  clearcoat: 0.20,
                  clearcoatRoughness: 0.25,
                  map: textures.faceplate,
                  envMapIntensity: 1.2
                });
              } else if (compId === 'exterior_housing') {
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0xf4f4f5,
                  roughness: 0.38,
                  metalness: 0.03,
                  envMapIntensity: 1.0
                });
              } else if (compId === 'optics_lens_left' || compId === 'optics_lens_right') {
                // Optical multi-element glass
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0x090a10,
                  roughness: 0.02,
                  metalness: 0.06,
                  transmission: 0.95,
                  ior: 1.54,
                  thickness: 1.8,
                  specularIntensity: 1.2,
                  specularColor: new THREE.Color(0xa1a1aa),
                  transparent: true,
                  opacity: 0.92,
                  envMapIntensity: 1.8
                });
              } else if (compId === 'electronics_motherboard') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x18191c,
                  map: textures.pcb,
                  roughness: 0.32,
                  metalness: 0.40,
                  envMapIntensity: 1.2
                });
              } else if (compId === 'electronics_snapdragon_xr2') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x18191c,
                  map: textures.chip,
                  roughness: 0.16,
                  metalness: 0.95,
                  envMapIntensity: 1.8
                });
              } else if (compId === 'power_battery') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xd4d4d8,
                  map: textures.battery,
                  roughness: 0.26,
                  metalness: 0.85,
                  envMapIntensity: 1.5
                });
              } else if (compId === 'electronics_cooling_fan_heatsink') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xc86d38, // sintered copper
                  roughness: 0.22,
                  metalness: 0.96,
                  envMapIntensity: 2.0
                });
              } else if (compId === 'comfort_head_strap' || compId === 'comfort_cushion_padding') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x27272a,
                  map: textures.strap,
                  roughness: 0.92,
                  metalness: 0.02,
                  envMapIntensity: 0.5
                });
              } else if (compId === 'optics_brackets') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x52525b,
                  roughness: 0.28,
                  metalness: 0.88,
                  envMapIntensity: 1.6
                });
              }
            } else {
              // Vision Pro Materials
              if (compId === 'vision_glass_visor') {
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0x06070c,
                  roughness: 0.02,
                  metalness: 0.05,
                  transmission: 0.96,
                  ior: 1.52,
                  thickness: 1.8,
                  specularIntensity: 1.5,
                  specularColor: new THREE.Color(0xffffff),
                  transparent: true,
                  opacity: 0.94,
                  envMapIntensity: 2.2
                });
              } else if (compId === 'vision_aluminum_frame') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xe4e4e7,
                  roughness: 0.28,
                  metalness: 0.92,
                  envMapIntensity: 2.0
                });
              } else if (compId === 'vision_eyesight_oled') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x100820,
                  map: textures.eyesight,
                  emissiveMap: textures.eyesight,
                  emissive: new THREE.Color(0x8b5cf6),
                  emissiveIntensity: 0.85,
                  roughness: 0.15,
                  metalness: 0.35
                });
              } else if (compId === 'vision_apple_silicon') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x18191c,
                  map: textures.visionSilicon,
                  roughness: 0.18,
                  metalness: 0.95
                });
              } else if (compId === 'vision_solo_knit_band') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x3f3f46,
                  map: textures.soloKnit,
                  roughness: 0.88,
                  metalness: 0.04
                });
              }
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
        console.error('Failed to load 3D model:', err);
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

    // Animation Loop with slow, smooth, controlled 360-degree rotation
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Slow, smooth, controlled product rotation when assembled
      if (sceneRef.current) {
        const root = sceneRef.current.getObjectByName('Headset_Root');
        if (root && !isInteractingRef.current) {
          // Slow continuous rotation
          root.rotation.y = elapsedTime * 0.12;
          root.position.y = Math.sin(elapsedTime * 0.8) * 0.15;
        }
      }

      // Update Screen Coordinates for Architectural Leader Callouts
      if (camera && container) {
        const labels = [];
        const w = container.clientWidth;
        const h = container.clientHeight;

        activeComponentsData.forEach((comp) => {
          const mesh = meshesMapRef.current.get(comp.id);
          if (mesh) {
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            
            const screenPos = worldPos.clone().project(camera);
            const isVisible = screenPos.z < 1.0 && screenPos.x >= -0.9 && screenPos.x <= 0.9 && screenPos.y >= -0.9 && screenPos.y <= 0.9;

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
  }, [headsetType]);

  // 2. Handle Explode Progress & Intensity
  useEffect(() => {
    meshesMapRef.current.forEach((mesh, compId) => {
      const compMeta = activeComponentsData.find(c => c.id === compId);
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
  }, [explodeProgress, explodeIntensity, activeComponentsData]);

  // 3. Handle Component Selection & Camera Framing
  useEffect(() => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (selectedComponentId) {
      const compMeta = activeComponentsData.find(c => c.id === selectedComponentId);
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

        // Highlight selected mesh subtly without neon glow
        meshesMapRef.current.forEach((mesh, id) => {
          if (id === selectedComponentId) {
            if (mesh.material.emissive) {
              gsap.to(mesh.material.emissive, {
                r: 0.12,
                g: 0.12,
                b: 0.15,
                duration: 0.3
              });
              mesh.material.emissiveIntensity = 0.5;
            }
          } else {
            if (mesh.material.opacity !== undefined) {
              mesh.material.transparent = true;
              gsap.to(mesh.material, { opacity: 0.28, duration: 0.3 });
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
  }, [selectedComponentId, activeComponentsData]);

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

  // 5. Mouse Raycasting for Selection
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
      className="relative w-full h-full overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Architectural Leader Callout Labels */}
      {showLabels && explodeProgress > 0.25 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {screenLabels
            .filter((_, idx) => idx % 2 === 0 || selectedComponentId)
            .map((lbl, idx) => {
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
                    isSelected ? 'scale-105 z-30' : 'hover:scale-102 z-20'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponent?.(lbl.id);
                  }}
                >
                  <div className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-2 shadow-lg border backdrop-blur-md ${
                    isSelected 
                      ? 'bg-white text-zinc-950 border-white font-medium shadow-white/10' 
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-white'
                  }`}>
                    <span className="font-mono text-[10px] text-zinc-400">0{idx + 1}</span>
                    <span className="text-[11px] whitespace-nowrap font-sans">{lbl.name}</span>
                  </div>
                  <div className="w-px h-3 bg-zinc-600 mx-auto" />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
