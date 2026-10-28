import * as THREE from 'three';

// Exact dimensions from idlex_rotor_generator.py
const SCALE = 0.024; // 140mm -> ~3.36 Three.js units tall
const ROTOR_HEIGHT_MM = 140.0;
const TRIANGLE_RADIUS_MM = 38.0;
const CORNER_FILLET_MM = 20.0;
const FACE_APOTHEM_MM = 0.5 * TRIANGLE_RADIUS_MM + CORNER_FILLET_MM; // 39.0mm
const FACE_CENTER_Z_MM = 70.0; // Centered at 0 in local space

const FACE_NORMAL_ANGLES_DEG = [-90.0, 30.0, 150.0];
const CORNER_VERTEX_ANGLES_DEG = [90.0, 210.0, 330.0];

const CORNER_ARC_SEGMENTS = 16;
const FLAT_FACE_SEGMENTS = 8;

// Transform a 2D local face coordinate (u, v) + depth (n) into 3D Three.js world space
export function getFacePoint(
  faceAngleDeg: number,
  u: number,
  v: number,
  n: number
): THREE.Vector3 {
  const phi = (faceAngleDeg * Math.PI) / 180.0;
  // Blender axes: n_blender = (cos(phi), sin(phi), 0), u_blender = (-sin(phi), cos(phi), 0)
  // Mapping to Three.js: X_3 = X_b, Y_3 = Z_b, Z_3 = -Y_b
  const nx = Math.cos(phi);
  const ny = Math.sin(phi);
  const ux = -Math.sin(phi);
  const uy = Math.cos(phi);

  const originX = nx * FACE_APOTHEM_MM;
  const originY = ny * FACE_APOTHEM_MM;

  const posX = (originX + ux * u + nx * n) * SCALE;
  const posY = v * SCALE; // centered at 0
  const posZ = -(originY + uy * u + ny * n) * SCALE;

  return new THREE.Vector3(posX, posY, posZ);
}

// 2D Polygon Offset Helper (inward offset for 45-degree chamfers)
function insetPolygon2D(poly: [number, number][], insetDist: number): [number, number][] {
  const n = poly.length;
  const result: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const pPrev = poly[(i - 1 + n) % n];
    const pCurr = poly[i];
    const pNext = poly[(i + 1) % n];

    let v1x = pCurr[0] - pPrev[0];
    let v1y = pCurr[1] - pPrev[1];
    let l1 = Math.hypot(v1x, v1y);
    if (l1 > 1e-6) { v1x /= l1; v1y /= l1; }

    let v2x = pNext[0] - pCurr[0];
    let v2y = pNext[1] - pCurr[1];
    let l2 = Math.hypot(v2x, v2y);
    if (l2 > 1e-6) { v2x /= l2; v2y /= l2; }

    // CCW Inward normals
    const n1x = -v1y;
    const n1y = v1x;
    const n2x = -v2y;
    const n2y = v2x;

    const denom = 1.0 + (n1x * n2x + n1y * n2y);
    let bx = n1x + n2x;
    let by = n1y + n2y;
    if (denom < 0.25) {
      const bl = Math.hypot(bx, by);
      if (bl > 1e-6) { bx = (bx / bl) * 2.0; by = (by / bl) * 2.0; }
    } else {
      bx /= denom;
      by /= denom;
    }

    result.push([pCurr[0] + bx * insetDist, pCurr[1] + by * insetDist]);
  }
  return result;
}

// CCW Chamfered Rectangle generator
export function polyChamferedRect(
  cx: number,
  cy: number,
  w: number,
  h: number,
  ch = 1.5
): [number, number][] {
  const hw = 0.5 * w;
  const hh = 0.5 * h;
  const c = Math.min(ch, hw * 0.45, hh * 0.45);
  return [
    [cx - hw + c, cy - hh],
    [cx + hw - c, cy - hh],
    [cx + hw,     cy - hh + c],
    [cx + hw,     cy + hh - c],
    [cx + hw - c, cy + hh],
    [cx - hw + c, cy + hh],
    [cx - hw,     cy + hh - c],
    [cx - hw,     cy - hh + c],
  ];
}

// CCW Regular N-gon generator
export function polyRegularNgon(
  cx: number,
  cy: number,
  radius: number,
  sides = 16,
  phaseDeg = 0.0
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const ang = ((phaseDeg + i * (360.0 / sides)) * Math.PI) / 180.0;
    pts.push([cx + radius * Math.cos(ang), cy + radius * Math.sin(ang)]);
  }
  return pts;
}

// Append a closed, 45-degree beveled 3D prism into buffers
export function appendBeveledPrism(
  positions: number[],
  normals: number[],
  indices: number[],
  polyUV: [number, number][],
  faceAngleDeg: number,
  nBack = -1.2,
  nFront = 2.8,
  bevelSize = 0.75
) {
  // Ensure CCW orientation
  let area2 = 0;
  const m = polyUV.length;
  for (let i = 0; i < m; i++) {
    const [u1, v1] = polyUV[i];
    const [u2, v2] = polyUV[(i + 1) % m];
    area2 += (u1 * v2 - u2 * v1);
  }
  const orderedUV = area2 < 0 ? [...polyUV].reverse() : polyUV;

  const polyBack = insetPolygon2D(orderedUV, -0.35);
  const polyShoulder = orderedUV;
  const polyFront = insetPolygon2D(orderedUV, bevelSize);

  const nShoulder = nFront - bevelSize;

  // Center points for front and back caps
  let cBackU = 0, cBackV = 0, cFrontU = 0, cFrontV = 0;
  for (let i = 0; i < m; i++) {
    cBackU += polyBack[i][0];
    cBackV += polyBack[i][1];
    cFrontU += polyFront[i][0];
    cFrontV += polyFront[i][1];
  }
  cBackU /= m; cBackV /= m;
  cFrontU /= m; cFrontV /= m;

  const baseIdx = positions.length / 3;

  // Add vertices
  // Ring 0: back (m vertices)
  for (let i = 0; i < m; i++) {
    const pt = getFacePoint(faceAngleDeg, polyBack[i][0], polyBack[i][1], nBack);
    positions.push(pt.x, pt.y, pt.z);
    normals.push(0, 0, 0); // computed later
  }
  // Ring 1: shoulder (m vertices)
  for (let i = 0; i < m; i++) {
    const pt = getFacePoint(faceAngleDeg, polyShoulder[i][0], polyShoulder[i][1], nShoulder);
    positions.push(pt.x, pt.y, pt.z);
    normals.push(0, 0, 0);
  }
  // Ring 2: front (m vertices)
  for (let i = 0; i < m; i++) {
    const pt = getFacePoint(faceAngleDeg, polyFront[i][0], polyFront[i][1], nFront);
    positions.push(pt.x, pt.y, pt.z);
    normals.push(0, 0, 0);
  }
  // Center Back (idx: baseIdx + 3*m)
  const ptCenterBack = getFacePoint(faceAngleDeg, cBackU, cBackV, nBack);
  positions.push(ptCenterBack.x, ptCenterBack.y, ptCenterBack.z);
  normals.push(0, 0, 0);
  const centerBackIdx = baseIdx + 3 * m;

  // Center Front (idx: baseIdx + 3*m + 1)
  const ptCenterFront = getFacePoint(faceAngleDeg, cFrontU, cFrontV, nFront);
  positions.push(ptCenterFront.x, ptCenterFront.y, ptCenterFront.z);
  normals.push(0, 0, 0);
  const centerFrontIdx = baseIdx + 3 * m + 1;

  for (let i = 0; i < m; i++) {
    const iNext = (i + 1) % m;
    const b0 = baseIdx + i;
    const b1 = baseIdx + iNext;
    const s0 = baseIdx + m + i;
    const s1 = baseIdx + m + iNext;
    const f0 = baseIdx + 2 * m + i;
    const f1 = baseIdx + 2 * m + iNext;

    // Side wall (b0 -> b1 -> s1 -> s0)
    indices.push(b0, b1, s1);
    indices.push(b0, s1, s0);

    // Bevel chamfer (s0 -> s1 -> f1 -> f0)
    indices.push(s0, s1, f1);
    indices.push(s0, f1, f0);

    // Front cap (f0 -> f1 -> centerFront)
    indices.push(f0, f1, centerFrontIdx);

    // Back cap (b1 -> b0 -> centerBack)
    indices.push(b1, b0, centerBackIdx);
  }
}

// 1. Core Rounded Triangular Lofted Body Geometry
export function createRotorCoreGeometry(): THREE.BufferGeometry {
  const loftStations = [
    { z: -70.0, s: 0.890 }, // base
    { z: -68.0, s: 0.920 }, // 45-deg bottom chamfer
    { z: -61.5, s: 0.920 }, // base collar
    { z: -59.5, s: 0.885 }, // neck ring
    { z: -57.5, s: 0.885 },
    { z: -53.5, s: 1.000 }, // flare to main body
    { z: -46.0, s: 1.000 },
    { z:  46.0, s: 1.000 },
    { z:  54.0, s: 1.000 }, // top main faces
    { z:  61.0, s: 0.855 }, // upper bevel
    { z:  62.5, s: 0.820 },
    { z:  65.5, s: 0.790 },
    { z:  69.0, s: 0.700 }, // crown top bevel
    { z:  70.0, s: 0.650 }, // crown flat rim
    { z:  70.0, s: 0.420 }, // inner crown ring
  ];

  const positions: number[] = [];
  const indices: number[] = [];

  // Generate 2D cross section rings
  const rings: THREE.Vector3[][] = [];
  for (const st of loftStations) {
    const ringPts: THREE.Vector3[] = [];
    const rt = TRIANGLE_RADIUS_MM * st.s;
    const rf = CORNER_FILLET_MM * st.s;

    const corners: [number, number, number][] = CORNER_VERTEX_ANGLES_DEG.map((deg) => {
      const rad = (deg * Math.PI) / 180.0;
      return [rt * Math.cos(rad), rt * Math.sin(rad), deg];
    });

    for (let c = 0; c < 3; c++) {
      const [cx, cy, cDeg] = corners[c];
      const [nextCx, nextCy, nextDeg] = corners[(c + 1) % 3];

      // Corner arc
      const startDeg = cDeg - 60.0;
      const endDeg = cDeg + 60.0;
      for (let s = 0; s < CORNER_ARC_SEGMENTS; s++) {
        const t = s / CORNER_ARC_SEGMENTS;
        const ang = ((startDeg + t * (endDeg - startDeg)) * Math.PI) / 180.0;
        const px = (cx + rf * Math.cos(ang)) * SCALE;
        const pz = -(cy + rf * Math.sin(ang)) * SCALE;
        ringPts.push(new THREE.Vector3(px, st.z * SCALE, pz));
      }

      // Flat face segment
      const endRad = (endDeg * Math.PI) / 180.0;
      const p0x = (cx + rf * Math.cos(endRad)) * SCALE;
      const p0z = -(cy + rf * Math.sin(endRad)) * SCALE;
      const p1x = (nextCx + rf * Math.cos(endRad)) * SCALE;
      const p1z = -(nextCy + rf * Math.sin(endRad)) * SCALE;

      for (let s = 0; s < FLAT_FACE_SEGMENTS; s++) {
        const t = s / FLAT_FACE_SEGMENTS;
        ringPts.push(new THREE.Vector3(p0x + (p1x - p0x) * t, st.z * SCALE, p0z + (p1z - p0z) * t));
      }
    }
    rings.push(ringPts);
  }

  const ringLen = rings[0].length;

  // Add vertices to positions array
  for (let r = 0; r < rings.length; r++) {
    for (let i = 0; i < ringLen; i++) {
      const p = rings[r][i];
      positions.push(p.x, p.y, p.z);
    }
  }

  // Bridge consecutive rings with triangles
  for (let r = 0; r < rings.length - 1; r++) {
    const baseA = r * ringLen;
    const baseB = (r + 1) * ringLen;
    for (let i = 0; i < ringLen; i++) {
      const iNext = (i + 1) % ringLen;
      const a0 = baseA + i;
      const a1 = baseA + iNext;
      const b0 = baseB + i;
      const b1 = baseB + iNext;

      indices.push(a0, a1, b1);
      indices.push(a0, b1, b0);
    }
  }

  // Cap bottom
  const bottomCenterIdx = positions.length / 3;
  positions.push(0, -70.0 * SCALE, 0);
  for (let i = 0; i < ringLen; i++) {
    const iNext = (i + 1) % ringLen;
    indices.push(iNext, i, bottomCenterIdx);
  }

  // Cap top
  const topCenterIdx = positions.length / 3;
  positions.push(0, 70.0 * SCALE, 0);
  const topRingBase = (rings.length - 1) * ringLen;
  for (let i = 0; i < ringLen; i++) {
    const iNext = (i + 1) % ringLen;
    indices.push(topRingBase + i, topRingBase + iNext, topCenterIdx);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// 2. Titanium Accent Collars & Corner Ribs Geometry
export function createTitaniumAccentsGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Corner Ribs along 90, 210, 330 deg
  const cornerApexRadius = TRIANGLE_RADIUS_MM + CORNER_FILLET_MM; // 58.0mm
  for (const cDeg of CORNER_VERTEX_ANGLES_DEG) {
    const phi = (cDeg * Math.PI) / 180.0;
    const nx = Math.cos(phi);
    const ny = Math.sin(phi);
    const ux = -Math.sin(phi);
    const uy = Math.cos(phi);

    const originX = nx * cornerApexRadius;
    const originY = -ny * cornerApexRadius;

    const ribPoly = polyChamferedRect(0, 0, 7.2, 86.0, 2.8);
    const baseIdx = positions.length / 3;
    const m = ribPoly.length;

    for (let i = 0; i < m; i++) {
      const [u, v] = ribPoly[i];
      // Front ridge
      const fx = (originX + ux * u + nx * 1.5) * SCALE;
      const fy = v * SCALE;
      const fz = -(originY + uy * u + ny * 1.5) * SCALE;
      positions.push(fx, fy, fz);
      normals.push(0, 0, 0);

      // Back base
      const bx = (originX + ux * u * 1.2 + nx * -1.8) * SCALE;
      const by = v * SCALE;
      const bz = -(originY + uy * u * 1.2 + ny * -1.8) * SCALE;
      positions.push(bx, by, bz);
      normals.push(0, 0, 0);
    }

    // Rib apex center
    const apexIdx = positions.length / 3;
    positions.push((originX + nx * 2.2) * SCALE, 0, -(originY + ny * 2.2) * SCALE);
    normals.push(0, 0, 0);

    for (let i = 0; i < m; i++) {
      const iNext = (i + 1) % m;
      const f0 = baseIdx + 2 * i;
      const b0 = baseIdx + 2 * i + 1;
      const f1 = baseIdx + 2 * iNext;
      const b1 = baseIdx + 2 * iNext + 1;

      indices.push(b0, b1, f1);
      indices.push(b0, f1, f0);
      indices.push(f0, f1, apexIdx);
    }
  }

  // Titanium Bezel Rails for each of the 3 faces
  for (const ang of FACE_NORMAL_ANGLES_DEG) {
    // Left & Right Vertical Frame Rails
    for (const sign of [-1.0, 1.0]) {
      const railV = polyChamferedRect(sign * 22.5, 0.0, 4.6, 86.0, 1.4);
      appendBeveledPrism(positions, normals, indices, railV, ang, -1.2, 1.6, 0.6);
    }
    // Top & Bottom Horizontal Rails
    for (const sign of [-1.0, 1.0]) {
      const railH = polyChamferedRect(0.0, sign * 43.0, 49.6, 5.2, 1.6);
      appendBeveledPrism(positions, normals, indices, railH, ang, -1.35, 1.85, 0.65);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// 3. Recessed Anodized Slate Panel Backing Plates
export function createSlatePanelsGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (const ang of FACE_NORMAL_ANGLES_DEG) {
    const backingPoly = polyChamferedRect(0.0, 0.0, 45.0, 86.0, 6.0);
    appendBeveledPrism(positions, normals, indices, backingPoly, ang, -0.8, 0.55, 0.35);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// 4. FACE 1 MOTIF — Property & Spaces (Modernist Skyline & Architectural Portal)
export function createPropertySpacesMotifGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const ang = FACE_NORMAL_ANGLES_DEG[0]; // -90 deg

  // Plinth
  const plinth = polyChamferedRect(0.0, -31.0, 34.0, 6.2, 1.2);
  appendBeveledPrism(positions, normals, indices, plinth, ang, -1.1, 2.7, 0.7);

  // Left Stepped Mid-Rise Wing
  const leftWing: [number, number][] = [
    [-15.5, -29.0],
    [-5.0,  -29.0],
    [-5.0,   14.5],
    [-15.5,   8.5],
  ];
  appendBeveledPrism(positions, normals, indices, leftWing, ang, -1.25, 2.3, 0.65);

  // Right Cantilevered Atrium Tower
  const rightWing: [number, number][] = [
    [5.0,  -29.0],
    [15.5, -29.0],
    [15.5,  15.0],
    [5.0,   21.5],
  ];
  appendBeveledPrism(positions, normals, indices, rightWing, ang, -1.3, 2.35, 0.65);

  // Central Monolith Tower
  const centralTower: [number, number][] = [
    [-6.8, -29.0],
    [ 6.8, -29.0],
    [ 6.8,  30.0],
    [ 0.0,  35.5],
    [-6.8,  30.0],
  ];
  appendBeveledPrism(positions, normals, indices, centralTower, ang, -1.45, 3.2, 0.75);

  // Spire Fin
  const spireFin = polyChamferedRect(0.0, 12.0, 4.4, 34.0, 1.0);
  appendBeveledPrism(positions, normals, indices, spireFin, ang, -1.55, 3.85, 0.65);

  // Portal Arch Columns & Lintel
  for (const sign of [-1.0, 1.0]) {
    const col = polyChamferedRect(sign * 8.2, -19.0, 4.6, 19.0, 0.9);
    appendBeveledPrism(positions, normals, indices, col, ang, -1.6, 3.65, 0.65);
  }
  const lintel = polyChamferedRect(0.0, -9.5, 22.0, 5.0, 1.1);
  appendBeveledPrism(positions, normals, indices, lintel, ang, -1.75, 3.95, 0.7);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// 5. FACE 2 MOTIF — Physical Assets (Gear, Bearing Hub, Torque Struts)
export function createPhysicalAssetsMotifGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const ang = FACE_NORMAL_ANGLES_DEG[1]; // +30 deg
  const gearCy = 5.5;

  // Dual Torque Struts
  for (const sign of [-1.0, 1.0]) {
    const strut = polyChamferedRect(sign * 5.4, -9.5, 4.5, 28.0, 0.9);
    appendBeveledPrism(positions, normals, indices, strut, ang, -1.1, 2.25, 0.6);
  }

  // Gear Core Disc
  const gearDisc = polyRegularNgon(0.0, gearCy, 13.2, 24, 7.5);
  appendBeveledPrism(positions, normals, indices, gearDisc, ang, -1.25, 2.85, 0.7);

  // 8 Trapezoidal Gear Teeth
  const rInner = 10.8;
  const rOuter = 17.4;
  const halfBase = (13.0 * Math.PI) / 180.0;
  const halfTip = (8.2 * Math.PI) / 180.0;

  for (let k = 0; k < 8; k++) {
    const theta = (k * 45.0 * Math.PI) / 180.0;
    const tooth: [number, number][] = [
      [rInner * Math.cos(theta - halfBase), gearCy + rInner * Math.sin(theta - halfBase)],
      [rOuter * Math.cos(theta - halfTip),  gearCy + rOuter * Math.sin(theta - halfTip)],
      [rOuter * Math.cos(theta + halfTip),  gearCy + rOuter * Math.sin(theta + halfTip)],
      [rInner * Math.cos(theta + halfBase), gearCy + rInner * Math.sin(theta + halfBase)],
    ];
    appendBeveledPrism(positions, normals, indices, tooth, ang, -1.35, 3.05, 0.65);
  }

  // Hexagonal Bearing Boss & Axle Pin
  const hexBoss = polyRegularNgon(0.0, gearCy, 8.2, 6, 30.0);
  appendBeveledPrism(positions, normals, indices, hexBoss, ang, -1.6, 3.6, 0.7);

  const axlePin = polyRegularNgon(0.0, gearCy, 4.2, 12, 0.0);
  appendBeveledPrism(positions, normals, indices, axlePin, ang, -1.75, 4.1, 0.6);

  // Lower Crank Boss & Pin
  const crankCy = -23.5;
  const crankBoss = polyRegularNgon(0.0, crankCy, 9.0, 20, 9.0);
  appendBeveledPrism(positions, normals, indices, crankBoss, ang, -1.45, 2.95, 0.7);

  const crankPin = polyRegularNgon(0.0, crankCy, 4.5, 12, 15.0);
  appendBeveledPrism(positions, normals, indices, crankPin, ang, -1.65, 3.65, 0.6);

  // Upper Caliper Bridge
  const upperYoke = polyChamferedRect(0.0, 29.5, 22.0, 5.2, 1.5);
  appendBeveledPrism(positions, normals, indices, upperYoke, ang, -1.5, 2.65, 0.65);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// 6. FACE 3 MOTIF — Digital & Tech (Silicon IC Package, Logic Die, Bus Traces)
export function createDigitalTechMotifGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const ang = FACE_NORMAL_ANGLES_DEG[2]; // +150 deg

  // Central IC Substrate (20x20mm)
  const icPkg = polyChamferedRect(0.0, 0.0, 20.0, 20.0, 2.8);
  appendBeveledPrism(positions, normals, indices, icPkg, ang, -1.2, 2.85, 0.7);

  // Silicon Die (11.6x11.6mm) & Logic Core (5.6x5.6mm)
  const icDie = polyChamferedRect(0.0, 0.0, 11.6, 11.6, 1.6);
  appendBeveledPrism(positions, normals, indices, icDie, ang, -1.45, 3.55, 0.65);

  const icCore = polyChamferedRect(0.0, 0.0, 5.6, 5.6, 0.9);
  appendBeveledPrism(positions, normals, indices, icCore, ang, -1.65, 4.05, 0.55);

  // Lateral Contact Leads (3 left, 3 right)
  for (const sideSign of [-1.0, 1.0]) {
    for (const vPos of [-6.2, 0.0, 6.2]) {
      const lead = polyChamferedRect(sideSign * 12.6, vPos, 8.2, 3.6, 0.7);
      appendBeveledPrism(positions, normals, indices, lead, ang, -1.1, 2.25, 0.55);
    }
  }

  // Central Vertical Data Buses & Terminal Nodes
  for (const vSign of [1.0, -1.0]) {
    const vBus = polyChamferedRect(0.0, vSign * 19.0, 4.0, 20.0, 0.8);
    appendBeveledPrism(positions, normals, indices, vBus, ang, -1.15, 2.35, 0.55);

    const nodeCenter = polyRegularNgon(0.0, vSign * 30.5, 4.5, 8, 22.5);
    appendBeveledPrism(positions, normals, indices, nodeCenter, ang, -1.45, 3.2, 0.65);
  }

  // Four 45-degree Diagonal Signal Buses & Corner Octagonal Nodes
  for (const uSign of [-1.0, 1.0]) {
    for (const vSign of [-1.0, 1.0]) {
      const p0: [number, number] = [uSign * 5.8, vSign * 8.5];
      const p1: [number, number] = [uSign * 11.5, vSign * 25.0];

      // Angled trace bar
      const dx = p1[0] - p0[0];
      const dy = p1[1] - p0[1];
      const len = Math.hypot(dx, dy);
      const nx = -dy / len * 1.9;
      const ny = dx / len * 1.9;

      const tracePoly: [number, number][] = [
        [p0[0] - nx, p0[1] - ny],
        [p1[0] - nx, p1[1] - ny],
        [p1[0] + nx, p1[1] + ny],
        [p0[0] + nx, p0[1] + ny],
      ];
      appendBeveledPrism(positions, normals, indices, tracePoly, ang, -1.1, 2.3, 0.55);

      const cornerNode = polyRegularNgon(uSign * 11.5, vSign * 26.2, 4.1, 8, 22.5);
      appendBeveledPrism(positions, normals, indices, cornerNode, ang, -1.5, 3.1, 0.6);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}
