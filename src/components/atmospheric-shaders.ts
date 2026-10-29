import * as THREE from 'three';

// ============================================================================
// GLSL PROCEDURAL 2D SIMPLEX NOISE & FBM HELPER
// ============================================================================
export const GLSL_SIMPLEX_NOISE = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float f = 0.0;
  f += 0.5000 * snoise(p); p *= 2.02;
  f += 0.2500 * snoise(p); p *= 2.03;
  f += 0.1250 * snoise(p); p *= 2.01;
  return f;
}
`;

// ============================================================================
// 1. EXPANSIVE WARM DESERT DUSK SKY & HORIZON DOME
// Dark charcoal-brown zenith transitioning to glowing amber-terracotta horizon
// ============================================================================
export function createAtmosphericSkyDome(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
} {
  const geom = new THREE.SphereGeometry(140, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.62);
  geom.scale(-1, 1, 1);

  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uZenithColor: { value: new THREE.Color(0x0a0504) },     // Deep dark dusk charcoal-brown
      uMidSkyColor: { value: new THREE.Color(0x1a0d0a) },     // Muted earthy terracotta
      uHorizonGlow: { value: new THREE.Color(0xa85e3a) },     // Luminous warm amber-peach horizon haze
      uHorizonY: { value: -0.2 },
      uBandThickness: { value: 5.2 },
      uHazeIntensity: { value: 2.1 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uZenithColor;
      uniform vec3 uMidSkyColor;
      uniform vec3 uHorizonGlow;
      uniform float uHorizonY;
      uniform float uBandThickness;
      uniform float uHazeIntensity;
      varying vec3 vWorldPosition;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        float h = vWorldPosition.y;
        
        // Base sky gradient: zenith down to mid-sky
        float skyT = clamp((h - 4.0) / 45.0, 0.0, 1.0);
        vec3 baseSky = mix(uMidSkyColor, uZenithColor, pow(skyT, 0.75));

        // Warm luminous horizon mist band
        float distFromHorizon = abs(h - uHorizonY);
        float band = exp(-(distFromHorizon * distFromHorizon) / (2.0 * uBandThickness * uBandThickness));

        // Organic slow drifting edge variation
        float drift = fbm(vec2(vWorldPosition.x * 0.012 + uTime * 0.010, vWorldPosition.z * 0.012));
        band = clamp(band * (0.8 + 0.35 * drift) * uHazeIntensity, 0.0, 1.0);

        vec3 finalCol = mix(baseSky, uHorizonGlow, band);

        // Ground nadir fade
        if (h < uHorizonY - 1.0) {
          float groundFade = clamp((uHorizonY - 1.0 - h) / 10.0, 0.0, 1.0);
          finalCol = mix(finalCol, vec3(0.06, 0.03, 0.02), groundFade);
        }

        gl_FragColor = vec4(finalCol, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = 8.0;
  mesh.renderOrder = -200;
  return { mesh, material };
}

// ============================================================================
// 2. HORIZON MIST BAND (Horizontal Warm Peach-Amber Ribbon)
// ============================================================================
export function createHorizonMistBand(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update: (time: number) => void;
  dispose: () => void;
} {
  const geom = new THREE.CylinderGeometry(60, 60, 9.5, 64, 4, true, -Math.PI * 0.65, Math.PI * 1.3);

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uMistColor: { value: new THREE.Color(0xb26c48) }, // Warm dusty amber-terracotta mist
      uOpacity: { value: 0.82 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uMistColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        float vertMask = smoothstep(0.0, 0.45, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));

        vec2 p = vec2(vWorldPos.x * 0.045 + uTime * 0.016, vWorldPos.y * 0.15);
        float n = fbm(p);
        float density = clamp(n * 0.55 + 0.45, 0.0, 1.0);

        float lateralMask = smoothstep(0.0, 0.15, vUv.x) * (1.0 - smoothstep(0.85, 1.0, vUv.x));

        float alpha = vertMask * lateralMask * density * uOpacity;
        gl_FragColor = vec4(uMistColor, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.set(0, 0.8, 0);
  mesh.renderOrder = -150;

  const update = (time: number) => {
    material.uniforms.uTime.value = time;
  };

  const dispose = () => {
    geom.dispose();
    material.dispose();
  };

  return { mesh, material, update, dispose };
}

// ============================================================================
// 3. LOW DESERT MOUNTAIN RIDGES & SILHOUETTES
// Organic rolling dunes and eroded rocky plateaus along horizon
// ============================================================================
export function createDistantTerrainRidges(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  dispose: () => void;
} {
  const width = 110;
  const segmentsX = 96;
  const geom = new THREE.PlaneGeometry(width, 7.5, segmentsX, 8);
  
  const posAttr = geom.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const normalizedY = (y + 3.75) / 7.5;
    
    if (normalizedY > 0.1) {
      const freq1 = Math.sin(x * 0.075) * 1.4;
      const freq2 = Math.cos(x * 0.18 + 0.4) * 0.7;
      const freq3 = Math.sin(x * 0.35 + 1.2) * 0.35;
      const noiseHeight = (freq1 + freq2 + freq3) * normalizedY;
      
      const centerDamp = 1.0 - 0.55 * Math.exp(-(x * x) / 90.0);
      posAttr.setY(i, y + noiseHeight * centerDamp);
    }
  }
  geom.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uBaseColor: { value: new THREE.Color(0x0c0605) },       // Deep desert ridge silhouette
      uHorizonGlow: { value: new THREE.Color(0xa85e3a) },     // Amber-peach horizon mist
      uRidgeHighlight: { value: new THREE.Color(0x522718) },  // Warm crest rim highlight
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uBaseColor;
      uniform vec3 uHorizonGlow;
      uniform vec3 uRidgeHighlight;
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying vec2 vUv;

      void main() {
        float crestHighlight = smoothstep(0.65, 1.0, vUv.y) * 0.5;
        vec3 col = mix(uBaseColor, uRidgeHighlight, crestHighlight);

        float mistFade = (1.0 - smoothstep(0.0, 0.75, vUv.y)) * 0.85;
        col = mix(col, uHorizonGlow, mistFade);

        float dist = length(vWorldPos.xz);
        float alpha = 1.0 - smoothstep(42.0, 68.0, dist);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.set(0, -0.2, -36.0);
  mesh.renderOrder = -120;

  const dispose = () => {
    geom.dispose();
    material.dispose();
  };

  return { mesh, material, dispose };
}

// ============================================================================
// 4. DARK DESERT TERRAIN & SHALLOW REFLECTIVE GROUND PLANE
// Warm earthy ground reflecting the amber horizon glow
// ============================================================================
export function createAtmosphericGround(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update: (time: number) => void;
  dispose: () => void;
} {
  const geom = new THREE.PlaneGeometry(150, 150, 80, 80);
  geom.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uTime: { value: 0 },
      uRotorPos: { value: new THREE.Vector2(0, 0) },
      uDeepGroundColor: { value: new THREE.Color(0x0e0706) },  // Dark desert ground foreground
      uHorizonGlow: { value: new THREE.Color(0xa85e3a) },      // Warm amber-peach horizon reflection
      uLimeAccent: { value: new THREE.Color(0xd4ff00) },       // Restrained acid-lime underglow
      uShadowStrength: { value: 0.90 },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uRotorPos;
      uniform vec3 uDeepGroundColor;
      uniform vec3 uHorizonGlow;
      uniform vec3 uLimeAccent;
      uniform float uShadowStrength;

      varying vec3 vWorldPos;
      varying vec2 vUv;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        float distFromCenter = length(vWorldPos.xz);
        
        float edgeAlpha = 1.0 - smoothstep(32.0, 68.0, distFromCenter);

        // Dynamic contact shadow beneath the monolith base
        vec2 shadowOffset = vWorldPos.xz - uRotorPos;
        float shadowDist = length(shadowOffset);
        float contactShadow = smoothstep(0.4, 2.0, shadowDist);
        contactShadow = mix(1.0 - uShadowStrength, 1.0, contactShadow);

        // Desert ground micro-relief
        float dune1 = snoise(vWorldPos.xz * 0.18 + vec2(uTime * 0.02, 0.0));
        float dune2 = snoise(vWorldPos.xz * 0.45) * 0.5;
        float totalWaves = (dune1 + dune2) * 0.05;

        // Grazing angle Fresnel reflection towards warm horizon
        float grazing = clamp((-vWorldPos.z + 2.0) / 28.0, 0.0, 1.0);
        grazing = pow(grazing, 1.35) + totalWaves;

        vec3 surfaceCol = mix(uDeepGroundColor, uHorizonGlow * 1.25, clamp(grazing, 0.0, 1.0));

        // Subtle specular reflection of monolith in the ground
        float monolithReflectX = exp(-pow(vWorldPos.x - uRotorPos.x, 2.0) / 1.6);
        float monolithReflectZ = smoothstep(-0.5, 3.5, vWorldPos.z) * (1.0 - smoothstep(3.5, 8.0, vWorldPos.z));
        float reflection = monolithReflectX * monolithReflectZ * 0.32;
        surfaceCol += vec3(0.55, 0.25, 0.15) * reflection;

        // Acid-lime underglow bounce directly beneath the base
        float limeBounce = exp(-shadowDist * 1.6) * 0.28;
        surfaceCol += uLimeAccent * limeBounce;

        // Apply contact shadow
        surfaceCol *= contactShadow;

        // Horizon mist depth blending
        float horizonFogFactor = smoothstep(12.0, 48.0, distFromCenter);
        vec3 finalCol = mix(surfaceCol, uHorizonGlow * 0.85, horizonFogFactor * 0.75);

        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = -1.02;
  mesh.renderOrder = -80;

  const update = (time: number) => {
    material.uniforms.uTime.value = time;
  };

  const dispose = () => {
    geom.dispose();
    material.dispose();
  };

  return { mesh, material, update, dispose };
}

// ============================================================================
// 5. MULTI-LAYER VOLUMETRIC DRIFTING FOG SYSTEM
// Warm desert dusk vapor and ground mist
// ============================================================================
export interface FogSystem {
  group: THREE.Group;
  update: (time: number, scrollProgress: number) => void;
  dispose: () => void;
}

export function createMultiLayerFogSystem(): FogSystem {
  const group = new THREE.Group();

  // A. Low-Lying Ground Mist Plane (skimming desert floor and monolith base)
  const groundFogGeom = new THREE.PlaneGeometry(50, 50, 36, 36);
  groundFogGeom.rotateX(-Math.PI / 2);

  const groundFogMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(0x8a4e32) }, // Warm desert ground mist
      uOpacity: { value: 0.70 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uFogColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        vec2 p = vWorldPos.xz * 0.08;
        float n1 = snoise(p + vec2(uTime * 0.022, uTime * 0.010));
        float n2 = snoise(p * 2.4 - vec2(uTime * 0.015, uTime * 0.030));
        float fogDensity = clamp((n1 * 0.65 + n2 * 0.35) * 0.5 + 0.5, 0.0, 1.0);

        float dist = length(vWorldPos.xz);
        float radialMask = 1.0 - smoothstep(4.0, 22.0, dist);

        float alpha = fogDensity * radialMask * uOpacity;
        gl_FragColor = vec4(uFogColor, alpha);
      }
    `,
  });

  const groundFogMesh = new THREE.Mesh(groundFogGeom, groundFogMat);
  groundFogMesh.position.y = -0.92;
  group.add(groundFogMesh);

  // B. Midground Horizon Fog Banks
  const midFogGeom = new THREE.PlaneGeometry(42, 9, 24, 8);
  const midFogLayers: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; speed: number; baseZ: number }[] = [];

  const midZPositions = [-6.0, -14.0, -22.0];
  const midSpeeds = [0.016, -0.010, 0.008];
  const midOpacities = [0.42, 0.54, 0.64];

  midZPositions.forEach((zPos, idx) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(0x9c5938) },
        uOpacity: { value: midOpacities[idx] },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uFogColor;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        ${GLSL_SIMPLEX_NOISE}

        void main() {
          vec2 p = vec2(vWorldPos.x * 0.07 + uTime * 0.016, vWorldPos.y * 0.16);
          float n = fbm(p);
          float density = clamp(n * 0.5 + 0.5, 0.0, 1.0);

          float vertMask = smoothstep(0.0, 0.4, vUv.y) * (1.0 - smoothstep(0.6, 1.0, vUv.y));
          float horizMask = smoothstep(0.0, 0.2, vUv.x) * (1.0 - smoothstep(0.8, 1.0, vUv.x));

          float alpha = density * vertMask * horizMask * uOpacity;
          gl_FragColor = vec4(uFogColor, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(midFogGeom, mat);
    mesh.position.set(0, -0.2 + idx * 0.3, zPos);
    group.add(mesh);
    midFogLayers.push({ mesh, mat, speed: midSpeeds[idx], baseZ: zPos });
  });

  // C. Foreground Wisps
  const foreGeom = new THREE.PlaneGeometry(18, 5, 16, 6);
  const foreMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(0x7c4228) },
      uOpacity: { value: 0.22 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uFogColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        vec2 p = vec2(vWorldPos.x * 0.12 - uTime * 0.014, vWorldPos.y * 0.22);
        float n = snoise(p);
        float density = clamp(n * 0.5 + 0.5, 0.0, 1.0);

        float mask = smoothstep(0.0, 0.5, vUv.y) * (1.0 - smoothstep(0.5, 1.0, vUv.y))
                   * smoothstep(0.0, 0.25, vUv.x) * (1.0 - smoothstep(0.75, 1.0, vUv.x));

        float alpha = density * mask * uOpacity;
        gl_FragColor = vec4(uFogColor, alpha);
      }
    `,
  });

  const foreMesh = new THREE.Mesh(foreGeom, foreMat);
  foreMesh.position.set(0, -1.0, 2.2);
  group.add(foreMesh);

  const update = (time: number, scrollProgress: number) => {
    groundFogMat.uniforms.uTime.value = time;
    foreMat.uniforms.uTime.value = time;

    midFogLayers.forEach((layer) => {
      layer.mat.uniforms.uTime.value = time * (1.0 + layer.speed * 6.0);
      layer.mesh.position.y = -0.2 + Math.sin(time * 0.25 + layer.baseZ) * 0.05 - scrollProgress * 0.12;
    });

    foreMesh.position.x = Math.sin(time * 0.14) * 0.25;
  };

  const dispose = () => {
    groundFogGeom.dispose();
    groundFogMat.dispose();
    midFogGeom.dispose();
    midFogLayers.forEach((l) => l.mat.dispose());
    foreGeom.dispose();
    foreMat.dispose();
  };

  return { group, update, dispose };
}

// ============================================================================
// 6. FLOATING ATMOSPHERIC PARTICULATE DUST MOTES
// Warm golden-amber dust motes drifting in the dusk air
// ============================================================================
export function createAtmosphericParticles(count = 160): {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  update: (time: number) => void;
  dispose: () => void;
} {
  const positions = new Float32Array(count * 3);
  const randomSeeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 14.0;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
    // Keep motes in mid-ground/background (-6.0 to +1.5), well clear of camera at Z=9.6
    positions[i * 3 + 2] = -6.0 + Math.random() * 7.5;

    randomSeeds[i * 3 + 0] = Math.random();
    randomSeeds[i * 3 + 1] = Math.random();
    randomSeeds[i * 3 + 2] = Math.random();
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('aSeed', new THREE.BufferAttribute(randomSeeds, 3));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xf2b488) },     // Warm amber-gold dust
    },
    vertexShader: `
      attribute vec3 aSeed;
      uniform float uTime;
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.35 + aSeed.x * 6.28) * 0.16;
        p.x += cos(uTime * 0.2 + aSeed.y * 6.28) * 0.14;
        p.z += sin(uTime * 0.18 + aSeed.z * 6.28) * 0.10;

        float lightProximity = exp(-length(p.xz) * 0.25);
        vAlpha = (0.20 + 0.55 * sin(uTime * 1.2 + aSeed.z * 8.0)) * lightProximity * 0.65;

        // Warm dusk ambient motes (peach, terracotta, amber gold)
        vColor = mix(vec3(0.95, 0.70, 0.53), vec3(0.85, 0.52, 0.35), aSeed.y);

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (10.0 / -mvPosition.z) * (0.6 + 0.4 * aSeed.x);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        float intensity = exp(-dist * dist * 9.0) * vAlpha;
        gl_FragColor = vec4(vColor, intensity);
      }
    `,
  });

  const points = new THREE.Points(geom, material);

  const update = (time: number) => {
    material.uniforms.uTime.value = time;
  };

  const dispose = () => {
    geom.dispose();
    material.dispose();
  };

  return { points, material, update, dispose };
}
