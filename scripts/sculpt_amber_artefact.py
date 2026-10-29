import os
import sys
import time
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
import trimesh
from trimesh.visual.texture import TextureVisuals
from trimesh.visual.material import PBRMaterial

def sculpt_futuristic_amber_artefact():
    t0 = time.time()
    print("=============================================================")
    print("  IdleX Sculptural Futuristic Amber Artefact Pipeline (v2)   ")
    print("=============================================================")

    # 1. PARAMETRIC POLAR SCULPTURAL OVOID SPECIFICATION
    # Height-to-width ratio: ~1.67:1 (proportional, substantial, organic)
    H = 3.92              # Total vertical height
    R0 = 1.05             # Base radius scaling
    alpha = 0.13          # Ovoid fullness (gentle egg taper, fuller lower-middle)
    beta = 0.10           # Central body fullness

    N_phi = 160           # Polar rings (from north pole to south pole)
    N_theta = 96          # Circumferential columns
    num_cols = N_theta + 1

    # Avoid exact 0 and pi to prevent quad collapse on the body strip;
    # clean single-vertex dome caps close the ends with perfect horizontal tangents
    phis = np.linspace(0.001, np.pi - 0.001, N_phi)
    thetas = np.linspace(-np.pi, np.pi, num_cols)

    verts = []
    uvs = []

    print(f"Sculpting 5-lobe sculptural ovoid mesh ({N_phi} rings x {N_theta} columns)...")

    for i, phi in enumerate(phis):
        cos_p = np.cos(phi)  # +1 at top, -1 at bottom
        sin_p = np.sin(phi)  # 0 at poles, 1 at equator
        
        # Base ovoid radius function (smooth parabolic dome at crown, rounded base at foot)
        r_base = R0 * sin_p * (1.0 - alpha * cos_p + beta * sin_p**2)
        
        # 5 broad, softly sweeping sculptural flutes with subtle helical twist
        # Fades to 0 at the poles via sin_p^1.8 to ensure completely smooth, unwrinkled poles
        lobe_fade = sin_p ** 1.8
        lobe = 0.062 * np.cos(5.0 * thetas + 0.75 * cos_p) + 0.022 * np.cos(2.0 * thetas - 0.35 * cos_p)
        r_mod = 1.0 + lobe * lobe_fade
        
        # Organic posture / spine curvature: subtle handcrafted artistic gesture
        cx = 0.050 * sin_p + 0.020 * np.sin(2.0 * phi)
        cz = 0.035 * cos_p - 0.015
        y = 0.5 * H * cos_p
        
        rx = r_base * r_mod
        rz = rx * (0.91 + 0.02 * sin_p)
        
        for j in range(num_cols):
            theta = thetas[j]
            x = cx + rx[j] * np.sin(theta)
            z = cz + rz[j] * np.cos(theta)
            
            u_coord = j / (num_cols - 1)
            v_coord = (cos_p + 1.0) * 0.5  # 0 at bottom (cos=-1), 1 at top (cos=+1)
            
            verts.append([x, y, z])
            uvs.append([u_coord, v_coord])

    # 2. Quad Strip Faces (Outward-facing normal winding)
    # Ring i has higher Y than ring i+1
    faces = []
    for i in range(N_phi - 1):
        for j in range(N_theta):
            p0 = i * num_cols + j
            p1 = i * num_cols + (j + 1)
            p2 = (i + 1) * num_cols + (j + 1)
            p3 = (i + 1) * num_cols + j
            faces.append([p0, p1, p2])
            faces.append([p0, p2, p3])

    # 3. Softly Rounded Crown Cap (Top Dome Apex)
    # Tangent at apex is completely horizontal (dy/dr = 0)
    top_apex = [0.0, 0.5 * H, 0.02]
    top_idx = len(verts)
    verts.append(top_apex)
    uvs.append([0.5, 1.0])
    for j in range(N_theta):
        faces.append([j, top_idx, j + 1])

    # 4. Softly Rounded Base Cap (Bottom Foot Apex)
    bot_apex = [0.0, -0.5 * H, -0.05]
    bot_idx = len(verts)
    verts.append(bot_apex)
    uvs.append([0.5, 0.0])
    bot_ring = (N_phi - 1) * num_cols
    for j in range(N_theta):
        faces.append([bot_ring + j, bot_ring + (j + 1), bot_idx])

    verts = np.array(verts, dtype=np.float32)
    uvs = np.array(uvs, dtype=np.float32)
    faces = np.array(faces, dtype=np.int32)

    # 5. Topological Validation
    welded = trimesh.Trimesh(vertices=verts.copy(), faces=faces.copy(), process=True)
    print(f"✓ Geometry created: {len(verts)} vertices, {len(faces)} faces")
    print(f"  Is Watertight?       : {welded.is_watertight}")
    print(f"  Euler Characteristic : {welded.euler_number} (expected 2)")
    
    bounds = welded.bounds
    dx = bounds[1, 0] - bounds[0, 0]
    dy = bounds[1, 1] - bounds[0, 1]
    dz = bounds[1, 2] - bounds[0, 2]
    ratio = dy / dx
    print(f"  Bounding Box         : X[{dx:.2f}] Y[{dy:.2f}] Z[{dz:.2f}]")
    print(f"  Height-to-Width Ratio: {ratio:.2f}:1 (Target: 1.6:1 to 1.8:1)")

    if not welded.is_watertight or welded.euler_number != 2:
        raise ValueError("Critical: Mesh failed watertight topological validation!")

    # 6. PROCEDURAL FUTURISTIC AMBER GLASS TEXTURE ATLAS GENERATION
    TEX_SIZE = 2048
    print(f"\nGenerating 360° Amber Glass Texture Atlas ({TEX_SIZE}x{TEX_SIZE})...")

    U_grid, V_grid = np.meshgrid(
        np.linspace(0.0, 1.0, TEX_SIZE, endpoint=False),
        np.linspace(0.0, 1.0, TEX_SIZE, endpoint=False)
    )

    theta = 2.0 * np.pi * U_grid
    sin_2t = np.sin(2.0 * theta)
    cos_t = np.cos(theta)

    # Volumetric fluid optical ribbons matching the 5-lobe sculptural fluting
    flow1 = 0.5 * (1.0 + np.sin(theta * 5.0 + 3.0 * V_grid + 0.3 * np.cos(theta * 2.0)))
    flow2 = 0.5 * (1.0 + np.cos(theta * 3.0 - 2.5 * V_grid + 0.4 * sin_2t))
    flow3 = 0.5 * (1.0 + np.sin(theta * 2.0 + 4.0 * V_grid**1.3))

    caustic_ribbon = (flow1 * 0.45 + flow2 * 0.35 + flow3 * 0.20)
    caustic_ribbon = gaussian_filter(caustic_ribbon, sigma=18.0)

    # Vertical depth gradient with soft luminous core
    v_norm = V_grid.copy()
    core_glow = np.exp(-((v_norm - 0.46) ** 2) / 0.09) * (0.85 + 0.15 * cos_t)

    # Rich, museum-quality amber glass color palette
    c_deep   = np.array([0.18, 0.05, 0.02])  # Deep shadow amber
    c_rust   = np.array([0.41, 0.11, 0.05])  # Terracotta rust
    c_copper = np.array([0.72, 0.30, 0.10])  # Polished copper-orange
    c_amber  = np.array([0.88, 0.47, 0.15])  # Molten amber warmth
    c_gold   = np.array([0.96, 0.67, 0.26])  # Golden core glow

    diffuse_rgb = np.zeros((TEX_SIZE, TEX_SIZE, 3), dtype=np.float32)

    for c_idx in range(3):
        lower = c_deep[c_idx] + (c_copper[c_idx] - c_deep[c_idx]) * np.clip(v_norm / 0.5, 0.0, 1.0)
        upper = c_copper[c_idx] + (c_amber[c_idx] - c_copper[c_idx]) * np.clip((v_norm - 0.5) / 0.5, 0.0, 1.0)
        base = np.where(v_norm < 0.5, lower, upper)
        
        layer = base + (c_amber[c_idx] - base) * caustic_ribbon * 0.38
        layer += (c_gold[c_idx] - layer) * core_glow * 0.35
        diffuse_rgb[:, :, c_idx] = np.clip(layer, 0.0, 1.0)

    diffuse_img_arr = (diffuse_rgb * 255.0).astype(np.uint8)
    diffuse_img = Image.fromarray(diffuse_img_arr)
    diffuse_path = 'public/models/idlex-crystal-diffuse.png'
    diffuse_img.save(diffuse_path, optimize=True)
    print(f"✓ Saved seamless amber glass diffuse map: {diffuse_path}")

    # 7. PROCEDURAL NORMAL MAP (Broad sculptural undulations, zero rock fractures)
    print("Generating smooth sculptural normal map...")
    d_v = np.gradient(caustic_ribbon, axis=0) * 1.2
    d_u = np.gradient(caustic_ribbon, axis=1) * 1.2

    nx = -d_u
    ny = -d_v
    nz = np.ones_like(nx) * 1.0
    norm_len = np.sqrt(nx**2 + ny**2 + nz**2)
    nx /= norm_len
    ny /= norm_len
    nz /= norm_len

    norm_r = ((nx * 0.5 + 0.5) * 255.0).astype(np.uint8)
    norm_g = ((ny * 0.5 + 0.5) * 255.0).astype(np.uint8)
    norm_b = ((nz * 0.5 + 0.5) * 255.0).astype(np.uint8)

    normal_rgb = np.stack([norm_r, norm_g, norm_b], axis=-1)
    normal_img = Image.fromarray(normal_rgb)
    normal_path = 'public/models/idlex-crystal-normal.png'
    normal_img.save(normal_path, optimize=True)
    print(f"✓ Saved smooth sculptural normal map   : {normal_path}")

    # 8. EXPORT SOLID WATERTIGHT STL
    stl_path = 'public/models/idlex-amber-crystal.stl'
    welded.export(stl_path)
    print(f"✓ Exported watertight STL               : {stl_path} ({os.path.getsize(stl_path)/1024:.1f} KB)")

    # 9. ASSEMBLE PBR GLB
    pbr_mat = PBRMaterial(
        name="IdleX_Futuristic_Amber_Glass_PBR",
        baseColorTexture=diffuse_img,
        normalTexture=normal_img,
        roughnessFactor=0.20,
        metallicFactor=0.02,
        doubleSided=True
    )

    visuals = TextureVisuals(uv=uvs, material=pbr_mat)
    glb_mesh = trimesh.Trimesh(
        vertices=verts,
        faces=faces,
        visual=visuals,
        process=False
    )
    glb_mesh.fix_normals()

    glb_bytes = glb_mesh.export(file_type="glb")
    
    with open('public/models/idlex-amber-crystal.glb', 'wb') as f:
        f.write(glb_bytes)
    with open('public/models/idlex-amber-crystal-repaired.glb', 'wb') as f:
        f.write(glb_bytes)
    print(f"✓ Exported production GLB               : public/models/idlex-amber-crystal.glb ({len(glb_bytes)/(1024*1024):.2f} MB)")

    print(f"\n=== Completed in {time.time()-t0:.2f}s ===")

if __name__ == '__main__':
    sculpt_futuristic_amber_artefact()
