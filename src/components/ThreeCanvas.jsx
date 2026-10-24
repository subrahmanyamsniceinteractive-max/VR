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
import { isLightColor } from '../utils/themeManager';

export default function ThreeCanvas({
  theme = null,
  headsetType = 'quest3', // 'quest3' | 'vision_pro'
  explodeProgress = 0,
  explodeIntensity = 1.0,
  selectedComponentId = null,
  hoveredComponentId = null,
  onSelectComponent,
  onHoverComponent,
  cameraPreset = null,
  showLabels = true,
  filterCategory = 'all',
  customModelUrl = null,
  onModelInspected,
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
  const defaultCameraPos = useRef(new THREE.Vector3(0, 1.2, 29.5));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));
  const [screenLabels, setScreenLabels] = useState([]);
  const animFrameIdRef = useRef(null);
  const isInteractingRef = useRef(false);

  // Theme Sync Refs for Dynamic Studio Updates
  const bgCanvasRef = useRef(null);
  const bgTextureRef = useRef(null);
  const rimLightRef = useRef(null);
  const hemiLightRef = useRef(null);
  const shadowCanvasRef = useRef(null);
  const shadowTexRef = useRef(null);

  const activeComponentsData = headsetType === 'quest3' ? quest3Data : visionProData;

  const getAssetUrl = (path) => {
    const base = import.meta.env.BASE_URL || '/';
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  const activeModelPath = customModelUrl || (headsetType === 'quest3' 
    ? getAssetUrl('models/quest3_exploded.glb') 
    : getAssetUrl('models/vision_pro_exploded.glb'));

  // 1. Initialize Scene, Studio Lighting & Post-Processing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene with subtle radial blue studio backdrop (#08172B to #173B65)
    const scene = new THREE.Scene();
    
    // High-resolution procedural radial gradient backdrop
    const initialGlow = theme?.glowColor || '#173B65';
    const initialSec = theme?.secondaryBg || '#102744';
    const initialScene = theme?.sceneBg || '#08172B';
    const initialAccent = theme?.accentColor || '#398BFF';

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 1024;
    bgCanvas.height = 1024;
    const bgCtx = bgCanvas.getContext('2d');
    const radialGrad = bgCtx.createRadialGradient(512, 512, 30, 512, 512, 620);
    radialGrad.addColorStop(0, initialGlow);
    radialGrad.addColorStop(0.48, initialSec);
    radialGrad.addColorStop(1, initialScene);
    bgCtx.fillStyle = radialGrad;
    bgCtx.fillRect(0, 0, 1024, 1024);
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = bgTexture;
    scene.fog = new THREE.FogExp2(initialScene, 0.012);
    sceneRef.current = scene;

    bgCanvasRef.current = bgCanvas;
    bgTextureRef.current = bgTexture;

    // Medium-wide product camera view (distortion-free 36° FOV at ~29.5 units distance)
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);
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

    // OrbitControls with comfortable distance bounds (prevent extreme close-ups)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 14;
    controls.maxDistance = 45;
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
    envScene.background = new THREE.Color(0x08172b);

    // Studio Softbox 1: Overhead Neutral White Key Softbox (preserves accurate headset materials)
    const sb1 = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 22),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    sb1.position.set(12, 22, 16);
    sb1.lookAt(0, 0, 0);
    envScene.add(sb1);

    // Studio Softbox 2: Rear Accent Blue Rim Softbox (#398BFF edge highlights)
    const sb2 = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 30),
      new THREE.MeshBasicMaterial({ color: 0x398bff })
    );
    sb2.position.set(-22, 12, -14);
    sb2.lookAt(0, 0, 0);
    envScene.add(sb2);

    // Studio Softbox 3: Deep Navy Secondary Fill (#102744)
    const sb3 = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 24),
      new THREE.MeshBasicMaterial({ color: 0x102744 })
    );
    sb3.position.set(-16, -8, 16);
    sb3.lookAt(0, 0, 0);
    envScene.add(sb3);

    const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envTexture;

    // Physical Studio Lighting Rig (Neutral Key + Restrained Accent Blue Rim)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.45);
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

    // Restrained Accent Rim Lighting on product silhouette
    const rimLight = new THREE.DirectionalLight(initialAccent, 1.75);
    rimLight.position.set(-18, 14, -18);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Soft daylight fill
    const fillLight = new THREE.DirectionalLight(0xeaf2fc, 1.15);
    fillLight.position.set(-16, -8, 14);
    scene.add(fillLight);

    // Subtle glow ambient (sky & ground)
    const hemiLight = new THREE.HemisphereLight(initialGlow, initialScene, 0.85);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Contact Ground Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, 'rgba(5, 15, 28, 0.90)');
    grad.addColorStop(0.35, 'rgba(8, 23, 43, 0.52)');
    grad.addColorStop(0.7, 'rgba(16, 39, 68, 0.16)');
    grad.addColorStop(1, 'rgba(8, 23, 43, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowCanvasRef.current = shadowCanvas;
    shadowTexRef.current = shadowTex;

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
      pcb: textureLoader.load(getAssetUrl('textures/motherboard_pcb.png')),
      chip: textureLoader.load(getAssetUrl('textures/snapdragon_xr2.png')),
      battery: textureLoader.load(getAssetUrl('textures/battery_label.png')),
      lens: textureLoader.load(getAssetUrl('textures/lens_ring.png')),
      display: textureLoader.load(getAssetUrl('textures/display_screen.png')),
      faceplate: textureLoader.load(getAssetUrl('textures/faceplate.png')),
      faceplateNormal: textureLoader.load(getAssetUrl('textures/faceplate_normal.png')),
      faceplateRoughness: textureLoader.load(getAssetUrl('textures/faceplate_roughness.png')),
      strap: textureLoader.load(getAssetUrl('textures/fabric_strap.png')),
      // Vision Pro Textures
      eyesight: textureLoader.load(getAssetUrl('textures/vision_eyesight.png')),
      visionSilicon: textureLoader.load(getAssetUrl('textures/vision_silicon.png')),
      soloKnit: textureLoader.load(getAssetUrl('textures/vision_solo_knit.png')),
      microOled: textureLoader.load(getAssetUrl('textures/vision_micro_oled.png'))
    };
    Object.values(textures).forEach(t => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    });
    textures.faceplateNormal.colorSpace = THREE.NoColorSpace;
    textures.faceplateRoughness.colorSpace = THREE.NoColorSpace;

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
                // Calibrated Satin Matte Injection-Molded Polymer (PC-ABS) with Mold-Tech micro-texture
                child.geometry.computeVertexNormals();
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0xedeeF2, // sophisticated satin off-white
                  roughness: 0.40,
                  roughnessMap: textures.faceplateRoughness,
                  metalness: 0.02,
                  clearcoat: 0.08,
                  clearcoatRoughness: 0.35,
                  sheen: 0.28,
                  sheenRoughness: 0.48,
                  sheenColor: new THREE.Color(0xffffff),
                  map: textures.faceplate,
                  normalMap: textures.faceplateNormal,
                  normalScale: new THREE.Vector2(0.40, 0.40),
                  envMapIntensity: 1.15
                });
              } else if (compId === 'exterior_housing') {
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0xf4f4f5,
                  roughness: 0.38,
                  metalness: 0.03,
                  envMapIntensity: 1.0
                });
              } else if (compId === 'exterior_sensors') {
                // High-gloss obsidian optical acrylic with AR camera optics
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0x07080a,
                  roughness: 0.08,
                  metalness: 0.20,
                  clearcoat: 0.95,
                  clearcoatRoughness: 0.08,
                  envMapIntensity: 2.2
                });
              } else if (compId === 'exterior_side_arms') {
                // Cantilever temple arms & audio slots
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0xf4f4f6,
                  roughness: 0.36,
                  metalness: 0.02,
                  clearcoat: 0.15,
                  envMapIntensity: 1.0
                });
              } else if (compId === 'optics_lens_left' || compId === 'optics_lens_right') {
                // Optical multi-element glass with realistic refraction
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0xffffff,
                  roughness: 0.03,
                  metalness: 0.02,
                  transmission: 0.97,
                  ior: 1.54,
                  thickness: 2.2,
                  specularIntensity: 1.4,
                  specularColor: new THREE.Color(0xffffff),
                  transparent: false,
                  envMapIntensity: 2.2
                });
              } else if (compId === 'optics_displays') {
                // Dual Fast-Switch LCD Infinite Display Matrix
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x080c14,
                  map: textures.display,
                  roughness: 0.20,
                  metalness: 0.40,
                  emissive: new THREE.Color(0x0e2438),
                  emissiveIntensity: 0.50,
                  envMapIntensity: 1.4
                });
              } else if (compId === 'optics_brackets') {
                // Die-cast magnesium IPD carriage & guide rods
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x52525b,
                  roughness: 0.28,
                  metalness: 0.88,
                  envMapIntensity: 1.6
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
              } else if (compId === 'electronics_cooling_fan_heatsink') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xc86d38, // sintered pure copper
                  roughness: 0.22,
                  metalness: 0.96,
                  envMapIntensity: 2.0
                });
              } else if (compId === 'power_battery') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xd4d4d8,
                  map: textures.battery,
                  roughness: 0.26,
                  metalness: 0.85,
                  envMapIntensity: 1.5
                });
              } else if (compId === 'power_connectors') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x222328,
                  roughness: 0.35,
                  metalness: 0.65,
                  envMapIntensity: 1.4
                });
              } else if (compId === 'electronics_flex_cables') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xb5781a,
                  roughness: 0.25,
                  metalness: 0.82,
                  envMapIntensity: 1.8
                });
              } else if (compId === 'electronics_connectivity_rf') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xb0b4bc,
                  roughness: 0.24,
                  metalness: 0.94,
                  envMapIntensity: 1.8
                });
              } else if (compId === 'comfort_facial_interface') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x1c1e24,
                  roughness: 0.88,
                  metalness: 0.02,
                  envMapIntensity: 0.4
                });
              } else if (compId === 'comfort_cushion_padding') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x14161a,
                  map: textures.strap,
                  roughness: 0.96,
                  metalness: 0.0,
                  envMapIntensity: 0.3
                });
              } else if (compId === 'comfort_head_strap') {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x27272a,
                  map: textures.strap,
                  roughness: 0.92,
                  metalness: 0.02,
                  envMapIntensity: 0.5
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

        // Dynamic 3D Model Structural Inspection
        const inspectedMeshes = [];
        let totalVerts = 0;
        let totalFaces = 0;

        meshesMapRef.current.forEach((mesh, id) => {
          const vCount = mesh.geometry?.attributes?.position?.count || 0;
          const fCount = mesh.geometry?.index ? mesh.geometry.index.count / 3 : vCount / 3;
          totalVerts += vCount;
          totalFaces += fCount;

          const meta = activeComponentsData.find(c => c.id === id);
          inspectedMeshes.push({
            id,
            name: meta ? meta.name : id,
            category: meta ? meta.category : 'Subassembly',
            groupName: meta ? meta.groupName : 'GENERAL',
            specs: meta ? meta.specs : '',
            vertices: vCount,
            faces: Math.round(fCount),
            isHighDensity: vCount > 1000
          });
        });

        onModelInspected?.({
          modelPath: activeModelPath,
          meshCount: inspectedMeshes.length,
          totalVertices: totalVerts,
          totalFaces: Math.round(totalFaces),
          meshes: inspectedMeshes
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
          // Subtle, slow, smooth product rotation (controlled and non-distracting)
          root.rotation.y = elapsedTime * 0.06;
          root.position.y = Math.sin(elapsedTime * 0.5) * 0.05;
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

    // Drag & Drop external CAD / GLB model loader for real engineering assets
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
          const blobUrl = URL.createObjectURL(file);
          loader.load(blobUrl, (gltf) => {
            const oldRoot = scene.getObjectByName('Headset_Root');
            if (oldRoot) scene.remove(oldRoot);
            const model = gltf.scene;
            model.name = 'Headset_Root';
            scene.add(model);
            meshesMapRef.current.clear();
            const droppedMeshes = [];
            let vTotal = 0;
            let fTotal = 0;
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                const mName = child.name || `mesh_${droppedMeshes.length + 1}`;
                child.userData.componentId = mName;
                child.userData.originalPos = child.position.clone();
                child.userData.baseMaterial = child.material.clone();
                meshesMapRef.current.set(mName, child);
                const v = child.geometry?.attributes?.position?.count || 0;
                const f = child.geometry?.index ? child.geometry.index.count / 3 : v / 3;
                vTotal += v;
                fTotal += f;
                droppedMeshes.push({
                  id: mName,
                  name: mName,
                  category: 'Imported CAD Mesh',
                  groupName: 'CUSTOM CAD IMPORT',
                  vertices: v,
                  faces: Math.round(f),
                  isHighDensity: v > 1000
                });
              }
            });
            onModelInspected?.({
              modelPath: `Local File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
              meshCount: droppedMeshes.length,
              totalVertices: vTotal,
              totalFaces: Math.round(fTotal),
              meshes: droppedMeshes
            });
          });
        }
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
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

        // Comfortable medium-wide product camera view (prevents aggressive close-ups)
        const camOffset = new THREE.Vector3(
          targetWorldPos.x * 0.35 + 1.5,
          targetWorldPos.y * 0.35 + 1.2,
          28.0
        );

        gsap.to(controls.target, {
          x: targetWorldPos.x * 0.3,
          y: targetWorldPos.y * 0.3,
          z: 0,
          duration: 1.3,
          ease: 'power2.inOut'
        });

        gsap.to(camera.position, {
          x: camOffset.x,
          y: camOffset.y,
          z: camOffset.z,
          duration: 1.3,
          ease: 'power2.inOut'
        });

        // Highlight selected mesh with subtle blue glow (#173B65 / #398BFF)
        meshesMapRef.current.forEach((mesh, id) => {
          if (id === selectedComponentId) {
            if (mesh.material.emissive) {
              gsap.to(mesh.material.emissive, {
                r: 0.09,
                g: 0.23,
                b: 0.45,
                duration: 0.3
              });
              mesh.material.emissiveIntensity = 0.60;
            }
          } else {
            if (mesh.material.opacity !== undefined) {
              mesh.material.transparent = true;
              gsap.to(mesh.material, { opacity: 0.25, duration: 0.3 });
            }
          }
        });
      }
    } else {
      // Smoothly restore comfortable default camera framing when deselected
      gsap.to(controls.target, {
        x: defaultTarget.current.x,
        y: defaultTarget.current.y,
        z: defaultTarget.current.z,
        duration: 1.3,
        ease: 'power2.inOut'
      });
      gsap.to(camera.position, {
        x: defaultCameraPos.current.x,
        y: defaultCameraPos.current.y,
        z: defaultCameraPos.current.z,
        duration: 1.3,
        ease: 'power2.inOut'
      });

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

  // 3b. Handle Subassembly Category Filtering
  useEffect(() => {
    if (!meshesMapRef.current || meshesMapRef.current.size === 0) return;
    
    meshesMapRef.current.forEach((mesh, compId) => {
      const compMeta = activeComponentsData.find(c => c.id === compId);
      if (!compMeta) return;

      let isVisible = true;
      if (filterCategory === 'exterior') {
        isVisible = compMeta.group === 'group_exterior';
      } else if (filterCategory === 'optics') {
        isVisible = compMeta.group === 'group_optics';
      } else if (filterCategory === 'electronics') {
        isVisible = compMeta.group === 'group_electronics';
      } else if (filterCategory === 'power') {
        isVisible = compMeta.group === 'group_power';
      } else if (filterCategory === 'comfort') {
        isVisible = compMeta.group === 'group_comfort';
      }

      if (mesh.material) {
        mesh.material.transparent = true;
        const targetOpacity = isVisible ? (mesh.userData.baseMaterial?.opacity || 1.0) : 0.08;
        gsap.to(mesh.material, {
          opacity: targetOpacity,
          duration: 0.45,
          overwrite: 'auto'
        });
      }
    });
  }, [filterCategory, activeComponentsData]);

  // Live Sync Theme with Three.js (Scene Backdrop, Fog, Rim Light, Ambient Light, Shadows)
  useEffect(() => {
    if (!theme || !sceneRef.current) return;

    // 1. Update procedural radial gradient backdrop
    const bgCanvas = bgCanvasRef.current;
    if (bgCanvas && bgTextureRef.current) {
      const bgCtx = bgCanvas.getContext('2d');
      const radialGrad = bgCtx.createRadialGradient(512, 512, 30, 512, 512, 620);
      radialGrad.addColorStop(0, theme.glowColor || '#173B65');
      radialGrad.addColorStop(0.48, theme.secondaryBg || '#102744');
      radialGrad.addColorStop(1, theme.sceneBg || '#08172B');
      bgCtx.fillStyle = radialGrad;
      bgCtx.fillRect(0, 0, 1024, 1024);
      bgTextureRef.current.needsUpdate = true;
    }

    // 2. Update Scene Fog
    if (sceneRef.current.fog && theme.sceneBg) {
      sceneRef.current.fog.color.set(theme.sceneBg);
    }

    // 3. Update Rim Light
    if (rimLightRef.current && theme.accentColor) {
      rimLightRef.current.color.set(theme.accentColor);
    }

    // 4. Update Ambient / Hemisphere Light
    if (hemiLightRef.current) {
      if (theme.glowColor) hemiLightRef.current.color.set(theme.glowColor);
      if (theme.sceneBg) hemiLightRef.current.groundColor.set(theme.sceneBg);
    }

    // 5. Update Contact Shadow
    const shadowCanvas = shadowCanvasRef.current;
    if (shadowCanvas && shadowTexRef.current) {
      const ctx = shadowCanvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);
      const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      const isLight = isLightColor(theme.sceneBg);
      if (isLight) {
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.18)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.06)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(5, 15, 28, 0.90)');
        grad.addColorStop(0.35, 'rgba(8, 23, 43, 0.52)');
        grad.addColorStop(0.7, 'rgba(16, 39, 68, 0.16)');
        grad.addColorStop(1, 'rgba(8, 23, 43, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      shadowTexRef.current.needsUpdate = true;
    }
  }, [theme]);

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
        targetCam = new THREE.Vector3(0, 1.2, 29.5);
        targetLook = new THREE.Vector3(0, 0, 0);
        break;
      case 'iso':
        targetCam = new THREE.Vector3(19.0, 11.0, 22.0);
        targetLook = new THREE.Vector3(0, 0, 0);
        break;
      case 'side':
        targetCam = new THREE.Vector3(30.0, 1.2, 0);
        targetLook = new THREE.Vector3(0, 0, -1);
        break;
      case 'top':
        targetCam = new THREE.Vector3(0, 31.0, 3.5);
        targetLook = new THREE.Vector3(0, 0, 0);
        break;
      case 'internal':
      case 'optics':
        // Medium-wide angled optical perspective (preserves breathing space, no extreme close-up)
        targetCam = new THREE.Vector3(-12.0, 7.5, 26.0);
        targetLook = new THREE.Vector3(-1.0, 0.5, 0);
        break;
      case 'rear':
        targetCam = new THREE.Vector3(0, 2.0, -30.5);
        targetLook = new THREE.Vector3(0, 0, -2);
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
      duration: 1.4,
      ease: 'power2.inOut'
    });

    gsap.to(controls.target, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 1.4,
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
                  <div className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-2 shadow-lg border backdrop-blur-md transition-colors ${
                    isSelected 
                      ? 'bg-[var(--accent-color)] text-[#FFFFFF] border-[var(--accent-color)] font-medium shadow-[var(--accent-color)]/30' 
                      : 'navy-glass text-[var(--text-primary)] border-[var(--accent-color)]/25 hover:border-[var(--accent-color)]'
                  }`}>
                    <span className="font-mono text-[10px] text-[var(--text-secondary)]">0{idx + 1}</span>
                    <span className="text-[11px] whitespace-nowrap font-sans">{lbl.name}</span>
                  </div>
                  <div className="w-px h-3 bg-[var(--accent-color)]/60 mx-auto" />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
