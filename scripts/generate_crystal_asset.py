import numpy as np
from PIL import Image
from scipy.spatial import cKDTree
from scipy.ndimage import distance_transform_edt, gaussian_filter
import trimesh
from trimesh.visual.texture import TextureVisuals
from trimesh.visual.material import PBRMaterial
import os
import time

def generate_production_crystal():
    t0 = time.time()
    print("=== Generating Production 360° Amber Crystal GLB Asset ===")

    # 1. Load authentic crystal reference
    ref_path = '/Users/rushanadvani/.gemini/antigravity/brain/56535441-0610-4c01-b1b7-3cc3a931ea9f/scratch/embedded_texture.png'
    ref_img = Image.open(ref_path).convert('RGBA')
    ref_arr = np.array(ref_img, dtype=np.float32)
    H_ref, W_ref = ref_arr.shape[:2]
    alpha = ref_arr[:, :, 3]

    # Clean bottom-left sand
    mask_crystal = (alpha > 40)
    for y in range(640, H_ref):
        for x in range(0, 140):
            if mask_crystal[y, x]:
                r, g, b = ref_arr[y, x, :3]
                if r > 110 and g > 65 and b > 35 and (r - b) < 95:
                    mask_crystal[y, x] = False

    # Extract silhouette bounds per row for 3D geometry
    lefts = np.zeros(H_ref, dtype=np.float32)
    rights = np.zeros(H_ref, dtype=np.float32)
    for y in range(H_ref):
        row = np.where(mask_crystal[y])[0]
        if len(row) > 8:
            lefts[y] = row[0]
            rights[y] = row[-1]
        else:
            lefts[y] = W_ref * 0.45
            rights[y] = W_ref * 0.55
            
    lefts = gaussian_filter(lefts, sigma=3.0)
    rights = gaussian_filter(rights, sigma=3.0)

    # 2. Extract Authentic Internal Texture Regions from Reference Photo
    # Glowing translucent amber core (Y: 250 to 650, X: 150 to 350)
    core_crop = ref_arr[220:650, 140:350, :3].copy()
    core_h, core_w = core_crop.shape[:2]
    
    # Basaltic matrix crust (left flank)
    crust_crop = ref_arr[200:600, 30:110, :3].copy()
    crust_h, crust_w = crust_crop.shape[:2]

    # 3. Synthesize High-Resolution 2048x2048 360° Texture Atlas
    tex_w = 2048
    tex_h = 2048

    u_coords = np.linspace(0.0, 1.0, tex_w)
    v_coords = np.linspace(1.0, 0.0, tex_h)
    grid_u, grid_v = np.meshgrid(u_coords, v_coords)

    # In 3D space: u=0.5 -> theta=0 (Front), u=0/1 -> theta=+/-pi (Rear)
    thetas = (grid_u - 0.5) * 2.0 * np.pi
    ys = grid_v * 4.85

    # 3D cylindrical surface for seamless periodic noise
    scale_cyl_x = 1.4
    scale_cyl_z = 1.0
    cyl_x = (np.sin(thetas) * scale_cyl_x).astype(np.float32)
    cyl_z = (np.cos(thetas) * scale_cyl_z).astype(np.float32)
    cyl_y = (ys * 0.18).astype(np.float32)

    pts = np.stack([cyl_x.ravel(), cyl_y.ravel(), cyl_z.ravel()], axis=-1)

    # Seed positions for 6-fold quartz prism facets + natural cleavage fractures
    np.random.seed(101)
    seed_angles = np.array([
        0.0, 0.35, -0.35,
        np.pi/3, np.pi/3 + 0.3,
        2*np.pi/3, 2*np.pi/3 - 0.25,
        np.pi, np.pi - 0.35, -np.pi + 0.35,
        -2*np.pi/3, -2*np.pi/3 + 0.25,
        -np.pi/3, -np.pi/3 - 0.3
    ])
    
    seeds = []
    seed_shifts = []

    for st in seed_angles:
        for sy in np.linspace(0.2, 4.65, 8):
            jitter_th = st + np.random.uniform(-0.15, 0.15)
            jitter_y = sy + np.random.uniform(-0.18, 0.18)
            sx = np.sin(jitter_th) * scale_cyl_x * np.random.uniform(0.9, 1.1)
            sz = np.cos(jitter_th) * scale_cyl_z * np.random.uniform(0.9, 1.1)
            seeds.append([sx, jitter_y * 0.18, sz])

            # Random texture UV shift per facet to sample different amber cleavage planes
            shift_u = np.random.uniform(0.0, 1.0)
            shift_v = np.random.uniform(0.0, 1.0)
            shear = np.random.uniform(-0.35, 0.35)
            brightness = np.random.uniform(0.92, 1.25) # Varied facet reflection brightness
            seeds_rind = (jitter_y > 4.1) or (jitter_y < 0.3) or (abs(np.sin(jitter_th)) > 0.8 and np.random.rand() < 0.45)
            seed_shifts.append((shift_u, shift_v, shear, brightness, seeds_rind))

    seeds = np.array(seeds, dtype=np.float32)

    tree = cKDTree(seeds)
    dists, indices = tree.query(pts, k=2)

    d1 = dists[:, 0].reshape(tex_h, tex_w)
    d2 = dists[:, 1].reshape(tex_h, tex_w)
    c_idx = indices[:, 0].reshape(tex_h, tex_w)

    # Synthesize rich mineral texture inside each facet using authentic crystal core
    procedural_rgb = np.zeros((tex_h, tex_w, 3), dtype=np.float32)

    for k, (su, sv, shear, b_mult, is_rind) in enumerate(seed_shifts):
        mask_k = (c_idx == k)
        if not np.any(mask_k):
            continue

        # Coordinate within this facet
        u_k = (thetas[mask_k] / (2.0 * np.pi) + su + grid_v[mask_k] * shear) % 1.0
        v_k = (grid_v[mask_k] * 1.5 + sv) % 1.0

        samp_x = np.clip((u_k * (core_w - 1)).astype(int), 0, core_w - 1)
        samp_y = np.clip((v_k * (core_h - 1)).astype(int), 0, core_h - 1)

        amber_samp = core_crop[samp_y, samp_x].copy()

        if is_rind:
            cx_k = np.clip((u_k * (crust_w - 1)).astype(int), 0, crust_w - 1)
            cy_k = np.clip((v_k * (crust_h - 1)).astype(int), 0, crust_h - 1)
            crust_samp = crust_crop[cy_k, cx_k]
            procedural_rgb[mask_k] = 0.65 * crust_samp + 0.35 * amber_samp
        else:
            procedural_rgb[mask_k] = amber_samp * b_mult

    # Planar facet shading
    facet_light = np.array([0.45, 0.65, 0.60], dtype=np.float32)
    facet_light /= np.linalg.norm(facet_light)
    seed_norm = seeds[c_idx]
    seed_norm[:, :, 1] *= 0.5
    norm_len = np.linalg.norm(seed_norm, axis=-1, keepdims=True) + 1e-5
    seed_norm /= norm_len
    facet_shading = np.sum(seed_norm * facet_light, axis=-1, keepdims=True)
    facet_shading = 0.88 + 0.28 * np.clip(facet_shading, -0.6, 0.8)
    procedural_rgb *= facet_shading

    # Razor cleavage veins (bright internal quartz reflection lines)
    cleavage = np.clip(1.0 - (d2 - d1) * 9.0, 0.0, 1.0) ** 2.0
    gold_highlight = np.array([255.0, 215.0, 135.0], dtype=np.float32)[None, None, :]
    procedural_rgb += cleavage[:, :, None] * 55.0 * (gold_highlight / 255.0)

    # Quartz growth striations
    striations = 1.0 + 0.045 * np.sin(ys * 80.0) * np.cos(thetas * 3.0)
    procedural_rgb *= striations[:, :, None]

    # Composite Authentic Crystal on front [512:1536] with smooth feathering
    photo_half = np.array(Image.fromarray(ref_arr[:,:,:3].astype(np.uint8)).resize((tex_w // 2, tex_h), Image.Resampling.LANCZOS), dtype=np.float32)
    mask_half = np.array(Image.fromarray((mask_crystal.astype(np.float32) * 255).astype(np.uint8)).resize((tex_w // 2, tex_h), Image.Resampling.BILINEAR), dtype=np.float32) / 255.0

    mask_feathered = gaussian_filter(mask_half, sigma=14.0)
    mask_feathered = np.clip(mask_feathered * 1.35 - 0.15, 0.0, 1.0)
    mask_feathered = mask_feathered[:, :, None]

    front_region = procedural_rgb[:, 512:1536]
    blended_front = mask_feathered * photo_half + (1.0 - mask_feathered) * front_region

    atlas_rgb = procedural_rgb.copy()
    atlas_rgb[:, 512:1536] = blended_front
    atlas_rgb = np.clip(atlas_rgb, 0.0, 255.0)

    # Exact periodic seam closure at u=0 and u=1
    seam_margin = 16
    for s_i in range(seam_margin):
        w = s_i / seam_margin
        avg = 0.5 * (atlas_rgb[:, s_i] + atlas_rgb[:, -1 - s_i])
        atlas_rgb[:, s_i] = (1.0 - w) * avg + w * atlas_rgb[:, s_i]
        atlas_rgb[:, -1 - s_i] = (1.0 - w) * avg + w * atlas_rgb[:, -1 - s_i]

    diffuse_img = Image.fromarray(atlas_rgb.astype(np.uint8))
    diffuse_img.save('/Users/rushanadvani/Desktop/codehack/public/models/idlex-crystal-diffuse.png')
    print("✓ Enriched diffuse atlas saved: public/models/idlex-crystal-diffuse.png")

    # 4. Generate Matching Normal Map
    gray = np.dot(atlas_rgb, [0.299, 0.587, 0.114])
    dx = np.zeros_like(gray)
    dy = np.zeros_like(gray)
    dx[:, 1:-1] = (gray[:, 2:] - gray[:, :-2]) * 0.5
    dx[:, 0] = (gray[:, 1] - gray[:, -1]) * 0.5
    dx[:, -1] = (gray[:, 0] - gray[:, -2]) * 0.5
    dy[1:-1, :] = (gray[2:, :] - gray[:-2, :]) * 0.5
    dy[0, :] = dy[1, :]
    dy[-1, :] = dy[-2, :]

    normal_strength = 2.6
    nx = -dx * normal_strength / 255.0
    ny = -dy * normal_strength / 255.0
    nz = np.ones_like(gray)
    nlen = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-5
    nx /= nlen
    ny /= nlen
    nz /= nlen

    norm_rgb = np.zeros((tex_h, tex_w, 3), dtype=np.uint8)
    norm_rgb[:, :, 0] = np.clip((nx * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
    norm_rgb[:, :, 1] = np.clip((ny * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
    norm_rgb[:, :, 2] = np.clip((nz * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
    normal_img = Image.fromarray(norm_rgb)
    normal_img.save('/Users/rushanadvani/Desktop/codehack/public/models/idlex-crystal-normal.png')
    print("✓ Normal map saved: public/models/idlex-crystal-normal.png")

    # 5. Build 3D Faceted Crystal Geometry
    num_slices = 128
    num_circumference = 72
    num_cols = num_circumference + 1

    scale_y = 4.85
    max_hw_px = np.max((rights - lefts) * 0.5)
    scale_x = 2.58 / (2.0 * max_hw_px)
    scale_z = scale_x * 0.72

    thetas_geo = np.linspace(-np.pi, np.pi, num_cols)

    facet_modulation = (
        1.0
        + 0.052 * np.cos(6.0 * thetas_geo)
        + 0.028 * np.cos(3.0 * thetas_geo + 0.3)
        - 0.016 * np.sin(2.0 * thetas_geo)
    )

    verts = []
    uvs = []
    y_indices_geo = np.linspace(0, H_ref - 1, num_slices).astype(int)

    for i in range(num_slices):
        v_coord = 1.0 - (i / (num_slices - 1))
        y_world = v_coord * scale_y
        y_ref = y_indices_geo[i]

        hw_px = (rights[y_ref] - lefts[y_ref]) * 0.5
        c_px = (lefts[y_ref] + rights[y_ref]) * 0.5

        hw = hw_px * scale_x
        hd = hw * 0.72
        cx = (c_px - W_ref * 0.5) * scale_x * 0.38

        # Pyramidal Crown Termination (top 15%)
        if v_coord > 0.85:
            crown_t = (v_coord - 0.85) / 0.15
            hw *= (1.0 - crown_t * 0.84)
            hd *= (1.0 - crown_t * 0.88)
            cx -= crown_t * 0.12
            
        # Ground footing taper (bottom 5%)
        if v_coord < 0.05:
            base_t = (0.05 - v_coord) / 0.05
            hw *= (1.0 - base_t * 0.12)
            hd *= (1.0 - base_t * 0.15)

        for j in range(num_cols):
            theta = thetas_geo[j]
            u_coord = j / (num_cols - 1)
            
            mod = facet_modulation[j]
            x_pos = cx + np.sin(theta) * hw * mod
            z_pos = np.cos(theta) * hd * mod
            
            verts.append([x_pos, y_world, z_pos])
            uvs.append([u_coord, v_coord])

    verts = np.array(verts, dtype=np.float32)
    uvs = np.array(uvs, dtype=np.float32)

    faces = []
    for i in range(num_slices - 1):
        for j in range(num_circumference):
            p0 = i * num_cols + j
            p1 = i * num_cols + (j + 1)
            p2 = (i + 1) * num_cols + (j + 1)
            p3 = (i + 1) * num_cols + j
            faces.append([p0, p1, p2])
            faces.append([p0, p2, p3])

    top_apex_idx = len(verts)
    top_y = scale_y + 0.04
    verts = np.vstack([verts, [[-0.08, top_y, 0.02]]])
    uvs = np.vstack([uvs, [[0.5, 1.0]]])
    last_ring = (num_slices - 1) * num_cols
    for j in range(num_circumference):
        faces.append([last_ring + j, last_ring + j + 1, top_apex_idx])

    bot_center_idx = len(verts)
    verts = np.vstack([verts, [[0.0, -0.02, 0.0]]])
    uvs = np.vstack([uvs, [[0.5, 0.0]]])
    for j in range(num_circumference):
        faces.append([bot_center_idx, j + 1, j])

    faces = np.array(faces, dtype=np.int32)

    # 6. Assemble Trimesh with PBR Material
    pbr_mat = PBRMaterial(
        name="IdleX_Production_360_Amber_Crystal_PBR",
        baseColorTexture=diffuse_img,
        normalTexture=normal_img,
        roughnessFactor=0.28,
        metallicFactor=0.02,
        doubleSided=False
    )

    visuals = TextureVisuals(
        uv=uvs,
        material=pbr_mat
    )

    crystal_mesh = trimesh.Trimesh(
        vertices=verts,
        faces=faces,
        visual=visuals,
        process=True
    )

    output_glb = "public/models/idlex-amber-crystal.glb"
    glb_bytes = crystal_mesh.export(file_type="glb")
    with open(output_glb, "wb") as f:
        f.write(glb_bytes)

    print(f"✓ Successfully generated & exported {output_glb} ({len(glb_bytes)/1024/1024:.2f} MB)")
    print(f"  Geometry: {len(verts)} vertices, {len(faces)} faces")
    print(f"  Elapsed: {time.time()-t0:.2f}s")

if __name__ == '__main__':
    generate_production_crystal()
