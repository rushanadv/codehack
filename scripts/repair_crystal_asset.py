import os
import sys
import time
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
import trimesh
from trimesh.visual.texture import TextureVisuals
from trimesh.visual.material import PBRMaterial

def repair_and_export_crystal():
    t0 = time.time()
    print("=============================================================")
    print("  IdleX 3D Amber Crystal Mesh Repair & Reconstruction Pipeline")
    print("=============================================================")

    # 1. Load Authentic Silhouette from Reference Photo
    ref_path = '/Users/rushanadvani/.gemini/antigravity/brain/56535441-0610-4c01-b1b7-3cc3a931ea9f/scratch/embedded_texture.png'
    if os.path.exists(ref_path):
        ref_img = Image.open(ref_path).convert('RGBA')
        ref_arr = np.array(ref_img, dtype=np.float32)
        H_ref, W_ref = ref_arr.shape[:2]
        alpha = ref_arr[:, :, 3]

        mask_crystal = (alpha > 40)
        for y in range(640, H_ref):
            for x in range(0, 140):
                if mask_crystal[y, x]:
                    r, g, b = ref_arr[y, x, :3]
                    if r > 110 and g > 65 and b > 35 and (r - b) < 95:
                        mask_crystal[y, x] = False

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
        print(f"✓ Extracted authentic silhouette profile ({H_ref}x{W_ref})")
    else:
        print("⚠ Reference image not found, using calibrated geometric profile")
        H_ref = 800
        W_ref = 500
        lefts = np.full(H_ref, 75.0)
        rights = np.full(H_ref, 425.0)

    # 2. Load Existing High-Resolution 360° Textures
    diffuse_path = 'public/models/idlex-crystal-diffuse.png'
    normal_path = 'public/models/idlex-crystal-normal.png'

    if not os.path.exists(diffuse_path) or not os.path.exists(normal_path):
        raise FileNotFoundError(f"Missing texture atlas: {diffuse_path} or {normal_path}")

    diffuse_img = Image.open(diffuse_path).convert('RGB')
    normal_img = Image.open(normal_path).convert('RGB')
    print(f"✓ Loaded 360° Diffuse Atlas ({diffuse_img.size[0]}x{diffuse_img.size[1]})")
    print(f"✓ Loaded 360° Normal Map    ({normal_img.size[0]}x{normal_img.size[1]})")

    # 3. Construct 3D Faceted Crystal Geometry
    num_slices = 128
    num_circumference = 72
    num_cols = num_circumference + 1  # extra col for u=1.0 seamless UV unwrap

    scale_y = 4.85
    max_hw_px = np.max((rights - lefts) * 0.5)
    scale_x = 2.58 / (2.0 * max_hw_px)
    scale_z = scale_x * 0.74

    thetas_geo = np.linspace(-np.pi, np.pi, num_cols)

    # Sharp 6-fold hexagonal quartz prism facets with rear crystal face relief
    prism_6 = 0.065 * np.cos(6.0 * thetas_geo)
    harm_12 = -0.015 * np.cos(12.0 * thetas_geo)
    asym = 0.032 * np.cos(3.0 * thetas_geo + 0.25) - 0.018 * np.sin(2.0 * thetas_geo)
    rear_weight = np.clip(-np.cos(thetas_geo), 0.0, 1.0) ** 1.5
    rear_facet = 0.045 * np.cos(6.0 * (thetas_geo - np.pi)) * rear_weight

    facet_modulation = 1.0 + prism_6 + harm_12 + asym + rear_facet

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
        hd = hw * 0.74
        cx = (c_px - W_ref * 0.5) * scale_x * 0.38
        cz = 0.0

        # Pyramidal Crown Termination (top 15% converges to sharp apex)
        if v_coord > 0.85:
            crown_t = (v_coord - 0.85) / 0.15
            hw *= (1.0 - crown_t * 0.85)
            hd *= (1.0 - crown_t * 0.88)
            cx -= crown_t * 0.08
            cz += crown_t * 0.02

        # Ground footing taper (bottom 5%)
        if v_coord < 0.05:
            base_t = (0.05 - v_coord) / 0.05
            hw *= (1.0 - base_t * 0.14)
            hd *= (1.0 - base_t * 0.16)

        for j in range(num_cols):
            theta = thetas_geo[j]
            u_coord = j / (num_cols - 1)

            mod = facet_modulation[j]
            x_pos = cx + np.sin(theta) * hw * mod
            z_pos = cz + np.cos(theta) * hd * mod

            verts.append([x_pos, y_world, z_pos])
            uvs.append([u_coord, v_coord])

    verts = np.array(verts, dtype=np.float32)
    uvs = np.array(uvs, dtype=np.float32)

    # 4. Generate Body Quad Strip Faces with Correct OUTWARD Winding Order
    # Slice i=0 is y=scale_y (top), slice i=num_slices-1 is y=0.0 (bottom).
    # Triangle winding [p0, p2, p1] and [p0, p3, p2] guarantees outward-pointing normals.
    faces = []
    for i in range(num_slices - 1):
        for j in range(num_circumference):
            p0 = i * num_cols + j
            p1 = i * num_cols + (j + 1)
            p2 = (i + 1) * num_cols + (j + 1)
            p3 = (i + 1) * num_cols + j
            faces.append([p0, p2, p1])
            faces.append([p0, p3, p2])

    # 5. Correctly Capped Top Crown Termination
    # Ring 0 is the top ring (i=0, y=scale_y).
    top_apex_idx = len(verts)
    top_y = scale_y + 0.05
    verts = np.vstack([verts, [[-0.08, top_y, 0.02]]])
    uvs = np.vstack([uvs, [[0.5, 1.0]]])
    for j in range(num_circumference):
        # Normal points upward (+Y) and outward
        faces.append([j, j + 1, top_apex_idx])

    # 6. Correctly Capped Ground Footing Base
    # Ring (num_slices - 1) is the bottom ring (i=num_slices-1, y=0.0).
    bot_center_idx = len(verts)
    verts = np.vstack([verts, [[0.0, -0.04, 0.0]]])
    uvs = np.vstack([uvs, [[0.5, 0.0]]])
    bot_ring = (num_slices - 1) * num_cols
    for j in range(num_circumference):
        # Normal points downward (-Y) and outward
        faces.append([bot_ring + j, bot_center_idx, bot_ring + j + 1])

    faces = np.array(faces, dtype=np.int32)
    print(f"✓ Built clean manifold geometry: {len(verts)} vertices, {len(faces)} faces")

    # 7. Rigorous Topological & Manifold Validation
    # Build welded mesh to verify solid watertight topology
    welded_mesh = trimesh.Trimesh(vertices=verts.copy(), faces=faces.copy(), process=True)

    print("\n--- Topological Validation Report ---")
    print(f"  Is Watertight?         : {welded_mesh.is_watertight}")
    print(f"  Euler Characteristic   : {welded_mesh.euler_number} (must be 2 for closed 2-manifold)")
    print(f"  Is Winding Consistent? : {welded_mesh.is_winding_consistent}")
    print(f"  Bounding Box           : X[{welded_mesh.bounds[0,0]:.2f}, {welded_mesh.bounds[1,0]:.2f}] "
          f"Y[{welded_mesh.bounds[0,1]:.2f}, {welded_mesh.bounds[1,1]:.2f}] "
          f"Z[{welded_mesh.bounds[0,2]:.2f}, {welded_mesh.bounds[1,2]:.2f}]")

    # Verify normals point outwards
    centers = welded_mesh.triangles_center
    rad_vec = centers - np.mean(welded_mesh.vertices, axis=0)
    rad_vec[:, 1] = 0
    dots = np.sum(welded_mesh.face_normals * rad_vec, axis=1)
    outward_pct = (dots > 0).mean() * 100
    print(f"  Outward Side Normals   : {outward_pct:.1f}%")

    if not welded_mesh.is_watertight:
        raise ValueError("CRITICAL ERROR: Mesh failed watertightness test!")
    if welded_mesh.euler_number != 2:
        raise ValueError(f"CRITICAL ERROR: Invalid Euler number: {welded_mesh.euler_number} (expected 2)")

    # 8. Export Solid Watertight STL (For 3D Interchange / Print Inspection)
    stl_output_path = 'public/models/idlex-amber-crystal.stl'
    welded_mesh.export(stl_output_path)
    stl_size_kb = os.path.getsize(stl_output_path) / 1024.0
    print(f"\n✓ Exported watertight STL : {stl_output_path} ({stl_size_kb:.1f} KB)")

    # 9. Assemble PBR Textured GLB Asset (Preserving UV Mapping for Web Rendering)
    pbr_mat = PBRMaterial(
        name="IdleX_Repaired_360_Amber_Crystal_PBR",
        baseColorTexture=diffuse_img,
        normalTexture=normal_img,
        roughnessFactor=0.28,
        metallicFactor=0.02,
        doubleSided=True
    )

    visuals = TextureVisuals(
        uv=uvs,
        material=pbr_mat
    )

    # Use original verts/faces with UVs for GLB export
    crystal_glb_mesh = trimesh.Trimesh(
        vertices=verts,
        faces=faces,
        visual=visuals,
        process=False  # Preserve UV seam vertex indexing
    )

    # Ensure normals are clean
    crystal_glb_mesh.fix_normals()

    repaired_glb_path = 'public/models/idlex-amber-crystal-repaired.glb'
    glb_bytes = crystal_glb_mesh.export(file_type="glb")
    with open(repaired_glb_path, "wb") as f:
        f.write(glb_bytes)
    glb_size_mb = len(glb_bytes) / (1024.0 * 1024.0)
    print(f"✓ Exported repaired GLB   : {repaired_glb_path} ({glb_size_mb:.2f} MB)")

    # Also update the original asset so both references work seamlessly
    with open('public/models/idlex-amber-crystal.glb', "wb") as f:
        f.write(glb_bytes)
    print(f"✓ Synced production GLB   : public/models/idlex-amber-crystal.glb")

    # 10. Generate Multi-Angle Diagnostic Inspection Renderings (360° Inspection)
    angles = [0, 45, 90, 135, 180, 225, 270, 315]
    angle_labels = ["Front (0°)", "Front-Right (45°)", "Right Profile (90°)",
                    "Rear-Right (135°)", "Direct Rear (180°)", "Rear-Left (225°)",
                    "Left Profile (270°)", "Front-Left (315°)"]

    print("\n--- Generating 8-Angle 360° Diagnostic Inspection Strip ---")
    img_w, img_h = 240, 420
    strip = np.zeros((img_h, img_w * len(angles), 3), dtype=np.uint8)

    center = np.mean(verts, axis=0)
    centered_v = verts - center

    for a_idx, deg in enumerate(angles):
        rad = np.radians(deg)
        cos_a = np.cos(rad)
        sin_a = np.sin(rad)

        rot_v = centered_v.copy()
        rx = cos_a * rot_v[:, 0] - sin_a * rot_v[:, 2]
        rz = sin_a * rot_v[:, 0] + cos_a * rot_v[:, 2]
        rot_v[:, 0] = rx
        rot_v[:, 2] = rz

        # Projection
        sub_img = np.zeros((img_h, img_w, 3), dtype=np.uint8)
        scale = 72.0
        px = (rot_v[:, 0] * scale + img_w / 2).astype(np.int32)
        py = (-rot_v[:, 1] * scale + img_h / 2).astype(np.int32)

        # Draw wireframe / rasterize facets
        for f in faces[::2]:  # sample faces for preview
            p0x, p0y = px[f[0]], py[f[0]]
            p1x, p1y = px[f[1]], py[f[1]]
            p2x, p2y = px[f[2]], py[f[2]]

            # 2D cross product for front-facing in current rotation
            cross2d = (p1x - p0x) * (p2y - p0y) - (p1y - p0y) * (p2x - p0x)
            if cross2d > 0:  # visible front-facing facet
                min_x = max(0, min(p0x, p1x, p2x))
                max_x = min(img_w - 1, max(p0x, p1x, p2x))
                min_y = max(0, min(p0y, p1y, p2y))
                max_y = min(img_h - 1, max(p0y, p1y, p2y))

                # Color based on depth and angle
                z_mid = (rot_v[f, 2]).mean()
                intensity = int(np.clip(160 + z_mid * 50, 40, 240))
                sub_img[min_y:max_y+1, min_x:max_x+1] = [intensity, int(intensity*0.55), int(intensity*0.25)]

        strip[:, a_idx*img_w:(a_idx+1)*img_w] = sub_img

    inspect_img = Image.fromarray(strip)
    inspect_path = 'public/models/crystal_360_inspection.png'
    inspect_img.save(inspect_path)
    print(f"✓ Saved 360° inspection image: {inspect_path}")

    print(f"\n=== Completed in {time.time()-t0:.2f}s ===")

if __name__ == '__main__':
    repair_and_export_crystal()
