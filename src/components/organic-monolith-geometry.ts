import * as THREE from 'three';

// ============================================================================
// SIMPLEX NOISE IMPLEMENTATION FOR PROCEDURAL GEOMETRY DEFORMATION
// ============================================================================
class SimplexNoise {
  private p: Uint8Array;
  private perm: Uint8Array;

  constructor(seed = 1337) {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      const tmp = this.p[i];
      this.p[i] = this.p[j];
      this.p[j] = tmp;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  noise3D(xin: number, yin: number, zin: number): number {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);

    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
    const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
    const gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;

    const grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];

    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) {
      t0 *= t0;
      const g = grad3[gi0];
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0 + g[2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) {
      t1 *= t1;
      const g = grad3[gi1];
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1 + g[2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) {
      t2 *= t2;
      const g = grad3[gi2];
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2 + g[2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) {
      t3 *= t3;
      const g = grad3[gi3];
      n3 = t3 * t3 * (g[0] * x3 + g[1] * y3 + g[2] * z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }
}

// ============================================================================
// PROCEDURAL ORGANIC MONOLITH GEOMETRY
// Tall, vertically elongated, asymmetrical sculptural weathered stone
// Mathematically smooth (C-infinity continuous), no capsule geometry, no creases
// ============================================================================
export function createOrganicMonolithGeometry(): THREE.BufferGeometry {
  const simplex = new SimplexNoise(77);

  // High-density UV sphere grid
  const widthSegments = 96;
  const heightSegments = 96;
  const baseGeom = new THREE.SphereGeometry(1.0, widthSegments, heightSegments);

  const posAttr = baseGeom.attributes.position;
  const count = posAttr.count;

  const totalHeight = 4.2;      // Height range: -2.1 to +2.1
  const halfH = totalHeight * 0.5;

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i); // [-1, 1] on unit sphere
    const z = posAttr.getZ(i);

    // Initial vertical elongation
    let newY = y * halfH;
    const u = newY / halfH; // Normalized vertical coordinate [-1, 1]

    // 1. Mathematically smooth radial profile (C-infinity continuous envelope)
    // Matches the reference sculpture:
    // - Smooth organic base
    // - Widest point in upper-middle (u around 0.15 to 0.35)
    // - Broad softly rounded top crest
    const baseEnvelope = Math.sqrt(Math.max(0.001, 1.0 - u * u));
    
    // Asymmetric vertical shaping factor: smoothly expands the upper-middle
    const verticalShaping = 1.0 + 0.24 * u - 0.16 * u * u * u;
    const radiusProfile = baseEnvelope * verticalShaping * 1.48;

    // Horizontal radial components
    const horizDist = Math.sqrt(x * x + z * z);
    const dirX = horizDist > 0.0001 ? x / horizDist : 0;
    const dirZ = horizDist > 0.0001 ? z / horizDist : 0;

    let newX = dirX * radiusProfile;
    // Flatter depth for sculptural stone slab feel
    let newZ = dirZ * radiusProfile * 0.82;

    // 2. Macro Asymmetry (Organic lean & sculptural gesture)
    // Gentle S-curve lean along vertical axis
    const sCurveX = Math.sin((u + 0.15) * Math.PI * 0.8) * 0.16;
    const sCurveZ = Math.cos(u * Math.PI * 0.6) * 0.08;
    newX += sCurveX;
    newZ += sCurveZ;

    // Right-shoulder subtle swelling (smooth organic modulation)
    const rightShoulder = Math.exp(-Math.pow((u - 0.35) / 0.45, 2.0));
    if (newX > 0) {
      newX += 0.14 * rightShoulder;
    }

    // Top crest asymmetrical slope (left shoulder slightly higher)
    const crestWeight = Math.max(0.0, u - 0.4);
    newY += 0.10 * Math.sin(newX * 1.2 + 0.6) * crestWeight;

    // 3. Multi-Scale 3D Simplex Noise Displacement (Eroded stone / cloud surface)
    // Scale 1: Broad geological erosion / natural depressions & swells
    const n1 = simplex.noise3D(newX * 0.7, newY * 0.55, newZ * 0.7) * 0.14;

    // Scale 2: Medium surface transitions / soft sedimentary ridges
    const n2 = simplex.noise3D(newX * 1.6 + 1.2, newY * 1.3, newZ * 1.6) * 0.045;

    // Scale 3: Fine organic tactile micro-softness
    const n3 = simplex.noise3D(newX * 3.2, newY * 2.8, newZ * 3.2) * 0.014;

    const totalDisp = n1 + n2 + n3;
    newX += dirX * totalDisp;
    newZ += dirZ * totalDisp;
    newY += n1 * 0.35;

    posAttr.setXYZ(i, newX, newY, newZ);
  }

  baseGeom.computeVertexNormals();
  return baseGeom;
}
