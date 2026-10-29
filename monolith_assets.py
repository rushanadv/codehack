"""
IdleX Procedural 3D Asset Pipeline
==================================
Procedural generation and offline export of:
  - public/models/idlex-monolith.glb : Elegant organic sculptural monolith with
                                       rich terracotta/burnt-orange/rust-red strata.
  - public/models/idlex-terrain.glb  : Vast dark geological landscape with rolling ridges
                                       and atmospheric dusk horizon.

Uses pure NumPy, SciPy, scikit-image, and Trimesh. No Blender required.
Coordinate system: Three.js standard (+Y up, +Z toward camera, +X right).
"""

import os
import sys
import time
import numpy as np
from scipy.ndimage import gaussian_filter, map_coordinates
from skimage.measure import marching_cubes
import trimesh


def multi_octave_2d_noise(shape, scales, weights, seed=101):
    rng = np.random.default_rng(seed)
    field = np.zeros(shape, dtype=np.float32)
    for sigma, weight in zip(scales, weights):
        raw = rng.standard_normal(shape, dtype=np.float32)
        smoothed = gaussian_filter(raw, sigma=sigma, mode="reflect")
        std = float(np.std(smoothed)) + 1e-8
        field += (weight / std) * smoothed
    return field


def build_monolith_mesh(nx=140, ny=244, nz=140):
    """
    Constructs an elegant, elongated, organic sculptural monolith.
    - Continuous single-volume form with broad, flowing contours (NO fused spheres, melted candle,
      or humanoid waist/neck pinch!).
    - Subtle monumental S-curved spine gesture.
    - Asymmetrical, softly sloping crown.
    - Elongated non-circular cross-section: broad from front/rear, slender and elegant from side.
    - Smooth, low-frequency geological stone weathering.
    """
    t0 = time.time()
    xs = np.linspace(-1.45, 1.45, nx, dtype=np.float32)
    ys = np.linspace(-0.65, 5.15, ny, dtype=np.float32)
    zs = np.linspace(-1.45, 1.45, nz, dtype=np.float32)

    X = xs[:, None, None]
    Y = ys[None, :, None]
    Z = zs[None, None, :]

    y_bot = -0.40
    y_top = 4.70
    hc = np.clip((Y - y_bot) / (y_top - y_bot), 0.0, 1.0)

    # 1. Subtle, monumental S-curved spine gesture (gentle organic lean, no wild distortion)
    cx = 0.08 * np.sin(hc * np.pi) - 0.04 * np.sin(hc * 2.0 * np.pi)
    cz = 0.06 * np.cos(hc * np.pi * 0.85)

    dx = X - cx
    dz = Z - cz

    # 2. Non-circular biomorphic cross-section (elliptical slab with organic softness)
    ang = np.arctan2(dz, dx)
    ang_mod = (
        1.0
        + 0.18 * np.cos(2.0 * ang - 0.35 * hc)      # Broad front vs slender side profile
        + 0.08 * np.cos(ang + 0.35)                  # Gentle front-to-back organic swell
        + 0.04 * np.sin(3.0 * ang - 0.75 * hc)       # Subtle biomorphic softness
    )

    # 3. Continuous vertical profile: grounded base, wide upper-middle expanse, soft tapering summit
    # NO pinching! Gradual, flowing changes in width throughout height
    base_flare = 0.12 * np.exp(-((hc - 0.04) / 0.16) ** 2)
    broad_swell = 0.18 * np.exp(-((hc - 0.60) / 0.28) ** 2)
    r_profile = (0.70 + base_flare + broad_swell) * ang_mod

    # 4. Asymmetrical, softly sloping crown (one shoulder peaks gently higher, sloping smoothly)
    crown_slope = -0.24 * dx + 0.12 * dz
    y_eff_top = y_top + crown_slope

    # Smooth organic cap rounding at top and bottom
    t_cap_top = np.clip((Y - (y_eff_top - 0.80)) / 0.80, 0.0, 1.0)
    cap_top = np.power(np.maximum(1.0 - t_cap_top * t_cap_top, 0.0), 0.50)

    t_cap_bot = np.clip(((y_bot + 0.25) - Y) / 0.25, 0.0, 1.0)
    cap_bot = np.power(np.maximum(1.0 - t_cap_bot * t_cap_bot, 0.0), 0.50)

    r_eff = r_profile * cap_top * cap_bot
    rad = np.sqrt(dx * dx + dz * dz)
    d = rad - r_eff

    over_top = np.maximum(Y - y_eff_top, 0.0)
    under_bot = np.maximum(y_bot - Y, 0.0)
    d = np.where(over_top > 0.0, np.sqrt(np.maximum(d, 0.0) ** 2 + over_top ** 2), d)
    d = np.where(under_bot > 0.0, np.sqrt(np.maximum(d, 0.0) ** 2 + under_bot ** 2), d)

    # 5. Low-frequency 3D organic stone undulation (smooth, natural geological erosion)
    rng = np.random.default_rng(20261029)
    raw_noise = rng.standard_normal((nx, ny, nz), dtype=np.float32)
    smooth_noise = gaussian_filter(raw_noise, sigma=(12, 16, 12), mode="reflect")
    std = float(np.std(smooth_noise)) + 1e-8
    organic_disp = (0.040 / std) * smooth_noise

    cap_fade = np.clip((Y - (y_bot + 0.10)) / 0.25, 0.0, 1.0)
    d = (d + cap_fade * organic_disp).astype(np.float32)
    d = gaussian_filter(d, sigma=1.0, mode="nearest")

    spacing = (
        float(xs[1] - xs[0]),
        float(ys[1] - ys[0]),
        float(zs[1] - zs[0]),
    )
    verts, faces, _, _ = marching_cubes(d, level=0.0, spacing=spacing)
    verts = verts.astype(np.float32)

    gx = verts[:, 0] / spacing[0]
    gy = verts[:, 1] / spacing[1]
    gz = verts[:, 2] / spacing[2]
    coords = np.vstack([gx, gy, gz])

    grad_x, grad_y, grad_z = np.gradient(d, spacing[0], spacing[1], spacing[2])
    nx_v = map_coordinates(grad_x, coords, order=1, mode="nearest")
    ny_v = map_coordinates(grad_y, coords, order=1, mode="nearest")
    nz_v = map_coordinates(grad_z, coords, order=1, mode="nearest")
    norms = np.stack([nx_v, ny_v, nz_v], axis=1).astype(np.float32)
    norms /= np.linalg.norm(norms, axis=1, keepdims=True) + 1e-8

    # Ambient Occlusion (gentle, natural cavity depth)
    occ = np.zeros(len(verts), dtype=np.float32)
    weight = 1.0
    for step_dist in [0.06, 0.15, 0.30]:
        sx = gx + (norms[:, 0] * step_dist) / spacing[0]
        sy = gy + (norms[:, 1] * step_dist) / spacing[1]
        sz = gz + (norms[:, 2] * step_dist) / spacing[2]
        sd = map_coordinates(d, np.vstack([sx, sy, sz]), order=1, mode="nearest")
        occ += weight * np.clip((step_dist - sd) / step_dist, 0.0, 1.0)
        weight *= 0.60
    ao = np.clip(1.0 - 0.20 * occ, 0.45, 1.0).astype(np.float32)

    # Curvature (gentle crest detection)
    lap_grid = gaussian_filter(d, sigma=3.0, mode="nearest") - d
    curv = np.clip(0.5 - 3.0 * map_coordinates(lap_grid, coords, order=1, mode="nearest"), 0.0, 1.0).astype(np.float32)

    verts[:, 0] += xs[0]
    verts[:, 1] += ys[0]
    verts[:, 2] += zs[0]

    # Center horizontal centroids at (X=0, Z=0)
    cx_mean = float(np.mean(verts[:, 0]))
    cz_mean = float(np.mean(verts[:, 2]))
    verts[:, 0] -= cx_mean
    verts[:, 2] -= cz_mean

    # Center vertical height around Y=0
    y_min, y_max = float(verts[:, 1].min()), float(verts[:, 1].max())
    y_center = (y_min + y_max) * 0.5
    verts[:, 1] -= y_center

    v0 = verts[faces[:, 0]]
    v1 = verts[faces[:, 1]]
    v2 = verts[faces[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    if np.mean(np.sum(fn * norms[faces[:, 0]], axis=1)) < 0.0:
        faces = faces[:, [0, 2, 1]]

    ao_curv = np.stack([ao, curv], axis=1).astype(np.float32)
    print(
        f"[Monolith Mesh] {len(verts):,} verts, {len(faces):,} tris in {time.time() - t0:.2f}s | "
        f"X:[{verts[:,0].min():.2f},{verts[:,0].max():.2f}] "
        f"Y:[{verts[:,1].min():.2f},{verts[:,1].max():.2f}] "
        f"Z:[{verts[:,2].min():.2f},{verts[:,2].max():.2f}]"
    )
    return verts, norms, ao_curv, faces.astype(np.int32)


def compute_monolith_colors(verts, norms, ao_curv):
    """
    Computes a deliberately designed, procedural, cloud-banded surface:
    Dominant Palette:
      - Deep rust red:              #78281D
      - Burnt orange:               #AD472B
      - Terracotta:                 #CB6947
    Secondary Highlights:
      - Dusty peach:                #D99A78
      - Warm ivory:                 #E8D4B9
      - Deep reddish-brown shadows: #401812

    Broad, irregular, predominantly horizontal bands wrap around the entire object,
    resembling naturally layered geological strata and atmospheric cloud deposits.
    Burnt orange, terracotta and rust red form ~75% of the surface.
    """
    X = verts[:, 0]
    Y = verts[:, 1]
    Z = verts[:, 2]
    ao = ao_curv[:, 0]
    curv = ao_curv[:, 1]

    y_min, y_max = float(Y.min()), float(Y.max())
    h = np.clip((Y - y_min) / (y_max - y_min + 1e-6), 0.0, 1.0)

    # Precise user color tokens (normalized sRGB)
    c_deep_shadow  = np.array([0.251, 0.094, 0.071], dtype=np.float32)  # #401812
    c_rust_red     = np.array([0.471, 0.157, 0.114], dtype=np.float32)  # #78281D
    c_burnt_orange = np.array([0.678, 0.278, 0.169], dtype=np.float32)  # #AD472B
    c_terracotta   = np.array([0.796, 0.412, 0.278], dtype=np.float32)  # #CB6947
    c_dusty_peach  = np.array([0.851, 0.604, 0.471], dtype=np.float32)  # #D99A78
    c_warm_ivory   = np.array([0.910, 0.831, 0.725], dtype=np.float32)  # #E8D4B9

    # Horizontal cloud-band coordinate warped with low-frequency 3D coordinates
    twist = np.arctan2(Z, X)
    warp_low = 0.32 * np.sin(h * 6.8 + 1.2 * X - 0.9 * Z) + 0.18 * np.cos(h * 11.5 - 1.4 * twist + 0.6 * Y)
    warp_fine = 0.06 * np.sin(h * 20.0 + 2.2 * X + 1.6 * Z) + 0.04 * np.cos(h * 32.0 - 2.8 * X + 1.9 * Z)
    layer = h * 8.2 + warp_low + warp_fine

    # 1. Base dominant foundation: oscillating between rust-red and rich burnt-orange
    wave_base = (np.sin(layer * 0.95) * 0.5 + 0.5)[:, None]
    col = (1.0 - wave_base) * c_rust_red + wave_base * c_burnt_orange

    # 2. Rich terracotta broad strata (dominant body)
    wave_terra = (np.cos(layer * 1.40 + 0.4) * 0.5 + 0.5)[:, None]
    col = (1.0 - wave_terra * 0.58) * col + (wave_terra * 0.58) * c_terracotta

    # 3. Dusty peach horizontal strata (secondary highlight, soft warm layers)
    peach_dist = np.mod(layer + 1.1, 3.8) - 1.9
    peach_mask = (np.exp(-(peach_dist / 0.52) ** 2) * 0.52)[:, None]
    col = (1.0 - peach_mask) * col + peach_mask * c_dusty_peach

    # 4. Signature warm ivory stratum across upper swell (secondary accent near h ~ 0.70 to 0.78)
    ivory_dist = (h - 0.72 + 0.025 * np.sin(X * 1.8 - Z * 1.2)) / 0.040
    ivory_mask = (np.exp(-(ivory_dist ** 2)) * 0.65)[:, None]
    col = (1.0 - ivory_mask) * col + ivory_mask * c_warm_ivory

    # 5. Thinner lower ivory wisp near h ~ 0.34
    wisp_dist = (h - 0.34 + 0.02 * np.cos(Z * 2.2 + X * 1.0)) / 0.025
    wisp_mask = (np.exp(-(wisp_dist ** 2)) * 0.42)[:, None]
    col = (1.0 - wisp_mask) * col + wisp_mask * c_warm_ivory

    # 6. Subtle curvature modulation (gentle highlights on crests, no sharp stains)
    high_curv = np.maximum(curv - 0.53, 0.0)[:, None]
    col += high_curv * 0.22 * (c_dusty_peach - col)

    # 7. Restrained deep shadow in natural recesses
    col = col * (0.75 + 0.25 * ao)[:, None] + ((1.0 - ao) * 0.15)[:, None] * c_deep_shadow

    col = np.clip(col, 0.0, 1.0)
    rgba = (np.column_stack([col, np.ones(len(verts))]) * 255).astype(np.uint8)
    return rgba


def build_terrain_mesh(nx=260, nz=260):
    """
    Expansive, uneven dreamlike dark landscape extending from foreground (z=+12)
    to distant horizon ridges (z=-135), x in [-85, +85].
    Natural rocky/eroded undulations, shallow mist basins, and multi-layered
    distant horizon ridges — NO pedestal or artificial platform!
    """
    t0 = time.time()
    u = np.linspace(-1.0, 1.0, nx, dtype=np.float32)
    xs = u * 85.0 * (0.45 + 0.55 * u * u)

    v = np.linspace(0.0, 1.0, nz, dtype=np.float32)
    zs = 12.5 - 147.5 * (v ** 1.65)

    X, Z = np.meshgrid(xs, zs, indexing="ij")

    n_large = multi_octave_2d_noise((nx, nz), scales=[(18, 14), (9, 7)], weights=[0.55, 0.26], seed=77)
    n_detail = multi_octave_2d_noise((nx, nz), scales=[(4.2, 3.5), (2.0, 1.8)], weights=[0.11, 0.045], seed=88)
    n_ridge = 1.0 - np.abs(multi_octave_2d_noise((nx, nz), scales=[(11, 8), (5.5, 4.0)], weights=[0.7, 0.3], seed=99))

    dist_center = np.sqrt(X * X + Z * Z)
    center_tame = 1.0 - 0.72 * np.exp(-((dist_center / 3.2) ** 2))

    H = (n_large + n_detail + 0.22 * (n_ridge - 0.5)) * center_tame

    fg_mask = np.exp(-(((Z - 5.2) / 3.6) ** 2)) * (1.0 - np.exp(-((X / 3.8) ** 2)))
    H += 0.32 * fg_mask * (0.6 + 0.4 * np.sin(X * 0.45 + 1.1))

    mid_ridge1 = np.exp(-(((Z + 19.0 + 2.5 * np.sin(X * 0.09)) / 5.5) ** 2))
    H += mid_ridge1 * (0.65 + 0.55 * n_ridge) * (0.45 + 0.55 * (1.0 - np.exp(-((X / 9.0) ** 2))))

    r1_z = -46.0 + 4.0 * np.sin(X * 0.055 + 0.8)
    ridge1 = np.exp(-(((Z - r1_z) / 7.5) ** 2))
    r1_profile = 2.1 + 1.4 * np.sin(X * 0.075 - 0.9) + 0.9 * np.cos(X * 0.14 + 0.4) + 1.2 * n_ridge
    valley_gap1 = 1.0 - 0.62 * np.exp(-(((X - 1.5) / 11.0) ** 2))
    H += ridge1 * np.maximum(r1_profile, 0.2) * valley_gap1

    r2_z = -78.0 + 6.0 * np.cos(X * 0.04 - 0.5)
    ridge2 = np.exp(-(((Z - r2_z) / 11.0) ** 2))
    r2_profile = 4.2 + 2.3 * np.sin(X * 0.05 + 1.7) + 1.5 * np.cos(X * 0.11 - 0.8) + 1.8 * n_ridge
    valley_gap2 = 1.0 - 0.48 * np.exp(-(((X + 3.0) / 16.0) ** 2))
    H += ridge2 * np.maximum(r2_profile, 0.3) * valley_gap2

    r3_z = -118.0 + 7.0 * np.sin(X * 0.03 + 2.1)
    ridge3 = np.exp(-(((Z - r3_z) / 14.0) ** 2))
    r3_profile = 6.4 + 3.2 * np.cos(X * 0.038 - 1.2) + 2.0 * np.sin(X * 0.085 + 0.5) + 2.2 * n_ridge
    valley_gap3 = 1.0 - 0.35 * np.exp(-(((X - 4.0) / 22.0) ** 2))
    H += ridge3 * np.maximum(r3_profile, 0.5) * valley_gap3

    ix0 = int(np.argmin(np.abs(xs)))
    iz0 = int(np.argmin(np.abs(zs)))
    H -= float(H[ix0, iz0]) - 0.02

    dHx = np.gradient(H, xs, axis=0)
    dHz = np.gradient(H, zs, axis=1)
    Nx = -dHx
    Ny = np.ones_like(H)
    Nz = -dHz
    Nlen = np.sqrt(Nx * Nx + Ny * Ny + Nz * Nz) + 1e-8
    Nx /= Nlen
    Ny /= Nlen
    Nz /= Nlen

    smooth_H = gaussian_filter(H, sigma=4.0, mode="nearest")
    terr_ao = np.clip(0.76 + 0.35 * (H - smooth_H), 0.30, 1.0).astype(np.float32)

    verts = np.stack([X, H, Z], axis=-1).reshape(-1, 3).astype(np.float32)
    norms = np.stack([Nx, Ny, Nz], axis=-1).reshape(-1, 3).astype(np.float32)
    ao = terr_ao.reshape(-1, 1).astype(np.float32)

    idx = np.arange(nx * nz, dtype=np.int32).reshape(nx, nz)
    i00 = idx[:-1, :-1].ravel()
    i10 = idx[1:, :-1].ravel()
    i01 = idx[:-1, 1:].ravel()
    i11 = idx[1:, 1:].ravel()
    faces = np.vstack([
        np.stack([i00, i10, i11], axis=-1),
        np.stack([i00, i11, i01], axis=-1),
    ]).astype(np.int32)

    v0 = verts[faces[:, 0]]
    v1 = verts[faces[:, 1]]
    v2 = verts[faces[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    if np.mean(fn[:, 1]) < 0.0:
        faces = faces[:, [0, 2, 1]]

    print(f"[Terrain Mesh] {len(verts):,} verts, {len(faces):,} tris in {time.time() - t0:.2f}s")
    return verts, norms, ao, faces


def compute_terrain_colors(verts, norms, ao):
    """
    Computes dark natural geological coloring:
    Basalt / volcanic obsidian base, charred umber mid-tones, subtle copper
    crests, AO cavity shading, and a gentle fade toward atmospheric dusk fog
    on distant horizons.
    """
    H = verts[:, 1]
    Z = verts[:, 2]
    ao_val = ao.ravel()

    c_basalt = np.array([0.055, 0.032, 0.028], dtype=np.float32)  # #0E0807
    c_umber  = np.array([0.115, 0.068, 0.055], dtype=np.float32)  # #1D110E
    c_crest  = np.array([0.220, 0.130, 0.102], dtype=np.float32)  # #38211A
    c_fog    = np.array([0.102, 0.051, 0.039], dtype=np.float32)  # #1A0D0A (matches scene fog)

    h_factor = np.clip((H + 0.5) / 5.2, 0.0, 1.0)[:, None]
    col = (1.0 - h_factor) * c_basalt + h_factor * c_umber

    crest_mask = np.clip((H - 2.2) / 4.5, 0.0, 1.0)[:, None]
    col = (1.0 - crest_mask * 0.65) * col + (crest_mask * 0.65) * c_crest

    col *= (0.40 + 0.60 * ao_val)[:, None]

    dist_t = (np.clip((-Z - 12.0) / 118.0, 0.0, 1.0) ** 1.35)[:, None]
    col = (1.0 - dist_t) * col + dist_t * c_fog

    col = np.clip(col, 0.0, 1.0)
    rgba = (np.column_stack([col, np.ones(len(verts))]) * 255).astype(np.uint8)
    return rgba


def export_assets(output_dir="public/models"):
    """
    Executes procedural generation and exports non-empty GLB models.
    """
    os.makedirs(output_dir, exist_ok=True)
    total_t0 = time.time()

    print("\n--- Generating IdleX Organic Monolith ---")
    verts_m, norms_m, ao_curv_m, faces_m = build_monolith_mesh()
    colors_m = compute_monolith_colors(verts_m, norms_m, ao_curv_m)

    monolith_mesh = trimesh.Trimesh(
        vertices=verts_m,
        faces=faces_m,
        vertex_normals=norms_m,
        vertex_colors=colors_m,
        process=False,
    )

    monolith_path = os.path.join(output_dir, "idlex-monolith.glb")
    monolith_glb = monolith_mesh.export(file_type="glb")
    with open(monolith_path, "wb") as f:
        f.write(monolith_glb)

    monolith_size_mb = os.path.getsize(monolith_path) / (1024 * 1024)
    print(f"✓ Exported Monolith GLB: {monolith_path} ({monolith_size_mb:.2f} MB)")

    print("\n--- Generating IdleX Geological Terrain ---")
    verts_t, norms_t, ao_t, faces_t = build_terrain_mesh()
    colors_t = compute_terrain_colors(verts_t, norms_t, ao_t)

    terrain_mesh = trimesh.Trimesh(
        vertices=verts_t,
        faces=faces_t,
        vertex_normals=norms_t,
        vertex_colors=colors_t,
        process=False,
    )

    terrain_path = os.path.join(output_dir, "idlex-terrain.glb")
    terrain_glb = terrain_mesh.export(file_type="glb")
    with open(terrain_path, "wb") as f:
        f.write(terrain_glb)

    terrain_size_mb = os.path.getsize(terrain_path) / (1024 * 1024)
    print(f"✓ Exported Terrain GLB: {terrain_path} ({terrain_size_mb:.2f} MB)")

    print(f"\n✨ Asset pipeline completed successfully in {time.time() - total_t0:.2f}s!")
    return monolith_path, terrain_path


if __name__ == "__main__":
    export_assets()
