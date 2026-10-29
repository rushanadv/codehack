"""
IdleX Procedural 3D Asset Pipeline
==================================
Procedural generation and offline export of:
  - public/models/idlex-monolith.glb : Asymmetrical biomorphic organic monolith with
                                       terracotta/burnt-orange/ivory geological strata.
  - public/models/idlex-terrain.glb  : Vast dark geological landscape with rolling ridges,
                                       horizon valleys, and atmospheric dusk coloring.

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


def multi_octave_3d_noise(shape, scales, weights, seed=42):
    rng = np.random.default_rng(seed)
    field = np.zeros(shape, dtype=np.float32)
    for sigma, weight in zip(scales, weights):
        raw = rng.standard_normal(shape, dtype=np.float32)
        smoothed = gaussian_filter(raw, sigma=sigma, mode="reflect")
        std = float(np.std(smoothed)) + 1e-8
        field += (weight / std) * smoothed
    return field


def multi_octave_2d_noise(shape, scales, weights, seed=101):
    rng = np.random.default_rng(seed)
    field = np.zeros(shape, dtype=np.float32)
    for sigma, weight in zip(scales, weights):
        raw = rng.standard_normal(shape, dtype=np.float32)
        smoothed = gaussian_filter(raw, sigma=sigma, mode="reflect")
        std = float(np.std(smoothed)) + 1e-8
        field += (weight / std) * smoothed
    return field


def smin_np(a, b, k):
    h = np.maximum(k - np.abs(a - b), 0.0) / k
    return np.minimum(a, b) - h * h * h * k * (1.0 / 6.0)


def smax_np(a, b, k):
    return -smin_np(-a, -b, k)


def build_monolith_mesh(nx=152, ny=264, nz=152):
    """
    Constructs a tall, asymmetrical, surreal organic monolith (~4.85 units tall above y=0,
    width ~1.25 to ~1.90 depending on viewing angle -> tall 2.6:1 to 3.8:1 aspect ratio).
    Features warped contrapposto sides, organic lobes & concavities, naturally varying
    vertical proportions, and an unmistakable uneven rounded top.
    """
    t0 = time.time()
    xs = np.linspace(-1.45, 1.45, nx, dtype=np.float32)
    ys = np.linspace(-0.85, 5.35, ny, dtype=np.float32)
    zs = np.linspace(-1.45, 1.45, nz, dtype=np.float32)

    X = xs[:, None, None]
    Y = ys[None, :, None]
    Z = zs[None, None, :]

    y_bot = -0.52
    y_top = 4.78
    hc = np.clip((Y - y_bot) / (y_top - y_bot), 0.0, 1.0)

    # 1. Expressive S-curved asymmetrical spine (warped sides & shifting lean)
    cx = (
        0.21 * np.sin(hc * 3.7 - 0.5)
        - 0.13 * np.sin(hc * 7.1 + 0.9)
        + 0.10 * (hc - 0.45)
    )
    cz = (
        -0.16 * np.cos(hc * 3.3 + 0.3)
        + 0.11 * np.sin(hc * 6.0 + 1.6)
    )

    dx = X - cx
    dz = Z - cz

    # 2. Twisting non-circular sculptural cross-section
    twist = 1.55 * hc + 0.38 * np.sin(hc * 4.4 + 0.2)
    ct = np.cos(twist)
    st = np.sin(twist)
    ux = ct * dx + st * dz
    uz = -st * dx + ct * dz

    ang = np.arctan2(uz, ux)
    ang_mod = (
        1.0
        + 0.21 * np.cos(ang - 1.3 * hc + 0.35)          # Lopsided organic bulge
        + 0.26 * np.cos(2.0 * ang + 1.8 * hc - 0.55)    # Broad vs slender profile contrast
        + 0.14 * np.sin(3.0 * ang - 2.3 * hc + 1.15)    # Biomorphic tri-lobe asymmetry
        + 0.06 * np.cos(4.0 * ang + 3.0 * hc)           # Soft eroded contour variation
    )

    # 3. Naturally varying proportions along height (slender monumental monolith, NOT a cylinder/capsule!)
    base_flare = 0.16 * np.exp(-((hc - 0.05) / 0.15) ** 2)
    lower_swell = 0.13 * np.exp(-((hc - 0.28) / 0.15) ** 2)
    mid_pinch = -0.15 * np.exp(-((hc - 0.54) / 0.13) ** 2)
    upper_crest_swell = 0.12 * np.exp(-((hc - 0.78) / 0.13) ** 2)

    r_profile = (0.59 + base_flare + lower_swell + mid_pinch + upper_crest_swell) * ang_mod

    # 4. Uneven, asymmetrical rounded top (one shoulder peaks high & full, opposite slopes lower)
    top_tilt = (
        -0.42 * dx
        + 0.24 * dz
        + 0.12 * np.sin(dx * 2.6 - dz * 2.1)
    )
    y_eff_top = 4.62 + top_tilt

    # Smooth organic rounding at top & bottom (ensures clean closed mesh underground too)
    t_cap_top = np.clip((Y - (y_eff_top - 0.88)) / 0.88, 0.0, 1.0)
    cap_top_scale = np.power(np.maximum(1.0 - t_cap_top * t_cap_top, 0.0), 0.44)

    t_cap_bot = np.clip(((y_bot + 0.22) - Y) / 0.22, 0.0, 1.0)
    cap_bot_scale = np.power(np.maximum(1.0 - t_cap_bot * t_cap_bot, 0.0), 0.45)

    r_eff = r_profile * cap_top_scale * cap_bot_scale
    rad = np.sqrt(dx * dx + dz * dz)
    d_core = rad - r_eff

    over_top = np.maximum(Y - y_eff_top, 0.0)
    under_bot = np.maximum(y_bot - Y, 0.0)
    d_core = np.where(
        over_top > 0.0,
        np.sqrt(np.maximum(d_core, 0.0) ** 2 + over_top ** 2),
        d_core,
    )
    d_core = np.where(
        under_bot > 0.0,
        np.sqrt(np.maximum(d_core, 0.0) ** 2 + under_bot ** 2),
        d_core,
    )

    # 5. Sculptural smooth boolean lobes & wind-carved hollows (surreal Arp/Moore organic silhouette)
    # High asymmetrical rounded crown lobe on (-X, +Z) pushing summit unevenly upward
    d_crown = (
        np.sqrt(((X + 0.22) / 0.48) ** 2 + ((Y - 4.22) / 0.72) ** 2 + ((Z - 0.12) / 0.40) ** 2) - 1.0
    ) * 0.46
    d = smin_np(d_core, d_crown, 0.46)

    # Sweeping lower-left organic hip bulge on (-X, -Z)
    d_hip = (
        np.sqrt(((X + 0.36) / 0.52) ** 2 + ((Y - 1.48) / 0.96) ** 2 + ((Z + 0.22) / 0.44) ** 2) - 1.0
    ) * 0.48
    d = smin_np(d, d_hip, 0.44)

    # Upper-right cantilevered warped bulge on (+X, -Z)
    d_cantilever = (
        np.sqrt(((X - 0.34) / 0.46) ** 2 + ((Y - 3.30) / 0.80) ** 2 + ((Z + 0.16) / 0.40) ** 2) - 1.0
    ) * 0.44
    d = smin_np(d, d_cantilever, 0.42)

    # Deep wind-carved concave scoop on (+X, +Z) mid-flank
    d_scoop1 = (
        np.sqrt(((X - 0.62) / 0.54) ** 2 + ((Y - 2.18) / 0.92) ** 2 + ((Z - 0.36) / 0.50) ** 2) - 1.0
    ) * 0.52
    d = smax_np(d, -d_scoop1, 0.42)

    # Upper-left-rear sculpted saddle concavity on (-X, -Z)
    d_scoop2 = (
        np.sqrt(((X + 0.54) / 0.48) ** 2 + ((Y - 3.05) / 0.74) ** 2 + ((Z + 0.48) / 0.46) ** 2) - 1.0
    ) * 0.46
    d = smax_np(d, -d_scoop2, 0.38)

    # Lower-right subtle undercut flute
    d_scoop3 = (
        np.sqrt(((X - 0.48) / 0.44) ** 2 + ((Y - 0.85) / 0.65) ** 2 + ((Z + 0.44) / 0.44) ** 2) - 1.0
    ) * 0.44
    d = smax_np(d, -d_scoop3, 0.35)

    # 6. Smooth multi-octave 3D organic stone undulation (faded near underground cap)
    cap_fade = np.clip((Y - (y_bot + 0.12)) / 0.25, 0.0, 1.0)
    organic_disp = multi_octave_3d_noise(
        (nx, ny, nz),
        scales=[(17, 23, 17), (8.5, 11, 8.5), (4.2, 3.0, 4.2)],
        weights=[0.072, 0.032, 0.011],
        seed=20261029,
    )
    d = (d + cap_fade * organic_disp).astype(np.float32)
    d = gaussian_filter(d, sigma=1.05, mode="nearest")

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

    # 5-step 3D SDF Ambient Occlusion
    occ = np.zeros(len(verts), dtype=np.float32)
    weight = 1.0
    for step_dist in [0.05, 0.12, 0.22, 0.36, 0.55]:
        sx = gx + (norms[:, 0] * step_dist) / spacing[0]
        sy = gy + (norms[:, 1] * step_dist) / spacing[1]
        sz = gz + (norms[:, 2] * step_dist) / spacing[2]
        sd = map_coordinates(d, np.vstack([sx, sy, sz]), order=1, mode="nearest")
        occ += weight * np.clip((step_dist - sd) / step_dist, 0.0, 1.0)
        weight *= 0.65
    ao = np.clip(1.0 - 0.28 * occ, 0.30, 1.0).astype(np.float32)

    # Curvature (convex crests > 0.5, concave hollows < 0.5)
    lap_grid = gaussian_filter(d, sigma=3.0, mode="nearest") - d
    curv = np.clip(0.5 - 4.0 * map_coordinates(lap_grid, coords, order=1, mode="nearest"), 0.0, 1.0).astype(np.float32)

    verts[:, 0] += xs[0]
    verts[:, 1] += ys[0]
    verts[:, 2] += zs[0]

    # Align visual centroid of above-ground sculpture onto (X=0, Z=0)
    above = verts[:, 1] > 0.0
    cx_mean = float(np.mean(verts[above, 0]))
    cz_mean = float(np.mean(verts[above, 2]))
    verts[:, 0] -= cx_mean
    verts[:, 2] -= cz_mean

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
    Computes distinct, high-fidelity geological strata wrapping horizontally:
    - Burnt orange (#D96335)
    - Terracotta (#A94427)
    - Rust-red (#872D18)
    - Dusty peach (#E29578)
    - Warm ivory (#F1E7DE)
    Wrapping with irregular geological undulations, curvature highlighting,
    and soft ambient occlusion.
    """
    X = verts[:, 0]
    Y = verts[:, 1]
    Z = verts[:, 2]
    ao = ao_curv[:, 0]
    curv = ao_curv[:, 1]

    y_min, y_max = float(Y.min()), float(Y.max())
    h = np.clip((Y - y_min) / (y_max - y_min + 1e-6), 0.0, 1.0)

    # 3D geological undulating strata coordinate
    # Horizontal wrapping with natural sediment undulations
    twist = np.arctan2(Z, X)
    w1 = 0.32 * np.sin(h * 11.0 + 1.5 * X - 1.2 * Z)
    w2 = 0.20 * np.cos(h * 18.0 - 1.8 * twist + 0.6 * Y)
    w3 = 0.10 * np.sin(3.0 * X + 2.5 * Z)
    layer = h * 14.0 + w1 + w2 + w3

    # Saturated, rich color palette (sRGB normalized)
    c_burnt_orange = np.array([0.851, 0.388, 0.208], dtype=np.float32)  # #D96335
    c_terracotta   = np.array([0.663, 0.267, 0.153], dtype=np.float32)  # #A94427
    c_rust_red     = np.array([0.529, 0.176, 0.094], dtype=np.float32)  # #872D18
    c_dusty_peach  = np.array([0.886, 0.584, 0.471], dtype=np.float32)  # #E29578
    c_warm_ivory   = np.array([0.945, 0.906, 0.871], dtype=np.float32)  # #F1E7DE
    c_mineral_dark = np.array([0.220, 0.098, 0.065], dtype=np.float32)  # #381911

    # 1. Broad undulating base: alternating rust-red and rich burnt-orange
    wave_base = np.sin(layer * 0.90) * 0.5 + 0.5  # [0, 1]
    col = (1.0 - wave_base[:, None]) * c_rust_red + wave_base[:, None] * c_burnt_orange

    # 2. Terracotta intermediate strata
    wave_terra = (np.cos(layer * 1.45 + 0.5) * 0.5 + 0.5)[:, None]
    col = (1.0 - wave_terra * 0.55) * col + (wave_terra * 0.55) * c_terracotta

    # 3. Dusty peach horizontal strata bands
    peach_dist = np.mod(layer + 1.2, 4.0) - 2.0
    peach_mask = np.exp(-(peach_dist / 0.62) ** 2)[:, None]
    col = (1.0 - peach_mask * 0.65) * col + (peach_mask * 0.65) * c_dusty_peach

    # 4. Prominent signature warm ivory band across upper shoulder (h ~ 0.70 to 0.78)
    ivory_dist = (h - 0.735 + 0.035 * np.sin(X * 2.2 - Z * 1.4)) / 0.042
    ivory_mask = np.exp(-(ivory_dist ** 2))[:, None]
    col = (1.0 - ivory_mask * 0.88) * col + (ivory_mask * 0.88) * c_warm_ivory

    # 5. Secondary subtle ivory band in lower-middle (h ~ 0.32)
    wisp_dist = (h - 0.32 + 0.025 * np.cos(Z * 2.5 + X * 1.1)) / 0.028
    wisp_mask = (np.exp(-(wisp_dist ** 2)) * 0.55)[:, None]
    col = (1.0 - wisp_mask) * col + wisp_mask * c_warm_ivory

    # 6. Curvature highlights (convex ridges catch peach highlight, deep hollows take warm umber)
    high_curv = np.maximum(curv - 0.53, 0.0)[:, None]
    col += high_curv * 0.28 * (c_dusty_peach - col)

    low_curv = np.maximum(0.47 - curv, 0.0)[:, None]
    col -= low_curv * 0.35 * (col - c_mineral_dark)

    # 7. Soft ambient occlusion shading (natural depth without turning pitch-black)
    col *= (0.42 + 0.58 * ao)[:, None]

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
    # Non-linear Z distribution: dense near foreground & monolith, stretching to distant horizon
    u = np.linspace(-1.0, 1.0, nx, dtype=np.float32)
    xs = u * 85.0 * (0.45 + 0.55 * u * u)  # Finer near center, wide +/-85 at edges

    v = np.linspace(0.0, 1.0, nz, dtype=np.float32)
    # Map v=0 -> z=+12.5 (foreground), v=1 -> z=-135.0 (far horizon)
    zs = 12.5 - 147.5 * (v ** 1.65)

    X, Z = np.meshgrid(xs, zs, indexing="ij")  # (nx, nz)

    # Rolling uneven terrain + ridged volcanic/desert undulations
    n_large = multi_octave_2d_noise((nx, nz), scales=[(18, 14), (9, 7)], weights=[0.55, 0.26], seed=77)
    n_detail = multi_octave_2d_noise((nx, nz), scales=[(4.2, 3.5), (2.0, 1.8)], weights=[0.11, 0.045], seed=88)
    n_ridge = 1.0 - np.abs(multi_octave_2d_noise((nx, nz), scales=[(11, 8), (5.5, 4.0)], weights=[0.7, 0.3], seed=99))

    dist_center = np.sqrt(X * X + Z * Z)
    # Keep immediate base around (0,0) naturally grounded near y=0.0 (gentle natural earth, NOT a flat pedestal)
    center_tame = 1.0 - 0.72 * np.exp(-((dist_center / 3.2) ** 2))

    H = (n_large + n_detail + 0.22 * (n_ridge - 0.5)) * center_tame

    # Subtle foreground uneven mounds (left & right framing depth without blocking monolith)
    fg_mask = np.exp(-(((Z - 5.2) / 3.6) ** 2)) * (1.0 - np.exp(-((X / 3.8) ** 2)))
    H += 0.32 * fg_mask * (0.6 + 0.4 * np.sin(X * 0.45 + 1.1))

    # Mid-distance rolling basins & low ridges (z ~ -14 to -38)
    mid_ridge1 = np.exp(-(((Z + 19.0 + 2.5 * np.sin(X * 0.09)) / 5.5) ** 2))
    H += mid_ridge1 * (0.65 + 0.55 * n_ridge) * (0.45 + 0.55 * (1.0 - np.exp(-((X / 9.0) ** 2))))

    # Distant Ridge Layer 1 (z ~ -46)
    r1_z = -46.0 + 4.0 * np.sin(X * 0.055 + 0.8)
    ridge1 = np.exp(-(((Z - r1_z) / 7.5) ** 2))
    r1_profile = 2.1 + 1.4 * np.sin(X * 0.075 - 0.9) + 0.9 * np.cos(X * 0.14 + 0.4) + 1.2 * n_ridge
    # Keep a subtle atmospheric valley gap behind the monolith so the monolith's upper half stands against sky/mist!
    valley_gap1 = 1.0 - 0.62 * np.exp(-(((X - 1.5) / 11.0) ** 2))
    H += ridge1 * np.maximum(r1_profile, 0.2) * valley_gap1

    # Distant Ridge Layer 2 (z ~ -78)
    r2_z = -78.0 + 6.0 * np.cos(X * 0.04 - 0.5)
    ridge2 = np.exp(-(((Z - r2_z) / 11.0) ** 2))
    r2_profile = 4.2 + 2.3 * np.sin(X * 0.05 + 1.7) + 1.5 * np.cos(X * 0.11 - 0.8) + 1.8 * n_ridge
    valley_gap2 = 1.0 - 0.48 * np.exp(-(((X + 3.0) / 16.0) ** 2))
    H += ridge2 * np.maximum(r2_profile, 0.3) * valley_gap2

    # Far Horizon Ridge Layer 3 (z ~ -118)
    r3_z = -118.0 + 7.0 * np.sin(X * 0.03 + 2.1)
    ridge3 = np.exp(-(((Z - r3_z) / 14.0) ** 2))
    r3_profile = 6.4 + 3.2 * np.cos(X * 0.038 - 1.2) + 2.0 * np.sin(X * 0.085 + 0.5) + 2.2 * n_ridge
    valley_gap3 = 1.0 - 0.35 * np.exp(-(((X - 4.0) / 22.0) ** 2))
    H += ridge3 * np.maximum(r3_profile, 0.5) * valley_gap3

    # Anchor y(0,0) cleanly near 0.0
    ix0 = int(np.argmin(np.abs(xs)))
    iz0 = int(np.argmin(np.abs(zs)))
    H -= float(H[ix0, iz0]) - 0.02

    # Compute smooth vertex normals from uneven spacing
    dHx = np.gradient(H, xs, axis=0)
    dHz = np.gradient(H, zs, axis=1)
    Nx = -dHx
    Ny = np.ones_like(H)
    Nz = -dHz
    Nlen = np.sqrt(Nx * Nx + Ny * Ny + Nz * Nz) + 1e-8
    Nx /= Nlen
    Ny /= Nlen
    Nz /= Nlen

    # Terrain Ambient Occlusion (valleys darker, crests more open)
    smooth_H = gaussian_filter(H, sigma=4.0, mode="nearest")
    terr_ao = np.clip(0.76 + 0.35 * (H - smooth_H), 0.30, 1.0).astype(np.float32)

    verts = np.stack([X, H, Z], axis=-1).reshape(-1, 3).astype(np.float32)
    norms = np.stack([Nx, Ny, Nz], axis=-1).reshape(-1, 3).astype(np.float32)
    ao = terr_ao.reshape(-1, 1).astype(np.float32)

    # Build grid triangle indices
    idx = np.arange(nx * nz, dtype=np.int32).reshape(nx, nz)
    i00 = idx[:-1, :-1].ravel()
    i10 = idx[1:, :-1].ravel()
    i01 = idx[:-1, 1:].ravel()
    i11 = idx[1:, 1:].ravel()
    # Note zs decreases as j increases, so check cross product orientation (+Y up)
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

    # Elevation modulation
    h_factor = np.clip((H + 0.5) / 5.2, 0.0, 1.0)[:, None]
    col = (1.0 - h_factor) * c_basalt + h_factor * c_umber

    # Crest accent on prominent mountain ridges
    crest_mask = np.clip((H - 2.2) / 4.5, 0.0, 1.0)[:, None]
    col = (1.0 - crest_mask * 0.65) * col + (crest_mask * 0.65) * c_crest

    # Ambient occlusion in valleys and crevices
    col *= (0.40 + 0.60 * ao_val)[:, None]

    # Atmospheric distance blending toward dusk horizon mist
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

    # =========================================================================
    # 1. GENERATE & EXPORT MONOLITH GLB
    # =========================================================================
    print("\n--- Generating IdleX Organic Monolith ---")
    verts_m, norms_m, ao_curv_m, faces_m = build_monolith_mesh()

    # Center vertical height around (0, 0, 0) for perfect Three.js rotational symmetry
    y_min, y_max = float(verts_m[:, 1].min()), float(verts_m[:, 1].max())
    y_center = (y_min + y_max) * 0.5
    verts_m[:, 1] -= y_center
    print(
        f"Monolith height centered at Y=0 (offset by -{y_center:.2f}). "
        f"New Y range: [{verts_m[:, 1].min():.2f}, {verts_m[:, 1].max():.2f}]"
    )

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

    # =========================================================================
    # 2. GENERATE & EXPORT TERRAIN GLB
    # =========================================================================
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
