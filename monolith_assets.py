"""
IdleX Procedural 3D Asset Pipeline — Final Sculptural Monolith
==============================================================
Procedural generation and offline export of:
  - public/models/idlex-monolith.glb : Deliberately designed, asymmetrical organic monolith
                                       with controlled lofting profile, sloping crown,
                                       and rich multi-strata cloud bands.
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


def build_monolith_mesh(nx=160, ny=260, nz=160):
    """
    Constructs an intentionally sculpted, tall organic standing-stone monolith via exact SDF lofting:
    - Deliberate asymmetrical profile (Neolithic standing stone / menhir / Arp & Moore sculpture).
    - Asymmetrical sloping crown with geological bevel (slopes ~26 deg naturally from high left peak).
    - Broad sculptural upper body with a prominent asymmetric left shoulder swell.
    - Subtly narrowed sculptural transition section (~17% taper, NO humanoid hourglass or vase).
    - Grounded, substantial lower body and uneven base.
    - Genuinely irregular depth (Z ~ 73% of X) so rotation visibly transforms the silhouette.
    """
    t0 = time.time()
    xs = np.linspace(-1.85, 1.85, nx, dtype=np.float32)
    ys = np.linspace(-1.20, 5.50, ny, dtype=np.float32)
    zs = np.linspace(-1.85, 1.85, nz, dtype=np.float32)

    X = xs[:, None, None]
    Y = ys[None, :, None]
    Z = zs[None, None, :]

    y_bot = -0.40
    y_top = 4.30
    hc = np.clip((Y - y_bot) / (y_top - y_bot), 0.0, 1.0)

    # 1. Monumental standing-stone spine trajectory (architectural contrapposto)
    cx = -0.14 * np.sin(hc * np.pi) + 0.16 * np.sin(hc * 2.6) * (hc > 0.24)
    cz = 0.08 * np.cos(hc * np.pi * 0.9) - 0.05 * (hc - 0.45)

    dx = X - cx
    dz = Z - cz

    # 2. Gradual orientation twist across height (~24 deg)
    twist = 0.42 * hc
    ct = np.cos(twist)
    st = np.sin(twist)
    ux = ct * dx + st * dz
    uz = -st * dx + ct * dz

    # 3. Sculptural Profile Functions:
    base_w = np.exp(-((hc - 0.02) / 0.16) ** 2)
    lower_w = np.exp(-((hc - 0.20) / 0.14) ** 2)
    waist_w = np.exp(-((hc - 0.42) / 0.13) ** 2)
    shoulder_w = np.exp(-((hc - 0.70) / 0.15) ** 2)
    crown_w = np.exp(-((hc - 0.92) / 0.14) ** 2)

    # Left flank (ux < 0): Bold sculptural shoulder swell
    r_left = (
        0.82
        + 0.08 * base_w
        + 0.12 * lower_w
        - 0.16 * waist_w
        + 0.32 * shoulder_w
        - 0.16 * crown_w
    )

    # Right flank (ux > 0): Taut, chiseled architectural contour
    r_right = (
        0.78
        + 0.08 * base_w
        + 0.10 * lower_w
        - 0.14 * waist_w
        + 0.10 * shoulder_w
        - 0.22 * crown_w
    )

    # Depth Z (depth is ~73% of width for genuine rotational silhouette transformation)
    rz = (
        0.56
        + 0.06 * lower_w
        - 0.08 * waist_w
        + 0.10 * shoulder_w
        - 0.10 * crown_w
    )

    # Smooth sigmoid blend between left and right flanks based on ux
    s_blend = 1.0 / (1.0 + np.exp(12.0 * ux))
    rx = s_blend * r_left + (1.0 - s_blend) * r_right

    # Polar angle in twisted coordinate frame
    theta = np.arctan2(uz, ux)
    cos_t = np.cos(theta)
    sin_t = np.sin(theta)
    denom = np.sqrt((rz * cos_t) ** 2 + (rx * sin_t) ** 2 + 1e-8)
    r_target = (rx * rz) / denom

    # Organic subtle faceting (integer multiples of theta -> C-infinity seamless!)
    ang_mod = (
        1.0
        + 0.06 * np.cos(2.0 * theta - 0.3 * hc)
        + 0.04 * np.sin(3.0 * theta + 0.5)
        + 0.02 * np.cos(4.0 * theta - 1.0 * hc)
    )
    r_target *= ang_mod

    # Horizontal radial distance
    r_curr = np.sqrt(ux * ux + uz * uz)
    d_horiz = r_curr - r_target

    # 4. Sloping Crown Top Summit:
    # High peak on left (ux < 0), slopes down across to right flank (ux > 0) with a bold 26 deg slant
    crown_slope = -0.48 * ux + 0.16 * uz
    y_eff_top = y_top + crown_slope

    # Vertical distance
    d_top = Y - y_eff_top
    d_bot = y_bot - Y
    d_vert = np.maximum(d_top, d_bot)

    # Exact rounded box / cylinder combination (fillet / bevel)
    r_fillet = 0.26
    w_horiz = d_horiz + r_fillet
    w_vert = d_vert + r_fillet

    outside_dist = np.sqrt(np.maximum(w_horiz, 0.0) ** 2 + np.maximum(w_vert, 0.0) ** 2) - r_fillet
    inside_dist = np.minimum(np.maximum(w_horiz, w_vert), 0.0) - r_fillet
    d = outside_dist + inside_dist

    # 5. Low-frequency 3D organic displacement (restrained, natural stone weathering)
    rng = np.random.default_rng(20261029)
    raw_noise = rng.standard_normal((nx, ny, nz), dtype=np.float32)
    smooth_noise = gaussian_filter(raw_noise, sigma=(10, 14, 10), mode="reflect")
    std = float(np.std(smooth_noise)) + 1e-8
    organic_disp = (0.028 / std) * smooth_noise
    d += organic_disp
    d = gaussian_filter(d, sigma=0.8, mode="nearest")

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

    # Restrained Ambient Occlusion
    occ = np.zeros(len(verts), dtype=np.float32)
    weight = 1.0
    for step_dist in [0.06, 0.15, 0.30]:
        sx = gx + (norms[:, 0] * step_dist) / spacing[0]
        sy = gy + (norms[:, 1] * step_dist) / spacing[1]
        sz = gz + (norms[:, 2] * step_dist) / spacing[2]
        sd = map_coordinates(d, np.vstack([sx, sy, sz]), order=1, mode="nearest")
        occ += weight * np.clip((step_dist - sd) / step_dist, 0.0, 1.0)
        weight *= 0.60
    ao = np.clip(1.0 - 0.18 * occ, 0.50, 1.0).astype(np.float32)

    # Curvature
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
    width = verts[:, 0].max() - verts[:, 0].min()
    height = verts[:, 1].max() - verts[:, 1].min()
    depth = verts[:, 2].max() - verts[:, 2].min()
    print(
        f"[Monolith Mesh] {len(verts):,} verts, {len(faces):,} tris in {time.time() - t0:.2f}s | "
        f"X:[{verts[:,0].min():.2f},{verts[:,0].max():.2f}] (width: {width:.2f}) "
        f"Y:[{verts[:,1].min():.2f},{verts[:,1].max():.2f}] (height: {height:.2f}) "
        f"Z:[{verts[:,2].min():.2f},{verts[:,2].max():.2f}] (depth: {depth:.2f}) | "
        f"Depth/Width ratio: {depth/width:.2f}"
    )
    return verts, norms, ao_curv, faces.astype(np.int32)


def compute_monolith_colors(verts, norms, ao_curv):
    """
    Computes a rich procedural, object-space cloud-banded surface:
    Dominant Palette:
      - Deep oxblood:   #6E211B -> [0.431, 0.129, 0.106]
      - Rust red:       #8F3022 -> [0.561, 0.188, 0.133]
      - Burnt orange:   #B84C2E -> [0.722, 0.298, 0.180]
      - Terracotta:     #CB704F -> [0.796, 0.439, 0.310]
    Contrasting Highlight Bands:
      - Dusty peach:    #D9A080 -> [0.851, 0.627, 0.502]
      - Warm ivory:     #E8D4B9 -> [0.910, 0.831, 0.725]

    Burnt orange, terracotta, and rust red form ~75% of the surface.
    Multiple horizontal strata wrap continuously around front, sides, and rear.
    """
    X = verts[:, 0]
    Y = verts[:, 1]
    Z = verts[:, 2]
    ao = ao_curv[:, 0]
    curv = ao_curv[:, 1]

    y_min, y_max = float(Y.min()), float(Y.max())
    h = np.clip((Y - y_min) / (y_max - y_min + 1e-6), 0.0, 1.0)

    c_oxblood      = np.array([0.431, 0.129, 0.106], dtype=np.float32)  # #6E211B
    c_rust_red     = np.array([0.561, 0.188, 0.133], dtype=np.float32)  # #8F3022
    c_burnt_orange = np.array([0.722, 0.298, 0.180], dtype=np.float32)  # #B84C2E
    c_terracotta   = np.array([0.796, 0.439, 0.310], dtype=np.float32)  # #CB704F
    c_dusty_peach  = np.array([0.851, 0.627, 0.502], dtype=np.float32)  # #D9A080
    c_warm_ivory   = np.array([0.910, 0.831, 0.725], dtype=np.float32)  # #E8D4B9

    # 3D multi-frequency domain warping in continuous 3D object space
    # Continuous (X, Y, Z) sinusoidal warping guarantees C-infinity continuity around all 360°
    # Absolutely NO seam line or branch cut jump!
    w1 = 0.42 * np.sin(2.6 * Y + 1.4 * X - 1.1 * Z)
    w2 = 0.26 * np.cos(4.2 * Y - 1.3 * Z + 0.9 * X)
    w3 = 0.14 * np.sin(6.8 * Y + 2.4 * X + 1.8 * Z)
    strata = h * 14.0 + w1 + w2 + w3

    # 1. Rich bedrock cycle: Burnt orange, terracotta, and rust red form ~80% of the surface!
    t_bed = np.sin(strata * 0.9) * 0.5 + 0.5  # 0 to 1
    # Smooth piecewise interpolation through bedrock strata
    col = np.zeros((len(verts), 3), dtype=np.float32)
    m1 = t_bed < 0.35
    m2 = (t_bed >= 0.35) & (t_bed < 0.70)
    m3 = t_bed >= 0.70

    f1 = (t_bed[m1] / 0.35)[:, None]
    col[m1] = (1.0 - f1) * c_oxblood + f1 * c_rust_red

    f2 = ((t_bed[m2] - 0.35) / 0.35)[:, None]
    col[m2] = (1.0 - f2) * c_rust_red + f2 * c_burnt_orange

    f3 = ((t_bed[m3] - 0.70) / 0.30)[:, None]
    col[m3] = (1.0 - f3) * c_burnt_orange + f3 * c_terracotta

    # 2. Contrasting Accent Strata Bands (TIGHT, CRISP, DISTINCT ribbons — true geological banding)
    # Band 1: Signature upper ivory band across upper shoulder (narrow ribbon at h ~ 0.74)
    warp_b1 = 0.025 * np.sin(X * 2.2 - Z * 1.5) + 0.015 * np.cos(Y * 3.0)
    b1 = (np.exp(-(((h - (0.74 + warp_b1)) / 0.018) ** 2)) * 0.88)[:, None]
    col = (1.0 - b1) * col + b1 * c_warm_ivory

    # Band 2: Mid-body ivory/peach double ribbon (narrow ribbons at h ~ 0.52 and 0.47)
    warp_b2 = 0.020 * np.cos(Z * 2.4 + X * 1.6)
    b2a = (np.exp(-(((h - (0.52 + warp_b2)) / 0.014) ** 2)) * 0.82)[:, None]
    b2b = (np.exp(-(((h - (0.47 + warp_b2)) / 0.012) ** 2)) * 0.70)[:, None]
    col = (1.0 - b2a) * col + b2a * c_warm_ivory
    col = (1.0 - b2b) * col + b2b * c_dusty_peach

    # Band 3: Lower body peach ribbon (narrow ribbon at h ~ 0.26)
    warp_b3 = 0.018 * np.sin(X * 2.5 + Z * 1.0)
    b3 = (np.exp(-(((h - (0.26 + warp_b3)) / 0.016) ** 2)) * 0.75)[:, None]
    col = (1.0 - b3) * col + b3 * c_dusty_peach

    # Band 4: Subtle fine micro-ribbon at h ~ 0.88 (near sloping crown)
    b_crown = (np.exp(-(((h - 0.88) / 0.012) ** 2)) * 0.65)[:, None]
    col = (1.0 - b_crown) * col + b_crown * c_dusty_peach

    # 3. Restrained ambient occlusion (warm shadow depth, no pitch black or muddy stains)
    col *= (0.80 + 0.20 * ao)[:, None]

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
