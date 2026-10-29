import * as THREE from 'three';

// ============================================================================
// GLSL Procedural 2D Simplex Noise & FBM Shader Helper
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
// 1. EXPANSIVE ATMOSPHERIC SKY & HORIZON DOME
// Seamless inverted hemisphere extending edge-to-edge
// ============================================================================
export function createAtmosphericSkyDome(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
} {
  // Vast hemisphere dome with high radius to encompass the full landscape
  const geom = new THREE.SphereGeometry(140, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.62);
  geom.scale(-1, 1, 1);

  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uZenithColor: { value: new THREE.Color(0x03070c) },     // Deep night ink at the zenith
      uMidSkyColor: { value: new THREE.Color(0x0c202a) },     // Desaturated petroleum teal
      uHorizonGlow: { value: new THREE.Color(0x76b8c8) },     // Luminous pale cyan-grey mist band
      uHorizonY: { value: -0.2 },
      uBandThickness: { value: 4.8 },
      uHazeIntensity: { value: 1.95 },
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
        // Vertical elevation normalized from horizon
        float h = vWorldPosition.y;
        
        // Base sky gradient: zenith (dark ink) down to mid sky (petroleum teal)
        float skyT = clamp((h - 5.0) / 45.0, 0.0, 1.0);
        vec3 baseSky = mix(uMidSkyColor, uZenithColor, pow(skyT, 0.8));

        // Distinct, luminous pale cyan-grey horizon mist band
        float distFromHorizon = abs(h - uHorizonY);
        float band = exp(-(distFromHorizon * distFromHorizon) / (2.0 * uBandThickness * uBandThickness));

        // Organic slow drifting edge variation along the horizon
        float drift = fbm(vec2(vWorldPosition.x * 0.015 + uTime * 0.012, vWorldPosition.z * 0.015));
        band = clamp(band * (0.8 + 0.35 * drift) * uHazeIntensity, 0.0, 1.0);

        // Blend the glowing mist band into the sky
        vec3 finalCol = mix(baseSky, uHorizonGlow, band);

        // Ground nadir fade (below horizon)
        if (h < uHorizonY - 1.0) {
          float groundFade = clamp((uHorizonY - 1.0 - h) / 12.0, 0.0, 1.0);
          finalCol = mix(finalCol, vec3(0.02, 0.04, 0.06), groundFade);
        }

        gl_FragColor = vec4(finalCol, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = 8.0;
  mesh.renderOrder = -200; // Always render first in the background
  return { mesh, material };
}

// ============================================================================
// 2. HORIZON MIST BAND (Horizontal Ethereal Ribbon)
// Directly mimics the thin, luminous horizontal mist strip from the reference
// ============================================================================
export function createHorizonMistBand(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update: (time: number) => void;
  dispose: () => void;
} {
  // Curved ribbon stretching 180 degrees across the horizon
  const geom = new THREE.CylinderGeometry(60, 60, 9.0, 64, 4, true, -Math.PI * 0.65, Math.PI * 1.3);

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uMistColor: { value: new THREE.Color(0x76b2c2) },
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
        // Vertical feathering (soft top and bottom edges)
        float vertMask = smoothstep(0.0, 0.45, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));

        // Horizontal noise drift for authentic atmospheric texture
        vec2 p = vec2(vWorldPos.x * 0.045 + uTime * 0.018, vWorldPos.y * 0.15);
        float n = fbm(p);
        float density = clamp(n * 0.55 + 0.45, 0.0, 1.0);

        // Edge lateral fade
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
// 3. LOW NATURAL TERRAIN RIDGES & SILHOUETTES
// Organic distant mountain ridges emerging from the horizon mist
// (NO RECTANGULAR BLOCKS / MONOLITHS)
// ============================================================================
export function createDistantTerrainRidges(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  dispose: () => void;
} {
  // Build an organic terrain ribbon along the back horizon
  const width = 110;
  const segmentsX = 96;
  const geom = new THREE.PlaneGeometry(width, 7.5, segmentsX, 8);
  
  // Displace top vertices with natural mountain ridge noise
  const posAttr = geom.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    
    // Normalize y between 0 (bottom) and 1 (top of ridge)
    const normalizedY = (y + 3.75) / 7.5;
    
    if (normalizedY > 0.1) {
      // Create organic ridge profile: left hills, center dip, right ridges
      const freq1 = Math.sin(x * 0.075) * 1.5;
      const freq2 = Math.cos(x * 0.18 + 0.4) * 0.8;
      const freq3 = Math.sin(x * 0.35 + 1.2) * 0.4;
      const noiseHeight = (freq1 + freq2 + freq3) * normalizedY;
      
      // Keep center somewhat lower so the central rotor is hero against horizon
      const centerDamp = 1.0 - 0.55 * Math.exp(-(x * x) / 90.0);
      posAttr.setY(i, y + noiseHeight * centerDamp);
    }
  }
  geom.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uBaseColor: { value: new THREE.Color(0x04090e) },     // Deep charcoal rock silhouette
      uHorizonGlow: { value: new THREE.Color(0x6ca4b4) },   // Luminous horizon mist
      uRidgeHighlight: { value: new THREE.Color(0x3a6878) },// Subtle rim on crests
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
        // Crest rim light (top edge of ridge catches horizon light)
        float crestHighlight = smoothstep(0.65, 1.0, vUv.y) * 0.45;
        vec3 col = mix(uBaseColor, uRidgeHighlight, crestHighlight);

        // Atmospheric depth haze: base of hills enveloped in horizon mist
        float mistFade = (1.0 - smoothstep(0.0, 0.75, vUv.y)) * 0.82;
        col = mix(col, uHorizonGlow, mistFade);

        // Distance fogging
        float dist = length(vWorldPos.xz);
        float alpha = 1.0 - smoothstep(42.0, 68.0, dist);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.set(0, -0.2, -36.0); // Placed in the far distance along the horizon
  mesh.renderOrder = -120;

  const dispose = () => {
    geom.dispose();
    material.dispose();
  };

  return { mesh, material, dispose };
}

// ============================================================================
// 4. DARK REFLECTIVE WATER & ROCK GROUND PLANE
// Calm water surface reflecting the pale cyan-grey horizon mist & rotor
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
      uDeepWaterColor: { value: new THREE.Color(0x04080c) },  // Deep dark foreground
      uHorizonGlow: { value: new THREE.Color(0x6ca4b4) },     // Pale cyan-grey mist reflection
      uLimeAccent: { value: new THREE.Color(0xd4ff00) },      // Subdued acid-lime underglow
      uShadowStrength: { value: 0.88 },
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
      uniform vec3 uDeepWaterColor;
      uniform vec3 uHorizonGlow;
      uniform vec3 uLimeAccent;
      uniform float uShadowStrength;

      varying vec3 vWorldPos;
      varying vec2 vUv;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        float distFromCenter = length(vWorldPos.xz);
        
        // Lateral edge fade so plane blends seamlessly into the horizon
        float edgeAlpha = 1.0 - smoothstep(32.0, 68.0, distFromCenter);

        // Dynamic contact shadow beneath the rotor base
        vec2 shadowOffset = vWorldPos.xz - uRotorPos;
        float shadowDist = length(shadowOffset);
        float contactShadow = smoothstep(0.3, 1.9, shadowDist);
        contactShadow = mix(1.0 - uShadowStrength, 1.0, contactShadow);

        // Water surface gentle micro-ripples
        float wave1 = snoise(vWorldPos.xz * 0.28 + vec2(uTime * 0.04, uTime * 0.02));
        float wave2 = snoise(vWorldPos.xz * 0.65 - vec2(uTime * 0.03, uTime * 0.05)) * 0.5;
        float totalWaves = (wave1 + wave2) * 0.06;

        // Fresnel reflection towards grazing angle (distant horizon reflections)
        // Camera looks towards -Z; as -Z increases, grazing angle approaches 0
        float grazing = clamp((-vWorldPos.z + 2.0) / 28.0, 0.0, 1.0);
        grazing = pow(grazing, 1.35) + totalWaves;

        // Surface color: deep dark water in near foreground, reflecting mist towards horizon
        vec3 surfaceCol = mix(uDeepWaterColor, uHorizonGlow * 1.3, clamp(grazing, 0.0, 1.0));

        // Subtle specular reflection of rotor in the water
        float rotorReflectX = exp(-pow(vWorldPos.x - uRotorPos.x, 2.0) / 1.8);
        float rotorReflectZ = smoothstep(-0.5, 3.5, vWorldPos.z) * (1.0 - smoothstep(3.5, 8.0, vWorldPos.z));
        float rotorReflection = rotorReflectX * rotorReflectZ * 0.35;
        surfaceCol += vec3(0.18, 0.24, 0.28) * rotorReflection;

        // Acid-lime underglow bounce directly beneath the rotor base
        float limeBounce = exp(-shadowDist * 1.5) * 0.32;
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
  mesh.position.y = -1.02; // Exactly beneath rotor base
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
// Ground mist and atmospheric layers drifting with organic speeds
// ============================================================================
export interface FogSystem {
  group: THREE.Group;
  update: (time: number, scrollProgress: number) => void;
  dispose: () => void;
}

export function createMultiLayerFogSystem(): FogSystem {
  const group = new THREE.Group();

  // A. Low-Lying Ground Mist Plane (skimming water and rotor base)
  const groundFogGeom = new THREE.PlaneGeometry(50, 50, 36, 36);
  groundFogGeom.rotateX(-Math.PI / 2);

  const groundFogMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(0x609caa) }, // Pale cyan-grey ground vapor
      uOpacity: { value: 0.72 },
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
        float n1 = snoise(p + vec2(uTime * 0.025, uTime * 0.012));
        float n2 = snoise(p * 2.4 - vec2(uTime * 0.018, uTime * 0.035));
        float fogDensity = clamp((n1 * 0.65 + n2 * 0.35) * 0.5 + 0.5, 0.0, 1.0);

        float dist = length(vWorldPos.xz);
        float radialMask = 1.0 - smoothstep(4.0, 22.0, dist);

        float alpha = fogDensity * radialMask * uOpacity;
        gl_FragColor = vec4(uFogColor, alpha);
      }
    `,
  });

  const groundFogMesh = new THREE.Mesh(groundFogGeom, groundFogMat);
  groundFogMesh.position.y = -0.92; // Just above ground plane (-1.02)
  group.add(groundFogMesh);

  // B. Midground Horizon Fog Banks (Layered billboard sheets drifting across)
  const midFogGeom = new THREE.PlaneGeometry(42, 9, 24, 8);
  const midFogLayers: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; speed: number; baseZ: number }[] = [];

  const midZPositions = [-6.0, -14.0, -22.0];
  const midSpeeds = [0.018, -0.012, 0.009];
  const midOpacities = [0.45, 0.58, 0.68];

  midZPositions.forEach((zPos, idx) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(0x6ea6b6) },
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
          vec2 p = vec2(vWorldPos.x * 0.07 + uTime * 0.018, vWorldPos.y * 0.16);
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

  // C. Foreground Wisps (Soft, ephemeral atmospheric pass in front of rotor)
  const foreGeom = new THREE.PlaneGeometry(18, 5, 16, 6);
  const foreMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(0x5a8f9e) },
      uOpacity: { value: 0.24 },
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
        vec2 p = vec2(vWorldPos.x * 0.12 - uTime * 0.016, vWorldPos.y * 0.22);
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

  // Update routine
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
// Soft Gaussian illuminated motes drifting in the dusky atmosphere
// ============================================================================
export function createAtmosphericParticles(count = 280): {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  update: (time: number) => void;
  dispose: () => void;
} {
  const positions = new Float32Array(count * 3);
  const randomSeeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 16.0;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6.0;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8.0;

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
      uColor: { value: new THREE.Color(0xa8d2e2) },
      uLimeColor: { value: new THREE.Color(0xd4ff00) },
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

        float lightProximity = exp(-length(p.xz) * 0.28);
        vAlpha = (0.25 + 0.65 * sin(uTime * 1.2 + aSeed.z * 8.0)) * lightProximity * 0.75;

        vColor = (p.y < -0.8) ? vec3(0.83, 1.0, 0.0) : vec3(0.66, 0.82, 0.89);

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (18.0 / -mvPosition.z) * (0.8 + 0.4 * aSeed.x);
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
