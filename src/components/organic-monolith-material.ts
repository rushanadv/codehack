import * as THREE from 'three';
import { GLSL_SIMPLEX_NOISE } from './atmospheric-shaders';

// ============================================================================
// PROCEDURAL GEOLOGICAL CLOUD-BAND MATERIAL
// Recreates the burnt-orange, terracotta, rust-red, peach, and cream layers
// directly inspired by the sculptural monolith above "CLARTÉ WORLD"
// ============================================================================
export function createOrganicMonolithMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLightDirection: { value: new THREE.Vector3(4.5, 6.0, 4.0).normalize() },
      uLightColor: { value: new THREE.Color(0xffeedb) },        // Warm desert sun highlight
      uFillColor: { value: new THREE.Color(0x4a2418) },         // Terracotta atmospheric fill
      uRimColor: { value: new THREE.Color(0xf6d4be) },          // Soft dusty peach rim light
      uAmbientColor: { value: new THREE.Color(0x28130e) },      // Deep earth ambient
      uLimeAccent: { value: new THREE.Color(0xd4ff00) },        // Subtle IdleX brand underglow
    },
    vertexShader: `
      varying vec3 vObjectPosition;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vObjectPosition = position;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = viewMatrix * worldPosition;
        vViewPosition = -mvPosition.xyz;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uLightDirection;
      uniform vec3 uLightColor;
      uniform vec3 uFillColor;
      uniform vec3 uRimColor;
      uniform vec3 uAmbientColor;
      uniform vec3 uLimeAccent;

      varying vec3 vObjectPosition;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      ${GLSL_SIMPLEX_NOISE}

      // Smooth multi-strata geological cloud interpolation
      vec3 getGeologicalCloudColor(float t) {
        // Natural color stops matching reference "CLARTÉ WORLD":
        // 1. Deep shadow rust: #3b110a
        // 2. Burnt terracotta: #d46222
        // 3. Deep rust-red:    #7a1e12
        // 4. Luminous cream:   #f6dfd4
        // 5. Dusty peach:      #e69a74
        // 6. Warm amber-ochre: #be7a3c

        vec3 cDarkRust   = vec3(0.24, 0.08, 0.05); // Deep shadow
        vec3 cTerracotta = vec3(0.83, 0.38, 0.13); // Burnt terracotta
        vec3 cRustRed    = vec3(0.50, 0.12, 0.07); // Rich rust-red
        vec3 cCream      = vec3(0.96, 0.88, 0.83); // Cream cloud layer
        vec3 cPeach      = vec3(0.91, 0.61, 0.46); // Dusty peach
        vec3 cAmberOchre = vec3(0.76, 0.48, 0.25); // Warm amber

        float normT = clamp(t, 0.0, 1.0);

        vec3 col = cDarkRust;
        if (normT < 0.18) {
          // Base shadow to terracotta
          float k = smoothstep(0.0, 0.18, normT);
          col = mix(cDarkRust, cTerracotta, k);
        } else if (normT < 0.36) {
          // Terracotta to deep rust-red band
          float k = smoothstep(0.18, 0.36, normT);
          col = mix(cTerracotta, cRustRed, k);
        } else if (normT < 0.54) {
          // Rust-red to soft peach
          float k = smoothstep(0.36, 0.54, normT);
          col = mix(cRustRed, cPeach, k);
        } else if (normT < 0.72) {
          // Peach to luminous cream cloud band
          float k = smoothstep(0.54, 0.72, normT);
          col = mix(cPeach, cCream, k);
        } else if (normT < 0.88) {
          // Cream cloud to deep rust-red band
          float k = smoothstep(0.72, 0.88, normT);
          col = mix(cCream, cRustRed, k);
        } else {
          // Upper rust-red to warm terracotta crest
          float k = smoothstep(0.88, 1.0, normT);
          col = mix(cRustRed, cTerracotta, k);
        }

        return col;
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPosition);
        vec3 L = normalize(uLightDirection);

        // 1. Organic Domain Warping for Horizontal Sedimentary Striations
        vec3 p = vObjectPosition;

        // Horizontally stretched noise (low freq in X/Z, higher freq in Y)
        float w1 = snoise(vec2(p.x * 0.38 + 0.2, p.z * 0.38 + 0.5));
        float w2 = snoise(vec2(p.x * 0.8 - 0.4, p.y * 1.4));
        
        // Primary horizontal band coordinate with organic undulating drift
        float bandY = p.y * 0.42 + 0.5 + w1 * 0.14 + w2 * 0.08;

        // Secondary subtle cloud turbulence along the bands
        float turbulence = fbm(vec2(p.x * 0.9 + p.z * 0.6, p.y * 2.2)) * 0.06;
        bandY += turbulence;

        // Base geological color
        vec3 baseAlbedo = getGeologicalCloudColor(bandY);

        // Fine mineral grain texture
        float grain = snoise(p.xy * 24.0) * 0.022;
        baseAlbedo += grain;

        // 2. Soft Wrapped Diffuse Lighting (Matte stone / velvety cloud feel)
        float wrap = 0.40;
        float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
        vec3 diffuse = baseAlbedo * uLightColor * NdotL * 1.2;

        // Atmospheric fill bounce
        float NdotUp = max(0.0, dot(N, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);
        vec3 fill = baseAlbedo * uFillColor * NdotUp * 1.1;

        // Deep earth ambient
        vec3 ambient = baseAlbedo * uAmbientColor;

        // 3. Subtle Non-Metallic Diffuse Sheen (No harsh plastic glare)
        vec3 H = normalize(L + V);
        float NdotH = max(0.0, dot(N, H));
        float sheen = pow(NdotH, 6.0) * 0.07;
        vec3 specCol = uLightColor * sheen;

        // 4. Soft Rim Lighting (Accentuates the sculptural silhouette against dusk)
        float NdotV = max(0.0, dot(N, V));
        float rimFactor = pow(1.0 - NdotV, 3.0);
        vec3 rim = uRimColor * rimFactor * 0.55;

        // 5. Restrained Acid-Lime Underglow Bounce at the base
        float baseDistance = clamp((-p.y - 0.9) / 1.1, 0.0, 1.0);
        vec3 limeBounce = uLimeAccent * pow(baseDistance, 2.0) * 0.24;

        // Final Composite Color
        vec3 finalColor = ambient + diffuse + fill + specCol + rim + limeBounce;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}
