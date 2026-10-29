import os
import sys
import time
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
import trimesh
from trimesh.visual.texture import TextureVisuals
from trimesh.visual.material import PBRMaterial

def create_petal_mesh(
    tier_name: str,
    index: int,
    total_in_tier: int,
    base_angle: float,
    y_range: tuple,
    r_curve: callable,
    width_max: float,
    cup_depth: float,
    twist_angle: float,
    thickness: float,
    outward_flare: float = 0.35,
    nu: int = 54,
    nv: int = 32
):
    """
    Parametric procedural solid 3D petal with smooth curvature, cupping,
    longitudinal spine rib, natural asymmetry, softly rounded arching apex,
    and realistic edge thickness.
    """
    u_vals = np.linspace(0.01, 1.0, nu)
    v_vals = np.linspace(-1.0, 1.0, nv)
    
    y_min, y_max = y_range
    h = y_max - y_min
    
    # Slight organic asymmetry per petal
    rng = np.random.RandomState(101 + hash(tier_name) % 1000 + index * 23)
    asym_twist = (rng.rand() - 0.5) * 0.08
    asym_flare = 1.0 + (rng.rand() - 0.5) * 0.12
    asym_width = 1.0 + (rng.rand() - 0.5) * 0.08

    inner_verts = np.zeros((nu, nv, 3), dtype=np.float32)
    outer_verts = np.zeros((nu, nv, 3), dtype=np.float32)
    inner_uvs = np.zeros((nu, nv, 2), dtype=np.float32)
    outer_uvs = np.zeros((nu, nv, 2), dtype=np.float32)

    for i, u in enumerate(u_vals):
        # Graceful curved arch at apex: top contour is softly curved, not a needle point
        # As u approaches 1, the width rounds off gracefully like a water lily or orchid petal
        if u < 0.70:
            w_u = width_max * np.sin(0.5 * np.pi * (u / 0.70) ** 0.85) * asym_width
        else:
            # Rounded parabolic crown
            t_crown = (u - 0.70) / 0.30
            w_u = width_max * np.sqrt(max(0.001, 1.0 - (t_crown ** 1.6))) * asym_width
        
        # S-curvature / outward blossoming flare
        r_mid = (r_curve(u) + outward_flare * (u ** 1.8) * asym_flare)
        
        # Helical sweep
        theta_u = base_angle + twist_angle * (u ** 1.25) + asym_twist * u
        
        spine_tangent = np.array([-np.sin(theta_u), 0.0, np.cos(theta_u)])
        spine_dir = np.array([np.cos(theta_u), 0.0, np.sin(theta_u)])
        
        # Gentle cupping concave toward the central core
        cup = cup_depth * (1.0 - (v_vals ** 2)) * np.sin(np.pi * u ** 0.85)
        
        # Feathered thickness
        th_u = thickness * (1.0 - 0.40 * u) * (1.0 - 0.50 * (v_vals ** 2))
        
        for j, v in enumerate(v_vals):
            # Rounded lateral contour: curve the petal top downwards away from center v=0
            apex_droop = (v ** 2) * 0.12 * (u ** 2.0)
            y = y_min + h * u - apex_droop
            
            lat_disp = v * w_u * 0.5
            r = r_mid - cup[j]
            
            x_mid = r * np.cos(theta_u) + lat_disp * spine_tangent[0]
            z_mid = r * np.sin(theta_u) + lat_disp * spine_tangent[1]
            
            # Subtle outward petal recurve at the rim
            if u > 0.82:
                recurve = (u - 0.82) / 0.18
                x_mid += spine_dir[0] * recurve * 0.14
                z_mid += spine_dir[2] * recurve * 0.14
                y -= recurve * 0.05
            
            norm_x = np.cos(theta_u)
            norm_z = np.sin(theta_u)
            half_t = max(0.008, th_u[j] * 0.5)
            
            inner_verts[i, j] = [x_mid - norm_x * half_t, y, z_mid - norm_z * half_t]
            outer_verts[i, j] = [x_mid + norm_x * half_t, y, z_mid + norm_z * half_t]
            
            u_coord = (base_angle / (2.0 * np.pi) + (v + 1.0) * 0.5 / total_in_tier) % 1.0
            v_coord = u
            inner_uvs[i, j] = [u_coord, v_coord]
            outer_uvs[i, j] = [u_coord, v_coord]

    # Stitch into solid manifold
    verts_list = []
    uvs_list = []
    faces_list = []

    inner_flat = inner_verts.reshape(-1, 3)
    outer_flat = outer_verts.reshape(-1, 3)
    inner_uv_flat = inner_uvs.reshape(-1, 2)
    outer_uv_flat = outer_uvs.reshape(-1, 2)

    offset_outer = nu * nv

    verts_list.extend(inner_flat)
    verts_list.extend(outer_flat)
    uvs_list.extend(inner_uv_flat)
    uvs_list.extend(outer_uv_flat)

    # Faces for outer surface
    for i in range(nu - 1):
        for j in range(nv - 1):
            p0 = offset_outer + i * nv + j
            p1 = offset_outer + i * nv + (j + 1)
            p2 = offset_outer + (i + 1) * nv + (j + 1)
            p3 = offset_outer + (i + 1) * nv + j
            faces_list.append([p0, p1, p2])
            faces_list.append([p0, p2, p3])

    # Faces for inner surface
    for i in range(nu - 1):
        for j in range(nv - 1):
            p0 = i * nv + j
            p1 = i * nv + (j + 1)
            p2 = (i + 1) * nv + (j + 1)
            p3 = (i + 1) * nv + j
            faces_list.append([p0, p2, p1])
            faces_list.append([p0, p3, p2])

    # Stitch left edge (j = 0)
    for i in range(nu - 1):
        in_0 = i * nv
        in_1 = (i + 1) * nv
        out_0 = offset_outer + i * nv
        out_1 = offset_outer + (i + 1) * nv
        faces_list.append([out_0, in_0, in_1])
        faces_list.append([out_0, in_1, out_1])

    # Stitch right edge (j = nv - 1)
    for i in range(nu - 1):
        in_0 = i * nv + (nv - 1)
        in_1 = (i + 1) * nv + (nv - 1)
        out_0 = offset_outer + i * nv + (nv - 1)
        out_1 = offset_outer + (i + 1) * nv + (nv - 1)
        faces_list.append([out_0, out_1, in_1])
        faces_list.append([out_0, in_1, in_0])

    # Stitch top crown rim (i = nu - 1)
    for j in range(nv - 1):
        in_0 = (nu - 1) * nv + j
        in_1 = (nu - 1) * nv + (j + 1)
        out_0 = offset_outer + (nu - 1) * nv + j
        out_1 = offset_outer + (nu - 1) * nv + (j + 1)
        faces_list.append([out_0, out_1, in_1])
        faces_list.append([out_0, in_1, in_0])

    # Stitch bottom base rim (i = 0)
    for j in range(nv - 1):
        in_0 = j
        in_1 = j + 1
        out_0 = offset_outer + j
        out_1 = offset_outer + (j + 1)
        faces_list.append([out_0, in_0, in_1])
        faces_list.append([out_0, in_1, out_1])

    return np.array(verts_list, dtype=np.float32), np.array(uvs_list, dtype=np.float32), np.array(faces_list, dtype=np.int32)

def create_central_luminous_stamen(radius_x=0.48, radius_y=0.88, radius_z=0.46, center_y=0.18, n_phi=40, n_theta=48):
    """
    Prominent glowing botanical core organ / stamen ovule.
    """
    phis = np.linspace(0.01, np.pi - 0.01, n_phi)
    thetas = np.linspace(-np.pi, np.pi, n_theta + 1)
    
    verts = []
    uvs = []
    
    for i, phi in enumerate(phis):
        cos_p = np.cos(phi)
        sin_p = np.sin(phi)
        
        y = center_y + radius_y * cos_p
        
        # Soft longitudinal flutes (delicate seed pod ridges)
        flute = 1.0 + 0.05 * np.cos(6.0 * thetas + 0.3 * cos_p) * (sin_p ** 1.4)
        
        rx = radius_x * sin_p * flute
        rz = radius_z * sin_p * flute
        
        for j in range(n_theta + 1):
            theta = thetas[j]
            x = rx[j] * np.sin(theta)
            z = rz[j] * np.cos(theta)
            
            u_coord = j / n_theta
            v_coord = (cos_p + 1.0) * 0.5
            verts.append([x, y, z])
            uvs.append([u_coord, v_coord])

    num_cols = n_theta + 1
    faces = []
    for i in range(n_phi - 1):
        for j in range(n_theta):
            p0 = i * num_cols + j
            p1 = i * num_cols + (j + 1)
            p2 = (i + 1) * num_cols + (j + 1)
            p3 = (i + 1) * num_cols + j
            faces.append([p0, p1, p2])
            faces.append([p0, p2, p3])

    # Top apex
    top_idx = len(verts)
    verts.append([0.0, center_y + radius_y, 0.0])
    uvs.append([0.5, 1.0])
    for j in range(n_theta):
        faces.append([j, top_idx, j + 1])

    # Bottom apex
    bot_idx = len(verts)
    verts.append([0.0, center_y - radius_y, 0.0])
    uvs.append([0.5, 0.0])
    bot_ring = (n_phi - 1) * num_cols
    for j in range(n_theta):
        faces.append([bot_ring + j, bot_ring + (j + 1), bot_idx])

    return np.array(verts, dtype=np.float32), np.array(uvs, dtype=np.float32), np.array(faces, dtype=np.int32)

def create_receptacle_calyx(y_top=-1.10, y_bot=-1.95, r_top=0.82, r_bot=0.38, n_rings=24, n_cols=48):
    """
    Sculpted receptacle calyx at the base grounding the petals.
    """
    ys = np.linspace(y_top, y_bot, n_rings)
    thetas = np.linspace(-np.pi, np.pi, n_cols + 1)
    
    verts = []
    uvs = []
    
    for i, y in enumerate(ys):
        t = (y - y_bot) / (y_top - y_bot)
        r_base = r_bot + (r_top - r_bot) * (t ** 1.35)
        
        flute = 1.0 + 0.06 * np.cos(5.0 * thetas) * (t ** 1.2)
        r = r_base * flute
        
        for j in range(n_cols + 1):
            th = thetas[j]
            x = r[j] * np.sin(th)
            z = r[j] * np.cos(th)
            verts.append([x, y, z])
            uvs.append([j / n_cols, 1.0 - t * 0.25])

    num_cols = n_cols + 1
    faces = []
    for i in range(n_rings - 1):
        for j in range(n_cols):
            p0 = i * num_cols + j
            p1 = i * num_cols + (j + 1)
            p2 = (i + 1) * num_cols + (j + 1)
            p3 = (i + 1) * num_cols + j
            faces.append([p0, p1, p2])
            faces.append([p0, p2, p3])

    # Bottom cap
    bot_idx = len(verts)
    verts.append([0.0, y_bot, 0.0])
    uvs.append([0.5, 0.0])
    bot_ring = (n_rings - 1) * num_cols
    for j in range(n_cols):
        faces.append([bot_ring + j, bot_ring + (j + 1), bot_idx])

    return np.array(verts, dtype=np.float32), np.array(uvs, dtype=np.float32), np.array(faces, dtype=np.int32)

def sculpt_bloom_sculpture():
    t0 = time.time()
    print("=============================================================")
    print("      IdleX Bloom: Living Botanical Sculpture Pipeline (v2)  ")
    print("=============================================================")

    all_verts = []
    all_uvs = []
    all_faces = []
    current_vertex_offset = 0

    def add_mesh_data(v, u, f):
        nonlocal current_vertex_offset
        all_verts.append(v)
        all_uvs.append(u)
        all_faces.append(f + current_vertex_offset)
        current_vertex_offset += len(v)

    # 1. CENTRAL LUMINOUS CORE
    print("Creating central luminous core organ...")
    sv, su, sf = create_central_luminous_stamen(
        radius_x=0.48, radius_y=0.88, radius_z=0.46, center_y=0.18
    )
    add_mesh_data(sv, su, sf)

    # 2. TIER 1: INNER PETALS (3 Cupped Spiraling Petals)
    # Tightly cupping the luminous core with natural helical curvature
    print("Sculpting Tier 1 (Inner Petals - 3 cupped spiraling petals)...")
    for k in range(3):
        angle = k * (2.0 * np.pi / 3.0) + 0.18
        pv, pu, pf = create_petal_mesh(
            tier_name="inner",
            index=k,
            total_in_tier=3,
            base_angle=angle,
            y_range=(-0.90, 1.40),
            r_curve=lambda u: 0.52 + 0.22 * np.sin(np.pi * u ** 0.85),
            width_max=0.92,
            cup_depth=0.25,
            twist_angle=0.40,
            thickness=0.048,
            outward_flare=0.18,
            nu=48,
            nv=26
        )
        add_mesh_data(pv, pu, pf)

    # 3. TIER 2: MID PETALS (4 Unfolding Petals with Graceful S-Curvature)
    print("Sculpting Tier 2 (Mid Petals - 4 unfolding petals with S-curvature)...")
    for k in range(4):
        angle = k * (2.0 * np.pi / 4.0) + (np.pi / 4.0) - 0.12
        pv, pu, pf = create_petal_mesh(
            tier_name="mid",
            index=k,
            total_in_tier=4,
            base_angle=angle,
            y_range=(-1.25, 1.70),
            r_curve=lambda u: 0.68 + 0.40 * (u ** 1.1) - 0.10 * (u ** 2.5),
            width_max=1.12,
            cup_depth=0.30,
            twist_angle=0.32,
            thickness=0.052,
            outward_flare=0.38,
            nu=52,
            nv=28
        )
        add_mesh_data(pv, pu, pf)

    # 4. TIER 3: OUTER PETALS (5 Sweeping Architectural Petals)
    # Blossoming outward, generous negative space to see through to the warm core
    print("Sculpting Tier 3 (Outer Petals - 5 sweeping architectural petals)...")
    for k in range(5):
        angle = k * (2.0 * np.pi / 5.0) + 0.28
        pv, pu, pf = create_petal_mesh(
            tier_name="outer",
            index=k,
            total_in_tier=5,
            base_angle=angle,
            y_range=(-1.60, 1.90),
            r_curve=lambda u: 0.84 + 0.50 * (u ** 1.0) - 0.15 * (u ** 2.2),
            width_max=1.35,
            cup_depth=0.35,
            twist_angle=0.26,
            thickness=0.056,
            outward_flare=0.55,
            nu=56,
            nv=30
        )
        add_mesh_data(pv, pu, pf)

    # 5. RECEPTACLE / CALYX BASE
    print("Sculpting botanical receptacle calyx base...")
    cv, cu, cf = create_receptacle_calyx(
        y_top=-1.10, y_bot=-1.95, r_top=0.84, r_bot=0.38
    )
    add_mesh_data(cv, cu, cf)

    verts_all = np.vstack(all_verts)
    uvs_all = np.vstack(all_uvs)
    faces_all = np.vstack(all_faces)

    print(f"✓ Bloom Sculpture Assembled: {len(verts_all)} vertices, {len(faces_all)} faces")

    bloom_mesh = trimesh.Trimesh(
        vertices=verts_all,
        faces=faces_all,
        process=True
    )
    bloom_mesh.fix_normals()

    bounds = bloom_mesh.bounds
    dx = bounds[1, 0] - bounds[0, 0]
    dy = bounds[1, 1] - bounds[0, 1]
    dz = bounds[1, 2] - bounds[0, 2]
    ratio = dy / max(dx, dz)
    print(f"  Bounding Box         : X[{dx:.2f}] Y[{dy:.2f}] Z[{dz:.2f}]")
    print(f"  Height-to-Width Ratio: {ratio:.2f}:1")

    # 6. PROCEDURAL TRANSLUCENT PORCELAIN-GLASS & BOTANICAL TEXTURE ATLAS
    TEX_SIZE = 2048
    print(f"\nGenerating 360° Translucent Botanical Texture Atlas ({TEX_SIZE}x{TEX_SIZE})...")

    U_grid, V_grid = np.meshgrid(
        np.linspace(0.0, 1.0, TEX_SIZE, endpoint=False),
        np.linspace(0.0, 1.0, TEX_SIZE, endpoint=False)
    )

    theta = 2.0 * np.pi * U_grid

    # Organic micro-veining network: fine longitudinal capillary channels
    vein_freq = 24.0
    longitudinal_veins = np.abs(np.sin(theta * vein_freq + 0.6 * np.sin(V_grid * 8.0))) ** 18.0
    fine_branching = np.abs(np.cos(theta * 48.0 - V_grid * 16.0)) ** 12.0 * np.sin(V_grid * np.pi)
    vein_network = gaussian_filter(longitudinal_veins * 0.7 + fine_branching * 0.3, sigma=1.5)

    # Volumetric caustics / light scattering ribbons
    ribbon1 = 0.5 * (1.0 + np.sin(theta * 5.0 + 3.0 * V_grid + 0.4 * np.cos(theta * 3.0)))
    ribbon2 = 0.5 * (1.0 + np.cos(theta * 4.0 - 2.5 * V_grid + 0.3 * np.sin(theta * 2.0)))
    caustic_flow = gaussian_filter(ribbon1 * 0.55 + ribbon2 * 0.45, sigma=14.0)

    # Core luminous warm ivory-gold halo
    core_glow = np.exp(-((V_grid - 0.48) ** 2) / 0.08) * (0.85 + 0.15 * np.cos(theta))

    # Sophisticated Botanical Futurism Palette:
    c_forest = np.array([0.06, 0.12, 0.08])
    c_jade   = np.array([0.14, 0.26, 0.18])
    c_celadon= np.array([0.38, 0.52, 0.40])
    c_leaf   = np.array([0.60, 0.74, 0.54])
    c_gold   = np.array([0.96, 0.92, 0.78])

    diffuse_rgb = np.zeros((TEX_SIZE, TEX_SIZE, 3), dtype=np.float32)

    for c_idx in range(3):
        lower = c_forest[c_idx] + (c_jade[c_idx] - c_forest[c_idx]) * np.clip(V_grid / 0.4, 0.0, 1.0)
        mid = c_jade[c_idx] + (c_celadon[c_idx] - c_jade[c_idx]) * np.clip((V_grid - 0.35) / 0.35, 0.0, 1.0)
        upper = c_celadon[c_idx] + (c_leaf[c_idx] - c_celadon[c_idx]) * np.clip((V_grid - 0.7) / 0.3, 0.0, 1.0)
        
        base = np.where(V_grid < 0.35, lower, np.where(V_grid < 0.7, mid, upper))
        
        layer = base + (c_leaf[c_idx] - base) * caustic_flow * 0.30
        layer += (c_gold[c_idx] - layer) * core_glow * 0.42
        layer += (c_leaf[c_idx] * 0.30) * vein_network
        
        diffuse_rgb[:, :, c_idx] = np.clip(layer, 0.0, 1.0)

    diffuse_img_arr = (diffuse_rgb * 255.0).astype(np.uint8)
    diffuse_img = Image.fromarray(diffuse_img_arr)
    diffuse_path = 'public/models/idlex-crystal-diffuse.png'
    diffuse_img.save(diffuse_path, optimize=True)
    print(f"✓ Saved botanical diffuse map          : {diffuse_path}")

    # 7. PROCEDURAL SMOOTH BOTANICAL NORMAL MAP
    print("Generating smooth sculptural botanical normal map...")
    d_v = np.gradient(caustic_flow * 0.8 + vein_network * 0.25, axis=0) * 1.2
    d_u = np.gradient(caustic_flow * 0.8 + vein_network * 0.25, axis=1) * 1.2

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
    print(f"✓ Saved botanical normal map           : {normal_path}")

    # 8. EXPORT SOLID WATERTIGHT STL
    stl_path = 'public/models/idlex-amber-crystal.stl'
    bloom_mesh.export(stl_path)
    print(f"✓ Exported watertight STL              : {stl_path} ({os.path.getsize(stl_path)/1024:.1f} KB)")

    # 9. ASSEMBLE PBR GLB
    pbr_mat = PBRMaterial(
        name="IdleX_Bloom_Botanical_Glass_PBR",
        baseColorTexture=diffuse_img,
        normalTexture=normal_img,
        roughnessFactor=0.18,
        metallicFactor=0.03,
        doubleSided=True
    )

    visuals = TextureVisuals(uv=uvs_all, material=pbr_mat)
    glb_mesh = trimesh.Trimesh(
        vertices=verts_all,
        faces=faces_all,
        visual=visuals,
        process=False
    )
    glb_mesh.fix_normals()

    glb_bytes = glb_mesh.export(file_type="glb")
    
    with open('public/models/idlex-amber-crystal.glb', 'wb') as f:
        f.write(glb_bytes)
    with open('public/models/idlex-amber-crystal-repaired.glb', 'wb') as f:
        f.write(glb_bytes)
    print(f"✓ Exported production GLB              : public/models/idlex-amber-crystal.glb ({len(glb_bytes)/(1024*1024):.2f} MB)")

    print(f"\n=== Completed in {time.time()-t0:.2f}s ===")

if __name__ == '__main__':
    sculpt_bloom_sculpture()
