import * as THREE from 'three';
import { GLSL_SIMPLEX_NOISE } from './atmospheric-shaders';

// ============================================================================
// BLOOM: TRANSLUCENT PORCELAIN-GLASS & BOTANICAL ORGANIC SCULPTURE SHADER
// Refined botanical futurism material language:
// - Deep forest shadows & moss-tinted translucent jade body
// - Pale mineral gold edge grazing & subtle celadon highlights
// - Subsurface light scattering filtering through curved translucent petals
// - Warm illuminated ivory-gold internal core (living botanical energy)
// - Flowing optical micro-ribbons simulating light through organic glass
// - Dual-layer specular highlights: polished glass clearcoat + soft organic sheen
// - Pale gold / warm ivory Fresnel rim contouring against dark forest dusk atmosphere
// ============================================================================
export function createOrganicMonolithMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLightDirection: { value: new THREE.Vector3(2.2, 4.2, 4.8).normalize() },
      uBackLightDirection: { value: new THREE.Vector3(0.0, 3.2, -4.5).normalize() },
      uLightColor: { value: new THREE.Color(0xfbf7ed) },         // Warm sunlight key highlight
      uFillColor: { value: new THREE.Color(0x607f59) },          // Botanical moss/leaf fill
      uRimColor: { value: new THREE.Color(0xc7bc91) },           // Pale mineral gold rim grazing
      uAmbientColor: { value: new THREE.Color(0x0a160f) },       // Deep forest ambient
      uBacklightColor: { value: new THREE.Color(0x82996d) },     // Luminous botanical petal transmission
      uCoreGlowColor: { value: new THREE.Color(0xfff1cf) },      // Warm illuminated ivory-gold core
    },
    vertexShader: `
      varying vec3 vObjectPosition;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying vec3 vWorldViewDir;

      void main() {
        vObjectPosition = position;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vWorldViewDir = normalize(cameraPosition - worldPosition.xyz);
        
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uLightDirection;
      uniform vec3 uBackLightDirection;
      uniform vec3 uLightColor;
      uniform vec3 uFillColor;
      uniform vec3 uRimColor;
      uniform vec3 uAmbientColor;
      uniform vec3 uBacklightColor;
      uniform vec3 uCoreGlowColor;

      varying vec3 vObjectPosition;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying vec3 vWorldViewDir;

      ${GLSL_SIMPLEX_NOISE}

      // Smooth multi-depth botanical porcelain-glass color gradient
      vec3 getBotanicalGlassDepthColor(float v, float caustic, float spine) {
        // Controlled, refined botanical color identity:
        // 1. Deep forest shadow:     #0c1911 (rich, deep forest canopy shadow)
        // 2. Rich moss jade:         #1d3824 (translucent organic depth)
        // 3. Translucent celadon:    #4a7051 (porcelain-glass body)
        // 4. Fresh leaf green:       #7b9e68 (radiant petal illumination)
        // 5. Pale mineral gold:      #c7bc91 (grazing highlights)
        // 6. Warm ivory core:        #fbf7ed (inner illumination)

        vec3 cForestDeep = vec3(0.05, 0.10, 0.07);
        vec3 cMossJade   = vec3(0.11, 0.22, 0.14);
        vec3 cCeladon    = vec3(0.29, 0.44, 0.32);
        vec3 cFreshLeaf  = vec3(0.48, 0.62, 0.41);
        vec3 cMineralGold= vec3(0.78, 0.74, 0.57);
        vec3 cWarmIvory  = vec3(0.98, 0.97, 0.93);

        float t = clamp(v * 0.5 + 0.5, 0.0, 1.0);

        vec3 col = cForestDeep;
        if (t < 0.28) {
          float k = smoothstep(0.0, 0.28, t);
          col = mix(cForestDeep, cMossJade, k);
        } else if (t < 0.65) {
          float k = smoothstep(0.28, 0.65, t);
          col = mix(cMossJade, cCeladon, k);
        } else if (t < 0.88) {
          float k = smoothstep(0.65, 0.88, t);
          col = mix(cCeladon, cFreshLeaf, k);
        } else {
          float k = smoothstep(0.88, 1.0, t);
          col = mix(cFreshLeaf, cMineralGold, k);
        }

        // Modulate with internal optical caustic layer (light filtering through petal curves)
        col = mix(col, cMineralGold, caustic * 0.24);

        // Highlight central spine of petals with subtle mineral gold translucency
        col = mix(col, cWarmIvory, spine * 0.20);

        return col;
      }

      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vWorldViewDir);
        vec3 L = normalize(uLightDirection);
        vec3 BL = normalize(uBackLightDirection);
        vec3 p = vObjectPosition;

        // 1. ORGANIC OPTICAL FLUIDITY (Subtle light refraction along petal curvatures)
        float wave1 = sin(p.y * 1.8 + p.x * 1.4 + cos(p.z * 1.5 + uTime * 0.06) * 0.6);
        float wave2 = cos(p.y * 1.3 - p.z * 1.6 + sin(p.x * 1.2) * 0.4);
        float caustic = (wave1 * 0.5 + wave2 * 0.5) * 0.5 + 0.5;
        caustic = smoothstep(0.25, 0.75, caustic);

        // Petal spine ridge prominence
        float spine = exp(-pow(atan(p.x, p.z) * 1.5, 2.0) * 2.0);

        // Normalized height along sculpture
        float vNorm = p.y / 1.95; // normalized -1 to +1

        // Base volumetric botanical porcelain-glass albedo
        vec3 baseAlbedo = getBotanicalGlassDepthColor(vNorm, caustic, spine);

        // 2. SOFT WRAPPED BOTANICAL DIFFUSE LIGHTING (Translucent petal response)
        float wrap = 0.42;
        float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
        vec3 diffuse = baseAlbedo * uLightColor * NdotL * 1.15;

        // Canopy fill bounce (soft upward sky/canopy light)
        float NdotUp = max(0.0, dot(N, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);
        vec3 fill = baseAlbedo * uFillColor * NdotUp * 0.85;

        // Deep forest ambient
        vec3 ambient = baseAlbedo * uAmbientColor * 1.25;

        // 3. SUBSURFACE SCATTERING & BACKLIGHT TRANSMISSION
        // Filtered sunlight through translucent porcelain-glass petals
        float subSurfaceFactor = pow(clamp(dot(V, -BL) * 0.70 + dot(N, -BL) * 0.30 + 0.28, 0.0, 1.0), 2.5);
        vec3 subsurfaceGlow = uBacklightColor * subSurfaceFactor * 1.05;

        // 4. WARM ILLUMINATED BOTANICAL CORE (Luminous central stamen/seed)
        // Radiant warm ivory-gold core glowing from within the opening petals
        float coreRadius = length(vec3(p.x * 1.4, (p.y - 0.18) * 0.9, p.z * 1.4));
        float coreIntensity = exp(-coreRadius * coreRadius * 0.65);
        vec3 internalCore = uCoreGlowColor * coreIntensity * 0.85;

        // 5. DUAL-LAYER SPECULAR HIGHLIGHTS
        vec3 H = normalize(L + V);
        float NdotH = max(0.0, dot(N, H));
        
        // Layer A: Crisp exterior clearcoat reflection (blown glass sheen)
        float clearcoat = pow(NdotH, 48.0) * 0.90;
        // Layer B: Broad, soft organic porcelain sheen
        float softSheen = pow(NdotH, 8.0) * 0.22;
        vec3 specular = uLightColor * (clearcoat + softSheen);

        // 6. ELEGANT PALE MINERAL GOLD FRESNEL RIM CONTOURING
        float NdotV = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 2.8);
        vec3 rim = uRimColor * fresnel * 0.90;

        // Final Composite: Depth + Translucency + Internal Core Glow + Clearcoat Specular + Rim Halo
        vec3 finalColor = ambient + diffuse + fill + subsurfaceGlow + internalCore + specular + rim;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}
