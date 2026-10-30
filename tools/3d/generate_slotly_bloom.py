#!/usr/bin/env python3
"""Generate the Slotly Bloom sculpture as a textured glTF 2.0 binary.

Dependencies: numpy, scipy, scikit-image, Pillow, trimesh
Usage: python generate_slotly_bloom.py --output-dir ./slotly_bloom_output

The model is built from closed, parametric petal shells, a displaced botanical
core, merged lichen clusters, and fine organic stems. No paid API or Blender is
required. Blender can open the resulting GLB for further editing.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import struct
from pathlib import Path
from typing import Iterable

import numpy as np
import trimesh
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

SEED = 41
RNG = np.random.default_rng(SEED)


def clamp01(x):
    return np.clip(x, 0.0, 1.0)


def make_petal_texture(size: int = 768) -> Image.Image:
    """Ivory botanical glass with restrained growth veins and natural tint."""
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    u = xx / (size - 1) * 2.0 - 1.0
    v = yy / (size - 1)
    noise = gaussian_filter(RNG.normal(0, 1, (size, size)).astype(np.float32), sigma=12)
    noise /= max(float(np.std(noise)), 1e-6)
    fine = gaussian_filter(RNG.normal(0, 1, (size, size)).astype(np.float32), sigma=2.4)
    fine /= max(float(np.std(fine)), 1e-6)

    vein = np.zeros_like(u)
    for k, base in enumerate([-0.78, -0.58, -0.36, -0.17, 0.0, 0.18, 0.39, 0.61, 0.80]):
        curve = base * (0.20 + 0.80 * v) + 0.055 * np.sin(v * (4.0 + (k % 3)) + k * 0.8) * v
        width = 0.0045 if k == 4 else 0.0028
        vein += np.exp(-((u - curve) / width) ** 2) * (0.20 + 0.35 * np.sin(np.pi * v))

    edge = np.abs(u) ** 2.2
    base = np.stack([
        0.91 + 0.018 * noise + 0.010 * fine - 0.035 * edge,
        0.93 + 0.016 * noise + 0.008 * fine - 0.028 * edge,
        0.865 + 0.014 * noise + 0.008 * fine - 0.045 * edge,
    ], axis=-1)
    green_wash = (0.5 + 0.5 * np.sin(v * 7.0 + u * 2.1)) * edge * 0.045
    base[..., 0] -= green_wash * 0.35
    base[..., 1] += green_wash * 0.10
    base[..., 2] -= green_wash * 0.28
    base -= vein[..., None] * np.array([0.10, 0.075, 0.035], dtype=np.float32)
    base = clamp01(base)
    alpha = clamp01(0.93 - edge * 0.035 + 0.012 * noise)
    rgba = np.dstack([base, alpha])
    return Image.fromarray((rgba * 255).astype(np.uint8), mode="RGBA")


def make_moss_texture(size: int = 768) -> Image.Image:
    """Mottled forest moss/lichen texture with several natural green scales."""
    n1 = gaussian_filter(RNG.normal(0, 1, (size, size)).astype(np.float32), sigma=42)
    n2 = gaussian_filter(RNG.normal(0, 1, (size, size)).astype(np.float32), sigma=13)
    n3 = gaussian_filter(RNG.normal(0, 1, (size, size)).astype(np.float32), sigma=3)
    for n in (n1, n2, n3):
        n /= max(float(np.std(n)), 1e-6)
    field = 0.48 * n1 + 0.34 * n2 + 0.18 * n3
    t = clamp01(0.5 + field * 0.18)
    stops = np.array([
        [18, 31, 17],
        [36, 55, 25],
        [63, 83, 37],
        [105, 119, 54],
        [151, 151, 83],
    ], dtype=np.float32) / 255.0
    idx = np.minimum((t * 4).astype(int), 3)
    frac = (t * 4 - idx)[..., None]
    rgb = stops[idx] * (1 - frac) + stops[idx + 1] * frac
    flecks = np.clip((n3 - 1.35) * 0.10, 0, 0.075)
    rgb += flecks[..., None] * np.array([0.95, 0.93, 0.72], dtype=np.float32)
    rgb = clamp01(rgb)
    alpha = np.ones((size, size, 1), dtype=np.float32)
    return Image.fromarray((np.concatenate([rgb, alpha], axis=-1) * 255).astype(np.uint8), mode="RGBA")


def make_materials():
    petal_tex = make_petal_texture()
    moss_tex = make_moss_texture()
    petal = PBRMaterial(
        name="Bloom_Translucent_Ivory_Petal",
        baseColorFactor=[244, 245, 232, 188],
        baseColorTexture=petal_tex,
        metallicFactor=0.025,
        roughnessFactor=0.24,
        doubleSided=True,
        alphaMode="BLEND",
    )
    moss = PBRMaterial(
        name="Bloom_Forest_Moss_Lichen",
        baseColorFactor=[255, 255, 255, 255],
        baseColorTexture=moss_tex,
        metallicFactor=0.0,
        roughnessFactor=0.91,
        doubleSided=True,
    )
    moss_deep = PBRMaterial(
        name="Bloom_Deep_Botanical_Structure",
        baseColorFactor=[35, 53, 25, 255],
        metallicFactor=0.0,
        roughnessFactor=0.86,
        doubleSided=True,
    )
    glow = PBRMaterial(
        name="Bloom_Warm_Ivory_Core",
        baseColorFactor=[255, 240, 205, 255],
        emissiveFactor=[0.76, 0.52, 0.22],
        metallicFactor=0.0,
        roughnessFactor=0.43,
        doubleSided=True,
    )
    filament = PBRMaterial(
        name="Bloom_Botanical_Filaments",
        baseColorFactor=[133, 151, 87, 255],
        metallicFactor=0.0,
        roughnessFactor=0.7,
        doubleSided=True,
    )
    return petal, moss, moss_deep, glow, filament, petal_tex, moss_tex


def make_petal(name: str, spec: dict, material: PBRMaterial,
               nu: int = 56, nv: int = 92) -> trimesh.Trimesh:
    """Create one broad, bowl-curved petal as a closed parametric shell.

    The local surface faces +Z; azimuth rotates it around the vertical Y axis.
    Each petal has a broad spoon-like body and softly irregular edge.
    """
    us = np.linspace(-1.0, 1.0, nu + 1, dtype=np.float32)
    vs = np.linspace(0.0, 1.0, nv + 1, dtype=np.float32)
    U, V = np.meshgrid(us, vs)
    phase = spec.get("phase", 0.0)

    envelope = 0.075 + 0.925 * np.sqrt(np.maximum(0.0, np.sin(np.pi * V)))
    envelope += 0.105 * np.exp(-((V - 0.94) / 0.065) ** 2)
    envelope *= (0.78 + 0.22 * V)
    envelope *= 1.0 + spec.get("asym", 0.07) * U
    half_w = 0.5 * spec["width"] * envelope

    x_local = U * half_w * 2.0
    x_local += spec.get("side_sweep", 0.0) * V ** 1.45
    x_local += spec.get("side_curve", 0.10) * np.sin(np.pi * V)
    x_local += spec.get("edge_wave", 0.018) * np.sin(3.0 * np.pi * V + phase) * np.abs(U) ** 5

    z_local = spec.get("base_z", 0.48) + spec["flare"] * V ** 1.35
    z_local += spec.get("depth_arch", 0.16) * np.sin(np.pi * V)
    z_local -= spec.get("cup", 0.30) * (U ** 2) * envelope
    z_local += spec.get("ridge", 0.035) * np.exp(-(U / 0.16) ** 2) * np.sin(np.pi * V)
    z_local += spec.get("rim_roll", 0.07) * U ** 2 * np.sin(np.pi * V)

    y = spec.get("base_y", 0.20) + spec["height"] * V
    y += spec.get("arch_y", 0.16) * np.sin(np.pi * V)
    y += spec.get("edge_lift", 0.13) * U ** 2 * np.sin(np.pi * V)
    y += spec.get("tip_curl", 0.0) * V ** 5 * (0.5 + 0.5 * np.cos(U * np.pi))
    y += spec.get("edge_irregularity", 0.022) * np.sin(4.5 * np.pi * V + phase + U * 1.4) * np.abs(U) ** 5

    theta = spec["azimuth"] + spec.get("twist", 0.0) * V ** 1.25
    ct, st = np.cos(theta), np.sin(theta)
    x = x_local * ct + z_local * st + spec.get("offset_x", 0.0)
    z = -x_local * st + z_local * ct + spec.get("offset_z", 0.0)

    grid = np.stack([x, y, z], axis=-1)
    du = np.gradient(grid, axis=1)
    dv = np.gradient(grid, axis=0)
    normals = np.cross(du, dv)
    normals /= np.maximum(np.linalg.norm(normals, axis=-1, keepdims=True), 1e-8)
    thick = spec.get("thickness", 0.045)
    top = (grid + normals * thick * 0.5).reshape(-1, 3)
    bottom = (grid - normals * thick * 0.5).reshape(-1, 3)

    row = nu + 1
    ngrid = (nv + 1) * row
    vertices = np.vstack([top, bottom])
    faces = []
    for i in range(nv):
        for j in range(nu):
            a = i * row + j
            b = a + 1
            c = a + row + 1
            d = a + row
            faces.extend([[a, b, c], [a, c, d]])
            aa, bb, cc, dd = a + ngrid, b + ngrid, c + ngrid, d + ngrid
            faces.extend([[aa, cc, bb], [aa, dd, cc]])

    boundary = list(range(0, nu + 1))
    boundary.extend([i * row + nu for i in range(1, nv + 1)])
    boundary.extend([nv * row + j for j in range(nu - 1, -1, -1)])
    boundary.extend([i * row for i in range(nv - 1, 0, -1)])
    for k, a in enumerate(boundary):
        b = boundary[(k + 1) % len(boundary)]
        faces.extend([[a, b, b + ngrid], [a, b + ngrid, a + ngrid]])

    uv_top = np.stack([(U + 1) * 0.5, V], axis=-1).reshape(-1, 2)
    uv = np.vstack([uv_top, uv_top])
    mesh = trimesh.Trimesh(vertices=vertices, faces=np.asarray(faces, dtype=np.int64), process=False)
    mesh.visual = TextureVisuals(uv=uv, material=material)
    mesh.metadata["name"] = name
    mesh.metadata["role"] = "broad translucent sculptural petal"
    mesh.fix_normals()
    return mesh


def make_uv_organic_core(material: PBRMaterial, center=(0.0, 1.58, 0.82),
                         rx=0.82, ry=1.28, rz=0.72,
                         nphi=72, ntheta=48) -> trimesh.Trimesh:
    """Generate an irregular lichen mass via a smooth union of lobes."""
    from skimage.measure import marching_cubes
    xs = np.linspace(-1.32, 1.32, 84, dtype=np.float32)
    ys = np.linspace(0.06, 3.35, 112, dtype=np.float32)
    zs = np.linspace(-0.82, 1.88, 82, dtype=np.float32)
    X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")

    lobes = [
        ((-0.05, 1.48, 0.79), (0.52, 0.72, 0.48)),
        ((-0.43, 2.10, 0.67), (0.34, 0.50, 0.36)),
        (( 0.31, 2.02, 0.75), (0.36, 0.52, 0.38)),
        ((-0.47, 1.34, 0.85), (0.35, 0.50, 0.38)),
        (( 0.42, 1.48, 0.88), (0.36, 0.53, 0.39)),
        ((-0.08, 0.83, 0.95), (0.40, 0.42, 0.39)),
        (( 0.34, 2.58, 0.60), (0.27, 0.36, 0.30)),
    ]
    field = None
    smooth_k = 0.055
    for (cx, cy, cz), (sx, sy, sz) in lobes:
        q = np.sqrt(((X - cx) / sx) ** 2 + ((Y - cy) / sy) ** 2 + ((Z - cz) / sz) ** 2)
        d = (q - 1.0) * min(sx, sy, sz)
        if field is None:
            field = d
        else:
            h = np.clip(0.5 + 0.5 * (d - field) / smooth_k, 0.0, 1.0)
            field = d * (1.0 - h) + field * h - smooth_k * h * (1.0 - h)

    coarse = gaussian_filter(RNG.normal(0, 1, field.shape).astype(np.float32), sigma=5.5)
    fine = gaussian_filter(RNG.normal(0, 1, field.shape).astype(np.float32), sigma=2.2)
    coarse /= max(float(np.std(coarse)), 1e-6)
    fine /= max(float(np.std(fine)), 1e-6)
    field += 0.062 * coarse + 0.018 * fine

    spacing = (float(xs[1] - xs[0]), float(ys[1] - ys[0]), float(zs[1] - zs[0]))
    verts, faces, normals, values = marching_cubes(field, level=0.0, spacing=spacing,
                                                    step_size=1, allow_degenerate=False)
    verts += np.array([xs[0], ys[0], zs[0]], dtype=np.float32)
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    uv_u = (np.arctan2(verts[:, 2] - center[2], verts[:, 0] - center[0]) / (2 * np.pi) + 0.5) % 1.0
    uv_v = np.clip((verts[:, 1] - ys[0]) / (ys[-1] - ys[0]), 0.0, 1.0)
    mesh.visual = TextureVisuals(uv=np.column_stack([uv_u, uv_v]), material=material)
    mesh.fix_normals()
    return mesh


def make_sphere_cluster(center, scale, subdivisions=2) -> trimesh.Trimesh:
    m = trimesh.creation.icosphere(subdivisions=subdivisions, radius=1.0)
    verts = m.vertices.copy()
    phase = RNG.uniform(0, 2 * np.pi, size=len(verts))
    radial = 1.0 + 0.055 * np.sin(verts[:, 0] * 7 + phase) * np.cos(verts[:, 2] * 5)
    verts *= radial[:, None]
    verts *= np.asarray(scale)[None, :]
    verts += np.asarray(center)[None, :]
    return trimesh.Trimesh(vertices=verts, faces=m.faces.copy(), process=False)


def make_lichen_cluster_mesh(core_materials: list[PBRMaterial], count: int = 125):
    """Create a small set of merged, surface-following lichen clusters."""
    cx, cy, cz = 0.0, 1.58, 0.82
    rx, ry, rz = 0.80, 1.23, 0.69
    groups: list[list[trimesh.Trimesh]] = [[] for _ in core_materials]
    for i in range(count):
        theta = RNG.uniform(0.48, 2.55)
        phi = RNG.uniform(-np.pi, np.pi)
        if i % 4 != 0:
            phi = RNG.uniform(0.18, 2.96)
        disp = 1.0 + 0.05 * math.sin(3 * phi + 0.55) * math.sin(2 * theta + 0.4)
        normal = np.array([math.sin(theta) * math.cos(phi) / rx,
                           math.cos(theta) / ry,
                           math.sin(theta) * math.sin(phi) / rz], dtype=float)
        normal /= np.linalg.norm(normal)
        point = np.array([cx + rx * math.sin(theta) * math.cos(phi) * disp,
                          cy + ry * math.cos(theta) * disp,
                          cz + rz * math.sin(theta) * math.sin(phi) * disp])
        rad = RNG.uniform(0.014, 0.030)
        point -= normal * rad * 0.40
        scale = (rad * RNG.uniform(0.8, 1.35), rad * RNG.uniform(0.55, 1.05), rad * RNG.uniform(0.8, 1.25))
        blob = make_sphere_cluster(point, scale, subdivisions=1 if rad < 0.065 else 2)
        groups[int(RNG.integers(0, len(groups)))].append(blob)
    combined = []
    for idx, group in enumerate(groups):
        if group:
            merged = trimesh.util.concatenate(group)
            merged.visual = trimesh.visual.TextureVisuals(material=core_materials[idx])
            combined.append((f"Bloom_Lichen_Clusters_{idx+1}", merged))
    return combined


def make_tube(points: np.ndarray, radius: float, material: PBRMaterial,
              sides: int = 8, taper: float = 0.35, name="Botanical_Filament") -> trimesh.Trimesh:
    """Tube around a sampled 3D curve, useful for fine stems and tendrils."""
    pts = np.asarray(points, dtype=float)
    vertices = []
    faces = []
    prev_n = None
    for i, p in enumerate(pts):
        if i == 0:
            tangent = pts[1] - pts[0]
        elif i == len(pts) - 1:
            tangent = pts[-1] - pts[-2]
        else:
            tangent = pts[i + 1] - pts[i - 1]
        tangent /= max(np.linalg.norm(tangent), 1e-9)
        ref = np.array([0.0, 0.0, 1.0])
        if abs(np.dot(ref, tangent)) > 0.88:
            ref = np.array([1.0, 0.0, 0.0])
        n = np.cross(tangent, ref)
        n /= max(np.linalg.norm(n), 1e-9)
        b = np.cross(tangent, n)
        if prev_n is not None and np.dot(n, prev_n) < 0:
            n, b = -n, -b
        prev_n = n
        t = i / (len(pts) - 1)
        r = radius * (1.0 - taper * t) * (0.92 + 0.08 * math.sin(t * math.pi))
        for j in range(sides):
            a = 2 * math.pi * j / sides
            v = p + r * (math.cos(a) * n + math.sin(a) * b)
            vertices.append(v)
    for i in range(len(pts) - 1):
        for j in range(sides):
            a = i * sides + j
            b = i * sides + (j + 1) % sides
            c = (i + 1) * sides + (j + 1) % sides
            d = (i + 1) * sides + j
            faces.extend([[a, b, c], [a, c, d]])
    start = len(vertices)
    vertices.append(pts[0])
    end = len(vertices)
    vertices.append(pts[-1])
    for j in range(sides):
        j2 = (j + 1) % sides
        faces.append([start, j2, j])
        a = (len(pts) - 1) * sides + j
        b = (len(pts) - 1) * sides + j2
        faces.append([end, a, b])
    mesh = trimesh.Trimesh(vertices=np.asarray(vertices), faces=np.asarray(faces), process=False)
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    mesh.fix_normals()
    mesh.metadata["name"] = name
    return mesh


def add_filaments(scene: trimesh.Scene, material: PBRMaterial):
    specs = [
        ((-0.38, 1.55, 0.18), (-0.92, 2.15, 0.35), -0.18),
        ((0.36, 1.68, 0.24), (0.94, 2.28, 0.28), 0.20),
        ((-0.25, 2.02, -0.22), (-0.55, 2.86, -0.22), -0.12),
        ((0.24, 1.98, -0.18), (0.52, 2.78, -0.30), 0.12),
        ((-0.46, 1.28, 0.12), (-0.88, 1.72, 0.48), -0.12),
        ((0.40, 1.36, 0.15), (0.80, 1.84, 0.42), 0.10),
    ]
    for idx, (p0, p1, sway) in enumerate(specs):
        p0 = np.asarray(p0, float)
        p1 = np.asarray(p1, float)
        pts = []
        for t in np.linspace(0, 1, 24):
            p = p0 * (1 - t) + p1 * t
            p[0] += sway * math.sin(math.pi * t)
            p[2] += 0.045 * math.sin(2 * math.pi * t + idx) * t
            pts.append(p)
        mesh = make_tube(np.asarray(pts), radius=0.018, material=material, sides=7,
                         taper=0.48, name=f"Bloom_Fine_Stem_{idx+1}")
        scene.add_geometry(mesh, geom_name=f"Bloom_Fine_Stem_{idx+1}", node_name=f"Bloom_Fine_Stem_{idx+1}")
        if idx in (0, 1, 3, 5):
            bud = make_sphere_cluster(p1, (0.045, 0.065, 0.04), subdivisions=2)
            bud.visual = trimesh.visual.TextureVisuals(material=material)
            scene.add_geometry(bud, geom_name=f"Bloom_Bud_{idx+1}", node_name=f"Bloom_Bud_{idx+1}")


def create_scene() -> tuple[trimesh.Scene, dict]:
    petal_mat, moss_mat, moss_deep_mat, glow_mat, filament_mat, petal_tex, moss_tex = make_materials()
    scene = trimesh.Scene(base_frame="Slotly_Bloom")

    core = make_uv_organic_core(moss_mat)
    scene.add_geometry(core, geom_name="Bloom_Botanical_Core", node_name="Bloom_Botanical_Core")

    petal_specs = [
        dict(name="Petal_Rear_Crown", height=3.52, width=0.98, azimuth=0.05,
             flare=0.04, base_z=-0.72, cup=0.25, arch_y=0.14, depth_arch=0.12,
             twist=0.06, side_sweep=0.06, side_curve=0.07, edge_lift=0.13,
             tip_curl=-0.035, asym=0.09, phase=0.2, thickness=0.047, rim_roll=0.08),
        dict(name="Petal_Broad_Left_Sweep", height=2.66, width=1.46, azimuth=-0.33,
             flare=0.24, base_z=-0.42, cup=0.33, arch_y=0.36, depth_arch=0.18,
             twist=0.34, side_sweep=-1.10, side_curve=-0.26, edge_lift=0.23,
             tip_curl=0.065, asym=0.17, phase=1.3, thickness=0.046, rim_roll=0.14),
        dict(name="Petal_Right_Opening", height=3.10, width=1.24, azimuth=0.48,
             flare=0.24, base_z=-0.40, cup=0.30, arch_y=0.25, depth_arch=0.17,
             twist=-0.22, side_sweep=0.78, side_curve=0.16, edge_lift=0.19,
             tip_curl=0.03, asym=-0.13, phase=2.4, thickness=0.047, rim_roll=0.12),
        dict(name="Petal_Rear_Side", height=2.72, width=0.90, azimuth=2.05,
             flare=0.16, base_z=-0.72, cup=0.27, arch_y=0.19, depth_arch=0.15,
             twist=0.28, side_sweep=0.26, side_curve=-0.08, edge_lift=0.15,
             tip_curl=-0.04, asym=0.10, phase=4.3, thickness=0.042, rim_roll=0.09),
    ]
    for spec in petal_specs:
        name = spec.pop("name")
        petal = make_petal(name, spec, petal_mat)
        scene.add_geometry(petal, geom_name=name, node_name=name)

    lichen_materials = [
        moss_deep_mat,
        PBRMaterial(name="Bloom_Moss_Mid", baseColorFactor=[70, 91, 42, 255], metallicFactor=0.0, roughnessFactor=0.92),
        PBRMaterial(name="Bloom_Moss_Olive", baseColorFactor=[111, 124, 59, 255], metallicFactor=0.0, roughnessFactor=0.94),
        PBRMaterial(name="Bloom_Lichen_Light", baseColorFactor=[92, 111, 58, 255], metallicFactor=0.0, roughnessFactor=0.93),
    ]
    for name, mesh in make_lichen_cluster_mesh(lichen_materials, count=26):
        scene.add_geometry(mesh, geom_name=name, node_name=name)

    glow_path = []
    for t in np.linspace(0, 1, 34):
        glow_path.append([
            -0.08 + 0.15 * math.sin(math.pi * t),
            0.92 + 0.58 * t,
            0.88 + 0.04 * math.sin(2 * math.pi * t),
        ])
    glow_filament = make_tube(np.asarray(glow_path), radius=0.052, material=glow_mat,
                              sides=10, taper=0.30, name="Bloom_Embedded_Warm_Filament")
    scene.add_geometry(glow_filament, geom_name="Bloom_Embedded_Warm_Filament",
                       node_name="Bloom_Embedded_Warm_Filament")

    add_filaments(scene, filament_mat)

    vein_mat = PBRMaterial(name="Bloom_Petal_Vein_Highlight", baseColorFactor=[203, 205, 174, 255],
                           metallicFactor=0.0, roughnessFactor=0.48, doubleSided=True)
    for idx, (az, start, end, height) in enumerate([
        (-0.92, -0.35, 0.33, 2.25), (0.52, -0.26, 0.38, 2.85),
        (2.72, -0.30, 0.24, 3.12), (1.43, -0.28, 0.27, 2.38)
    ]):
        pts = []
        for t in np.linspace(0, 1, 38):
            u = start * (1 - t) + end * t
            r = 0.29 + 0.34 * (t ** 1.2)
            theta = az + 0.17 * t
            x = r * math.sin(theta) + u * 0.50 * math.cos(theta)
            z = r * math.cos(theta) - u * 0.50 * math.sin(theta)
            y = 0.30 + height * t
            pts.append([x, y, z])
        vein = make_tube(np.asarray(pts), radius=0.009, material=vein_mat, sides=6,
                         taper=0.70, name=f"Bloom_Subtle_Vein_{idx+1}")
        scene.add_geometry(vein, geom_name=f"Bloom_Subtle_Vein_{idx+1}", node_name=f"Bloom_Subtle_Vein_{idx+1}")

    info = {
        "seed": SEED,
        "petal_count": len(petal_specs),
        "major_materials": [m.name for m in [petal_mat, moss_mat, moss_deep_mat, glow_mat, filament_mat]],
        "texture_count": 2,
        "design": "broad translucent sculptural petals around a forest moss core",
    }
    return scene, info


def add_gltf_extensions(glb_path: Path):
    """Add optional glTF material extensions for better Three.js glass rendering."""
    data = glb_path.read_bytes()
    magic, version, total = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF" or version != 2:
        raise RuntimeError("Unexpected GLB header")
    offset = 12
    json_chunk = None
    rest = []
    while offset < len(data):
        length, chunk_type = struct.unpack_from("<I4s", data, offset)
        start = offset + 8
        chunk = data[start:start + length]
        if chunk_type == b"JSON":
            json_chunk = json.loads(chunk.decode("utf-8").rstrip(" \t\r\n\0"))
        else:
            rest.append((chunk_type, chunk))
        offset = start + length
    if json_chunk is None:
        raise RuntimeError("GLB JSON chunk not found")

    extensions = [
        "KHR_materials_transmission",
        "KHR_materials_volume",
        "KHR_materials_ior",
        "KHR_materials_clearcoat",
        "KHR_materials_emissive_strength",
    ]
    existing = json_chunk.get("extensionsUsed", [])
    for ext in extensions:
        if ext not in existing:
            existing.append(ext)
    json_chunk["extensionsUsed"] = existing

    for mat in json_chunk.get("materials", []):
        name = mat.get("name", "")
        ext = mat.setdefault("extensions", {})
        if name == "Bloom_Translucent_Ivory_Petal":
            ext["KHR_materials_transmission"] = {"transmissionFactor": 0.46}
            ext["KHR_materials_volume"] = {
                "thicknessFactor": 0.045,
                "attenuationDistance": 1.35,
                "attenuationColor": [0.77, 0.84, 0.70],
            }
            ext["KHR_materials_ior"] = {"ior": 1.44}
            ext["KHR_materials_clearcoat"] = {"clearcoatFactor": 0.18, "clearcoatRoughnessFactor": 0.28}
        if "Inner_Ivory_Glow" in name or "Inner_Glow" in name:
            ext["KHR_materials_emissive_strength"] = {"emissiveStrength": 2.0}

    json_bytes = json.dumps(json_chunk, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_bytes += b" " * ((4 - len(json_bytes) % 4) % 4)
    chunks = [(b"JSON", json_bytes)] + rest
    out = bytearray(b"glTF" + struct.pack("<II", 2, 0))
    for ctype, chunk in chunks:
        out += struct.pack("<I4s", len(chunk), ctype)
        out += chunk
    struct.pack_into("<I", out, 8, len(out))
    glb_path.write_bytes(out)


def validate_glb(path: Path) -> dict:
    raw = path.read_bytes()
    if raw[:4] != b"glTF":
        raise RuntimeError("Output is not a GLB")
    magic, version, total = struct.unpack_from("<4sII", raw, 0)
    if version != 2 or total != len(raw):
        raise RuntimeError("Invalid GLB header or length")
    scene = trimesh.load(path, force="scene")
    if not scene.geometry:
        raise RuntimeError("GLB contains no geometry")
    node_count = len(scene.graph.nodes_geometry)
    vertex_count = sum(len(g.vertices) for g in scene.geometry.values() if isinstance(g, trimesh.Trimesh))
    face_count = sum(len(g.faces) for g in scene.geometry.values() if isinstance(g, trimesh.Trimesh))
    bounds = scene.bounds
    extents = bounds[1] - bounds[0]
    if not np.all(np.isfinite(bounds)) or np.any(extents <= 0):
        raise RuntimeError("GLB has invalid bounds")
    material_names = sorted({getattr(getattr(g.visual, "material", None), "name", "")
                             for g in scene.geometry.values() if hasattr(g, "visual")})
    offset = 12
    gltf_json = None
    while offset < len(raw):
        length, ctype = struct.unpack_from("<I4s", raw, offset)
        chunk = raw[offset + 8:offset + 8 + length]
        if ctype == b"JSON":
            gltf_json = json.loads(chunk.decode("utf8").rstrip(" \t\r\n\0"))
            break
        offset += 8 + length
    texture_count = len(gltf_json.get("images", [])) if gltf_json else 0
    used = gltf_json.get("extensionsUsed", []) if gltf_json else []
    non_watertight = [name for name, geom in scene.geometry.items()
                      if isinstance(geom, trimesh.Trimesh) and not geom.is_watertight]
    inconsistent = [name for name, geom in scene.geometry.items()
                    if isinstance(geom, trimesh.Trimesh) and not geom.is_winding_consistent]
    return {
        "file": str(path), "bytes": len(raw), "nodes_with_geometry": node_count,
        "geometry_objects": len(scene.geometry), "vertices": vertex_count,
        "triangles": face_count, "bounds": bounds.tolist(), "extents": extents.tolist(),
        "materials": material_names, "embedded_images": texture_count,
        "gltf_extensions_used": used,
        "non_watertight_meshes": non_watertight,
        "inconsistent_winding_meshes": inconsistent,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="./slotly_bloom_output")
    args = parser.parse_args()
    out = Path(args.output_dir).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    scene, info = create_scene()
    glb_path = out / "slotly_bloom.glb"
    exported = scene.export(file_type="glb")
    glb_path.write_bytes(exported)
    add_gltf_extensions(glb_path)

    for geom in scene.geometry.values():
        mat = getattr(getattr(geom, "visual", None), "material", None)
        if mat is not None and getattr(mat, "baseColorTexture", None) is not None:
            if mat.name == "Bloom_Translucent_Ivory_Petal":
                mat.baseColorTexture.save(out / "bloom_petal_texture.png")
            elif mat.name == "Bloom_Forest_Moss_Lichen":
                mat.baseColorTexture.save(out / "bloom_moss_texture.png")

    report = validate_glb(glb_path)
    report.update(info)
    (out / "validation_report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    print(f"\nGLB: {glb_path}")
    print(f"Output directory: {out}")


if __name__ == "__main__":
    main()
