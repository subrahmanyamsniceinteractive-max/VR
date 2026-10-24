# Meta Quest 3 — Realistic Interactive 3D Exploded View Experience

A photorealistic, interactive 3D product engineering visualization and teardown experience of the **Meta Quest 3** virtual and mixed-reality headset, built with Three.js, React, Tailwind CSS, GSAP, and physically based rendering (PBR) materials.

---

## 🌟 Key Features

### 1. Genuine Multi-Part 3D Model (`.glb`)
- 18 discrete, independently accessible 3D hardware subassemblies across 5 functional engineering groups:
  - **GROUP A — EXTERIOR**: Front Faceplate, Main Chassis Housing & Frame, Tracking Cameras & Sensor Assemblies, Hinged Side Arms with Spatial Audio Chambers.
  - **GROUP B — OPTICAL SYSTEM**: Left Folded Pancake Lens Module, Right Folded Pancake Lens Module, Dual Fast-Switch LCD Displays (2064×2208 per eye), Precision Magnesium Optical Carrier & IPD Mechanism.
  - **GROUP C — ELECTRONICS**: Contoured Multi-Layer Motherboard PCB, Qualcomm Snapdragon XR2 Gen 2 Platform (4nm TSMC, Adreno 740, 12GB LPDDR5), RF & 6DoF IMU Tracking Subsystem, Amber Kapton Flex Ribbon Circuits (FFC), Active Radial Blower Fan with Sintered Copper Heat Pipe.
  - **GROUP D — POWER SYSTEM**: Curved 5,060 mAh (19.44 Wh) Lithium-Ion Polymer Battery Pack with Integrated BMS, Heavy-Gauge Silicone Power Harness & Locking Header.
  - **GROUP E — FIT AND COMFORT**: Contoured Facial Interface Bezel with 4-Position Eye-Relief Sliders, Removable Breathable Athletic Mesh Memory Foam Cushion with Silicone Nose Light Blockers, Flexible Elastic Y-Strap with Dual Rear Sliders.

### 2. Smooth Bi-Directional Disassembly & Reassembly Animations
- **Assemble / Disassemble Toggle**: Smooth physical transitions powered by GSAP easing (`power2.inOut`).
- **Interactive Scrubber**: Real-time slider (0% to 100%) to scrub and inspect any intermediate teardown state.
- **Spread Intensity Slider**: Dynamically adjust component separation distance (0.6x to 1.6x).
- **Cinematic Auto-Play**: Play/pause loop that orchestrates a cinematic teardown and reassembly presentation.

### 3. Interactive Component Selection & Inspection
- **3D Raycasting**: Hover highlights and click-to-select directly on 3D meshes in the viewport.
- **Telemetry HUD Inspector**:
  - Displays verified hardware names, architecture group, and verified hardware badges.
  - In-depth hardware specifications (silicon process node, display resolution, battery chemistry, lens geometry).
  - Exact real-time assembled $[X, Y, Z]$ and exploded $[X, Y, Z]$ coordinates.
  - Smooth camera focusing: Camera glides automatically to frame the selected component up close while softly dimming unrelated parts.
- **Component Directory Drawer**: Searchable list of all 18 subassemblies with category filters (`All`, `Exterior`, `Optics`, `Compute`, `Power`, `Fit & Comfort`).
- **3D Screen Labels**: Screen-projected interactive pins that follow components in 3D space during exploded view.

### 4. Dual-Mode Experience: 3D Studio & Scroll-Driven Storytelling
- **3D Studio Mode**: Full OrbitControls navigation with damping, bounded zoom, 6 cinematic camera presets (`Front`, `3/4 Iso`, `Profile`, `Top`, `Optics`, `Rear`), reset controls, and technical HUD.
- **Scroll Story Mode**: Long-form narrative journey driven by GSAP ScrollTrigger across 7 engineering chapters:
  1. *Section 1: Product Reveal* — Assembled Quest 3 floating in studio lighting.
  2. *Section 2: Exterior Engineering* — Sensor apertures, 4MP RGB passthrough cameras, and temple arms.
  3. *Section 3: Optical System* — Folded pancake lenses, polarizing beam splitters, and dual LCD panels.
  4. *Section 4: Computing System* — Qualcomm Snapdragon XR2 Gen 2 die, Adreno 740 GPU, and Hexagon NPU.
  5. *Section 5: Power & Thermal* — Curved 19.44 Wh lithium battery and active centrifugal radial cooling.
  6. *Section 6: Full Exploded Engineering View* — All 18 parts separated in balanced composition.
  7. *Section 7: Precision Reassembly* — Coordinated return to the fully assembled product.

### 5. Physically Based Rendering (PBR) & Studio Lighting
- Key, rim, fill, and core accent lights delivering soft blue and violet studio lighting.
- Contact ground shadow plane with radial gradient falloff.
- Physical materials with transmission and dispersion for pancake lenses, brushed aluminum for battery pouch, procedural copper traces for motherboard PCB, and matte white polymer for the exterior shell.

---

## 🛠️ Technology Stack
- **Rendering**: Three.js (r186) with `GLTFLoader`, `OrbitControls`, `ACESFilmicToneMapping`, `PCFSoftShadowMap`.
- **Framework**: React 19 + Vite 8.
- **Animation**: GSAP 3 (GreenSock Animation Platform) + ScrollTrigger.
- **Styling**: Tailwind CSS v4 + Glassmorphic UI overlays.
- **Icons**: Lucide React.
- **3D Asset Generation**: Python with `trimesh`, `scipy`, `pygltflib`, and `Pillow`.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview the Production Build
```bash
npm run preview
```

---

## 📐 3D Model Pipeline & Customization Guide

### File Location
The compiled 3D binary model is located at:
```
public/models/quest3_exploded.glb
```

### Regenerating or Modifying the Procedural 3D Model
To rebuild the GLB model and all procedural textures:
```bash
python scripts/generate_quest3_glb.py
```
This script:
1. Synthesizes high-resolution PBR textures in `public/textures/`:
   - `motherboard_pcb.png` (traces, vias, golden contact pads, IC footprints)
   - `snapdragon_xr2.png` (Qualcomm Snapdragon XR2 Gen 2 laser etched die)
   - `battery_label.png` (brushed silver cell with Model FB40 regulatory specs)
   - `lens_ring.png` (laser-etched optical ring text)
   - `display_screen.png` (active subpixel VR test matrix)
   - `faceplate.png` (subtle matte contour with debossed Meta insignia)
   - `fabric_strap.png` (breathable woven elastic mesh pattern)
2. Compiles all 18 discrete geometries into a single glTF 2.0 binary (`.glb`).
3. Exports coordinates, camera targets, and hardware specifications to `src/data/componentsData.json`.

### Integrating Your Own CAD / GLB Model
If replacing `quest3_exploded.glb` with your own CAD export:
1. Ensure your model meshes are named matching the 18 IDs:
   - `exterior_faceplate`
   - `exterior_housing`
   - `exterior_sensors`
   - `exterior_side_arms`
   - `optics_lens_left`
   - `optics_lens_right`
   - `optics_displays`
   - `optics_brackets`
   - `electronics_motherboard`
   - `electronics_snapdragon_xr2`
   - `electronics_connectivity_rf`
   - `electronics_flex_cables`
   - `electronics_cooling_fan_heatsink`
   - `power_battery`
   - `power_connectors`
   - `comfort_facial_interface`
   - `comfort_head_strap`
   - `comfort_cushion_padding`
2. Save your file to `public/models/quest3_exploded.glb`.
3. Adjust target explode offsets in `src/data/componentsData.json` if necessary.

---

## 📄 License & Attribution
Designed as an educational product engineering visualization and interactive 3D demonstration. Hardware trademarks, specifications, and teardown layouts belong to Meta Platforms Technologies, LLC and Qualcomm Technologies, Inc.
