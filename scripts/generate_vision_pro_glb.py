import os
import math
import json
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from PIL import Image, ImageDraw, ImageFilter

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

ensure_dir("public/models")
ensure_dir("public/textures")
ensure_dir("src/data")

print("1. Generating Apple Vision Pro procedural PBR textures...")

# --- 1. EyeSight OLED Display Texture (Matching User's Reference Image) ---
def make_eyesight_texture():
    w, h = 1024, 512
    img = Image.new("RGBA", (w, h), (8, 6, 16, 255))
    d = ImageDraw.Draw(img)
    
    # Lenticular OLED background grid
    for x in range(0, w, 4):
        d.line([(x, 0), (x, h)], fill=(12, 10, 22, 255), width=1)
        
    # Draw the iconic dual-eye spatial glowing gradient seen in the user's uploaded photo!
    # Left eye glow (Blue & Violet)
    for r in range(160, 0, -2):
        alpha = int(240 * (1 - r / 160))
        d.ellipse(
            [(w * 0.35 - r * 1.3, h * 0.52 - r * 0.8), (w * 0.35 + r * 1.3, h * 0.52 + r * 0.8)],
            fill=(60, 100, 255, alpha)
        )
    for r in range(110, 0, -2):
        alpha = int(255 * (1 - r / 110))
        d.ellipse(
            [(w * 0.35 - r * 1.1, h * 0.52 - r * 0.7), (w * 0.35 + r * 1.1, h * 0.52 + r * 0.7)],
            fill=(180, 70, 255, alpha)
        )
    for r in range(60, 0, -2):
        alpha = int(255 * (1 - r / 60))
        d.ellipse(
            [(w * 0.35 - r, h * 0.52 - r * 0.6), (w * 0.35 + r, h * 0.52 + r * 0.6)],
            fill=(255, 120, 220, alpha)
        )

    # Right eye glow (Blue & Violet)
    for r in range(160, 0, -2):
        alpha = int(240 * (1 - r / 160))
        d.ellipse(
            [(w * 0.65 - r * 1.3, h * 0.52 - r * 0.8), (w * 0.65 + r * 1.3, h * 0.52 + r * 0.8)],
            fill=(60, 100, 255, alpha)
        )
    for r in range(110, 0, -2):
        alpha = int(255 * (1 - r / 110))
        d.ellipse(
            [(w * 0.65 - r * 1.1, h * 0.52 - r * 0.7), (w * 0.65 + r * 1.1, h * 0.52 + r * 0.7)],
            fill=(180, 70, 255, alpha)
        )
    for r in range(60, 0, -2):
        alpha = int(255 * (1 - r / 60))
        d.ellipse(
            [(w * 0.65 - r, h * 0.52 - r * 0.6), (w * 0.65 + r, h * 0.52 + r * 0.6)],
            fill=(255, 120, 220, alpha)
        )

    img = img.filter(ImageFilter.GaussianBlur(radius=8))
    img.save("public/textures/vision_eyesight.png")
    return img

# --- 2. Apple M2 & Apple R1 Dual Silicon Texture ---
def make_apple_silicon_texture():
    w, h = 1024, 512
    img = Image.new("RGBA", (w, h), (18, 19, 23, 255))
    d = ImageDraw.Draw(img)
    
    # Left chip: Apple M2
    d.rectangle([(40, 40), (460, 460)], fill=(24, 25, 30, 255), outline=(70, 75, 85, 255), width=4)
    d.rectangle([(60, 60), (440, 440)], outline=(45, 50, 60, 255), width=2)
    d.text((120, 120), " M2", fill=(255, 255, 255, 255))
    d.text((120, 190), "APPLE SILICON M2", fill=(220, 225, 235, 240))
    d.text((120, 230), "8-Core CPU • 10-Core GPU", fill=(180, 190, 205, 210))
    d.text((120, 270), "16-Core Neural Engine", fill=(180, 190, 205, 210))
    d.text((120, 310), "16GB Unified Memory • 100GB/s", fill=(190, 220, 255, 230))
    d.text((120, 370), "APL1109 • 5nm TSMC", fill=(130, 140, 155, 180))
    d.ellipse([(70, 70), (95, 95)], fill=(230, 190, 60, 255))

    # Right chip: Apple R1 (Real-Time Sensor Processor)
    d.rectangle([(564, 40), (984, 460)], fill=(24, 25, 30, 255), outline=(70, 75, 85, 255), width=4)
    d.rectangle([(584, 60), (964, 440)], outline=(45, 50, 60, 255), width=2)
    d.text((640, 120), " R1", fill=(0, 210, 255, 255))
    d.text((640, 190), "REAL-TIME SENSOR COPROCESSOR", fill=(220, 225, 235, 240))
    d.text((640, 230), "12 Cameras • 5 Sensors • 6 Mics", fill=(180, 190, 205, 210))
    d.text((640, 270), "12-Millisecond Photon-to-Motion", fill=(0, 230, 255, 240))
    d.text((640, 310), "256GB/s Ultra-Low Latency Bus", fill=(190, 220, 255, 230))
    d.text((640, 370), "APL1031 • CUSTOM APPLE XR SILICON", fill=(130, 140, 155, 180))
    d.ellipse([(594, 70), (619, 95)], fill=(0, 200, 255, 255))

    img.save("public/textures/vision_silicon.png")
    return img

# --- 3. 3D Knitted Ribbed Solo Knit Band Texture ---
def make_solo_knit_texture():
    w, h = 1024, 512
    img = Image.new("RGBA", (w, h), (46, 49, 56, 255))
    d = ImageDraw.Draw(img)
    for x in range(0, w, 16):
        d.rectangle([(x, 0), (x + 8, h)], fill=(62, 66, 75, 255))
        d.line([(x, 0), (x, h)], fill=(75, 82, 92, 255), width=2)
        d.line([(x + 8, 0), (x + 8, h)], fill=(30, 32, 36, 255), width=2)
        for y in range(0, h, 8):
            d.point((x + 4, y), fill=(90, 96, 110, 255))

    img.save("public/textures/vision_solo_knit.png")
    return img

# --- 4. Micro-OLED Dual Display Texture ---
def make_micro_oled_texture():
    w, h = 1024, 512
    img = Image.new("RGBA", (w, h), (8, 12, 18, 255))
    d = ImageDraw.Draw(img)
    for x in range(0, w, 4):
        d.line([(x, 0), (x, h)], fill=(12, 18, 28, 200), width=1)
    for y in range(0, h, 4):
        d.line([(0, y), (w, y)], fill=(12, 18, 28, 200), width=1)
    # Left Micro-OLED
    d.rectangle([(80, 60), (460, 440)], outline=(0, 160, 255, 240), width=3)
    d.text((140, 220), "23 MILLION PIXELS", fill=(255, 255, 255, 255))
    d.text((150, 260), "4K+ MICRO-OLED (DCI-P3)", fill=(0, 210, 255, 240))
    # Right Micro-OLED
    d.rectangle([(564, 60), (944, 440)], outline=(0, 160, 255, 240), width=3)
    d.text((624, 220), "23 MILLION PIXELS", fill=(255, 255, 255, 255))
    d.text((634, 260), "4K+ MICRO-OLED (DCI-P3)", fill=(0, 210, 255, 240))
    
    img.save("public/textures/vision_micro_oled.png")
    return img

make_eyesight_texture()
make_apple_silicon_texture()
make_solo_knit_texture()
make_micro_oled_texture()
print("Apple Vision Pro textures generated.")

# --- 2. Geometric Builders for Apple Vision Pro ---

def apply_rot(mesh, angle, axis):
    mesh.apply_transform(trimesh.transformations.rotation_matrix(angle, axis))

def make_filleted_box(extents, transform=None):
    mesh = trimesh.creation.box(extents=extents)
    if transform is not None:
        mesh.apply_transform(transform)
    return mesh

def make_smooth_cylinder(radius, height, sections=48, transform=None):
    mesh = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    if transform is not None:
        mesh.apply_transform(transform)
    return mesh

# 1. Seamless 3D-Formed Laminated Optical Glass Front Visor (matching uploaded photo)
def make_vision_glass_visor():
    nx, ny = 64, 40
    xs = np.linspace(-8.8, 8.8, nx)
    ys = np.linspace(-4.4, 4.4, ny)
    
    verts = []
    uvs = []
    for j, y in enumerate(ys):
        for i, x in enumerate(xs):
            bx = abs(x) / 8.8
            by = abs(y) / 4.4
            # Continuous curved ski-goggle surface with nose indentation
            nose_indent = 0.55 * math.exp(-((x / 1.8)**2 + ((y + 3.0) / 1.6)**2))
            curve = 1.45 * ((1.0 - bx**2.3) ** 0.5) * ((1.0 - by**2.2) ** 0.5) - nose_indent if (bx < 1.0 and by < 1.0) else 0.0
            z = 3.8 + curve
            verts.append([x, y, z])
            uvs.append([i / (nx - 1), 1.0 - j / (ny - 1)])

    faces = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            idx = j * nx + i
            faces.append([idx, idx + 1, idx + nx + 1])
            faces.append([idx, idx + nx + 1, idx + nx])

    # Front glass outer surface
    front_mesh = trimesh.Trimesh(vertices=verts, faces=faces)
    
    # Back glass surface for realistic optical refraction
    back_verts = np.array(verts) - [0, 0, 0.28]
    back_faces = [[f[0] + len(verts), f[2] + len(verts), f[1] + len(verts)] for f in faces]
    
    all_verts = np.vstack([verts, back_verts])
    all_faces = np.vstack([faces, back_faces])
    glass = trimesh.Trimesh(vertices=all_verts, faces=all_faces)
    
    # Mirror-finish perimeter chamfer rim
    rim = make_filleted_box((18.1, 9.1, 0.3))
    rim.apply_translation([0.0, 0.0, 3.7])
    
    res = trimesh.util.concatenate([glass, rim])
    res.fix_normals()
    return res

# 2. Curved EyeSight Lenticular OLED Panel (Radiant Violet/Blue Glow)
def make_eyesight_oled_panel():
    nx, ny = 48, 28
    xs = np.linspace(-8.2, 8.2, nx)
    ys = np.linspace(-4.0, 4.0, ny)
    verts = []
    uvs = []
    for j, y in enumerate(ys):
        for i, x in enumerate(xs):
            bx = abs(x) / 8.2
            by = abs(y) / 4.0
            curve = 1.35 * ((1.0 - bx**2.3) ** 0.5) * ((1.0 - by**2.2) ** 0.5) if (bx < 1.0 and by < 1.0) else 0.0
            z = 3.55 + curve
            verts.append([x, y, z])
            uvs.append([i / (nx - 1), 1.0 - j / (ny - 1)])

    faces = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            idx = j * nx + i
            faces.append([idx, idx + 1, idx + nx + 1])
            faces.append([idx, idx + nx + 1, idx + nx])

    mesh = trimesh.Trimesh(vertices=verts, faces=faces)
    res = mesh
    res.fix_normals()
    return res

# 3. Spatial Sensors, LiDAR & TrueDepth Array
def make_vision_sensors():
    parts = []
    # 2 Primary high-resolution 4K stereoscopic passthrough cameras
    p_cam_l = make_smooth_cylinder(radius=0.45, height=0.75, sections=32)
    p_cam_l.apply_translation([-4.2, -1.8, 3.8])
    p_cam_r = make_smooth_cylinder(radius=0.45, height=0.75, sections=32)
    p_cam_r.apply_translation([4.2, -1.8, 3.8])
    
    # Center LiDAR Scanner & TrueDepth Projector
    lidar = make_smooth_cylinder(radius=0.52, height=0.6, sections=32)
    lidar.apply_translation([0.0, -1.9, 3.9])
    
    # 4 Downward & Peripheral hand-tracking cameras
    for cx in [-6.5, -2.2, 2.2, 6.5]:
        dc = make_smooth_cylinder(radius=0.32, height=0.5, sections=24)
        apply_rot(dc, math.pi * 0.25, [1, 0, 0])
        dc.apply_translation([cx, -3.8, 3.4])
        parts.append(dc)
        
    # 2 Side-facing cameras
    sc_l = make_smooth_cylinder(radius=0.32, height=0.5, sections=24)
    apply_rot(sc_l, math.pi * 0.35, [0, 1, 0])
    sc_l.apply_translation([-8.5, 0.0, 3.0])
    sc_r = make_smooth_cylinder(radius=0.32, height=0.5, sections=24)
    apply_rot(sc_r, -math.pi * 0.35, [0, 1, 0])
    sc_r.apply_translation([8.5, 0.0, 3.0])

    parts.extend([p_cam_l, p_cam_r, lidar, sc_l, sc_r])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 4. Precision CNC Milled Curved Aluminum Alloy Chassis with Digital Crown & Top Button
def make_vision_aluminum_frame():
    parts = []
    # Main curved aluminum alloy enclosure
    top = make_filleted_box((18.2, 0.45, 5.8))
    top.apply_translation([0.0, 4.4, 1.2])
    bot = make_filleted_box((18.2, 0.45, 5.8))
    bot.apply_translation([0.0, -4.4, 1.2])
    left = make_filleted_box((0.45, 9.0, 5.8))
    left.apply_translation([-9.0, 0.0, 1.2])
    right = make_filleted_box((0.45, 9.0, 5.8))
    right.apply_translation([9.0, 0.0, 1.2])
    
    # 4 Rounded aerodynamic corners
    for cx, cy in [(-8.7, 4.1), (8.7, 4.1), (-8.7, -4.1), (8.7, -4.1)]:
        c_corner = make_smooth_cylinder(radius=0.9, height=5.8, sections=36)
        c_corner.apply_translation([cx, cy, 1.2])
        parts.append(c_corner)
        
    # Digital Crown on Top Right (knurled titanium rotating crown)
    crown = make_smooth_cylinder(radius=0.6, height=0.6, sections=40)
    crown.apply_translation([6.2, 4.8, 1.8])
    
    # Top Capture Button on Top Left (smooth pill button)
    btn = make_filleted_box((1.4, 0.45, 0.5))
    btn.apply_translation([-6.2, 4.75, 1.8])
    
    # Thermal exhaust micro-machined vents
    for vx in np.linspace(-3.5, 3.5, 14):
        vent = make_filleted_box((0.18, 0.35, 2.0))
        vent.apply_translation([vx, 4.65, 1.6])
        parts.append(vent)

    parts.extend([top, bot, left, right, crown, btn])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 5. Dual Thermal Micro-Blowers & Heat Sink
def make_vision_thermal():
    parts = []
    # Left Micro-Blower Fan
    fan_l = make_smooth_cylinder(radius=1.8, height=0.75, sections=36)
    fan_l.apply_translation([-4.2, 2.2, 2.2])
    # Right Micro-Blower Fan
    fan_r = make_smooth_cylinder(radius=1.8, height=0.75, sections=36)
    fan_r.apply_translation([4.2, 2.2, 2.2])
    # Copper vapor chamber plate
    vapor = make_filleted_box((12.0, 3.2, 0.22))
    vapor.apply_translation([0.0, 1.2, 2.1])
    # Aluminum micro-fin radiator stacks
    for fx in np.linspace(-3.2, 3.2, 16):
        fin = make_filleted_box((0.08, 1.1, 1.6))
        fin.apply_translation([fx, 4.1, 2.0])
        parts.append(fin)

    parts.extend([fan_l, fan_r, vapor])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 6. Apple Silicon: Apple M2 & Apple R1 Dual-Chip Platform
def make_vision_silicon():
    parts = []
    # Apple M2 SoC (left compute engine)
    m2_pkg = make_filleted_box((2.8, 2.8, 0.35))
    m2_pkg.apply_translation([-3.2, 1.2, 2.4])
    m2_die = make_filleted_box((2.1, 2.1, 0.16))
    m2_die.apply_translation([-3.2, 1.2, 2.62])
    
    # Apple R1 Real-Time Sensor Processor (right coprocessor)
    r1_pkg = make_filleted_box((2.8, 2.8, 0.35))
    r1_pkg.apply_translation([3.2, 1.2, 2.4])
    r1_die = make_filleted_box((2.1, 2.1, 0.16))
    r1_die.apply_translation([3.2, 1.2, 2.62])
    
    # Unified memory packages
    ram1 = make_filleted_box((1.1, 2.0, 0.25))
    ram1.apply_translation([-4.8, 1.2, 2.4])
    ram2 = make_filleted_box((1.1, 2.0, 0.25))
    ram2.apply_translation([4.8, 1.2, 2.4])

    parts.extend([m2_pkg, m2_die, r1_pkg, r1_die, ram1, ram2])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 7. Main Logic Board (HDI PCB with Silver Shielding Cans)
def make_vision_logic_board():
    parts = []
    pcb = make_filleted_box((15.4, 7.2, 0.25))
    pcb.apply_translation([0.0, 0.8, 1.8])
    # Silver RF Shielding Cans
    can1 = make_filleted_box((4.2, 3.4, 0.45))
    can1.apply_translation([-4.2, 1.0, 2.05])
    can2 = make_filleted_box((4.2, 3.4, 0.45))
    can2.apply_translation([4.2, 1.0, 2.05])
    can3 = make_filleted_box((5.0, 2.2, 0.45))
    can3.apply_translation([0.0, -1.6, 2.05])
    parts.extend([pcb, can1, can2, can3])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 8. Dual 4K+ Micro-OLED Displays (23 Million Pixels)
def make_vision_micro_oled():
    displays = []
    for cx in [-3.3, 3.3]:
        disp = make_filleted_box((4.4, 4.4, 0.22))
        disp.apply_translation([cx, 0.0, 0.2])
        plate = make_filleted_box((4.6, 4.6, 0.16))
        plate.apply_translation([cx, 0.0, 0.38])
        flex = make_filleted_box((1.2, 0.08, 1.2))
        flex.apply_translation([cx, 2.3, 0.5])
        displays.extend([disp, plate, flex])
    res = trimesh.util.concatenate(displays)
    res.fix_normals()
    return res

# 9. Custom 3-Element Catadioptric Optics with Zeiss Magnetic Rings
def make_vision_catadioptric_optics(is_left=True):
    cx = -3.3 if is_left else 3.3
    elements = []
    # 3-Element optical lens stack
    lens1 = trimesh.creation.icosphere(subdivisions=4, radius=2.3)
    lens1.apply_scale([1.0, 0.95, 0.30])
    lens1.apply_translation([cx, 0.0, -1.65])
    
    barrel = make_smooth_cylinder(radius=2.5, height=0.85, sections=64)
    barrel.apply_translation([cx, 0.0, -1.8])
    
    zeiss_ring = make_smooth_cylinder(radius=2.6, height=0.2, sections=48)
    zeiss_ring.apply_translation([cx, 0.0, -1.35])
    
    lens2 = trimesh.creation.icosphere(subdivisions=3, radius=2.15)
    lens2.apply_scale([1.0, 0.92, 0.25])
    lens2.apply_translation([cx, 0.0, -2.1])

    elements.extend([lens1, barrel, zeiss_ring, lens2])
    res = trimesh.util.concatenate(elements)
    res.fix_normals()
    return res

# 10. Audio Straps & Dual-Driver Spatial Audio Pods
def make_vision_audio_straps():
    parts = []
    # Left Audio Strap
    strap_l = make_filleted_box((0.42, 1.6, 9.6))
    strap_l.apply_translation([-9.22, 0.2, -3.8])
    # Left Spatial Audio Pod (dual-driver sound pod)
    pod_l = make_filleted_box((0.6, 1.2, 2.4))
    pod_l.apply_translation([-9.3, 0.2, -4.8])
    # Magnetic charging connector puck
    puck = make_smooth_cylinder(radius=0.7, height=0.35, sections=32)
    apply_rot(puck, math.pi / 2, [0, 0, 1])
    puck.apply_translation([-9.35, 0.2, -1.2])
    
    # Right Audio Strap
    strap_r = make_filleted_box((0.42, 1.6, 9.6))
    strap_r.apply_translation([9.22, 0.2, -3.8])
    # Right Spatial Audio Pod
    pod_r = make_filleted_box((0.6, 1.2, 2.4))
    pod_r.apply_translation([9.3, 0.2, -4.8])

    parts.extend([strap_l, pod_l, puck, strap_r, pod_r])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 11. Magnetically Attached Light Seal Frame
def make_vision_light_seal():
    parts = []
    frame = make_filleted_box((17.2, 9.4, 1.4))
    frame.apply_translation([0.0, 0.0, -4.6])
    # Nasal contour
    nose_notch = make_filleted_box((2.8, 3.2, 1.6))
    nose_notch.apply_translation([0.0, -3.8, -4.6])
    parts.append(frame)
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 12. Breathable Light Seal Cushion
def make_vision_light_seal_cushion():
    parts = []
    cushion = make_filleted_box((16.8, 9.0, 1.3))
    cushion.apply_translation([0.0, 0.0, -5.9])
    parts.append(cushion)
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 13. 3D-Knitted Ribbed Solo Knit Band with Precision Fit Dial
def make_vision_solo_knit_band():
    parts = []
    # Left loop curve extending back
    b_left = make_filleted_box((0.35, 2.8, 10.4))
    apply_rot(b_left, -0.16, [0, 1, 0])
    b_left.apply_translation([-8.8, 0.0, -10.2])
    
    # Right loop curve extending back
    b_right = make_filleted_box((0.35, 2.8, 10.4))
    apply_rot(b_right, 0.16, [0, 1, 0])
    b_right.apply_translation([8.8, 0.0, -10.2])
    
    # Rear continuous accordion knitted cradle arch
    rear_arch = make_filleted_box((14.6, 3.4, 0.45))
    rear_arch.apply_translation([0.0, 0.0, -15.2])
    
    # Precision Fit Dial on Right Temple (circular ratcheting tension dial)
    dial = make_smooth_cylinder(radius=1.1, height=0.55, sections=40)
    apply_rot(dial, math.pi / 2, [0, 0, 1])
    dial.apply_translation([8.9, 0.0, -14.6])

    parts.extend([b_left, b_right, rear_arch, dial])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

print("2. Compiling Apple Vision Pro 3D Scene...")

vision_spec = [
    {
        "id": "vision_glass_visor",
        "name": "3D-Formed Laminated Optical Glass Visor",
        "group": "group_exterior",
        "groupName": "EXTERIOR & OPTICS",
        "fn": make_vision_glass_visor,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, 14.5],
        "mat": PBRMaterial(name="Mat_VisionGlass", baseColorFactor=[0.95, 0.96, 0.98, 0.25], roughnessFactor=0.02, metallicFactor=0.08),
        "category": "Optical Enclosure",
        "specs": "Single continuous piece of 3D-formed laminated glass, optical surface for 12 cameras and sensors, anti-reflective and oleophobic coatings.",
        "description": "Flows seamlessly into the custom aluminum alloy frame. Acts as a protective optical surface for the cameras and displays the EyeSight lenticular OLED panel.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, 14.5],
        "cameraDist": 16.0
    },
    {
        "id": "vision_eyesight_oled",
        "name": "Curved Lenticular EyeSight OLED Display",
        "group": "group_exterior",
        "groupName": "EXTERIOR & OPTICS",
        "fn": make_eyesight_oled_panel,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, 10.5],
        "mat": PBRMaterial(name="Mat_EyeSight", baseColorFactor=[0.2, 0.1, 0.4, 1.0], roughnessFactor=0.15, metallicFactor=0.4),
        "category": "Display Engineering",
        "specs": "Curved lenticular OLED display, stereoscopic perspective projection, reveals eyes to external observers or indicates immersion mode.",
        "description": "Projects a perspective-correct view of the user's eyes to nearby observers through lenticular optics, creating authentic eye contact in physical space.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, 10.5],
        "cameraDist": 14.0
    },
    {
        "id": "vision_sensors",
        "name": "TrueDepth & Spatial Perception Array",
        "group": "group_sensors",
        "groupName": "SENSORS & TRACKING",
        "fn": make_vision_sensors,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, 16.5],
        "mat": PBRMaterial(name="Mat_VisionSensors", baseColorFactor=[0.12, 0.14, 0.18, 1.0], roughnessFactor=0.18, metallicFactor=0.92),
        "category": "Spatial Perception",
        "specs": "2x primary 4K stereoscopic cameras, LiDAR Scanner, 4x downward/peripheral tracking cameras, 2x TrueDepth IR illuminators, ambient light sensor.",
        "description": "Enables sub-millimeter hand tracking, real-time 3D room meshing, and high-fidelity video passthrough with precise spatial depth perception.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, 16.5],
        "cameraDist": 12.0
    },
    {
        "id": "vision_aluminum_frame",
        "name": "Curved Aluminum Alloy Chassis with Digital Crown",
        "group": "group_exterior",
        "groupName": "EXTERIOR & STRUCTURE",
        "fn": make_vision_aluminum_frame,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, 7.5],
        "mat": PBRMaterial(name="Mat_VisionAluminum", baseColorFactor=[0.88, 0.90, 0.92, 1.0], roughnessFactor=0.28, metallicFactor=0.88),
        "category": "Structural Architecture",
        "specs": "Custom aerospace-grade bead-blasted aluminum alloy frame, titanium Digital Crown, top capture button, micro-machined thermal grilles.",
        "description": "Gently curves to wrap around the user's face while structurally securing the display, optical, and computing modules in calibrated alignment.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, 7.5],
        "cameraDist": 18.0
    },
    {
        "id": "vision_thermal_cooling",
        "name": "Active Dual Micro-Blowers & Heat Sink",
        "group": "group_compute",
        "groupName": "THERMAL ENGINEERING",
        "fn": make_vision_thermal,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 7.5, 2.0],
        "mat": PBRMaterial(name="Mat_VisionCooling", baseColorFactor=[0.75, 0.78, 0.82, 1.0], roughnessFactor=0.22, metallicFactor=0.95),
        "category": "Thermal Architecture",
        "specs": "Dual ultra-quiet centrifugal micro-blowers, copper vapor chamber, top and bottom micro-machined air channels.",
        "description": "Silently draws air from bottom vents and moves it across the M2 and R1 thermal dissipation plates, exhausting quietly through top vents.",
        "verified": True,
        "cameraTarget": [0.0, 7.5, 2.0],
        "cameraDist": 12.0
    },
    {
        "id": "vision_apple_silicon",
        "name": "Apple Silicon: Dual-Chip Architecture (M2 + R1)",
        "group": "group_compute",
        "groupName": "SILICON ARCHITECTURE",
        "fn": make_vision_silicon,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 10.5, 3.5],
        "mat": PBRMaterial(name="Mat_AppleSilicon", baseColorFactor=[0.14, 0.15, 0.18, 1.0], roughnessFactor=0.18, metallicFactor=0.94),
        "category": "Compute Architecture",
        "specs": "Apple M2 (8-core CPU, 10-core GPU, 16-core NPU) + Apple R1 (12ms photon-to-motion latency, 256GB/s memory bandwidth, 5nm TSMC).",
        "description": "M2 runs visionOS and 3D graphics while R1 processes feeds from 12 cameras, 5 sensors, and 6 microphones in real time, virtually eliminating lag.",
        "verified": True,
        "cameraTarget": [0.0, 10.5, 3.5],
        "cameraDist": 8.0
    },
    {
        "id": "vision_logic_board",
        "name": "Main Logic Board (Contoured HDI PCB)",
        "group": "group_compute",
        "groupName": "COMPUTE ARCHITECTURE",
        "fn": make_vision_logic_board,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 5.0, 3.0],
        "mat": PBRMaterial(name="Mat_VisionLogicBoard", baseColorFactor=[0.12, 0.16, 0.14, 1.0], roughnessFactor=0.32, metallicFactor=0.55),
        "category": "Electronics",
        "specs": "Curved high-density interconnect (HDI) logic board, silver EMI shielding cans, high-speed unified memory bus, flash storage.",
        "description": "Houses the processing silicon, power distribution regulators, and high-speed bus interfaces connecting the Micro-OLEDs and sensor arrays.",
        "verified": True,
        "cameraTarget": [0.0, 5.0, 3.0],
        "cameraDist": 14.0
    },
    {
        "id": "vision_micro_oled",
        "name": "Dual 4K+ Micro-OLED Displays (23M Pixels)",
        "group": "group_optics",
        "groupName": "OPTICS & DISPLAY",
        "fn": make_vision_micro_oled,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, -1.8, -2.5],
        "mat": PBRMaterial(name="Mat_VisionMicroOLED", baseColorFactor=[0.06, 0.09, 0.14, 1.0], roughnessFactor=0.15, metallicFactor=0.75),
        "category": "Display Technology",
        "specs": "Dual custom micro-OLED displays, 23 million pixels total, 64x pixel density of iPhone, 92% DCI-P3 wide color gamut, HDR support.",
        "description": "Each display is the size of a postage stamp yet packs more pixels than a 4K TV for each eye, delivering breathtaking visual sharpness and vibrant color.",
        "verified": True,
        "cameraTarget": [0.0, -1.8, -2.5],
        "cameraDist": 12.0
    },
    {
        "id": "vision_catadioptric_optics_left",
        "name": "Left 3-Element Catadioptric Optical Lens",
        "group": "group_optics",
        "groupName": "OPTICS & DISPLAY",
        "fn": lambda: make_vision_catadioptric_optics(is_left=True),
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [-5.8, 0.0, 2.5],
        "mat": PBRMaterial(name="Mat_VisionLensL", baseColorFactor=[0.10, 0.18, 0.30, 0.88], roughnessFactor=0.03, metallicFactor=0.25),
        "category": "Optical Engineering",
        "specs": "Custom 3-element catadioptric optical system, Zeiss magnetic prescription insert attachment, motorized automatic IPD adjustment.",
        "description": "Bends light to produce incredible sharpness and clarity across the entire field of view while keeping the optical module ultra-compact.",
        "verified": True,
        "cameraTarget": [-5.8, 0.0, 2.5],
        "cameraDist": 10.0
    },
    {
        "id": "vision_catadioptric_optics_right",
        "name": "Right 3-Element Catadioptric Optical Lens",
        "group": "group_optics",
        "groupName": "OPTICS & DISPLAY",
        "fn": lambda: make_vision_catadioptric_optics(is_left=False),
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [5.8, 0.0, 2.5],
        "mat": PBRMaterial(name="Mat_VisionLensR", baseColorFactor=[0.10, 0.18, 0.30, 0.88], roughnessFactor=0.03, metallicFactor=0.25),
        "category": "Optical Engineering",
        "specs": "Custom 3-element catadioptric optical system, Zeiss magnetic prescription insert attachment, motorized automatic IPD adjustment.",
        "description": "Delivers matched stereoscopic fidelity for the right eye with motorized IPD adjustments matching your exact pupil distance automatically.",
        "verified": True,
        "cameraTarget": [5.8, 0.0, 2.5],
        "cameraDist": 10.0
    },
    {
        "id": "vision_audio_straps",
        "name": "Audio Straps with Spatial Audio Pods",
        "group": "group_exterior",
        "groupName": "AUDIO & ERGONOMICS",
        "fn": make_vision_audio_straps,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -2.0],
        "mat": PBRMaterial(name="Mat_VisionAudio", baseColorFactor=[0.92, 0.93, 0.95, 1.0], roughnessFactor=0.32, metallicFactor=0.08),
        "category": "Acoustic Engineering",
        "specs": "Dual-driver audio pods positioned right next to ears, Personalized Spatial Audio, audio ray tracing, magnetic braided power connector puck.",
        "description": "Directs sound directly into the ears while keeping the user aware of surroundings. Matches sound to room acoustics using audio ray tracing.",
        "verified": True,
        "cameraTarget": [9.0, 0.0, -4.0],
        "cameraDist": 16.0
    },
    {
        "id": "vision_light_seal",
        "name": "Magnetic Light Seal Frame",
        "group": "group_comfort",
        "groupName": "FIT & ERGONOMICS",
        "fn": make_vision_light_seal,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -8.0],
        "mat": PBRMaterial(name="Mat_VisionLightSeal", baseColorFactor=[0.24, 0.26, 0.30, 1.0], roughnessFactor=0.75, metallicFactor=0.05),
        "category": "Ergonomics",
        "specs": "Magnetically attached light seal frame, soft textile construction, contours to various facial structures to eliminate stray light.",
        "description": "Attaches magnetically to the aluminum alloy frame, flexing gently to conform to the user's face and blocking stray ambient light.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -8.0],
        "cameraDist": 16.0
    },
    {
        "id": "vision_light_seal_cushion",
        "name": "Breathable Light Seal Face Cushion",
        "group": "group_comfort",
        "groupName": "FIT & ERGONOMICS",
        "fn": make_vision_light_seal_cushion,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -12.0],
        "mat": PBRMaterial(name="Mat_VisionCushion", baseColorFactor=[0.20, 0.22, 0.26, 1.0], roughnessFactor=0.92, metallicFactor=0.02),
        "category": "Comfort",
        "specs": "Breathable soft fabric cushion, attaches via micro-velcro to Light Seal, cushions face contact with even weight distribution.",
        "description": "Provides breathable cushioning against facial cheekbones and forehead, ensuring all-day spatial computing comfort.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -12.0],
        "cameraDist": 14.0
    },
    {
        "id": "vision_solo_knit_band",
        "name": "3D-Knitted Ribbed Solo Knit Band with Fit Dial",
        "group": "group_comfort",
        "groupName": "FIT & ERGONOMICS",
        "fn": make_vision_solo_knit_band,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -16.5],
        "mat": PBRMaterial(name="Mat_VisionSoloKnit", baseColorFactor=[0.32, 0.34, 0.38, 1.0], roughnessFactor=0.88, metallicFactor=0.04),
        "category": "Textile Engineering",
        "specs": "Single continuous 3D-knitted ribbed piece, micro-adjustable rotary Fit Dial, secure click-in release mechanism.",
        "description": "Woven as a single continuous piece with engineered ribbing for breathability, stretch, and cushioning. The Fit Dial allows micro-tuning tension with precision.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -16.5],
        "cameraDist": 20.0
    }
]

scene = trimesh.Scene()
vision_json_data = []

for comp in vision_spec:
    cid = comp["id"]
    print(f"  Building Apple Vision Pro {cid}...")
    mesh = comp["fn"]()
    mesh.visual.material = comp["mat"]
    mesh.metadata["name"] = cid
    mesh.metadata["id"] = cid
    scene.add_geometry(mesh, node_name=cid, geom_name=cid)
    
    vision_json_data.append({
        "id": comp["id"],
        "name": comp["name"],
        "group": comp["group"],
        "groupName": comp["groupName"],
        "category": comp["category"],
        "specs": comp["specs"],
        "description": comp["description"],
        "verified": comp["verified"],
        "assembled": comp["assembled"],
        "exploded": comp["exploded"],
        "cameraTarget": comp["cameraTarget"],
        "cameraDist": comp["cameraDist"]
    })

with open("src/data/visionProData.json", "w") as f:
    json.dump(vision_json_data, f, indent=2)

print("Saved src/data/visionProData.json")

output_glb_path = "public/models/vision_pro_exploded.glb"
glb_bytes = scene.export(file_type="glb")
with open(output_glb_path, "wb") as f:
    f.write(glb_bytes)

print(f"Exported photorealistic Apple Vision Pro GLB to {output_glb_path} ({len(glb_bytes):,} bytes)")
print("All Apple Vision Pro components successfully compiled!")
