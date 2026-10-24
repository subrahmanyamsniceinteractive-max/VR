import os
import math
import json
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual import TextureVisuals
from PIL import Image, ImageDraw

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

ensure_dir("public/models")
ensure_dir("public/textures")
ensure_dir("src/data")

print("1. Generating high-resolution industrial textures...")

# --- 1. Industrial High-Detail Textures ---

def make_pcb_texture():
    w, h = 2048, 2048
    img = Image.new("RGBA", (w, h), (18, 19, 22, 255))
    d = ImageDraw.Draw(img)
    
    # Ground plane copper hatching
    for x in range(0, w, 24):
        d.line([(x, 0), (x, h)], fill=(24, 25, 28, 180), width=1)
    for y in range(0, h, 24):
        d.line([(0, y), (w, y)], fill=(24, 25, 28, 180), width=1)
        
    np.random.seed(42)
    # Dense gold micro-traces (ENIG finish)
    for _ in range(450):
        x1 = int(np.random.randint(80, w - 80))
        y1 = int(np.random.randint(80, h - 80))
        dx = int(np.random.choice([-160, -80, 80, 160]))
        dy = int(np.random.choice([-160, -80, 80, 160]))
        d.line([(x1, y1), (x1 + dx, y1), (x1 + dx, y1 + dy)], fill=(210, 175, 70, 240), width=2)
        d.ellipse([(x1-4, y1-4), (x1+4, y1+4)], fill=(230, 195, 85, 255), outline=(45, 40, 20, 255))
        d.ellipse([(x1+dx-4, y1+dy-4), (x1+dx+4, y1+dy+4)], fill=(230, 195, 85, 255), outline=(45, 40, 20, 255))
        
    # IC footprints & BGA solder pads
    for bx, by, bw, bh in [
        (350, 400, 320, 260), (1200, 380, 280, 280), 
        (400, 1220, 360, 280), (1240, 1160, 380, 320),
        (800, 800, 440, 440)
    ]:
        d.rectangle([(bx, by), (bx + bw, by + bh)], fill=(14, 15, 17, 255), outline=(200, 170, 65, 255), width=2)
        for px in range(bx, bx + bw, 12):
            d.line([(px, by - 8), (px, by)], fill=(220, 190, 70, 255), width=2)
            d.line([(px, by + bh), (px, by + bh + 8)], fill=(220, 190, 70, 255), width=2)
        for py in range(by, by + bh, 12):
            d.line([(bx - 8, py), (bx, py)], fill=(220, 190, 70, 255), width=2)
            d.line([(bx + bw, py), (bx + bw + 8, py)], fill=(220, 190, 70, 255), width=2)

    d.text((120, 120), "META QUEST 3 LOGIC ARCHITECTURE • REV 4.2", fill=(170, 175, 185, 220))
    d.text((120, 155), "QUALCOMM SNAPDRAGON XR2 GEN 2 • 10-LAYER HDI", fill=(140, 145, 155, 190))
    d.text((1350, 1920), "MODEL: MS49 • COMPLIANCE FCC-ID: 2AGOZ-Q3", fill=(120, 125, 135, 170))
    img.save("public/textures/motherboard_pcb.png")

def make_snapdragon_texture():
    w, h = 1024, 1024
    img = Image.new("RGBA", (w, h), (18, 19, 22, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([(16, 16), (w-16, h-16)], outline=(60, 64, 72, 255), width=4)
    d.rectangle([(32, 32), (w-32, h-32)], outline=(38, 40, 46, 255), width=2)
    d.rectangle([(140, 140), (w-140, h-140)], fill=(25, 26, 30, 255), outline=(52, 56, 64, 255), width=3)
    
    d.text((180, 200), "Qualcomm", fill=(230, 232, 240, 255))
    d.text((180, 255), "snapdragon", fill=(250, 250, 255, 255))
    d.text((180, 320), "XR2 Gen 2", fill=(245, 70, 50, 255))
    d.text((180, 420), "SXR2230P • 4nm TSMC PROCESS", fill=(190, 195, 205, 220))
    d.text((180, 475), "Adreno 740 GPU • Dual Hexagon NPU", fill=(160, 165, 175, 200))
    d.text((180, 530), "12GB LPDDR5 3200MHz POP MEMORY", fill=(180, 210, 245, 220))
    d.text((180, 585), "512GB UFS 3.1 ULTRA HIGH-SPEED FLASH", fill=(160, 170, 185, 190))
    d.text((180, 700), "LOT SEC 340 / SXR-884A • TAIWAN", fill=(120, 125, 135, 160))
    d.ellipse([(55, 55), (80, 80)], fill=(220, 190, 70, 255))
    img.save("public/textures/snapdragon_xr2.png")

def make_battery_texture():
    w, h = 1024, 512
    img = Image.new("RGBA", (w, h), (215, 218, 225, 255))
    d = ImageDraw.Draw(img)
    for y in range(0, h, 2):
        shade = int(212 + 8 * math.sin(y * 0.04))
        d.line([(0, y), (w, y)], fill=(shade, shade + 1, shade + 3, 255), width=1)
        
    d.rectangle([(25, 25), (w - 25, h - 25)], fill=(24, 25, 28, 255), outline=(58, 64, 74, 255), width=2)
    d.text((55, 55), "Rechargeable Lithium-Ion Polymer Battery Pack", fill=(250, 250, 250, 255))
    d.text((55, 95), "Model: FB40  |  1S1P Architecture  |  UL 1642 Certified", fill=(190, 195, 200, 230))
    d.text((55, 135), "Rating: 3.85V Nom  |  4.40V Max  |  19.44 Wh (5,060 mAh)", fill=(180, 220, 195, 240))
    d.text((55, 180), "CAUTION: Do not crush, puncture, disassemble, or heat above 60°C.", fill=(245, 170, 65, 245))
    d.text((55, 220), "Manufactured for Meta Technologies  •  Cell Made in Japan", fill=(150, 155, 165, 190))
    d.text((55, 260), "CE • UKCA • PSE • KC • RoHS • Li-ion 00 • Recyclable", fill=(140, 190, 235, 210))
    
    bx = 720
    np.random.seed(88)
    for _ in range(48):
        bw = int(np.random.choice([2, 4, 5]))
        d.rectangle([(bx, 75), (bx + bw - 1, 230)], fill=(245, 245, 245, 255))
        bx += bw + int(np.random.choice([2, 3]))
    d.text((720, 250), "S/N: 2G0YQ3BAT49021B", fill=(185, 190, 200, 200))
    img.save("public/textures/battery_label.png")

def make_lens_ring_texture():
    w, h = 1024, 1024
    img = Image.new("RGBA", (w, h), (14, 15, 18, 255))
    d = ImageDraw.Draw(img)
    d.ellipse([(20, 20), (w-20, h-20)], outline=(48, 54, 65, 255), width=32)
    d.ellipse([(60, 60), (w-60, h-60)], outline=(24, 27, 33, 255), width=18)
    d.text((260, 50), "META PANCAKE OPTICS • 110° FOV", fill=(190, 210, 235, 230))
    d.text((270, 930), "FOLDED POLARIZING ARCHITECTURE", fill=(160, 180, 200, 200))
    img.save("public/textures/lens_ring.png")

def make_display_texture():
    w, h = 1024, 1024
    img = Image.new("RGBA", (w, h), (6, 8, 12, 255))
    d = ImageDraw.Draw(img)
    for x in range(0, w, 8):
        d.line([(x, 0), (x, h)], fill=(12, 18, 26, 200), width=1)
    for y in range(0, h, 8):
        d.line([(0, y), (w, y)], fill=(12, 18, 26, 200), width=1)
    d.ellipse([(w//2 - 180, h//2 - 180), (w//2 + 180, h//2 + 180)], outline=(35, 125, 220, 170), width=3)
    d.line([(w//2, h//2 - 210), (w//2, h//2 + 210)], fill=(35, 125, 220, 130), width=2)
    d.line([(w//2 - 210, h//2), (w//2 + 210, h//2)], fill=(35, 125, 220, 130), width=2)
    d.text((w//2 - 160, h//2 - 25), "2064 x 2208 @ 120Hz", fill=(170, 220, 250, 240))
    d.text((w//2 - 130, h//2 + 15), "INFINITE DISPLAY VR", fill=(150, 190, 225, 200))
    img.save("public/textures/display_screen.png")

def make_faceplate_texture():
    w, h = 2048, 1024
    
    # 1. Base color map
    color_img = Image.new("RGBA", (w, h), (236, 237, 240, 255))
    d = ImageDraw.Draw(color_img)
    
    # Subtle perimeter AO
    for r in range(40):
        val = int(236 - (40 - r) * 0.45)
        d.rounded_rectangle([r*2, r, w - 1 - r*2, h - 1 - r], radius=int(180 - r*2), outline=(val, val+1, val+2, 255), width=2)
    
    # Outer parting line seam
    d.rounded_rectangle([24, 12, w - 25, h - 13], radius=165, outline=(188, 192, 198, 255), width=2)
    
    # 2. Meta Logo (debossed infinity emblem)
    cx, cy = w // 2, 190
    d.ellipse([cx - 48, cy - 24, cx - 2, cy + 24], outline=(255, 255, 255, 180), width=9)
    d.ellipse([cx + 2, cy - 24, cx + 48, cy + 24], outline=(255, 255, 255, 180), width=9)
    d.ellipse([cx - 48, cy - 26, cx - 2, cy + 22], outline=(145, 150, 160, 255), width=8)
    d.ellipse([cx + 2, cy - 26, cx + 48, cy + 22], outline=(145, 150, 160, 255), width=8)
    d.ellipse([cx - 48, cy - 27, cx - 2, cy + 21], outline=(115, 120, 130, 200), width=3)
    d.ellipse([cx + 2, cy - 27, cx + 48, cy + 21], outline=(115, 120, 130, 200), width=3)
    
    # 3. Pill Cutouts (Left, Center, Right)
    pills = [
        {'x': 592, 'y': 512, 'w': 154, 'h': 350, 'type': 'stereo'},
        {'x': 1024, 'y': 512, 'w': 144, 'h': 365, 'type': 'depth'},
        {'x': 1456, 'y': 512, 'w': 154, 'h': 350, 'type': 'stereo'}
    ]
    
    for p in pills:
        px, py, pw, ph = p['x'], p['y'], p['w'], p['h']
        hw, hh = pw // 2, ph // 2
        
        # Outer soft drop shadow around pill hole in faceplate
        for s in range(12, 0, -2):
            alpha = int(35 * (s / 12))
            d.rounded_rectangle([px - hw - s, py - hh - s, px + hw + s, py + hh + s], radius=hw + s, outline=(200 - s*2, 202 - s*2, 206 - s*2, alpha), width=2)
        
        # Beveled rim (chamfered lip)
        d.rounded_rectangle([px - hw, py - hh, px + hw, py + hh], radius=hw, fill=(48, 52, 58, 255), outline=(175, 180, 188, 255), width=3)
        d.rounded_rectangle([px - hw + 4, py - hh + 4, px + hw - 4, py + hh - 4], radius=hw - 4, fill=(28, 30, 34, 255), outline=(38, 40, 46, 255), width=2)
        # Inner aperture cavity
        d.rounded_rectangle([px - hw + 8, py - hh + 8, px + hw - 8, py + hh - 8], radius=hw - 8, fill=(10, 11, 14, 255))
        
        if p['type'] == 'stereo':
            # Dual camera optical lenses
            for cam_y in [py - 80, py + 80]:
                r_outer = 48
                d.ellipse([px - r_outer, cam_y - r_outer, px + r_outer, cam_y + r_outer], fill=(22, 24, 28, 255), outline=(65, 70, 78, 255), width=2)
                d.ellipse([px - r_outer + 6, cam_y - r_outer + 6, px + r_outer - 6, cam_y + r_outer - 6], fill=(12, 14, 18, 255))
                r_glass = 34
                d.ellipse([px - r_glass, cam_y - r_glass, px + r_glass, cam_y + r_glass], fill=(6, 8, 12, 255), outline=(40, 44, 52, 255), width=2)
                d.arc([px - r_glass + 4, cam_y - r_glass + 4, px + r_glass - 4, cam_y + r_glass - 4], start=210, end=330, fill=(70, 190, 240, 220), width=3)
                d.arc([px - r_glass + 6, cam_y - r_glass + 6, px + r_glass - 6, cam_y + r_glass - 6], start=40, end=140, fill=(190, 80, 220, 180), width=2)
                d.ellipse([px - 14, cam_y - 14, px - 9, cam_y - 9], fill=(255, 255, 255, 230))
                d.ellipse([px - 8, cam_y - 8, px + 8, cam_y + 8], fill=(2, 3, 4, 255))
        else:
            # Central VCSEL Depth Projector & White LED indicator
            grid_y = py - 70
            d.rounded_rectangle([px - 44, grid_y - 44, px + 44, grid_y + 44], radius=16, fill=(18, 20, 24, 255), outline=(55, 60, 68, 255), width=2)
            for gx in range(px - 30, px + 35, 12):
                for gy in range(grid_y - 30, grid_y + 35, 12):
                    d.ellipse([gx - 2, gy - 2, gx + 2, gy + 2], fill=(60, 30, 45, 220))
                    d.point((gx, gy), fill=(120, 50, 75, 255))
            led_y = py + 75
            d.ellipse([px - 28, led_y - 28, px + 28, led_y + 28], fill=(16, 18, 22, 255), outline=(50, 54, 62, 255), width=2)
            d.ellipse([px - 14, led_y - 14, px + 14, led_y + 14], fill=(240, 245, 255, 240), outline=(200, 220, 255, 255), width=1)
            d.ellipse([px - 8, led_y - 8, px + 8, led_y + 8], fill=(255, 255, 255, 255))
    
    # 4. Micro technical typography
    d.text((1250, 920), 'META QUEST 3 // MODEL MSQ3 // PC-ABS // REV 3.4', fill=(155, 160, 168, 200))
    d.text((580, 920), 'SPATIAL PERCEPTION ACTIVE ARRAY // DUAL 4MP RGB + TOF', fill=(155, 160, 168, 200))
    
    color_img.save("public/textures/faceplate.png")
    
    # Normal Map with Mold-Tech micro-stipple and pill bevels
    height = np.full((h, w), 128, dtype=np.float32)
    rng = np.random.RandomState(42)
    height += rng.normal(0, 1.8, (h, w)).astype(np.float32)
    
    mask_img = Image.new('L', (w, h), 128)
    dm = ImageDraw.Draw(mask_img)
    dm.ellipse([cx - 48, cy - 26, cx - 2, cy + 22], outline=112, width=8)
    dm.ellipse([cx + 2, cy - 26, cx + 48, cy + 22], outline=112, width=8)
    for px, py, pw, ph in [(592, 512, 154, 350), (1024, 512, 144, 365), (1456, 512, 154, 350)]:
        hw, hh = pw // 2, ph // 2
        dm.rounded_rectangle([px - hw - 8, py - hh - 8, px + hw + 8, py + hh + 8], radius=hw + 8, outline=145, width=6)
        dm.rounded_rectangle([px - hw, py - hh, px + hw, py + hh], radius=hw, fill=100, outline=160, width=4)
        dm.rounded_rectangle([px - hw + 8, py - hh + 8, px + hw - 8, py + hh - 8], radius=hw - 8, fill=30)
    dm.rounded_rectangle([24, 12, w - 25, h - 13], radius=165, outline=105, width=3)
    
    mask_arr = np.array(mask_img, dtype=np.float32)
    height = 0.85 * mask_arr + 0.15 * height
    gy, gx = np.gradient(height)
    strength = 2.2
    nx_arr = -gx * strength
    ny_arr = -gy * strength
    nz_arr = np.ones_like(nx_arr) * 12.0
    norm_arr = np.sqrt(nx_arr**2 + ny_arr**2 + nz_arr**2)
    nx_arr /= norm_arr
    ny_arr /= norm_arr
    nz_arr /= norm_arr
    
    r_chan = np.clip((nx_arr * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
    g_chan = np.clip((ny_arr * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
    b_chan = np.clip((nz_arr * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
    Image.fromarray(np.stack([r_chan, g_chan, b_chan], axis=-1), mode='RGB').save("public/textures/faceplate_normal.png")
    
    # Roughness Map
    rough_img = Image.new('L', (w, h), 110)
    dr = ImageDraw.Draw(rough_img)
    dr.ellipse([cx - 48, cy - 26, cx - 2, cy + 22], outline=140, width=8)
    dr.ellipse([cx + 2, cy - 26, cx + 48, cy + 22], outline=140, width=8)
    for px, py, pw, ph in [(592, 512, 154, 350), (1024, 512, 144, 365), (1456, 512, 154, 350)]:
        hw, hh = pw // 2, ph // 2
        dr.rounded_rectangle([px - hw, py - hh, px + hw, py + hh], radius=hw, fill=46, outline=60, width=4)
        dr.rounded_rectangle([px - hw + 8, py - hh + 8, px + hw - 8, py + hh - 8], radius=hw - 8, fill=16)
    rough_arr = np.array(rough_img, dtype=np.float32)
    rough_arr += rng.normal(0, 3.5, (h, w)).astype(np.float32)
    rough_arr = np.clip(rough_arr, 10, 255).astype(np.uint8)
    Image.fromarray(rough_arr, mode='L').save("public/textures/faceplate_roughness.png")

def make_fabric_texture():
    w, h = 512, 512
    img = Image.new("RGBA", (w, h), (36, 38, 42, 255))
    d = ImageDraw.Draw(img)
    for x in range(0, w, 4):
        for y in range(0, h, 4):
            shade = 32 + int(14 * ((x + y) % 8 == 0))
            d.point((x, y), fill=(shade, shade + 1, shade + 3, 255))
    img.save("public/textures/fabric_strap.png")

make_pcb_texture()
make_snapdragon_texture()
make_battery_texture()
make_lens_ring_texture()
make_display_texture()
make_faceplate_texture()
make_fabric_texture()
print("Textures ready.")

# --- 2. Advanced Parametric CAD Geometry Helpers ---

def apply_rot(mesh, angle, axis):
    mesh.apply_transform(trimesh.transformations.rotation_matrix(angle, axis))

def make_smooth_cylinder(radius, height, sections=64, transform=None):
    mesh = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    if transform is not None:
        mesh.apply_transform(transform)
    return mesh

# Superquadric solid for filleted, organic CAD bodies (replaces crude 8-vertex boxes)
def make_filleted_cad_body(a, b, c, e1=0.22, e2=0.22, u_res=36, v_res=36):
    u = np.linspace(-np.pi/2, np.pi/2, u_res)
    v = np.linspace(-np.pi, np.pi, v_res)
    U, V = np.meshgrid(u, v)
    
    def sgn_p(val, p):
        return np.sign(val) * (np.abs(val) ** p)
    
    X = a * sgn_p(np.cos(U), e1) * sgn_p(np.cos(V), e2)
    Y = b * sgn_p(np.cos(U), e1) * sgn_p(np.sin(V), e2)
    Z = c * sgn_p(np.sin(U), e1)
    
    verts = np.column_stack([X.ravel(), Y.ravel(), Z.ravel()])
    faces = []
    for i in range(v_res - 1):
        for j in range(u_res - 1):
            idx = i * u_res + j
            faces.append([idx, idx + 1, idx + u_res + 1])
            faces.append([idx, idx + u_res + 1, idx + u_res])
    mesh = trimesh.Trimesh(vertices=verts, faces=faces)
    mesh.fix_normals()
    return mesh

# Extruded ribbon spline for authentic flexible cables & contoured straps
def make_ribbon_spline(pts, width, thickness=0.08, segments=48):
    # pts: list of 3D points
    t = np.linspace(0, 1, segments)
    pts = np.array(pts)
    # Quadratic or piecewise interpolation
    res_pts = []
    for i in range(segments):
        frac = i / (segments - 1)
        # linear blend along points
        idx = frac * (len(pts) - 1)
        i0 = int(math.floor(idx))
        i1 = min(len(pts) - 1, i0 + 1)
        r = idx - i0
        res_pts.append((1 - r) * pts[i0] + r * pts[i1])
    res_pts = np.array(res_pts)
    
    verts = []
    faces = []
    half_w = width * 0.5
    half_t = thickness * 0.5
    
    for i, p in enumerate(res_pts):
        # Tangent vector
        if i < len(res_pts) - 1:
            tan = res_pts[i + 1] - p
        else:
            tan = p - res_pts[i - 1]
        tan_len = np.linalg.norm(tan)
        if tan_len > 1e-6:
            tan = tan / tan_len
        else:
            tan = np.array([0, 0, 1])
        
        norm = np.array([0, 1, 0])
        binorm = np.cross(tan, norm)
        binorm_len = np.linalg.norm(binorm)
        if binorm_len > 1e-6:
            binorm = binorm / binorm_len
        else:
            binorm = np.array([1, 0, 0])
        norm = np.cross(binorm, tan)
        
        # 4 vertices per cross section
        v1 = p + binorm * half_w + norm * half_t
        v2 = p - binorm * half_w + norm * half_t
        v3 = p - binorm * half_w - norm * half_t
        v4 = p + binorm * half_w - norm * half_t
        verts.extend([v1, v2, v3, v4])
        
    for i in range(segments - 1):
        b0 = i * 4
        b1 = (i + 1) * 4
        # 4 sides
        for k in range(4):
            kn = (k + 1) % 4
            faces.append([b0 + k, b0 + kn, b1 + kn])
            faces.append([b0 + k, b1 + kn, b1 + k])
            
    mesh = trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces))
    mesh.fix_normals()
    return mesh

print("2. Generating authentic CAD subassemblies...")

# 1. Front Faceplate: Smooth Continuous Lofted Shell with Precision UV Mapping and Real Wall Thickness
def make_cad_faceplate():
    nx, ny = 96, 64
    xs = np.linspace(-8.8, 8.8, nx)
    ys = np.linspace(-4.5, 4.5, ny)
    
    verts = []
    uvs = []
    for j, y in enumerate(ys):
        for i, x in enumerate(xs):
            bx = abs(x) / 8.8
            by = abs(y) / 4.5
            curve = 1.32 * ((1.0 - min(1.0, bx**2.3)) ** 0.5) * ((1.0 - min(1.0, by**2.2)) ** 0.5)
            z = 3.65 + curve
            verts.append([x, y, z])
            u = (x - (-8.8)) / 17.6
            v = (y - (-4.5)) / 9.0
            uvs.append([u, v])

    faces = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            idx = j * nx + i
            faces.append([idx, idx + 1, idx + nx + 1])
            faces.append([idx, idx + nx + 1, idx + nx])

    verts = np.array(verts)
    uvs = np.array(uvs)
    faces = np.array(faces)

    # Back shell for realistic wall thickness (2.8mm injection molded PC-ABS)
    back_verts = verts - [0, 0, 0.28]
    back_faces = [[f[0] + len(verts), f[2] + len(verts), f[1] + len(verts)] for f in faces]

    all_verts = np.vstack([verts, back_verts])
    all_uvs = np.vstack([uvs, uvs])
    all_faces = np.vstack([faces, back_faces])

    # Perimeter perimeter rim faces connecting front and back shell
    rim_faces = []
    # bottom edge
    for i in range(nx - 1):
        b0 = i
        b1 = i + 1
        t0 = b0 + len(verts)
        t1 = b1 + len(verts)
        rim_faces.append([b0, t1, t0])
        rim_faces.append([b0, b1, t1])
    # top edge
    for i in range(nx - 1):
        b0 = (ny - 1) * nx + i
        b1 = (ny - 1) * nx + i + 1
        t0 = b0 + len(verts)
        t1 = b1 + len(verts)
        rim_faces.append([b0, t0, t1])
        rim_faces.append([b0, t1, b1])
    # left edge
    for j in range(ny - 1):
        b0 = j * nx
        b1 = (j + 1) * nx
        t0 = b0 + len(verts)
        t1 = b1 + len(verts)
        rim_faces.append([b0, t0, t1])
        rim_faces.append([b0, t1, b1])
    # right edge
    for j in range(ny - 1):
        b0 = j * nx + (nx - 1)
        b1 = (j + 1) * nx + (nx - 1)
        t0 = b0 + len(verts)
        t1 = b1 + len(verts)
        rim_faces.append([b0, t1, t0])
        rim_faces.append([b0, b1, t1])

    all_faces = np.vstack([all_faces, rim_faces])
    shell = trimesh.Trimesh(vertices=all_verts, faces=all_faces)
    shell.visual = TextureVisuals(uv=all_uvs)
    return shell

# 2. Main Chassis Housing: Organic Contoured Shell with Vent Slots and Nose Arch
def make_cad_housing():
    # Outer filleted body
    body = make_filleted_cad_body(9.2, 4.8, 2.8, e1=0.28, e2=0.28, u_res=44, v_res=44)
    body.apply_translation([0.0, 0.0, 1.2])
    
    # Internal hollow cavity via inverted slightly smaller body
    cavity = make_filleted_cad_body(8.7, 4.3, 2.6, e1=0.28, e2=0.28, u_res=36, v_res=36)
    cavity.apply_translation([0.0, 0.0, 1.2])
    cavity.invert()
    
    # Perimeter bezel rim
    rim = make_smooth_cylinder(radius=0.22, height=18.0, sections=24)
    apply_rot(rim, math.pi / 2, [0, 0, 1])
    rim.apply_translation([0.0, 4.65, 3.4])
    
    # Top exhaust vent grille ribs
    vents = []
    for vx in np.linspace(-4.5, 4.5, 12):
        v_fin = make_smooth_cylinder(radius=0.08, height=1.4, sections=16)
        apply_rot(v_fin, math.pi / 2, [1, 0, 0])
        v_fin.apply_translation([vx, 4.68, 1.2])
        vents.append(v_fin)
        
    combined = trimesh.util.concatenate([body, cavity, rim] + vents)
    combined.fix_normals()
    return combined

# 3. Triple Camera & Depth Perception Sensor Cluster
def make_cad_sensors():
    parts = []
    # Left pill sensors (Stereo RGB Passthrough + Tracking)
    lens1 = trimesh.creation.icosphere(subdivisions=4, radius=0.48)
    lens1.apply_scale([1.0, 1.0, 0.45])
    lens1.apply_translation([-3.8, 0.75, 4.38])
    barrel1 = make_smooth_cylinder(radius=0.52, height=0.9, sections=40)
    barrel1.apply_translation([-3.8, 0.75, 3.9])
    
    lens2 = trimesh.creation.icosphere(subdivisions=4, radius=0.44)
    lens2.apply_scale([1.0, 1.0, 0.45])
    lens2.apply_translation([-3.8, -0.75, 4.38])
    barrel2 = make_smooth_cylinder(radius=0.48, height=0.9, sections=40)
    barrel2.apply_translation([-3.8, -0.75, 3.9])
    
    # Center VCSEL Active Depth Projector
    vcsel_emitter = make_filleted_cad_body(0.42, 0.65, 0.38, e1=0.2, e2=0.2, u_res=20, v_res=20)
    vcsel_emitter.apply_translation([0.0, 0.55, 4.22])
    vcsel_lens = trimesh.creation.icosphere(subdivisions=4, radius=0.44)
    vcsel_lens.apply_scale([1.0, 1.0, 0.40])
    vcsel_lens.apply_translation([0.0, -0.6, 4.38])
    
    # Right pill sensors
    lens3 = trimesh.creation.icosphere(subdivisions=4, radius=0.48)
    lens3.apply_scale([1.0, 1.0, 0.45])
    lens3.apply_translation([3.8, 0.75, 4.38])
    barrel3 = make_smooth_cylinder(radius=0.52, height=0.9, sections=40)
    barrel3.apply_translation([3.8, 0.75, 3.9])
    
    lens4 = trimesh.creation.icosphere(subdivisions=4, radius=0.44)
    lens4.apply_scale([1.0, 1.0, 0.45])
    lens4.apply_translation([3.8, -0.75, 4.38])
    barrel4 = make_smooth_cylinder(radius=0.48, height=0.9, sections=40)
    barrel4.apply_translation([3.8, -0.75, 3.9])
    
    # Wide-angle corner tracking cameras (bottom corners)
    c_left = make_smooth_cylinder(radius=0.45, height=0.9, sections=36)
    apply_rot(c_left, math.pi * 0.25, [0, 1, 1])
    c_left.apply_translation([-7.6, -4.0, 3.2])
    
    c_right = make_smooth_cylinder(radius=0.45, height=0.9, sections=36)
    apply_rot(c_right, -math.pi * 0.25, [0, 1, 1])
    c_right.apply_translation([7.6, -4.0, 3.2])

    parts.extend([lens1, barrel1, lens2, barrel2, vcsel_emitter, vcsel_lens, lens3, barrel3, lens4, barrel4, c_left, c_right])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 4. Side Cantilever Temple Arms with Spatial Audio Ducting
def make_cad_side_arms():
    parts = []
    # Left cantilever arm
    arm_l = make_filleted_cad_body(0.24, 0.95, 5.2, e1=0.25, e2=0.25, u_res=24, v_res=24)
    arm_l.apply_translation([-9.25, 0.2, -4.0])
    hinge_l = make_smooth_cylinder(radius=1.05, height=0.65, sections=48)
    apply_rot(hinge_l, math.pi / 2, [0, 0, 1])
    hinge_l.apply_translation([-9.25, 0.2, 0.6])
    
    # Left spatial audio acoustic slot
    spk_l = make_filleted_cad_body(0.12, 0.45, 1.4, e1=0.2, e2=0.2, u_res=16, v_res=16)
    spk_l.apply_translation([-8.98, 0.2, -5.0])
    
    # Right cantilever arm
    arm_r = make_filleted_cad_body(0.24, 0.95, 5.2, e1=0.25, e2=0.25, u_res=24, v_res=24)
    arm_r.apply_translation([9.25, 0.2, -4.0])
    hinge_r = make_smooth_cylinder(radius=1.05, height=0.65, sections=48)
    apply_rot(hinge_r, math.pi / 2, [0, 0, 1])
    hinge_r.apply_translation([9.25, 0.2, 0.6])
    
    spk_r = make_filleted_cad_body(0.12, 0.45, 1.4, e1=0.2, e2=0.2, u_res=16, v_res=16)
    spk_r.apply_translation([8.98, 0.2, -5.0])

    parts.extend([arm_l, hinge_l, spk_l, arm_r, hinge_r, spk_r])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 5. Folded Pancake Optical Assemblies (Left / Right)
def make_cad_pancake_lens(is_left=True):
    cx = -3.3 if is_left else 3.3
    elements = []
    # Front curved meniscus element
    lens_front = trimesh.creation.icosphere(subdivisions=4, radius=2.45)
    lens_front.apply_scale([1.0, 0.95, 0.35])
    lens_front.apply_translation([cx, 0.0, -1.65])
    elements.append(lens_front)
    
    # Precision knurled retaining barrel
    barrel = make_smooth_cylinder(radius=2.65, height=0.92, sections=72)
    barrel.apply_translation([cx, 0.0, -1.8])
    elements.append(barrel)
    
    # Polarizing Beam Splitter (PBS) mirror plate
    pbs = make_smooth_cylinder(radius=2.35, height=0.24, sections=54)
    pbs.apply_translation([cx, 0.0, -1.25])
    elements.append(pbs)
    
    # Rear aspheric element
    lens_rear = trimesh.creation.icosphere(subdivisions=4, radius=2.28)
    lens_rear.apply_scale([1.0, 0.92, 0.28])
    lens_rear.apply_translation([cx, 0.0, -2.15])
    elements.append(lens_rear)

    res = trimesh.util.concatenate(elements)
    res.fix_normals()
    return res

# 6. Fast-Switch LCD Display Panels
def make_cad_displays():
    displays = []
    for cx in [-3.3, 3.3]:
        # Active LCD matrix
        glass = make_filleted_cad_body(2.35, 2.35, 0.14, e1=0.15, e2=0.15, u_res=24, v_res=24)
        glass.apply_translation([cx, 0.0, 0.2])
        # Aluminum backplate heat spreader
        plate = make_filleted_cad_body(2.45, 2.45, 0.12, e1=0.15, e2=0.15, u_res=24, v_res=24)
        plate.apply_translation([cx, 0.0, 0.42])
        # Display driver flex ribbon
        flex = make_ribbon_spline([[cx, 2.4, 0.42], [cx, 2.8, 0.8], [cx, 3.2, 1.4]], width=1.6, thickness=0.06)
        displays.extend([glass, plate, flex])
        
    res = trimesh.util.concatenate(displays)
    res.fix_normals()
    return res

# 7. Magnesium Optical Carriage & Guide Shafts
def make_cad_optics_carriage():
    parts = []
    # Left and right cylindrical eye barrels
    c_left = make_smooth_cylinder(radius=2.85, height=0.65, sections=56)
    c_left.apply_translation([-3.3, 0.0, -1.0])
    c_right = make_smooth_cylinder(radius=2.85, height=0.65, sections=56)
    c_right.apply_translation([3.3, 0.0, -1.0])
    
    # Dual precision stainless steel linear guide rods
    rail_t = make_smooth_cylinder(radius=0.20, height=12.8, sections=36)
    apply_rot(rail_t, math.pi / 2, [0, 0, 1])
    rail_t.apply_translation([0.0, 2.95, -1.0])
    
    rail_b = make_smooth_cylinder(radius=0.20, height=12.8, sections=36)
    apply_rot(rail_b, math.pi / 2, [0, 0, 1])
    rail_b.apply_translation([0.0, -2.95, -1.0])
    
    # Central IPD thumbwheel gear
    gear = make_smooth_cylinder(radius=0.75, height=0.7, sections=44)
    gear.apply_translation([0.0, 0.0, -1.0])

    parts.extend([c_left, c_right, rail_t, rail_b, gear])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 8. Main Logic Board: 10-Layer HDI PCB with Nickel Shielding Cans
def make_cad_motherboard():
    parts = []
    # Mainboard substrate with filleted edges
    pcb = make_filleted_cad_body(7.4, 3.7, 0.16, e1=0.22, e2=0.22, u_res=36, v_res=36)
    pcb.apply_translation([0.0, 0.8, 1.8])
    
    # EMI / RF metal shielding cans with stamped bevels
    can1 = make_filleted_cad_body(1.9, 1.7, 0.28, e1=0.18, e2=0.18, u_res=20, v_res=20)
    can1.apply_translation([-4.2, 1.2, 2.12])
    
    can2 = make_filleted_cad_body(1.8, 1.5, 0.28, e1=0.18, e2=0.18, u_res=20, v_res=20)
    can2.apply_translation([4.4, 1.0, 2.12])
    
    can3 = make_filleted_cad_body(2.1, 1.2, 0.28, e1=0.18, e2=0.18, u_res=20, v_res=20)
    can3.apply_translation([0.0, 2.6, 2.12])

    parts.extend([pcb, can1, can2, can3])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 9. Qualcomm Snapdragon XR2 Gen 2 Processor Package
def make_cad_snapdragon_xr2():
    parts = []
    # Silicon SoC Die
    die = make_filleted_cad_body(1.4, 1.4, 0.24, e1=0.15, e2=0.15, u_res=24, v_res=24)
    die.apply_translation([0.0, 0.6, 2.18])
    
    # 12GB LPDDR5 PoP RAM package
    ram = make_filleted_cad_body(1.2, 1.2, 0.16, e1=0.15, e2=0.15, u_res=20, v_res=20)
    ram.apply_translation([0.0, 0.6, 2.38])
    
    # Gold pin-1 corner indicator dot
    pin1 = trimesh.creation.icosphere(subdivisions=3, radius=0.12)
    pin1.apply_translation([-1.1, -0.5, 2.48])

    parts.extend([die, ram, pin1])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 10. Thermal Engineering: Sintered Copper Heat Pipe & Radial Blower Fan
def make_cad_cooling_system():
    parts = []
    # S-curved sintered copper heat pipe
    pipe_pts = [
        [0.0, 0.6, 2.3],
        [-1.8, 1.4, 2.35],
        [-3.6, 2.2, 2.3],
        [-4.5, 3.4, 2.2]
    ]
    pipe = make_ribbon_spline(pipe_pts, width=0.75, thickness=0.35, segments=36)
    
    # Pure copper vapor chamber contact block
    vapor_base = make_filleted_cad_body(1.6, 1.4, 0.25, e1=0.2, e2=0.2, u_res=20, v_res=20)
    vapor_base.apply_translation([0.0, 0.6, 2.25])
    
    # Micro-fin aluminum radiator stack
    fins = []
    for fx in np.linspace(-5.6, -3.4, 16):
        fin = make_filleted_cad_body(0.04, 0.9, 0.5, e1=0.1, e2=0.1, u_res=12, v_res=12)
        fin.apply_translation([fx, 3.8, 2.2])
        fins.append(fin)
        
    # Centrifugal radial blower fan housing
    fan_housing = make_smooth_cylinder(radius=2.05, height=1.1, sections=56)
    fan_housing.apply_translation([-4.5, 2.2, 1.8])
    fan_hub = make_smooth_cylinder(radius=0.75, height=1.2, sections=36)
    fan_hub.apply_translation([-4.5, 2.2, 1.85])

    parts.extend([pipe, vapor_base, fan_housing, fan_hub] + fins)
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 11. Battery System: Curved 19.44 Wh Lithium Polymer Cell
def make_cad_battery():
    # Real curved pouch cell with rounded edges
    bat = make_filleted_cad_body(6.0, 2.45, 0.72, e1=0.26, e2=0.26, u_res=36, v_res=36)
    # Slight arc curve along X
    verts = bat.vertices.copy()
    arc = 0.35 * (1.0 - (verts[:, 0] / 6.0)**2)
    verts[:, 2] += arc
    bat.vertices = verts
    bat.apply_translation([0.0, -2.6, 1.4])
    
    # Safety protection circuit board (BMS) on top
    bms = make_filleted_cad_body(4.8, 0.35, 0.45, e1=0.2, e2=0.2, u_res=20, v_res=20)
    bms.apply_translation([0.0, -0.05, 1.7])
    
    res = trimesh.util.concatenate([bat, bms])
    res.fix_normals()
    return res

# 12. Power Harness: Multi-Strand High-Current Wiring
def make_cad_power_wiring():
    # Flexible red and black silicone cables
    wire_r = make_ribbon_spline([[0.0, -0.05, 1.7], [0.6, 0.4, 1.8], [0.8, 0.8, 1.9]], width=0.24, thickness=0.24)
    wire_b = make_ribbon_spline([[-0.2, -0.05, 1.7], [-0.5, 0.4, 1.8], [-0.6, 0.8, 1.9]], width=0.24, thickness=0.24)
    # Gold-plated locking terminal block
    terminal = make_filleted_cad_body(0.55, 0.35, 0.35, e1=0.15, e2=0.15, u_res=16, v_res=16)
    terminal.apply_translation([0.0, 0.8, 1.9])
    
    res = trimesh.util.concatenate([wire_r, wire_b, terminal])
    res.fix_normals()
    return res

# 13. Signal Interconnects: Translucent Amber Kapton Flex Circuits
def make_cad_flex_circuits():
    # S-curved flex cables connecting logic board to sensors and displays
    f1 = make_ribbon_spline([[-3.8, 0.0, 3.8], [-3.8, 0.4, 2.6], [-2.5, 0.8, 2.0]], width=0.85, thickness=0.06)
    f2 = make_ribbon_spline([[3.8, 0.0, 3.8], [3.8, 0.4, 2.6], [2.5, 0.8, 2.0]], width=0.85, thickness=0.06)
    f3 = make_ribbon_spline([[0.0, 0.0, 4.0], [0.0, 0.5, 2.8], [0.0, 0.8, 2.0]], width=0.65, thickness=0.06)
    
    res = trimesh.util.concatenate([f1, f2, f3])
    res.fix_normals()
    return res

# 14. Wireless & 6DoF Inertial Measurement Hub
def make_cad_rf_imu():
    # Ceramic Wi-Fi 6E dual antennas + 6DoF gyroscope
    ant_l = make_filleted_cad_body(0.75, 0.35, 0.18, e1=0.15, e2=0.15, u_res=16, v_res=16)
    ant_l.apply_translation([-7.4, 3.2, 1.8])
    ant_r = make_filleted_cad_body(0.75, 0.35, 0.18, e1=0.15, e2=0.15, u_res=16, v_res=16)
    ant_r.apply_translation([7.4, 3.2, 1.8])
    imu = make_filleted_cad_body(0.35, 0.35, 0.22, e1=0.15, e2=0.15, u_res=16, v_res=16)
    imu.apply_translation([0.0, 1.6, 2.0])
    
    res = trimesh.util.concatenate([ant_l, ant_r, imu])
    res.fix_normals()
    return res

# 15. Ergonomic Facial Interface: Anatomically Contoured Frame
def make_cad_facial_interface():
    # Contoured frame with brow curve and nasal arch
    u = np.linspace(0, 2*np.pi, 64)
    # Parametric oval with nasal arch notch
    a, b = 8.8, 4.7
    x = a * np.cos(u)
    y = b * np.sin(u)
    # Notch out nose bridge at bottom
    nose_mask = (np.abs(x) < 1.6) & (y < -1.5)
    y[nose_mask] += 1.4 * (1.0 - (np.abs(x[nose_mask]) / 1.6)**2)
    
    z = -1.2 * (np.abs(x) / a)**1.8
    pts = np.column_stack([x, y, z])
    
    frame = make_ribbon_spline(pts, width=1.1, thickness=0.35, segments=64)
    frame.apply_translation([0.0, 0.0, -3.2])
    return frame

# 16. Breathable Memory Foam Cushion & Light Blockers
def make_cad_face_cushion():
    u = np.linspace(0, 2*np.pi, 64)
    a, b = 8.6, 4.5
    x = a * np.cos(u)
    y = b * np.sin(u)
    nose_mask = (np.abs(x) < 1.6) & (y < -1.5)
    y[nose_mask] += 1.4 * (1.0 - (np.abs(x[nose_mask]) / 1.6)**2)
    z = -1.3 * (np.abs(x) / a)**1.8
    pts = np.column_stack([x, y, z])
    
    cushion = make_ribbon_spline(pts, width=1.35, thickness=0.55, segments=64)
    cushion.apply_translation([0.0, 0.0, -3.8])
    return cushion

# 17. Adjustable Woven Elastic Headstrap Harness
def make_cad_head_strap():
    parts = []
    # Left strap wrapping back
    pts_l = [
        [-9.25, 0.2, -4.0],
        [-9.3, 0.4, -8.0],
        [-8.2, 0.6, -12.0],
        [-5.0, 0.8, -15.0],
        [0.0, 1.0, -16.2]
    ]
    strap_l = make_ribbon_spline(pts_l, width=1.65, thickness=0.18, segments=48)
    
    # Right strap wrapping back
    pts_r = [
        [9.25, 0.2, -4.0],
        [9.3, 0.4, -8.0],
        [8.2, 0.6, -12.0],
        [5.0, 0.8, -15.0],
        [0.0, 1.0, -16.2]
    ]
    strap_r = make_ribbon_spline(pts_r, width=1.65, thickness=0.18, segments=48)
    
    # Top crown strap arching over skull
    pts_top = [
        [0.0, 4.6, 1.2],
        [0.0, 7.2, -5.0],
        [0.0, 6.8, -11.0],
        [0.0, 2.5, -15.5],
        [0.0, 1.0, -16.2]
    ]
    strap_top = make_ribbon_spline(pts_top, width=1.55, thickness=0.18, segments=48)
    
    # Rear ergonomic silicone tensioner cradle
    cradle = make_filleted_cad_body(2.4, 1.4, 0.22, e1=0.2, e2=0.2, u_res=24, v_res=24)
    cradle.apply_translation([0.0, 1.0, -16.3])

    parts.extend([strap_l, strap_r, strap_top, cradle])
    res = trimesh.util.concatenate(parts)
    res.fix_normals()
    return res

# 18 Precision Subassembly Catalog
cad_specs = [
    {
        "id": "exterior_faceplate",
        "name": "Satin Polycarbonate Faceplate",
        "group": "group_exterior",
        "groupName": "EXTERIOR ARCHITECTURE",
        "fn": make_cad_faceplate,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, 11.0],
        "mat": PBRMaterial(name="Mat_Faceplate", baseColorFactor=[0.93, 0.93, 0.95, 1.0], roughnessFactor=0.40, metallicFactor=0.02),
        "category": "Exterior Shell",
        "specs": "Injection-molded high-impact polycarbonate (PC-ABS) alloy with Mold-Tech satin anti-glare finish, triple perception sensor apertures, and debossed Meta insignia.",
        "description": "Forms the front aerodynamic aesthetic shell while providing mechanical shock protection and thermal dissipation for the internal optical sensor array.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, 11.0],
        "cameraDist": 16.0
    },
    {
        "id": "exterior_housing",
        "name": "Contoured Unibody Chassis Housing",
        "group": "group_exterior",
        "groupName": "CHASSIS & AIRFLOW",
        "fn": make_cad_housing,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, 0.0],
        "mat": PBRMaterial(name="Mat_Housing", baseColorFactor=[0.94, 0.94, 0.96, 1.0], roughnessFactor=0.38, metallicFactor=0.03),
        "category": "Structural Frame",
        "specs": "Precision engineered unibody enclosure with top convective ventilation slots, IPD scroll wheel opening, and bottom volume rockers.",
        "description": "The central structural core enclosing the main logic board, battery, and pancake optical barrels with sub-millimeter tolerances.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, 0.0],
        "cameraDist": 20.0
    },
    {
        "id": "exterior_sensors",
        "name": "Perception Tracking & Active Depth Cluster",
        "group": "group_exterior",
        "groupName": "PERCEPTION ARCHITECTURE",
        "fn": make_cad_sensors,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, 15.5],
        "mat": PBRMaterial(name="Mat_Sensors", baseColorFactor=[0.05, 0.06, 0.08, 1.0], roughnessFactor=0.12, metallicFactor=0.25),
        "category": "Spatial Perception",
        "specs": "Dual 4MP RGB color passthrough cameras (18 PPD), VCSEL infrared depth projector, and 4 wide-angle 6DoF tracking cameras.",
        "description": "Enables stereoscopic mixed-reality video passthrough and sub-millimeter room mesh spatial tracking with real-time occlusion.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, 15.5],
        "cameraDist": 14.0
    },
    {
        "id": "exterior_side_arms",
        "name": "Cantilever Temple Arms & Spatial Speakers",
        "group": "group_exterior",
        "groupName": "ACOUSTICS & ERGONOMICS",
        "fn": make_cad_side_arms,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [5.5, 0.0, -1.0],
        "mat": PBRMaterial(name="Mat_SideArms", baseColorFactor=[0.94, 0.94, 0.96, 1.0], roughnessFactor=0.36, metallicFactor=0.02),
        "category": "Spatial Audio",
        "specs": "Dual-driver integrated acoustic chambers with bass reflex ports, 40% louder than Quest 2, calibrated 3D HRTF spatial audio.",
        "description": "Rigid cantilever arms transfer clamping pressure evenly while channeling spatial audio directly toward the user's ears without headphones.",
        "verified": True,
        "cameraTarget": [5.5, 0.0, -1.0],
        "cameraDist": 15.0
    },
    {
        "id": "optics_lens_left",
        "name": "Left Folded Pancake Optical Assembly",
        "group": "group_optics",
        "groupName": "OPTICAL TRAIN",
        "fn": lambda: make_cad_pancake_lens(is_left=True),
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [-6.2, 0.0, -4.5],
        "mat": PBRMaterial(name="Mat_OpticsGlassL", baseColorFactor=[0.95, 0.98, 1.0, 0.95], roughnessFactor=0.03, metallicFactor=0.05),
        "category": "Pancake Optics",
        "specs": "Multi-element polarized folded pancake lens architecture, 110° diagonal FOV, edge-to-edge optical clarity, anti-reflective coating.",
        "description": "Folded polarizing geometry bounces incoming display light multiple times, slashing headset thickness by 40% compared to Fresnel lenses.",
        "verified": True,
        "cameraTarget": [-6.2, 0.0, -4.5],
        "cameraDist": 12.0
    },
    {
        "id": "optics_lens_right",
        "name": "Right Folded Pancake Optical Assembly",
        "group": "group_optics",
        "groupName": "OPTICAL TRAIN",
        "fn": lambda: make_cad_pancake_lens(is_left=False),
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [6.2, 0.0, -4.5],
        "mat": PBRMaterial(name="Mat_OpticsGlassR", baseColorFactor=[0.95, 0.98, 1.0, 0.95], roughnessFactor=0.03, metallicFactor=0.05),
        "category": "Pancake Optics",
        "specs": "Multi-element polarized folded pancake lens architecture, 110° diagonal FOV, edge-to-edge optical clarity, anti-reflective coating.",
        "description": "Folded polarizing geometry bounces incoming display light multiple times, slashing headset thickness by 40% compared to Fresnel lenses.",
        "verified": True,
        "cameraTarget": [6.2, 0.0, -4.5],
        "cameraDist": 12.0
    },
    {
        "id": "optics_displays",
        "name": "Dual 4K+ Infinite Display Panels",
        "group": "group_optics",
        "groupName": "DISPLAY SYSTEM",
        "fn": make_cad_displays,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -1.8],
        "mat": PBRMaterial(name="Mat_Displays", baseColorFactor=[0.06, 0.08, 0.12, 1.0], roughnessFactor=0.18, metallicFactor=0.40),
        "category": "Infinite Display",
        "specs": "Dual Fast-Switch LCD panels (2064 × 2208 pixels per eye, 1218 PPI, 25 PPD), up to 120Hz refresh rate, 100% sRGB color gamut.",
        "description": "Provides nearly 30% jump in resolution over Quest 2, eliminating the screen-door effect for crisp virtual reality text and fine details.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -1.8],
        "cameraDist": 14.0
    },
    {
        "id": "optics_brackets",
        "name": "Magnesium IPD Carriage & Guide Rails",
        "group": "group_optics",
        "groupName": "MECHANICAL OPTICS",
        "fn": make_cad_optics_carriage,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -3.2],
        "mat": PBRMaterial(name="Mat_OpticsCarriage", baseColorFactor=[0.45, 0.48, 0.52, 1.0], roughnessFactor=0.28, metallicFactor=0.90),
        "category": "IPD Mechanism",
        "specs": "Die-cast magnesium alloy frame, continuous 58mm-71mm manual thumbwheel IPD adjustment mechanism with stainless steel guide rails.",
        "description": "Houses the optical lenses and displays in rigid alignment while allowing continuous interpupillary distance customization for individual eye spacing.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -3.2],
        "cameraDist": 15.0
    },
    {
        "id": "electronics_motherboard",
        "name": "10-Layer HDI Main Logic Board",
        "group": "group_electronics",
        "groupName": "COMPUTE & ELECTRONICS",
        "fn": make_cad_motherboard,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 6.2, 3.2],
        "mat": PBRMaterial(name="Mat_Motherboard", baseColorFactor=[0.12, 0.13, 0.15, 1.0], roughnessFactor=0.32, metallicFactor=0.42),
        "category": "Mainboard Architecture",
        "specs": "10-layer High Density Interconnect (HDI) rigid PCB, immersion gold pads, surface-mount components, nickel EMI shielding cans.",
        "description": "The central processing hub uniting the Qualcomm XR2 Gen 2, power regulation circuitry, Wi-Fi 6E connectivity, and video pipelines.",
        "verified": True,
        "cameraTarget": [0.0, 6.2, 3.2],
        "cameraDist": 15.0
    },
    {
        "id": "electronics_snapdragon_xr2",
        "name": "Qualcomm Snapdragon XR2 Gen 2 Platform",
        "group": "group_electronics",
        "groupName": "COMPUTE & ELECTRONICS",
        "fn": make_cad_snapdragon_xr2,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 10.5, 4.5],
        "mat": PBRMaterial(name="Mat_Snapdragon", baseColorFactor=[0.14, 0.15, 0.18, 1.0], roughnessFactor=0.18, metallicFactor=0.94),
        "category": "Silicon Architecture",
        "specs": "Qualcomm Snapdragon XR2 Gen 2 (SXR2230P), 4nm TSMC process node, Adreno 740 GPU, 12GB LPDDR5 RAM, Hexagon dual-core NPU.",
        "description": "Delivers 2.5x the graphic processing performance of Quest 2, handling dynamic lighting shaders, 120Hz refresh rates, and low-latency computer vision.",
        "verified": True,
        "cameraTarget": [0.0, 10.5, 4.5],
        "cameraDist": 8.0
    },
    {
        "id": "electronics_cooling_fan_heatsink",
        "name": "Sintered Copper Heat Pipe & Radial Blower Fan",
        "group": "group_electronics",
        "groupName": "THERMAL DYNAMICS",
        "fn": make_cad_cooling_system,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [-4.8, 8.5, 1.8],
        "mat": PBRMaterial(name="Mat_CoolingCopper", baseColorFactor=[0.85, 0.46, 0.24, 1.0], roughnessFactor=0.20, metallicFactor=0.98),
        "category": "Thermal Engineering",
        "specs": "Sintered pure copper heat pipe with vapor chamber base, stacked aluminum micro-fin radiator, centrifugal radial micro-blower fan.",
        "description": "Actively exhausts heat from the Snapdragon XR2 die through top vent slots, preventing thermal throttling during intensive mixed-reality workloads.",
        "verified": True,
        "cameraTarget": [-4.8, 8.5, 1.8],
        "cameraDist": 11.0
    },
    {
        "id": "power_battery",
        "name": "Curved 5,060 mAh Lithium Polymer Battery",
        "group": "group_power",
        "groupName": "POWER MANAGEMENT",
        "fn": make_cad_battery,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, -7.0, 3.5],
        "mat": PBRMaterial(name="Mat_Battery", baseColorFactor=[0.86, 0.88, 0.90, 1.0], roughnessFactor=0.26, metallicFactor=0.88),
        "category": "Energy Storage",
        "specs": "Rechargeable Lithium-Ion Polymer cell (Model FB40), 5,060 mAh capacity (19.44 Wh nominal @ 3.85V, 4.40V cutoff), curved form factor.",
        "description": "Supplies 2.0 to 2.5 hours of continuous wireless VR/MR operation. Centrally placed low in the headset frame to drastically reduce neck torque.",
        "verified": True,
        "cameraTarget": [0.0, -7.0, 3.5],
        "cameraDist": 14.0
    },
    {
        "id": "power_connectors",
        "name": "Heavy-Duty Power Wiring Harness",
        "group": "group_power",
        "groupName": "POWER MANAGEMENT",
        "fn": make_cad_power_wiring,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, -9.5, 2.0],
        "mat": PBRMaterial(name="Mat_PowerConnectors", baseColorFactor=[0.80, 0.20, 0.20, 1.0], roughnessFactor=0.38, metallicFactor=0.20),
        "category": "Power Distribution",
        "specs": "Silicone insulated red/black multi-strand copper harness, locking gold-plated battery terminal, inline ferrite suppression bead.",
        "description": "Safely routes high-current power from the battery through the protection circuitry to the mainboard, monitoring cell temperatures and voltage balance.",
        "verified": True,
        "cameraTarget": [0.0, -9.5, 2.0],
        "cameraDist": 10.0
    },
    {
        "id": "electronics_flex_cables",
        "name": "Polyimide Kapton Flex Ribbon Circuits",
        "group": "group_electronics",
        "groupName": "SIGNAL DISTRIBUTION",
        "fn": make_cad_flex_circuits,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 4.0, 3.0],
        "mat": PBRMaterial(name="Mat_FlexCables", baseColorFactor=[0.85, 0.60, 0.15, 0.9], roughnessFactor=0.28, metallicFactor=0.55),
        "category": "Interconnects",
        "specs": "Translucent amber Kapton polyimide Flexible Flat Circuits (FFC), high-density gold micro-strip traces, locking ZIF board headers.",
        "description": "Distributes high-speed video signals, sensor data, and power across the optical and computing layers with high flexibility and resistance to thermal expansion.",
        "verified": True,
        "cameraTarget": [0.0, 4.0, 3.0],
        "cameraDist": 12.0
    },
    {
        "id": "electronics_connectivity_rf",
        "name": "Wireless Subsystem & 6DoF IMU Hub",
        "group": "group_electronics",
        "groupName": "WIRELESS & SENSORS",
        "fn": make_cad_rf_imu,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [7.0, 5.5, 2.0],
        "mat": PBRMaterial(name="Mat_RF_IMU", baseColorFactor=[0.25, 0.28, 0.32, 1.0], roughnessFactor=0.26, metallicFactor=0.82),
        "category": "Wireless Subsystem",
        "specs": "Qualcomm FastConnect 7800 Wi-Fi 6E & Bluetooth 5.2 ceramic antennas, InvenSense 6-axis ultra-low-drift IMU, quad beamforming mics.",
        "description": "Ensures lag-free wireless PC VR streaming over 6GHz bands, instantaneous head-rotation motion capture, and spatial voice pickup.",
        "verified": True,
        "cameraTarget": [7.0, 5.5, 2.0],
        "cameraDist": 10.0
    },
    {
        "id": "comfort_facial_interface",
        "name": "Ergonomic Facial Interface Mount",
        "group": "group_comfort",
        "groupName": "FIT & ERGONOMICS",
        "fn": make_cad_facial_interface,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -8.0],
        "mat": PBRMaterial(name="Mat_FacialInterface", baseColorFactor=[0.16, 0.18, 0.22, 1.0], roughnessFactor=0.55, metallicFactor=0.06),
        "category": "Ergonomics",
        "specs": "Anatomically contoured dark charcoal polycarbonate frame with nasal bridge arch, dual 4-position eye-relief sliding depth adjusters.",
        "description": "Ergonomically bridges the headset to the human face. Allows the user to slide the headset closer or further from their glasses while preventing lens fogging.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -8.0],
        "cameraDist": 16.0
    },
    {
        "id": "comfort_cushion_padding",
        "name": "Breathable Memory Foam Cushion & Light Blockers",
        "group": "group_comfort",
        "groupName": "FIT & ERGONOMICS",
        "fn": make_cad_face_cushion,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -12.0],
        "mat": PBRMaterial(name="Mat_CushionPadding", baseColorFactor=[0.14, 0.15, 0.18, 1.0], roughnessFactor=0.92, metallicFactor=0.01),
        "category": "Comfort Gasket",
        "specs": "Soft open-cell memory foam core encased in breathable athletic micro-mesh fabric, flexible silicone nose light-blocker flaps.",
        "description": "Cushions contact pressure against the forehead and cheekbones while silicone nose flaps block external ambient light for deep virtual reality immersion.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -12.0],
        "cameraDist": 14.0
    },
    {
        "id": "comfort_head_strap",
        "name": "Adjustable Woven Elastic Y-Strap",
        "group": "group_comfort",
        "groupName": "FIT & ERGONOMICS",
        "fn": make_cad_head_strap,
        "assembled": [0.0, 0.0, 0.0],
        "exploded": [0.0, 0.0, -16.5],
        "mat": PBRMaterial(name="Mat_HeadStrap", baseColorFactor=[0.22, 0.24, 0.28, 1.0], roughnessFactor=0.85, metallicFactor=0.02),
        "category": "Headstrap Harness",
        "specs": "Y-shaped flexible woven elastic strap, hook-and-loop top crown adjustment fastener, dual rear polymer tension sliders.",
        "description": "Evenly distributes the headset's 515g weight across the top of the skull and back of the head, ensuring a snug, non-slip fit during vigorous gameplay.",
        "verified": True,
        "cameraTarget": [0.0, 0.0, -16.5],
        "cameraDist": 20.0
    }
]

scene = trimesh.Scene()
quest3_json = []

for spec in cad_specs:
    cid = spec["id"]
    print(f"  Building {cid}...")
    mesh = spec["fn"]()
    mesh.visual.material = spec["mat"]
    mesh.metadata["name"] = cid
    mesh.metadata["id"] = cid
    scene.add_geometry(mesh, node_name=cid, geom_name=cid)
    
    quest3_json.append({
        "id": spec["id"],
        "name": spec["name"],
        "group": spec["group"],
        "groupName": spec["groupName"],
        "category": spec["category"],
        "specs": spec["specs"],
        "description": spec["description"],
        "verified": spec["verified"],
        "assembled": spec["assembled"],
        "exploded": spec["exploded"],
        "cameraTarget": spec["cameraTarget"],
        "cameraDist": spec["cameraDist"]
    })

with open("src/data/componentsData.json", "w") as f:
    json.dump(quest3_json, f, indent=2)

print("Saved src/data/componentsData.json")

output_glb_path = "public/models/quest3_exploded.glb"
glb_bytes = scene.export(file_type="glb")
with open(output_glb_path, "wb") as f:
    f.write(glb_bytes)

print(f"Exported High-Fidelity CAD Quest 3 GLB to {output_glb_path} ({len(glb_bytes):,} bytes)")