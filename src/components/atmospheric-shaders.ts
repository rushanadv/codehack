import * as THREE from 'three';

// ============================================================================
// GLSL Procedural 2D Simplex Noise Shader Helper
// ============================================================================
const GLSL_SIMPLEX_NOISE = `
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
// 1. ATMOSPHERIC SKY & HORIZON DOME
// ============================================================================
export function createAtmosphericSkyDome(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
} {
  const geom = new THREE.CylinderGeometry(52, 52, 70, 32, 1, true);
  geom.scale(-1, 1, 1);

  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uZenithColor: { value: new THREE.Color(0x061118) },
      uHorizonColor: { value: new THREE.Color(0x286580) }, // Distinct petroleum-teal horizon haze
      uHazeIntensity: { value: 2.2 },
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
      uniform vec3 uHorizonColor;
      uniform float uHazeIntensity;
      varying vec3 vWorldPosition;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        // Elevation angle relative to horizon (around y = -1.5)
        float h = (vWorldPosition.y + 1.5) / 24.0;
        
        // Atmospheric horizon glow band
        float horizonFactor = exp(-max(0.0, h) * 1.5);
        
        // Procedural organic haze variation
        float noise = snoise(vec2(vWorldPosition.x * 0.035 + uTime * 0.02, vWorldPosition.z * 0.035));
        horizonFactor = clamp(horizonFactor + noise * 0.08 * horizonFactor, 0.0, 1.0);

        vec3 sky = mix(uZenithColor, uHorizonColor, clamp(horizonFactor * uHazeIntensity, 0.0, 1.0));
        
        // Ground nadir fade
        if (vWorldPosition.y < -1.8) {
          float groundFade = clamp((-1.8 - vWorldPosition.y) / 6.0, 0.0, 1.0);
          sky = mix(sky, vec3(0.03, 0.045, 0.06), groundFade);
        }

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = 12.0;
  mesh.renderOrder = -100; // Render first as background
  return { mesh, material };
}

// ============================================================================
// 2. DARK REFLECTIVE GROUND PLANE WITH DYNAMIC CONTACT SHADOW
// ============================================================================
export function createAtmosphericGround(): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
} {
  const geom = new THREE.PlaneGeometry(64, 64, 48, 48);
  geom.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uTime: { value: 0 },
      uRotorPos: { value: new THREE.Vector2(0, 0) },
      uGroundColor: { value: new THREE.Color(0x0a151e) },
      uHorizonGlow: { value: new THREE.Color(0x286580) },
      uLimeAccent: { value: new THREE.Color(0xd4ff00) },
      uShadowStrength: { value: 0.94 },
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
      uniform vec3 uGroundColor;
      uniform vec3 uHorizonGlow;
      uniform vec3 uLimeAccent;
      uniform float uShadowStrength;

      varying vec3 vWorldPos;
      varying vec2 vUv;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        float distFromCenter = length(vWorldPos.xz);
        
        // Radial edge fade into distance
        float edgeAlpha = 1.0 - smoothstep(18.0, 30.0, distFromCenter);

        // Dynamic contact shadow beneath the rotor base
        vec2 shadowOffset = vWorldPos.xz - uRotorPos;
        float shadowDist = length(shadowOffset);
        float contactShadow = smoothstep(0.25, 1.85, shadowDist);
        contactShadow = mix(1.0 - uShadowStrength, 1.0, contactShadow);

        // Ground micro-texture (subtle damp sheen)
        float groundNoise = snoise(vWorldPos.xz * 0.5);
        float microSheen = snoise(vWorldPos.xz * 2.8) * 0.08;

        // Fresnel reflection towards grazing angle
        float grazing = pow(clamp(-vWorldPos.z / 20.0, 0.0, 1.0), 1.2);
        vec3 surfaceCol = mix(uGroundColor, uHorizonGlow * 1.5, grazing * 0.8 + microSheen);

        // Acid-lime subtle underglow bounce directly under rotor base
        float limeBounce = exp(-shadowDist * 1.3) * 0.4;
        surfaceCol += uLimeAccent * limeBounce;

        // Apply contact shadow
        surfaceCol *= contactShadow;

        // Depth fogging on ground
        float fogFactor = smoothstep(4.0, 24.0, distFromCenter);
        vec3 finalCol = mix(surfaceCol, uHorizonGlow, fogFactor * 0.85);

        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = -1.74; // Aligned directly beneath rotor base (-1.68)
  mesh.renderOrder = -50;
  return { mesh, material };
}

// ============================================================================
// 3. DISTANT ARCHITECTURAL MONOLITHS (Atmospheric Silhouettes in Haze)
// ============================================================================
export function createDistantMonoliths(): {
  group: THREE.Group;
  materials: THREE.ShaderMaterial[];
} {
  const group = new THREE.Group();
  const materials: THREE.ShaderMaterial[] = [];

  const monolithData = [
    { x: -8.8, z: -11.5, w: 2.2, h: 7.5, d: 2.0 },
    { x: -6.2, z: -10.2, w: 1.6, h: 5.5, d: 1.5 },
    { x: -4.0, z: -12.5, w: 2.4, h: 8.8, d: 2.0 },
    { x: -2.0, z: -9.5,  w: 1.2, h: 4.2, d: 1.2 },
    { x:  2.2, z: -10.0, w: 1.4, h: 4.8, d: 1.2 },
    { x:  4.5, z: -12.0, w: 2.2, h: 8.0, d: 1.8 },
    { x:  6.8, z: -10.5, w: 1.8, h: 5.8, d: 1.5 },
    { x:  9.2, z: -13.0, w: 2.6, h: 9.5, d: 2.2 },
  ];

  monolithData.forEach((m) => {
    const geom = new THREE.BoxGeometry(m.w, m.h, m.d);
    geom.translate(0, m.h / 2, 0);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uHorizonColor: { value: new THREE.Color(0x286580) },
        uBaseColor: { value: new THREE.Color(0x0e1e28) },
        uFogDensity: { value: 0.035 },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uHorizonColor;
        uniform vec3 uBaseColor;
        uniform float uFogDensity;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main() {
          float dist = length(vWorldPos - vec3(0.0, 0.0, 6.2));
          float fog = 1.0 - exp(-dist * uFogDensity);
          fog = clamp(fog, 0.0, 0.95);

          float topHighlight = max(0.0, vNormal.y) * 0.45 + max(0.0, -vNormal.z) * 0.2;
          vec3 col = mix(uBaseColor, uHorizonColor * 1.35, topHighlight);

          float groundHaze = smoothstep(-1.74, 1.5, vWorldPos.y);
          col = mix(uHorizonColor, col, groundHaze);

          vec3 finalColor = mix(col, uHorizonColor, fog);
          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
    });

    materials.push(mat);
    const box = new THREE.Mesh(geom, mat);
    box.position.set(m.x, -1.74, m.z);
    group.add(box);
  });

  return { group, materials };
}

// ============================================================================
// 4. MULTI-LAYER VOLUMETRIC DRIFTING FOG SYSTEM
// ============================================================================
export interface FogSystem {
  group: THREE.Group;
  update: (time: number, scrollProgress: number) => void;
  dispose: () => void;
}

export function createMultiLayerFogSystem(): FogSystem {
  const group = new THREE.Group();

  // A. Low-Lying Ground Mist Plane (Enveloping lower collar of rotor)
  const groundFogGeom = new THREE.PlaneGeometry(38, 38, 32, 32);
  groundFogGeom.rotateX(-Math.PI / 2);

  const groundFogMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(0x286078) },
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
      uniform vec3 uFogColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      ${GLSL_SIMPLEX_NOISE}

      void main() {
        vec2 p = vWorldPos.xz * 0.11;
        float n1 = snoise(p + vec2(uTime * 0.035, uTime * 0.015));
        float n2 = snoise(p * 2.2 - vec2(uTime * 0.02, uTime * 0.04));
        float fogDensity = clamp((n1 * 0.6 + n2 * 0.4) * 0.5 + 0.5, 0.0, 1.0);

        float dist = length(vWorldPos.xz);
        float radialMask = 1.0 - smoothstep(5.0, 17.0, dist);

        float alpha = fogDensity * radialMask * uOpacity;
        gl_FragColor = vec4(uFogColor, alpha);
      }
    `,
  });

  const groundFogMesh = new THREE.Mesh(groundFogGeom, groundFogMat);
  groundFogMesh.position.y = -1.62;
  group.add(groundFogMesh);

  // B. Midground Vertical Fog Banks (Layered billboard sheets with FBM noise)
  const midFogGeom = new THREE.PlaneGeometry(30, 9, 24, 8);
  const midFogLayers: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; speed: number; baseZ: number }[] = [];

  const midZPositions = [-1.0, -2.8, -5.2];
  const midSpeeds = [0.03, -0.022, 0.018];
  const midOpacities = [0.55, 0.68, 0.78];

  midZPositions.forEach((zPos, idx) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(0x245870) },
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
          vec2 p = vec2(vWorldPos.x * 0.09 + uTime * 0.028, vWorldPos.y * 0.16);
          float n = fbm(p);
          float density = clamp(n * 0.5 + 0.5, 0.0, 1.0);

          float vertMask = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.65, 1.0, vUv.y));
          float horizMask = smoothstep(0.0, 0.25, vUv.x) * (1.0 - smoothstep(0.75, 1.0, vUv.x));

          float alpha = density * vertMask * horizMask * uOpacity;
          gl_FragColor = vec4(uFogColor, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(midFogGeom, mat);
    mesh.position.set(0, -0.4 + idx * 0.25, zPos);
    group.add(mesh);
    midFogLayers.push({ mesh, mat, speed: midSpeeds[idx], baseZ: zPos });
  });

  // C. Foreground Wisps (Very subtle, passing in front of rotor's base)
  const foreGeom = new THREE.PlaneGeometry(16, 5, 16, 6);
  const foreMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(0x2a5f78) },
      uOpacity: { value: 0.32 },
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
        vec2 p = vec2(vWorldPos.x * 0.14 - uTime * 0.022, vWorldPos.y * 0.22);
        float n = snoise(p);
        float density = clamp(n * 0.5 + 0.5, 0.0, 1.0);

        float mask = smoothstep(0.0, 0.5, vUv.y) * (1.0 - smoothstep(0.5, 1.0, vUv.y))
                   * smoothstep(0.0, 0.3, vUv.x) * (1.0 - smoothstep(0.7, 1.0, vUv.x));

        float alpha = density * mask * uOpacity;
        gl_FragColor = vec4(uFogColor, alpha);
      }
    `,
  });

  const foreMesh = new THREE.Mesh(foreGeom, foreMat);
  foreMesh.position.set(0, -1.2, 2.0);
  group.add(foreMesh);

  // Update routine
  const update = (time: number, scrollProgress: number) => {
    groundFogMat.uniforms.uTime.value = time;
    foreMat.uniforms.uTime.value = time;

    midFogLayers.forEach((layer) => {
      layer.mat.uniforms.uTime.value = time * (1.0 + layer.speed * 8.0);
      layer.mesh.position.y = -0.4 + Math.sin(time * 0.35 + layer.baseZ) * 0.06 - scrollProgress * 0.15;
    });

    foreMesh.position.x = Math.sin(time * 0.18) * 0.35;
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
// 5. FLOATING ATMOSPHERIC PARTICULATE DUST MOTES
// ============================================================================
export function createAtmosphericParticles(count = 380): {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  update: (time: number) => void;
  dispose: () => void;
} {
  const positions = new Float32Array(count * 3);
  const randomSeeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 14.0;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
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
      uColor: { value: new THREE.Color(0xb8def5) },
      uLimeColor: { value: new THREE.Color(0xd4ff00) },
    },
    vertexShader: `
      attribute vec3 aSeed;
      uniform float uTime;
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.4 + aSeed.x * 6.28) * 0.2;
        p.x += cos(uTime * 0.25 + aSeed.y * 6.28) * 0.18;
        p.z += sin(uTime * 0.2 + aSeed.z * 6.28) * 0.12;

        float lightProximity = exp(-length(p.xz) * 0.32);
        vAlpha = (0.3 + 0.7 * sin(uTime * 1.5 + aSeed.z * 10.0)) * lightProximity * 0.85;

        vColor = (p.y < -0.8) ? vec3(0.83, 1.0, 0.0) : vec3(0.72, 0.87, 0.96);

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (20.0 / -mvPosition.z) * (0.8 + 0.4 * aSeed.x);
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

        float intensity = exp(-dist * dist * 10.0) * vAlpha;
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
