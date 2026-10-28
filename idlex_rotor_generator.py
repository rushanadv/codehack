#!/usr/bin/env python3
"""
IdleX Resource Rotor — Procedural CAD & Web Asset Generator for Blender
========================================================================
Generates a precision threefold-symmetric rounded triangular rotor sculpture:
  1. Web Version (`idlex-resource-rotor.glb`)
     - Centered at world origin (0, 0, 0) on the exact 3-fold rotational
       symmetry axis (X = 0, Y = 0) and vertical midpoint (Z: -70.0 -> +70.0 mm)
       for wobble-free Three.js vertical-axis rotation.
     - Multi-material PBR setup: Machined Dark Graphite, Brushed Titanium,
       and Anodized Slate Metallic panels.
     - Distinct 120-degree relief motifs:
         * Face 1 (Property & Spaces): Stepped modernist architectural skyline & portal
         * Face 2 (Physical Assets): 8-tooth precision gear, bearing hub & dual torque struts
         * Face 3 (Digital & Tech): Silicon IC die package, 45-deg data buses & logic nodes

  2. Print Version (`idlex-resource-rotor.stl`)
     - Millimeter-accurate solid resting flat on Z = 0.0 mm (Z: 0.0 -> 140.0 mm).
     - Core body cross-section: ~105.8 mm (X) x 97.0 mm (Y); full relief envelope:
       ~108.3 mm (X) x ~102.6 mm (Y) x 140.0 mm (Z).
     - All relief features built as 45-degree chamfered frustums (support-free FDM/SLA)
       and Boolean-unioned (`EXACT` solver) into a single watertight manifold mesh.
     - Validated via BMesh topological & dimensional checks prior to STL export.

Compatible with Blender 3.6 LTS, 4.0, 4.1, 4.2 LTS, 4.3, and 4.4+.
"""

import os
import sys
import math
import struct
import bpy
import bmesh
from mathutils import Vector, Matrix


# ==============================================================================
# 1. CONFIGURATION & DIMENSIONAL CONSTANTS (MILLIMETERS)
# ==============================================================================

OUTPUT_DIR = os.path.expanduser(
    os.environ.get("IDLEX_OUTPUT_DIR", "~/Desktop/IdleX-Rotor")
)

EXPORT_FILENAMES = {
    "glb": "idlex-resource-rotor.glb",
    "stl": "idlex-resource-rotor.stl",
    "blend": "idlex-resource-rotor.blend",
    "preview": "idlex-resource-rotor-preview.png",
}

# Primary physical dimensions (1 Blender Unit = 1.0 mm with scale_length = 0.001)
ROTOR_HEIGHT_MM = 140.0          # Exact overall height (Z: 0.0 -> 140.0 mm)
TRIANGLE_RADIUS_MM = 38.0        # Core equilateral triangle vertex radius
CORNER_FILLET_MM = 20.0          # Rounded vertical edge radius
# Resulting flat-face apothem = 0.5 * 38.0 + 20.0 = 39.0 mm
# Resulting flat-face width   = sqrt(3) * 38.0    = 65.82 mm
# Resulting core X-span width = 65.82 + 2 * 20.0  = 105.82 mm (~108.3 mm with reliefs)

FACE_APOTHEM_MM = 0.5 * TRIANGLE_RADIUS_MM + CORNER_FILLET_MM  # 39.0 mm
FACE_CENTER_Z_MM = 70.0          # Vertical midpoint of the three relief panels

# Threefold rotational symmetry angles (separated by exactly 120 degrees)
# Face 1 (-90 deg / Front -Y), Face 2 (+30 deg), Face 3 (+150 deg)
FACE_NORMAL_ANGLES_DEG = (-90.0, 30.0, 150.0)
CORNER_VERTEX_ANGLES_DEG = (90.0, 210.0, 330.0)

# Cross-section resolution
CORNER_ARC_SEGMENTS = 24         # Segments per 120-deg rounded corner
FLAT_FACE_SEGMENTS = 14          # Segments across each flat face


# ==============================================================================
# 2. SCENE RESET & METRIC UNIT CONFIGURATION
# ==============================================================================

def reset_scene_and_configure_units():
    """Clears all existing objects/data blocks and sets up millimeter metric units."""
    bpy.ops.wm.read_factory_settings(use_empty=True)

    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 0.001  # 1 Blender Unit = 1 Millimeter
    scene.unit_settings.length_unit = 'MILLIMETERS'

    # Ensure orphan data blocks are purged
    for block_collection in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.lights,
        bpy.data.cameras,
        bpy.data.collections,
    ):
        for block in list(block_collection):
            block_collection.remove(block)

    return scene


def get_or_create_collection(name, parent_collection=None):
    """Creates a named collection and links it to the scene or parent collection."""
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    col = bpy.data.collections.new(name)
    if parent_collection is None:
        bpy.context.scene.collection.children.link(col)
    else:
        parent_collection.children.link(col)
    return col


# ==============================================================================
# 3. PBR MATERIALS (BLENDER 3.x & 4.x COMPATIBLE)
# ==============================================================================

def set_bsdf_socket(bsdf, socket_names, value):
    """Safely assigns a Principled BSDF input across Blender 3.x and 4.x."""
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = value
            return True
    return False


def create_pbr_materials():
    """Creates the three industrial PBR materials for the Web GLB version."""
    materials = {}

    # 1. Dark Machined Graphite (Main Rotor Body)
    mat_graphite = bpy.data.materials.new(name="MAT_IdleX_Dark_Graphite")
    mat_graphite.use_nodes = True
    bsdf_g = mat_graphite.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        set_bsdf_socket(bsdf_g, ["Base Color"], (0.055, 0.058, 0.064, 1.0))
        set_bsdf_socket(bsdf_g, ["Metallic"], 0.82)
        set_bsdf_socket(bsdf_g, ["Roughness"], 0.36)
        set_bsdf_socket(bsdf_g, ["Specular IOR Level", "Specular"], 0.55)
    materials["graphite"] = mat_graphite

    # 2. Brushed Titanium (Relief Motifs, Bezel Frames, Corner Accents & Crown Collar)
    mat_titanium = bpy.data.materials.new(name="MAT_IdleX_Brushed_Titanium")
    mat_titanium.use_nodes = True
    bsdf_t = mat_titanium.node_tree.nodes.get("Principled BSDF")
    if bsdf_t:
        set_bsdf_socket(bsdf_t, ["Base Color"], (0.64, 0.66, 0.69, 1.0))
        set_bsdf_socket(bsdf_t, ["Metallic"], 0.94)
        set_bsdf_socket(bsdf_t, ["Roughness"], 0.22)
        set_bsdf_socket(bsdf_t, ["Anisotropic"], 0.35)
        set_bsdf_socket(bsdf_t, ["Specular IOR Level", "Specular"], 0.70)
    materials["titanium"] = mat_titanium

    # 3. Anodized Slate Metallic (Recessed Face Panel Backing)
    mat_slate = bpy.data.materials.new(name="MAT_IdleX_Anodized_Slate_Panel")
    mat_slate.use_nodes = True
    bsdf_s = mat_slate.node_tree.nodes.get("Principled BSDF")
    if bsdf_s:
        set_bsdf_socket(bsdf_s, ["Base Color"], (0.11, 0.125, 0.145, 1.0))
        set_bsdf_socket(bsdf_s, ["Metallic"], 0.88)
        set_bsdf_socket(bsdf_s, ["Roughness"], 0.28)
    materials["slate"] = mat_slate

    return materials


# ==============================================================================
# 4. MATHEMATICAL CROSS-SECTION & BEVELED PRISM ENGINE
# ==============================================================================

def compute_rounded_triangle_ring(scale_xy=1.0, z_mm=0.0):
    """
    Computes a 2D/3D counter-clockwise ring of vertices representing the
    Minkowski sum of an equilateral triangle (radius R_t) and a circle (radius R_f)
    centered on the 3-fold rotational symmetry axis (X = 0, Y = 0).
    This produces three truly planar faces separated by 120 degrees and three
    smoothly rounded cylindrical corners.
    """
    rt = TRIANGLE_RADIUS_MM * scale_xy
    rf = CORNER_FILLET_MM * scale_xy

    # Corner centers at 90, 210, 330 degrees
    corners = []
    for deg in CORNER_VERTEX_ANGLES_DEG:
        rad = math.radians(deg)
        corners.append((rt * math.cos(rad), rt * math.sin(rad), deg))

    ring_points = []
    for idx in range(3):
        cx, cy, c_deg = corners[idx]
        next_cx, next_cy, next_deg = corners[(idx + 1) % 3]

        # 1. Corner circular arc sweeping 120 degrees: [c_deg - 60, c_deg + 60]
        start_deg = c_deg - 60.0
        end_deg = c_deg + 60.0
        for s in range(CORNER_ARC_SEGMENTS):
            t = s / float(CORNER_ARC_SEGMENTS)
            ang = math.radians(start_deg + t * (end_deg - start_deg))
            px = cx + rf * math.cos(ang)
            py = cy + rf * math.sin(ang)
            ring_points.append(Vector((px, py, z_mm)))

        # 2. Planar face segment connecting end of corner `idx` to start of corner `idx+1`
        end_rad = math.radians(end_deg)
        p0 = Vector((cx + rf * math.cos(end_rad), cy + rf * math.sin(end_rad), z_mm))
        p1 = Vector((next_cx + rf * math.cos(end_rad), next_cy + rf * math.sin(end_rad), z_mm))

        for s in range(FLAT_FACE_SEGMENTS):
            t = s / float(FLAT_FACE_SEGMENTS)
            ring_points.append(p0.lerp(p1, t))

    return ring_points


def create_rotor_core_bmesh():
    """
    Constructs the solid 140 mm main rotor body as a single watertight manifold BMesh.
    Includes:
      - Anti-elephant-foot bottom chamfer (Z = 0 -> 2 mm)
      - Stable integrated pedestal collar (Z = 2 -> 8.5 mm)
      - 45-degree printable neck transition (Z = 8.5 -> 16.5 mm)
      - Full-width rounded triangular body (Z = 16.5 -> 124 mm)
      - Multi-step bevelled top crown & titanium collar (Z = 124 -> 140 mm)
    """
    bm = bmesh.new()

    # Define vertical loft stations: (z_mm, scale_xy, material_index)
    # material_index: 0 = Dark Graphite, 1 = Brushed Titanium
    loft_stations = [
        (0.0,   0.890, 0),  # Flat build-plate base (width ~94.2 mm)
        (2.0,   0.920, 0),  # 45-deg bottom chamfer
        (8.5,   0.920, 0),  # Integrated base collar
        (10.5,  0.885, 1),  # Precision recessed titanium neck ring
        (12.5,  0.885, 1),  # Neck ring top
        (16.5,  1.000, 0),  # 45-deg flare out to full rotor body
        (24.0,  1.000, 0),  # Lower body station
        (116.0, 1.000, 0),  # Upper body station
        (124.0, 1.000, 0),  # Top of main vertical faces
        (131.0, 0.855, 0),  # Primary upper bevel (45-deg printable slope)
        (132.5, 0.820, 1),  # Upper titanium accent collar start
        (135.5, 0.790, 1),  # Upper titanium accent collar end
        (139.0, 0.700, 0),  # Crown top bevel
        (140.0, 0.650, 0),  # Top flat crown rim (exact Z = 140.0 mm)
        (140.0, 0.420, 1),  # Inner crown titanium ring at Z = 140.0 mm
    ]

    rings_verts = []
    for z_mm, scale_xy, _ in loft_stations:
        pts = compute_rounded_triangle_ring(scale_xy=scale_xy, z_mm=z_mm)
        ring_v = [bm.verts.new(pt) for pt in pts]
        rings_verts.append(ring_v)

    bm.verts.ensure_lookup_table()
    ring_len = len(rings_verts[0])

    # Bridge consecutive rings with quad faces
    for r_idx in range(len(loft_stations) - 1):
        ring_a = rings_verts[r_idx]
        ring_b = rings_verts[r_idx + 1]
        mat_idx = loft_stations[r_idx][2]

        for i in range(ring_len):
            i_next = (i + 1) % ring_len
            f = bm.faces.new((ring_a[i], ring_a[i_next], ring_b[i_next], ring_b[i]))
            f.material_index = mat_idx
            f.smooth = True

    # Cap bottom at Z = 0.0 mm (strictly planar for 3D printing bed adhesion)
    bottom_center = bm.verts.new(Vector((0.0, 0.0, 0.0)))
    bottom_ring = rings_verts[0]
    for i in range(ring_len):
        i_next = (i + 1) % ring_len
        f = bm.faces.new((bottom_ring[i_next], bottom_ring[i], bottom_center))
        f.material_index = 0
        f.smooth = False

    # Cap top at Z = 140.0 mm
    top_center = bm.verts.new(Vector((0.0, 0.0, ROTOR_HEIGHT_MM)))
    top_ring = rings_verts[-1]
    for i in range(ring_len):
        i_next = (i + 1) % ring_len
        f = bm.faces.new((top_ring[i], top_ring[i_next], top_center))
        f.material_index = 1
        f.smooth = False

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def inset_convex_polygon_2d(poly_uv, inset_dist):
    """
    Computes an inward-offset 2D polygon for a counter-clockwise convex/star-convex
    polygon `poly_uv` so every relief feature has clean 45-degree beveled edges.
    """
    n = len(poly_uv)
    inset_pts = []
    for i in range(n):
        p_prev = Vector(poly_uv[(i - 1) % n])
        p_curr = Vector(poly_uv[i])
        p_next = Vector(poly_uv[(i + 1) % n])

        v1 = (p_curr - p_prev)
        v2 = (p_next - p_curr)
        if v1.length > 1e-6:
            v1.normalize()
        if v2.length > 1e-6:
            v2.normalize()

        # Inward unit normals for CCW polygon
        n1 = Vector((-v1.y, v1.x))
        n2 = Vector((-v2.y, v2.x))

        denom = 1.0 + n1.dot(n2)
        if denom < 0.25:
            bisector = (n1 + n2).normalized() * 2.0
        else:
            bisector = (n1 + n2) / denom

        # Clamp inset to avoid self-intersection on narrow features
        inset_pts.append(p_curr + bisector * inset_dist)

    return inset_pts


def get_face_transform_vectors(face_angle_deg):
    """
    Returns the local orthonormal coordinate frame (origin, u_axis, v_axis, n_axis)
    on a flat rotor face at `face_angle_deg`.
      - origin: center point on the flat face at (apothem = 39.0 mm, Z = 70.0 mm)
      - u_axis: horizontal tangent across the face
      - v_axis: vertical +Z axis up the face
      - n_axis: outward surface normal
    """
    phi = math.radians(face_angle_deg)
    n_axis = Vector((math.cos(phi), math.sin(phi), 0.0))
    u_axis = Vector((-math.sin(phi), math.cos(phi), 0.0))
    v_axis = Vector((0.0, 0.0, 1.0))
    origin = n_axis * FACE_APOTHEM_MM + Vector((0.0, 0.0, FACE_CENTER_Z_MM))
    return origin, u_axis, v_axis, n_axis


def add_beveled_prism_to_bmesh(
    bm,
    poly_uv,
    face_angle_deg,
    n_back=-1.2,
    n_front=2.8,
    bevel_size=0.75,
    material_index=1,
):
    """
    Appends a closed, manifold, 45-degree beveled 3D prism to `bm` from a CCW 2D
    polygon `poly_uv` in the local (u, v, n) coordinate frame of a rotor face.
      - Back face sits at `n_back` (negative = embedded inside the solid rotor body)
      - Shoulder ring sits at `n_front - bevel_size`
      - Front face sits at `n_front` inset by `bevel_size`
    Every generated prism is strictly watertight with zero n-gons.
    """
    origin, u_axis, v_axis, n_axis = get_face_transform_vectors(face_angle_deg)

    # Ensure polygon is oriented counter-clockwise in (u, v)
    area2 = 0.0
    m = len(poly_uv)
    for i in range(m):
        u1, v1 = poly_uv[i]
        u2, v2 = poly_uv[(i + 1) % m]
        area2 += (u1 * v2 - u2 * v1)
    if area2 < 0.0:
        poly_uv = list(reversed(poly_uv))

    # Compute outward-flared back polygon (for 45-deg draft base) and inset front polygon
    poly_back = inset_convex_polygon_2d(poly_uv, -0.35)
    poly_shoulder = [Vector(p) for p in poly_uv]
    poly_front = inset_convex_polygon_2d(poly_uv, bevel_size)

    def to_world(pt_uv, n_depth):
        return origin + u_axis * pt_uv.x + v_axis * pt_uv.y + n_axis * n_depth

    n_shoulder = n_front - bevel_size
    verts_back = [bm.verts.new(to_world(p, n_back)) for p in poly_back]
    verts_shoulder = [bm.verts.new(to_world(p, n_shoulder)) for p in poly_shoulder]
    verts_front = [bm.verts.new(to_world(p, n_front)) for p in poly_front]

    # Centroids for clean triangle fan caps (zero n-gons)
    c_back_uv = sum(poly_back, Vector((0.0, 0.0))) / float(m)
    c_front_uv = sum(poly_front, Vector((0.0, 0.0))) / float(m)
    v_center_back = bm.verts.new(to_world(c_back_uv, n_back))
    v_center_front = bm.verts.new(to_world(c_front_uv, n_front))

    for i in range(m):
        i_next = (i + 1) % m

        # Side walls (back -> shoulder)
        f_side = bm.faces.new((
            verts_back[i],
            verts_back[i_next],
            verts_shoulder[i_next],
            verts_shoulder[i],
        ))
        f_side.material_index = material_index

        # 45-degree front chamfer (shoulder -> front)
        f_chamfer = bm.faces.new((
            verts_shoulder[i],
            verts_shoulder[i_next],
            verts_front[i_next],
            verts_front[i],
        ))
        f_chamfer.material_index = material_index

        # Front cap triangle
        f_front = bm.faces.new((
            verts_front[i],
            verts_front[i_next],
            v_center_front,
        ))
        f_front.material_index = material_index

        # Back cap triangle (reversed winding so normal points -n_axis)
        f_back = bm.faces.new((
            verts_back[i_next],
            verts_back[i],
            v_center_back,
        ))
        f_back.material_index = material_index


# ==============================================================================
# 5. GEOMETRIC PRIMITIVE HELPERS FOR FACE RELIEFS
# ==============================================================================

def poly_chamfered_rect(cx, cy, w, h, ch=1.5):
    """Returns a CCW 8-vertex chamfered rectangle centered at (cx, cy)."""
    hw, hh = 0.5 * w, 0.5 * h
    c = min(ch, hw * 0.45, hh * 0.45)
    if c <= 1e-4:
        return [
            (cx - hw, cy - hh),
            (cx + hw, cy - hh),
            (cx + hw, cy + hh),
            (cx - hw, cy + hh),
        ]
    return [
        (cx - hw + c, cy - hh),
        (cx + hw - c, cy - hh),
        (cx + hw,     cy - hh + c),
        (cx + hw,     cy + hh - c),
        (cx + hw - c, cy + hh),
        (cx - hw + c, cy + hh),
        (cx - hw,     cy + hh - c),
        (cx - hw,     cy - hh + c),
    ]


def poly_regular_ngon(cx, cy, radius, sides=16, phase_deg=0.0):
    """Returns a CCW regular n-gon centered at (cx, cy)."""
    pts = []
    for i in range(sides):
        ang = math.radians(phase_deg + i * (360.0 / sides))
        pts.append((cx + radius * math.cos(ang), cy + radius * math.sin(ang)))
    return pts


def poly_thick_segment(p0, p1, width):
    """Returns a CCW 8-vertex pointed/chamfered trace bar between 2D points p0 and p1."""
    v0 = Vector(p0)
    v1 = Vector(p1)
    d = (v1 - v0)
    length = d.length
    if length < 1e-5:
        return poly_regular_ngon(v0.x, v0.y, width * 0.5, sides=8)
    t = d / length
    n = Vector((-t.y, t.x))
    hw = 0.5 * width
    return [
        tuple(v0 - t * (hw * 0.4) - n * (hw * 0.6)),
        tuple(v0 + n * (-hw)),
        tuple(v1 + n * (-hw)),
        tuple(v1 + t * (hw * 0.4) - n * (hw * 0.6)),
        tuple(v1 + t * (hw * 0.4) + n * (hw * 0.6)),
        tuple(v1 + n * hw),
        tuple(v0 + n * hw),
        tuple(v0 - t * (hw * 0.4) + n * (hw * 0.6)),
    ]


# ==============================================================================
# 6. THE THREE DISTINCT CATEGORY RELIEF GENERATORS & PANEL FRAMES
# ==============================================================================

def build_face_panel_frame_bmesh(face_angle_deg, include_slate_backing=False):
    """
    Creates the precision octagonal bezel frame surrounding a rotor face panel.
    Outer dimensions: 50 mm wide x 92 mm tall.
    """
    bm = bmesh.new()

    # Optional slate metallic backing plate for the Web version
    if include_slate_backing:
        backing_poly = poly_chamfered_rect(0.0, 0.0, 46.0, 88.0, ch=6.0)
        add_beveled_prism_to_bmesh(
            bm,
            backing_poly,
            face_angle_deg,
            n_back=-0.8,
            n_front=0.55,
            bevel_size=0.35,
            material_index=2,  # Slate metallic panel
        )

    # Four overlapping beveled frame rails (staggered depths avoid coplanar boolean faces)
    # Left & Right vertical frame rails
    for sign, n_b, n_f in ((-1.0, -1.15, 1.55), (1.0, -1.20, 1.55)):
        rail_v = poly_chamfered_rect(sign * 22.5, 0.0, 4.6, 86.0, ch=1.4)
        add_beveled_prism_to_bmesh(
            bm, rail_v, face_angle_deg,
            n_back=n_b, n_front=n_f, bevel_size=0.60, material_index=1
        )

    # Top & Bottom horizontal header/footer bars
    for sign, n_b, n_f in ((-1.0, -1.35, 1.85), (1.0, -1.40, 1.85)):
        rail_h = poly_chamfered_rect(0.0, sign * 43.0, 49.6, 5.2, ch=1.6)
        add_beveled_prism_to_bmesh(
            bm, rail_h, face_angle_deg,
            n_back=n_b, n_front=n_f, bevel_size=0.65, material_index=1
        )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def build_motif_property_spaces_bmesh(face_angle_deg):
    """
    FACE 1 — PROPERTY & SPACES (Architectural Skyline & Structural Portal Relief)
    Composed of bold, stepped modernist building masses, an angled atrium wing,
    a central high-rise spire, and a deep architectural portal arch.
    """
    bm = bmesh.new()

    # 1. Architectural Foundation Plinth
    plinth = poly_chamfered_rect(0.0, -31.0, 34.0, 6.2, ch=1.2)
    add_beveled_prism_to_bmesh(
        bm, plinth, face_angle_deg,
        n_back=-1.10, n_front=2.70, bevel_size=0.70, material_index=1
    )

    # 2. Left Stepped Mid-Rise Wing (with angled modernist roof)
    left_wing = [
        (-15.5, -29.0),
        (-5.0,  -29.0),
        (-5.0,   14.5),
        (-15.5,   8.5),
    ]
    add_beveled_prism_to_bmesh(
        bm, left_wing, face_angle_deg,
        n_back=-1.25, n_front=2.30, bevel_size=0.65, material_index=1
    )

    # 3. Right Cantilevered Atrium Tower (with sloped crown)
    right_wing = [
        (5.0,  -29.0),
        (15.5, -29.0),
        (15.5,  15.0),
        (5.0,   21.5),
    ]
    add_beveled_prism_to_bmesh(
        bm, right_wing, face_angle_deg,
        n_back=-1.30, n_front=2.35, bevel_size=0.65, material_index=1
    )

    # 4. Central High-Rise Monolith Tower (pointed architectural crown)
    central_tower = [
        (-6.8, -29.0),
        ( 6.8, -29.0),
        ( 6.8,  30.0),
        ( 0.0,  35.5),
        (-6.8,  30.0),
    ]
    add_beveled_prism_to_bmesh(
        bm, central_tower, face_angle_deg,
        n_back=-1.45, n_front=3.20, bevel_size=0.75, material_index=1
    )

    # 5. Upper Structural Spine / Spire Fin on Central Tower
    spire_fin = poly_chamfered_rect(0.0, 12.0, 4.4, 34.0, ch=1.0)
    add_beveled_prism_to_bmesh(
        bm, spire_fin, face_angle_deg,
        n_back=-1.55, n_front=3.85, bevel_size=0.65, material_index=1
    )

    # 6. Lower Structural Portal Columns & Lintel Span
    for sign, nb in ((-1.0, -1.60), (1.0, -1.65)):
        col = poly_chamfered_rect(sign * 8.2, -19.0, 4.6, 19.0, ch=0.9)
        add_beveled_prism_to_bmesh(
            bm, col, face_angle_deg,
            n_back=nb, n_front=3.65, bevel_size=0.65, material_index=1
        )

    lintel = poly_chamfered_rect(0.0, -9.5, 22.0, 5.0, ch=1.1)
    add_beveled_prism_to_bmesh(
        bm, lintel, face_angle_deg,
        n_back=-1.75, n_front=3.95, bevel_size=0.70, material_index=1
    )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def build_motif_physical_assets_bmesh(face_angle_deg):
    """
    FACE 2 — PHYSICAL ASSETS (Precision Gear, Bearing Hub & Mechanical Actuator Relief)
    Composed of an 8-tooth involute-style industrial gear wheel, raised hexagonal
    bearing hub, dual connecting torque struts, and lower crank pivot boss.
    """
    bm = bmesh.new()
    gear_cy = 5.5

    # 1. Dual Vertical Connecting Torque Struts (linking gear to lower pivot)
    for sign, nb in ((-1.0, -1.10), (1.0, -1.15)):
        strut = poly_chamfered_rect(sign * 5.4, -9.5, 4.5, 28.0, ch=0.9)
        add_beveled_prism_to_bmesh(
            bm, strut, face_angle_deg,
            n_back=nb, n_front=2.25, bevel_size=0.60, material_index=1
        )

    # 2. Primary Gear Wheel Core Disc
    gear_disc = poly_regular_ngon(0.0, gear_cy, radius=13.2, sides=24, phase_deg=7.5)
    add_beveled_prism_to_bmesh(
        bm, gear_disc, face_angle_deg,
        n_back=-1.25, n_front=2.85, bevel_size=0.70, material_index=1
    )

    # 3. Eight Precision Trapezoidal Gear Teeth
    r_inner = 10.8
    r_outer = 17.4
    half_ang_base = math.radians(13.0)
    half_ang_tip = math.radians(8.2)

    for k in range(8):
        theta = math.radians(k * 45.0)
        t_poly = [
            (r_inner * math.cos(theta - half_ang_base), gear_cy + r_inner * math.sin(theta - half_ang_base)),
            (r_outer * math.cos(theta - half_ang_tip),  gear_cy + r_outer * math.sin(theta - half_ang_tip)),
            (r_outer * math.cos(theta + half_ang_tip),  gear_cy + r_outer * math.sin(theta + half_ang_tip)),
            (r_inner * math.cos(theta + half_ang_base), gear_cy + r_inner * math.sin(theta + half_ang_base)),
        ]
        add_beveled_prism_to_bmesh(
            bm, t_poly, face_angle_deg,
            n_back=-1.35 - 0.02 * k, n_front=3.05, bevel_size=0.65, material_index=1
        )

    # 4. Central Hexagonal Bearing Boss & Drive Axle Pin
    hex_boss = poly_regular_ngon(0.0, gear_cy, radius=8.2, sides=6, phase_deg=30.0)
    add_beveled_prism_to_bmesh(
        bm, hex_boss, face_angle_deg,
        n_back=-1.60, n_front=3.60, bevel_size=0.70, material_index=1
    )

    axle_pin = poly_regular_ngon(0.0, gear_cy, radius=4.2, sides=12, phase_deg=0.0)
    add_beveled_prism_to_bmesh(
        bm, axle_pin, face_angle_deg,
        n_back=-1.75, n_front=4.10, bevel_size=0.60, material_index=1
    )

    # 5. Lower Crank Pivot Boss & Pin
    crank_cy = -23.5
    crank_boss = poly_regular_ngon(0.0, crank_cy, radius=9.0, sides=20, phase_deg=9.0)
    add_beveled_prism_to_bmesh(
        bm, crank_boss, face_angle_deg,
        n_back=-1.45, n_front=2.95, bevel_size=0.70, material_index=1
    )

    crank_pin = poly_regular_ngon(0.0, crank_cy, radius=4.5, sides=12, phase_deg=15.0)
    add_beveled_prism_to_bmesh(
        bm, crank_pin, face_angle_deg,
        n_back=-1.65, n_front=3.65, bevel_size=0.60, material_index=1
    )

    # 6. Upper Precision Caliper / Stabilizer Bridge
    upper_yoke = poly_chamfered_rect(0.0, 29.5, 22.0, 5.2, ch=1.5)
    add_beveled_prism_to_bmesh(
        bm, upper_yoke, face_angle_deg,
        n_back=-1.50, n_front=2.65, bevel_size=0.65, material_index=1
    )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def build_motif_digital_tech_bmesh(face_angle_deg):
    """
    FACE 3 — DIGITAL & TECH (Microchip Die, Bus Traces & Logic Nodes Relief)
    Composed of a central chamfered IC package, raised silicon core die, lateral
    contact leads, 45-degree routed data bus bars, and octagonal I/O nodes.
    """
    bm = bmesh.new()

    # 1. Central IC Package Substrate (20 x 20 mm chamfered square)
    ic_pkg = poly_chamfered_rect(0.0, 0.0, 20.0, 20.0, ch=2.8)
    add_beveled_prism_to_bmesh(
        bm, ic_pkg, face_angle_deg,
        n_back=-1.20, n_front=2.85, bevel_size=0.70, material_index=1
    )

    # 2. Raised Inner Silicon Die & Central Logic Core
    ic_die = poly_chamfered_rect(0.0, 0.0, 11.6, 11.6, ch=1.6)
    add_beveled_prism_to_bmesh(
        bm, ic_die, face_angle_deg,
        n_back=-1.45, n_front=3.55, bevel_size=0.65, material_index=1
    )

    ic_core = poly_chamfered_rect(0.0, 0.0, 5.6, 5.6, ch=0.9)
    add_beveled_prism_to_bmesh(
        bm, ic_core, face_angle_deg,
        n_back=-1.65, n_front=4.05, bevel_size=0.55, material_index=1
    )

    # 3. Lateral IC Contact Lead Pads (3 Left, 3 Right)
    idx_counter = 0
    for side_sign in (-1.0, 1.0):
        for v_pos in (-6.2, 0.0, 6.2):
            idx_counter += 1
            lead = poly_chamfered_rect(side_sign * 12.6, v_pos, 8.2, 3.6, ch=0.7)
            add_beveled_prism_to_bmesh(
                bm, lead, face_angle_deg,
                n_back=-1.05 - 0.02 * idx_counter,
                n_front=2.25,
                bevel_size=0.55,
                material_index=1,
            )

    # 4. Central Vertical Data Bus Traces & Terminal I/O Nodes (Top & Bottom)
    for v_sign, nb in ((1.0, -1.12), (-1.0, -1.16)):
        v_bus = poly_chamfered_rect(0.0, v_sign * 19.0, 4.0, 20.0, ch=0.8)
        add_beveled_prism_to_bmesh(
            bm, v_bus, face_angle_deg,
            n_back=nb, n_front=2.35, bevel_size=0.55, material_index=1
        )
        node_center = poly_regular_ngon(0.0, v_sign * 30.5, radius=4.5, sides=8, phase_deg=22.5)
        add_beveled_prism_to_bmesh(
            bm, node_center, face_angle_deg,
            n_back=nb - 0.3, n_front=3.20, bevel_size=0.65, material_index=1
        )

    # 5. Four 45-Degree Diagonal Signal Bus Traces & Corner Logic Nodes
    diag_idx = 0
    for u_sign in (-1.0, 1.0):
        for v_sign in (-1.0, 1.0):
            diag_idx += 1
            p_start = (u_sign * 5.8, v_sign * 8.5)
            p_end = (u_sign * 11.5, v_sign * 25.0)
            trace_poly = poly_thick_segment(p_start, p_end, width=3.8)
            add_beveled_prism_to_bmesh(
                bm, trace_poly, face_angle_deg,
                n_back=-1.02 - 0.03 * diag_idx,
                n_front=2.30,
                bevel_size=0.55,
                material_index=1,
            )

            corner_node = poly_regular_ngon(
                u_sign * 11.5, v_sign * 26.2, radius=4.1, sides=8, phase_deg=22.5
            )
            add_beveled_prism_to_bmesh(
                bm, corner_node, face_angle_deg,
                n_back=-1.50 - 0.03 * diag_idx,
                n_front=3.10,
                bevel_size=0.60,
                material_index=1,
            )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def build_corner_titanium_flutes_bmesh():
    """
    Creates three sleek brushed-titanium vertical accent ribs along the three
    rounded corners (90, 210, 330 deg) to accentuate the threefold symmetry.
    """
    bm = bmesh.new()
    corner_apex_radius = TRIANGLE_RADIUS_MM + CORNER_FILLET_MM  # 58.0 mm

    for c_deg in CORNER_VERTEX_ANGLES_DEG:
        phi = math.radians(c_deg)
        n_axis = Vector((math.cos(phi), math.sin(phi), 0.0))
        u_axis = Vector((-math.sin(phi), math.cos(phi), 0.0))
        v_axis = Vector((0.0, 0.0, 1.0))
        origin = n_axis * corner_apex_radius + Vector((0.0, 0.0, FACE_CENTER_Z_MM))

        poly_uv = poly_chamfered_rect(0.0, 0.0, 7.2, 86.0, ch=2.8)
        poly_back = inset_convex_polygon_2d(poly_uv, -0.4)
        poly_shoulder = [Vector(p) for p in poly_uv]
        poly_front = inset_convex_polygon_2d(poly_uv, 1.1)

        def to_world(pt_uv, n_depth):
            return origin + u_axis * pt_uv.x + v_axis * pt_uv.y + n_axis * n_depth

        m = len(poly_uv)
        v_back = [bm.verts.new(to_world(p, -2.2)) for p in poly_back]
        v_sh = [bm.verts.new(to_world(p, 0.35)) for p in poly_shoulder]
        v_fr = [bm.verts.new(to_world(p, 1.45)) for p in poly_front]

        vc_back = bm.verts.new(to_world(Vector((0.0, 0.0)), -2.2))
        vc_fr = bm.verts.new(to_world(Vector((0.0, 0.0)), 1.45))

        for i in range(m):
            i_next = (i + 1) % m
            for quad in (
                (v_back[i], v_back[i_next], v_sh[i_next], v_sh[i]),
                (v_sh[i], v_sh[i_next], v_fr[i_next], v_fr[i]),
                (v_fr[i], v_fr[i_next], vc_fr),
                (v_back[i_next], v_back[i], vc_back),
            ):
                f = bm.faces.new(quad)
                f.material_index = 1

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


# ==============================================================================
# 7. OBJECT CREATION, SHADING & BOOLEAN ASSEMBLY
# ==============================================================================

def bmesh_to_object(bm, obj_name, collection, materials_list=None, z_offset=0.0):
    """
    Converts a BMesh into a Blender Mesh Object with its object origin pinned at
    world (0.0, 0.0, 0.0), shifts vertex Z coordinates if requested, and assigns materials.
    """
    if abs(z_offset) > 1e-6:
        bmesh.ops.translate(bm, verts=bm.verts, vec=Vector((0.0, 0.0, z_offset)))

    mesh = bpy.data.meshes.new(obj_name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()

    if materials_list:
        for mat in materials_list:
            mesh.materials.append(mat)

    obj = bpy.data.objects.new(obj_name, mesh)
    obj.location = Vector((0.0, 0.0, 0.0))
    obj.rotation_euler = (0.0, 0.0, 0.0)
    obj.scale = Vector((1.0, 1.0, 1.0))
    collection.objects.link(obj)
    return obj


def apply_crisp_web_normals(obj, angle_deg=32.0):
    """
    Applies clean sharp/smooth shading for the Web GLB objects across both
    Blender 3.x and Blender 4.x+ by splitting sharp edges above `angle_deg`.
    """
    mesh = obj.data
    for poly in mesh.polygons:
        poly.use_smooth = True

    mod = obj.modifiers.new(name="CrispNormals", type='EDGE_SPLIT')
    mod.use_edge_angle = True
    mod.split_angle = math.radians(angle_deg)

    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)


def build_web_version(materials):
    """
    Builds the `Web_Version` collection centered at world origin (0, 0, 0)
    so Z spans [-70.0 mm, +70.0 mm] and the 3-fold rotational symmetry axis
    sits directly on (X = 0.0, Y = 0.0).
    """
    web_col = get_or_create_collection("Web_Version")
    mat_list = [materials["graphite"], materials["titanium"], materials["slate"]]
    z_shift_web = -0.5 * ROTOR_HEIGHT_MM  # -70.0 mm centers the 140 mm rotor at Z = 0.0

    # 1. Main Rotor Core
    bm_core = create_rotor_core_bmesh()
    obj_core = bmesh_to_object(
        bm_core, "IdleX_Rotor_Core_Web", web_col, mat_list, z_offset=z_shift_web
    )
    apply_crisp_web_normals(obj_core, angle_deg=30.0)

    # 2. Corner Brushed Titanium Accent Flutes
    bm_flutes = build_corner_titanium_flutes_bmesh()
    obj_flutes = bmesh_to_object(
        bm_flutes, "IdleX_Corner_Flutes_Web", web_col, mat_list, z_offset=z_shift_web
    )
    apply_crisp_web_normals(obj_flutes, angle_deg=32.0)

    # 3. Three Face Panel Frames + Recessed Slate Backing Plates
    bm_frames = bmesh.new()
    for ang in FACE_NORMAL_ANGLES_DEG:
        bm_f = build_face_panel_frame_bmesh(ang, include_slate_backing=True)
        temp_mesh = bpy.data.meshes.new("Temp_Frame")
        bm_f.to_mesh(temp_mesh)
        bm_f.free()
        bm_frames.from_mesh(temp_mesh)
        bpy.data.meshes.remove(temp_mesh)

    obj_frames = bmesh_to_object(
        bm_frames, "IdleX_Face_Frames_Web", web_col, mat_list, z_offset=z_shift_web
    )
    apply_crisp_web_normals(obj_frames, angle_deg=32.0)

    # 4. Three Distinct Category Relief Objects
    motif_specs = [
        ("IdleX_Motif_Property_Spaces_Web", FACE_NORMAL_ANGLES_DEG[0], build_motif_property_spaces_bmesh),
        ("IdleX_Motif_Physical_Assets_Web", FACE_NORMAL_ANGLES_DEG[1], build_motif_physical_assets_bmesh),
        ("IdleX_Motif_Digital_Tech_Web",    FACE_NORMAL_ANGLES_DEG[2], build_motif_digital_tech_bmesh),
    ]
    motif_objs = []
    for name, ang, builder_fn in motif_specs:
        bm_m = builder_fn(ang)
        obj_m = bmesh_to_object(bm_m, name, web_col, mat_list, z_offset=z_shift_web)
        apply_crisp_web_normals(obj_m, angle_deg=32.0)
        motif_objs.append(obj_m)

    web_objects = [obj_core, obj_flutes, obj_frames] + motif_objs

    # Explicitly enforce identity transforms and world-origin pivot on all web objects
    for obj in web_objects:
        obj.location = Vector((0.0, 0.0, 0.0))
        obj.rotation_euler = (0.0, 0.0, 0.0)
        obj.scale = Vector((1.0, 1.0, 1.0))

    return web_col, web_objects


def verify_and_measure_web_assembly(web_objects):
    """
    Verifies that all Web_Version objects have their rotation origin centered at
    (0.0, 0.0, 0.0) and measures the actual world-space dimensions of the Web assembly.
    """
    if not web_objects:
        raise RuntimeError("Web_Version contains no objects.")

    all_xs, all_ys, all_zs = [], [], []
    core_xs, core_ys = [], []
    total_verts = 0
    total_polys = 0
    origin_errors = []

    for obj in web_objects:
        if obj.location.length > 1e-5:
            origin_errors.append(
                f"{obj.name} origin is offset at {tuple(round(c, 4) for c in obj.location)}"
            )
        mat_w = obj.matrix_world
        mesh = obj.data
        if len(mesh.vertices) == 0:
            raise RuntimeError(f"Web object '{obj.name}' has 0 vertices.")

        total_verts += len(mesh.vertices)
        total_polys += len(mesh.polygons)

        for v in mesh.vertices:
            w_co = mat_w @ v.co
            all_xs.append(w_co.x)
            all_ys.append(w_co.y)
            all_zs.append(w_co.z)
            if obj.name == "IdleX_Rotor_Core_Web":
                core_xs.append(w_co.x)
                core_ys.append(w_co.y)

    min_x, max_x = min(all_xs), max(all_xs)
    min_y, max_y = min(all_ys), max(all_ys)
    min_z, max_z = min(all_zs), max(all_zs)

    dim_x = max_x - min_x
    dim_y = max_y - min_y
    dim_z = max_z - min_z
    mid_z = 0.5 * (min_z + max_z)

    core_dim_x = (max(core_xs) - min(core_xs)) if core_xs else dim_x
    core_dim_y = (max(core_ys) - min(core_ys)) if core_ys else dim_y

    if abs(mid_z) > 0.05:
        origin_errors.append(
            f"Web assembly vertical midpoint is not centered at Z=0.0 mm (mid_z={mid_z:.3f} mm)."
        )

    if origin_errors:
        raise RuntimeError(
            "Web GLB origin verification failed: " + "; ".join(origin_errors)
        )

    return {
        "object_count": len(web_objects),
        "vertex_count": total_verts,
        "polygon_count": total_polys,
        "core_dimensions_xy_mm": (round(core_dim_x, 2), round(core_dim_y, 2)),
        "overall_dimensions_mm": (round(dim_x, 2), round(dim_y, 2), round(dim_z, 2)),
        "x_bounds_mm": (round(min_x, 2), round(max_x, 2)),
        "y_bounds_mm": (round(min_y, 2), round(max_y, 2)),
        "z_bounds_mm": (round(min_z, 3), round(max_z, 3)),
        "rotation_origin_mm": (0.0, 0.0, 0.0),
    }


def build_print_version(materials):
    """
    Builds the `Print_Version` collection with a single solid, manifold,
    watertight mesh (`IdleX_Resource_Rotor_Print`) resting flat on Z = 0.0 mm.
    Uses Blender's `EXACT` Boolean solver with `use_self=True` to fuse the core,
    corner ribs, panel frames, and all three category motifs into one solid.
    Raises a descriptive RuntimeError if the Boolean union produces invalid or
    missing geometry.
    """
    print_col = get_or_create_collection("Print_Version")
    mat_list = [materials["graphite"], materials["titanium"]]

    # 1. Base Rotor Core (Z: 0.0 -> 140.0 mm)
    bm_core = create_rotor_core_bmesh()
    obj_print = bmesh_to_object(
        bm_core, "IdleX_Resource_Rotor_Print", print_col, mat_list, z_offset=0.0
    )

    core_vert_count = len(obj_print.data.vertices)
    core_face_count = len(obj_print.data.polygons)
    if core_vert_count == 0 or core_face_count == 0:
        raise RuntimeError(
            f"Rotor core mesh generation failed (verts={core_vert_count}, faces={core_face_count})."
        )

    # 2. Collect all relief & structural detail meshes into a combined operand
    bm_details = bmesh.new()

    def append_bmesh(source_bm, label):
        if len(source_bm.verts) == 0 or len(source_bm.faces) == 0:
            source_bm.free()
            raise RuntimeError(f"Detail BMesh '{label}' is empty and cannot be unioned.")
        tmp = bpy.data.meshes.new("Tmp_Detail")
        source_bm.to_mesh(tmp)
        source_bm.free()
        bm_details.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)

    append_bmesh(build_corner_titanium_flutes_bmesh(), "Corner_Titanium_Flutes")
    for idx, ang in enumerate(FACE_NORMAL_ANGLES_DEG, start=1):
        append_bmesh(
            build_face_panel_frame_bmesh(ang, include_slate_backing=False),
            f"Face_Panel_Frame_{idx}",
        )

    append_bmesh(build_motif_property_spaces_bmesh(FACE_NORMAL_ANGLES_DEG[0]), "Motif_Property_Spaces")
    append_bmesh(build_motif_physical_assets_bmesh(FACE_NORMAL_ANGLES_DEG[1]), "Motif_Physical_Assets")
    append_bmesh(build_motif_digital_tech_bmesh(FACE_NORMAL_ANGLES_DEG[2]), "Motif_Digital_Tech")

    obj_details = bmesh_to_object(
        bm_details, "IdleX_Details_Boolean_Operand", print_col, mat_list, z_offset=0.0
    )
    details_vert_count = len(obj_details.data.vertices)
    details_face_count = len(obj_details.data.polygons)

    if details_vert_count == 0 or details_face_count == 0:
        raise RuntimeError(
            "Combined relief operand mesh is empty prior to Boolean union."
        )

    # 3. Apply EXACT Boolean Union (with self-intersection handling enabled)
    try:
        bpy.context.view_layer.objects.active = obj_print
        bool_mod = obj_print.modifiers.new(name="Union_All_Reliefs", type='BOOLEAN')
        bool_mod.operation = 'UNION'
        bool_mod.object = obj_details
        if hasattr(bool_mod, "solver"):
            bool_mod.solver = 'EXACT'
        if hasattr(bool_mod, "use_self"):
            bool_mod.use_self = True
        if hasattr(bool_mod, "use_hole_tolerant"):
            bool_mod.use_hole_tolerant = True

        res = bpy.ops.object.modifier_apply(modifier=bool_mod.name)
        if 'FINISHED' not in res:
            raise RuntimeError(f"Boolean modifier apply returned unexpected status: {res}")
    except Exception as exc:
        raise RuntimeError(
            f"Boolean UNION operator failed while fusing reliefs onto rotor core: {exc}"
        ) from exc
    finally:
        # Always clean up the temporary operand object
        if obj_details.name in bpy.data.objects:
            operand_mesh = obj_details.data
            bpy.data.objects.remove(obj_details, do_unlink=True)
            if operand_mesh and operand_mesh.name in bpy.data.meshes:
                bpy.data.meshes.remove(operand_mesh)

    post_bool_verts = len(obj_print.data.vertices)
    post_bool_faces = len(obj_print.data.polygons)

    if post_bool_verts == 0 or post_bool_faces == 0:
        raise RuntimeError(
            "Boolean UNION resulted in an empty mesh (0 vertices or 0 faces)."
        )

    if post_bool_verts <= core_vert_count or post_bool_faces <= core_face_count:
        raise RuntimeError(
            "Boolean UNION failed to incorporate relief geometry: "
            f"core had {core_vert_count} verts / {core_face_count} faces, "
            f"operand had {details_vert_count} verts / {details_face_count} faces, "
            f"result has only {post_bool_verts} verts / {post_bool_faces} faces."
        )

    # 4. BMesh cleanup & normal recalculation pass on the unified solid
    bm_clean = bmesh.new()
    bm_clean.from_mesh(obj_print.data)

    bmesh.ops.remove_doubles(bm_clean, verts=bm_clean.verts, dist=0.002)
    bmesh.ops.dissolve_degenerate(bm_clean, dist=0.001, edges=bm_clean.edges)
    bmesh.ops.triangulate(bm_clean, faces=bm_clean.faces)
    bmesh.ops.recalc_face_normals(bm_clean, faces=bm_clean.faces)
    bm_clean.normal_update()

    if len(bm_clean.verts) == 0 or len(bm_clean.faces) == 0:
        bm_clean.free()
        raise RuntimeError(
            "Post-Boolean BMesh cleanup resulted in empty geometry."
        )

    xs = [v.co.x for v in bm_clean.verts]
    ys = [v.co.y for v in bm_clean.verts]
    zs = [v.co.z for v in bm_clean.verts]
    dim_x = max(xs) - min(xs)
    dim_y = max(ys) - min(ys)
    dim_z = max(zs) - min(zs)

    if dim_x < 100.0 or dim_y < 95.0 or abs(dim_z - ROTOR_HEIGHT_MM) > 0.5:
        bm_clean.free()
        raise RuntimeError(
            "Boolean UNION geometry bounding box is outside expected tolerances: "
            f"measured {dim_x:.2f} x {dim_y:.2f} x {dim_z:.2f} mm "
            f"(expected >100 mm X, >95 mm Y, {ROTOR_HEIGHT_MM:.1f} mm Z)."
        )

    bm_clean.to_mesh(obj_print.data)
    bm_clean.free()
    obj_print.data.update()

    return print_col, obj_print


# ==============================================================================
# 8. PRINTABLE MESH GEOMETRY VALIDATION
# ==============================================================================

def validate_print_mesh(obj_print):
    """
    Performs rigorous BMesh topological and dimensional validation on the
    print mesh before declaring it ready for slicing.
    """
    bm = bmesh.new()
    bm.from_mesh(obj_print.data)
    bm.verts.ensure_lookup_table()
    bm.edges.ensure_lookup_table()
    bm.faces.ensure_lookup_table()

    if len(bm.verts) == 0 or len(bm.faces) == 0:
        bm.free()
        return {
            "vertex_count": 0,
            "face_count": 0,
            "non_manifold_edges": -1,
            "non_contiguous_edges": -1,
            "zero_area_faces": -1,
            "degenerate_edges": -1,
            "loose_verts": -1,
            "dimensions_mm": (0.0, 0.0, 0.0),
            "x_bounds_mm": (0.0, 0.0),
            "y_bounds_mm": (0.0, 0.0),
            "z_bounds_mm": (0.0, 0.0),
            "base_contact_vertices": 0,
            "volume_cm3": 0.0,
            "warnings": ["Mesh contains 0 vertices or 0 faces."],
            "is_valid_manifold": False,
            "validation_passed": False,
        }

    non_manifold_edges = [e for e in bm.edges if not e.is_manifold]
    non_contiguous_edges = [e for e in bm.edges if not e.is_contiguous]
    zero_area_faces = [f for f in bm.faces if f.calc_area() < 1e-6]
    degenerate_edges = [e for e in bm.edges if e.calc_length() < 1e-5]
    loose_verts = [v for v in bm.verts if not v.link_edges]

    xs = [v.co.x for v in bm.verts]
    ys = [v.co.y for v in bm.verts]
    zs = [v.co.z for v in bm.verts]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    dim_x = max_x - min_x
    dim_y = max_y - min_y
    dim_z = max_z - min_z

    base_contact_verts = [v for v in bm.verts if abs(v.co.z - min_z) < 0.01]
    volume_mm3 = bm.calc_volume()

    report = {
        "vertex_count": len(bm.verts),
        "face_count": len(bm.faces),
        "non_manifold_edges": len(non_manifold_edges),
        "non_contiguous_edges": len(non_contiguous_edges),
        "zero_area_faces": len(zero_area_faces),
        "degenerate_edges": len(degenerate_edges),
        "loose_verts": len(loose_verts),
        "dimensions_mm": (round(dim_x, 2), round(dim_y, 2), round(dim_z, 2)),
        "x_bounds_mm": (round(min_x, 2), round(max_x, 2)),
        "y_bounds_mm": (round(min_y, 2), round(max_y, 2)),
        "z_bounds_mm": (round(min_z, 3), round(max_z, 3)),
        "base_contact_vertices": len(base_contact_verts),
        "volume_cm3": round(volume_mm3 / 1000.0, 2),
        "warnings": [],
    }

    if report["non_manifold_edges"] > 0:
        report["warnings"].append(
            f"Found {report['non_manifold_edges']} non-manifold edges."
        )
    if report["non_contiguous_edges"] > 0:
        report["warnings"].append(
            f"Found {report['non_contiguous_edges']} non-contiguous normal edges."
        )
    if report["zero_area_faces"] > 0:
        report["warnings"].append(
            f"Found {report['zero_area_faces']} zero-area faces."
        )
    if report["degenerate_edges"] > 0:
        report["warnings"].append(
            f"Found {report['degenerate_edges']} degenerate zero-length edges."
        )
    if report["loose_verts"] > 0:
        report["warnings"].append(
            f"Found {report['loose_verts']} loose disconnected vertices."
        )
    if volume_mm3 <= 0.0:
        report["warnings"].append(
            f"Non-positive mesh volume ({volume_mm3:.2f} mm^3) indicates inverted or open normals."
        )
    if abs(min_z) > 0.05:
        report["warnings"].append(
            f"Base does not sit flat at Z=0.0 mm (min_z = {min_z:.3f} mm)."
        )
    if abs(dim_z - ROTOR_HEIGHT_MM) > 0.25:
        report["warnings"].append(
            f"Height deviates from {ROTOR_HEIGHT_MM:.1f} mm target (dim_z = {dim_z:.3f} mm)."
        )
    if len(base_contact_verts) < 20:
        report["warnings"].append(
            "Insufficient flat bottom contact area for stable bed adhesion."
        )

    report["is_valid_manifold"] = (
        report["non_manifold_edges"] == 0
        and report["non_contiguous_edges"] == 0
        and report["zero_area_faces"] == 0
        and report["degenerate_edges"] == 0
        and report["loose_verts"] == 0
        and volume_mm3 > 0.0
    )

    report["validation_passed"] = (
        report["is_valid_manifold"] and len(report["warnings"]) == 0
    )

    bm.free()
    return report


# ==============================================================================
# 9. STUDIO LIGHTING, CAMERA & PREVIEW RENDER SETUP
# ==============================================================================

def setup_studio_lighting_and_camera(scene):
    """
    Sets up a three-point industrial studio lighting rig and a 3/4 view camera
    in a dedicated `Studio_Environment` collection (excluded from GLB/STL exports).
    Camera is positioned so both Face 1 (Property & Spaces) and Face 2 (Physical Assets)
    and the overall 3-sided rounded silhouette are clearly visible.
    """
    studio_col = get_or_create_collection("Studio_Environment")

    # Dark studio world background for preview render only
    world = bpy.data.worlds.new("IdleX_Studio_World")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs[0].default_value = (0.018, 0.020, 0.025, 1.0)
        bg_node.inputs[1].default_value = 1.0

    # Helper to create an Area Light aimed at target (0, 0, 0)
    def add_studio_light(name, location, energy, size, color=(1.0, 1.0, 1.0)):
        light_data = bpy.data.lights.new(name=name, type='AREA')
        light_data.energy = energy
        light_data.size = size
        light_data.color = color
        light_obj = bpy.data.objects.new(name=name, object_data=light_data)
        studio_col.objects.link(light_obj)
        light_obj.location = Vector(location)
        direction = Vector((0.0, 0.0, 0.0)) - light_obj.location
        light_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
        return light_obj

    # Distances in mm (with scale_length = 0.001, light energy is in Watts)
    add_studio_light("IdleX_Key_Light",  (190.0, -240.0, 180.0), energy=12.0, size=180.0, color=(1.0, 0.98, 0.95))
    add_studio_light("IdleX_Fill_Light", (-240.0, -160.0, 90.0), energy=5.5,  size=220.0, color=(0.88, 0.93, 1.0))
    add_studio_light("IdleX_Rim_Light",  (40.0,   250.0, 210.0), energy=15.0, size=160.0, color=(0.95, 0.97, 1.0))

    # Camera positioned at a 3/4 view angle (+X, -Y, +Z) seeing Face 1 (-90 deg) and Face 2 (+30 deg)
    cam_data = bpy.data.cameras.new("IdleX_Preview_Camera")
    cam_data.lens = 65.0
    cam_data.clip_start = 10.0
    cam_data.clip_end = 2000.0
    cam_obj = bpy.data.objects.new("IdleX_Preview_Camera", cam_data)
    studio_col.objects.link(cam_obj)

    cam_obj.location = Vector((215.0, -235.0, 115.0))
    look_target = Vector((0.0, 0.0, -4.0))
    cam_dir = look_target - cam_obj.location
    cam_obj.rotation_euler = cam_dir.to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam_obj

    return studio_col


def render_preview_image(scene, web_col, print_col, filepath):
    """Renders a 3/4 studio preview image of the Web version."""
    if print_col is not None:
        print_col.hide_render = True
        print_col.hide_viewport = True
    web_col.hide_render = False
    web_col.hide_viewport = False

    # Select best available render engine across Blender 3.x and 4.x
    available_engines = [
        item.identifier for item in scene.render.bl_rna.properties['engine'].enum_items
    ]
    if 'BLENDER_EEVEE_NEXT' in available_engines:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    elif 'BLENDER_EEVEE' in available_engines:
        scene.render.engine = 'BLENDER_EEVEE'
    elif 'CYCLES' in available_engines:
        scene.render.engine = 'CYCLES'
        scene.cycles.samples = 48

    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = filepath

    try:
        bpy.ops.render.render(write_still=True)
        return True, None
    except Exception as exc:
        return False, str(exc)


# ==============================================================================
# 10. VERSION-RESILIENT EXPORTERS (GLB & STL WITH NATIVE BINARY FALLBACK)
# ==============================================================================

def select_only_objects(obj_list):
    """Deselects all objects in the scene and selects only `obj_list`."""
    for obj in bpy.context.scene.objects:
        obj.select_set(False)
    for obj in obj_list:
        obj.hide_viewport = False
        obj.select_set(True)
    if obj_list:
        bpy.context.view_layer.objects.active = obj_list[0]


def export_web_glb(web_objects, filepath):
    """Exports the Web_Version objects to a binary glTF (.glb) file."""
    select_only_objects(web_objects)

    if not hasattr(bpy.ops.export_scene, "gltf"):
        raise RuntimeError(
            "Blender glTF 2.0 exporter (`bpy.ops.export_scene.gltf`) is unavailable. "
            "Ensure the `io_scene_gltf2` add-on is enabled."
        )

    valid_props = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    desired_kwargs = {
        "filepath": filepath,
        "export_format": 'GLB',
        "use_selection": True,
        "export_apply": True,
        "export_yup": True,
        "export_materials": 'EXPORT',
    }
    filtered_kwargs = {k: v for k, v in desired_kwargs.items() if k in valid_props}
    result = bpy.ops.export_scene.gltf(**filtered_kwargs)
    if 'FINISHED' not in result or not os.path.isfile(filepath):
        raise RuntimeError(f"GLB export operator failed or did not write file: {result}")


def write_binary_stl_fallback(obj, filepath):
    """
    Deterministic native Python binary STL writer used if Blender's STL operator
    is disabled or unavailable in a stripped headless environment.
    Recalculates face normals after triangulation so every written triangle carries
    an accurate outward unit normal.
    """
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.transform(obj.matrix_world)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.normal_update()
    bm.faces.ensure_lookup_table()

    header = b"IdleX Resource Rotor - Printable Solid Mesh (Units: mm)"
    header = header.ljust(80, b"\x00")[:80]

    with open(filepath, "wb") as f:
        f.write(header)
        f.write(struct.pack("<I", len(bm.faces)))

        for face in bm.faces:
            n = face.normal
            v0, v1, v2 = face.verts[0].co, face.verts[1].co, face.verts[2].co
            f.write(
                struct.pack(
                    "<12fH",
                    float(n.x), float(n.y), float(n.z),
                    float(v0.x), float(v0.y), float(v0.z),
                    float(v1.x), float(v1.y), float(v1.z),
                    float(v2.x), float(v2.y), float(v2.z),
                    0,
                )
            )

    bm.free()


def export_print_stl(obj_print, filepath):
    """
    Exports the unified `obj_print` mesh to a binary STL file.
    Supports Blender 4.0+ (`wm.stl_export`), Blender 3.6 (`export_mesh.stl`),
    and falls back to `write_binary_stl_fallback` if the addon is unavailable.
    """
    select_only_objects([obj_print])

    # 1. Try Blender 4.0+ C++ STL exporter
    if hasattr(bpy.ops.wm, "stl_export"):
        try:
            valid_props = set(bpy.ops.wm.stl_export.get_rna_type().properties.keys())
            desired_kwargs = {
                "filepath": filepath,
                "export_selected_objects": True,
                "ascii_format": False,
                "apply_modifiers": True,
            }
            filtered_kwargs = {k: v for k, v in desired_kwargs.items() if k in valid_props}
            res = bpy.ops.wm.stl_export(**filtered_kwargs)
            if 'FINISHED' in res and os.path.isfile(filepath) and os.path.getsize(filepath) > 84:
                return "wm.stl_export"
        except Exception:
            pass

    # 2. Try Blender 3.x Python STL exporter
    if hasattr(bpy.ops.export_mesh, "stl"):
        try:
            valid_props = set(bpy.ops.export_mesh.stl.get_rna_type().properties.keys())
            desired_kwargs = {
                "filepath": filepath,
                "use_selection": True,
                "ascii": False,
                "use_mesh_modifiers": True,
            }
            filtered_kwargs = {k: v for k, v in desired_kwargs.items() if k in valid_props}
            res = bpy.ops.export_mesh.stl(**filtered_kwargs)
            if 'FINISHED' in res and os.path.isfile(filepath) and os.path.getsize(filepath) > 84:
                return "export_mesh.stl"
        except Exception:
            pass

    # 3. Deterministic native binary STL writer fallback
    write_binary_stl_fallback(obj_print, filepath)
    if not os.path.isfile(filepath) or os.path.getsize(filepath) <= 84:
        raise RuntimeError("Native binary STL fallback failed to write a non-empty STL file.")
    return "native_binary_fallback"


# ==============================================================================
# 11. MAIN PIPELINE EXECUTION
# ==============================================================================

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    glb_path = os.path.join(OUTPUT_DIR, EXPORT_FILENAMES["glb"])
    stl_path = os.path.join(OUTPUT_DIR, EXPORT_FILENAMES["stl"])
    blend_path = os.path.join(OUTPUT_DIR, EXPORT_FILENAMES["blend"])
    preview_path = os.path.join(OUTPUT_DIR, EXPORT_FILENAMES["preview"])

    # Remove stale output files from previous runs so status checks are accurate
    for stale_path in (glb_path, stl_path):
        if os.path.isfile(stale_path):
            try:
                os.remove(stale_path)
            except OSError:
                pass

    print("=" * 76)
    print("IDLEX RESOURCE ROTOR — PROCEDURAL CAD & WEB ASSET PIPELINE")
    print("=" * 76)
    print(f"Blender Version : {bpy.app.version_string}")
    print(f"Output Directory: {OUTPUT_DIR}")

    # 1. Reset scene & configure millimeter units
    scene = reset_scene_and_configure_units()

    # 2. Create PBR materials
    materials = create_pbr_materials()

    # 3. Build, Verify & Export Web Version FIRST so print/STL issues never block GLB generation
    print("\n[1/5] Building & verifying Web_Version collection (centered at world origin)...")
    web_col, web_objects = build_web_version(materials)
    web_report = verify_and_measure_web_assembly(web_objects)
    print(f"      Web Objects          : {web_report['object_count']} ({web_report['vertex_count']} verts / {web_report['polygon_count']} tris)")
    print(f"      Rotation Pivot       : {web_report['rotation_origin_mm']} mm (3-fold symmetry axis at X=0, Y=0; Z-centered)")
    print(f"      Core Cross-Section   : {web_report['core_dimensions_xy_mm'][0]} x {web_report['core_dimensions_xy_mm'][1]} mm")
    print(f"      Full Envelope (X,Y,Z): {web_report['overall_dimensions_mm'][0]} x {web_report['overall_dimensions_mm'][1]} x {web_report['overall_dimensions_mm'][2]} mm")
    print(f"      Web Bounds (X / Y / Z): X{web_report['x_bounds_mm']} | Y{web_report['y_bounds_mm']} | Z{web_report['z_bounds_mm']} mm")

    glb_exported_ok = False
    glb_error_msg = None
    try:
        web_col.hide_viewport = False
        export_web_glb(web_objects, glb_path)
        glb_exported_ok = True
        print(f"      Web GLB Export       : SUCCESS ({glb_path})")
    except Exception as exc:
        glb_error_msg = str(exc)
        print(f"      [ERROR] Web GLB export failed: {glb_error_msg}")

    # 4. Build Print Version (isolated so errors do not abort the script or affect Web GLB)
    print("\n[2/5] Building Print_Version solid (EXACT Boolean Union on Z = 0.0 mm)...")
    print_col = None
    obj_print = None
    print_build_error = None
    try:
        print_col, obj_print = build_print_version(materials)
    except Exception as exc:
        print_build_error = str(exc)
        print(f"      [ERROR] Print_Version Boolean assembly failed: {print_build_error}")

    # 5. Validate Printable Solid
    print("\n[3/5] Validating manifold topology & dimensional accuracy...")
    report = None
    stl_validated = False
    if obj_print is not None:
        report = validate_print_mesh(obj_print)
        stl_validated = report["validation_passed"]

        print(f"      Vertices / Triangles : {report['vertex_count']} / {report['face_count']}")
        print(f"      Actual Dimensions    : {report['dimensions_mm'][0]} x {report['dimensions_mm'][1]} x {report['dimensions_mm'][2]} mm")
        print(f"      X / Y Bounds         : X{report['x_bounds_mm']} mm | Y{report['y_bounds_mm']} mm")
        print(f"      Z Bounds             : {report['z_bounds_mm'][0]} mm -> {report['z_bounds_mm'][1]} mm")
        print(f"      Volume               : {report['volume_cm3']} cm^3")
        print(f"      Base Contact Verts   : {report['base_contact_vertices']}")
        print(f"      Non-Manifold Edges   : {report['non_manifold_edges']}")
        print(f"      Non-Contiguous Edges : {report['non_contiguous_edges']}")
        print(f"      Zero-Area Faces      : {report['zero_area_faces']}")
        print(f"      Degenerate Edges     : {report['degenerate_edges']}")
        print(f"      Loose Vertices       : {report['loose_verts']}")
        print(f"      Watertight Manifold  : {report['is_valid_manifold']}")

        if report["warnings"]:
            for w in report["warnings"]:
                print(f"      [DIAGNOSTIC WARNING] {w}")

        if stl_validated:
            print("      Validation Status    : PASSED (watertight manifold & dimensionally verified)")
        else:
            print("      [VALIDATION FAILED]  : Print mesh did NOT pass validation! Any exported STL is marked UNVALIDATED.")
    else:
        print("      [VALIDATION SKIPPED] : Print mesh could not be built; see build error above.")

    # 6. Export Print STL (isolated from Web GLB; preserves unvalidated diagnostic state)
    print("\n[4/5] Exporting 3D Print (.stl) asset...")
    stl_exported_ok = False
    stl_method = None
    stl_export_error = None

    if obj_print is not None:
        try:
            web_col.hide_viewport = True
            if print_col is not None:
                print_col.hide_viewport = False
            stl_method = export_print_stl(obj_print, stl_path)
            stl_exported_ok = True
            if stl_validated:
                print(f"      STL exported via     : {stl_method} (VALIDATED)")
            else:
                print(f"      STL exported via     : {stl_method} [UNVALIDATED - FOR TROUBLESHOOTING ONLY]")
        except Exception as exc:
            stl_export_error = str(exc)
            print(f"      [ERROR] STL export failed: {stl_export_error}")
    else:
        stl_export_error = print_build_error or "Print mesh object unavailable."
        print(f"      [SKIPPED] STL export skipped because Print_Version build failed: {stl_export_error}")

    # 7. Studio Lighting, Preview Render & .blend Save
    print("\n[5/5] Setting up studio lighting, rendering preview & saving .blend...")
    setup_studio_lighting_and_camera(scene)
    rendered_ok, render_err = render_preview_image(scene, web_col, print_col, preview_path)
    if not rendered_ok:
        print(f"      [NOTE] Preview render skipped/failed in current environment: {render_err}")

    # Leave Web_Version visible by default when opening the .blend file
    web_col.hide_viewport = False
    web_col.hide_render = False
    if print_col is not None:
        print_col.hide_viewport = True
        print_col.hide_render = True
    select_only_objects(web_objects)

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)

    print("\n" + "=" * 76)
    print("EXPORT SUMMARY")
    print("=" * 76)

    # Web GLB status
    if glb_exported_ok and os.path.isfile(glb_path):
        size_kb = os.path.getsize(glb_path) / 1024.0
        print(
            f"  [OK]          Web GLB   : {glb_path} ({size_kb:,.1f} KB) | "
            f"Origin {web_report['rotation_origin_mm']} mm | "
            f"{web_report['overall_dimensions_mm'][0]} x {web_report['overall_dimensions_mm'][1]} x {web_report['overall_dimensions_mm'][2]} mm"
        )
    else:
        print(f"  [FAILED]      Web GLB   : {glb_path} ({glb_error_msg or 'not generated'})")

    # Print STL status (explicitly distinguishes VALIDATED vs UNVALIDATED vs FAILED)
    if stl_exported_ok and os.path.isfile(stl_path):
        size_kb = os.path.getsize(stl_path) / 1024.0
        dims_str = (
            f"{report['dimensions_mm'][0]} x {report['dimensions_mm'][1]} x {report['dimensions_mm'][2]} mm"
            if report else "unknown dims"
        )
        if stl_validated:
            print(f"  [OK]          Print STL : {stl_path} ({size_kb:,.1f} KB) | VALIDATED MANIFOLD | {dims_str}")
        else:
            print(
                f"  [UNVALIDATED] Print STL : {stl_path} ({size_kb:,.1f} KB) | "
                f"UNVALIDATED (failed print-mesh validation; inspect diagnostics above) | {dims_str}"
            )
    else:
        print(f"  [FAILED]      Print STL : {stl_path} ({stl_export_error or 'not generated'})")

    # Blend & Preview status
    for label, path in (
        ("Blend File", blend_path),
        ("Preview   ", preview_path),
    ):
        if os.path.isfile(path):
            size_kb = os.path.getsize(path) / 1024.0
            print(f"  [OK]          {label}: {path} ({size_kb:,.1f} KB)")
        else:
            print(f"  [--]          {label}: {path} (not generated)")
    print("=" * 76)


if __name__ == "__main__":
    main()
