import * as THREE from 'three';
import { GLSL_SIMPLEX_NOISE } from './atmospheric-shaders';

// ============================================================================
// FUTURISTIC TRANSLUCENT AMBER GLASS & POLISHED RESIN ARTEFACT SHADER
// Refined material language:
// - Deep burnt amber & rich copper-orange body with rust-red undertones
// - Subsurface light transmission (backlight scatter through translucent resin)
// - Warm luminous internal core illumination (breathing digital energy core)
// - Flowing optical caustic ribbons inside the volume (blown-glass depth)
// - Dual-layer specular highlights (sharp polished glass clearcoat + soft subsurface sheen)
// - Warm golden-peach Fresnel rim contouring against dark dusk atmosphere
// ============================================================================
export function createOrganicMonolithMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLightDirection: { value: new THREE.Vector3(2.2, 4.2, 4.8).normalize() },
      uBackLightDirection: { value: new THREE.Vector3(0.0, 3.2, -4.5).normalize() },
      uLightColor: { value: new THREE.Color(0xfff5ea) },         // Warm studio key highlight
      uFillColor: { value: new THREE.Color(0xd9653b) },          // Terracotta / copper fill
      uRimColor: { value: new THREE.Color(0xf6ba8e) },           // Soft warm golden-peach rim
      uAmbientColor: { value: new THREE.Color(0x280e07) },       // Deep mahogany earth ambient
      uBacklightColor: { value: new THREE.Color(0xf58a36) },     // Luminous amber backlight transmission
      uCoreGlowColor: { value: new THREE.Color(0xffad42) },      // Golden internal energy core
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

      // Smooth multi-depth amber glass color gradient
      vec3 getAmberGlassDepthColor(float v, float caustic) {
        // Controlled, refined amber color identity:
        // 1. Deep shadow amber:  #240a04 (rich, dark, luxurious depth)
        // 2. Terracotta rust:    #54170a (warm translucent transition)
        // 3. Rich copper-orange: #b04618 (vibrant polished body)
        // 4. Molten amber:       #df7624 (luminous internal warmth)
        // 5. Golden honey:       #f5ab42 (grazing highlights & core glow)

        vec3 cDarkAmber  = vec3(0.14, 0.04, 0.015);
        vec3 cRustRed    = vec3(0.35, 0.09, 0.04);
        vec3 cCopper     = vec3(0.69, 0.28, 0.095);
        vec3 cMoltenAmber= vec3(0.87, 0.46, 0.14);
        vec3 cHoneyGold  = vec3(0.96, 0.67, 0.26);

        float t = clamp(v * 0.5 + 0.5, 0.0, 1.0);

        vec3 col = cDarkAmber;
        if (t < 0.28) {
          float k = smoothstep(0.0, 0.28, t);
          col = mix(cDarkAmber, cRustRed, k);
        } else if (t < 0.65) {
          float k = smoothstep(0.28, 0.65, t);
          col = mix(cRustRed, cCopper, k);
        } else if (t < 0.88) {
          float k = smoothstep(0.65, 0.88, t);
          col = mix(cCopper, cMoltenAmber, k);
        } else {
          float k = smoothstep(0.88, 1.0, t);
          col = mix(cMoltenAmber, cHoneyGold, k);
        }

        // Modulate with internal optical caustic layer (smooth fluid ribbons)
        col = mix(col, cHoneyGold, caustic * 0.28);
        return col;
      }

      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vWorldViewDir);
        vec3 L = normalize(uLightDirection);
        vec3 BL = normalize(uBackLightDirection);
        vec3 p = vObjectPosition;

        // 1. SILKY OPTICAL CAUSTIC FLOW (Smooth internal ribbons, zero rock noise)
        // Wave equations that follow the sculptural ovoid curves with slow optical drift
        float wave1 = sin(p.y * 1.8 + p.x * 1.2 + cos(p.z * 1.6 + uTime * 0.08) * 0.7);
        float wave2 = cos(p.y * 1.4 - p.z * 1.5 + sin(p.x * 1.3) * 0.5);
        float caustic = (wave1 * 0.5 + wave2 * 0.5) * 0.5 + 0.5;
        caustic = smoothstep(0.25, 0.75, caustic);

        // Normalized height along artefact
        float vNorm = p.y / 1.95; // normalized -1 to +1

        // Base volumetric amber glass albedo
        vec3 baseAlbedo = getAmberGlassDepthColor(vNorm, caustic);

        // 2. SOFT WRAPPED DIFFUSE LIGHTING (Translucent resin response)
        float wrap = 0.40;
        float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
        vec3 diffuse = baseAlbedo * uLightColor * NdotL * 1.2;

        // Atmospheric fill bounce
        float NdotUp = max(0.0, dot(N, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);
        vec3 fill = baseAlbedo * uFillColor * NdotUp * 0.85;

        // Deep earth ambient
        vec3 ambient = baseAlbedo * uAmbientColor * 1.2;

        // 3. SUBSURFACE SCATTERING & BACKLIGHT TRANSMISSION (Amber glass depth)
        // Light passing through the translucent volume toward the viewer from the rear
        float subSurfaceFactor = pow(clamp(dot(V, -BL) * 0.7 + dot(N, -BL) * 0.3 + 0.25, 0.0, 1.0), 3.0);
        vec3 subsurfaceGlow = uBacklightColor * subSurfaceFactor * 0.85;

        // 4. WARM INTERNAL CORE ILLUMINATION (Breathing energy core)
        // Radial volumetric falloff from the heart of the ovoid
        float coreRadius = length(vec3(p.x * 1.15, (p.y - 0.05) * 0.75, p.z * 1.15));
        float coreIntensity = exp(-coreRadius * coreRadius * 0.90);
        vec3 internalCore = uCoreGlowColor * coreIntensity * 0.48;

        // 5. DUAL-LAYER POLISHED GLASS SPECULAR HIGHLIGHTS
        vec3 H = normalize(L + V);
        float NdotH = max(0.0, dot(N, H));
        
        // Layer A: Crisp exterior clearcoat reflection (polished glass luster)
        float clearcoat = pow(NdotH, 48.0) * 0.80;
        // Layer B: Broad, soft subsurface sheen (rich optical body)
        float softSheen = pow(NdotH, 8.0) * 0.16;
        vec3 specular = uLightColor * (clearcoat + softSheen);

        // 6. ELEGANT FRESNEL RIM CONTOURING
        float NdotV = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 3.0);
        vec3 rim = uRimColor * fresnel * 0.80;

        // Final Composite: Depth + Translucency + Internal Glow + Clearcoat Specular + Rim Halo
        vec3 finalColor = ambient + diffuse + fill + subsurfaceGlow + internalCore + specular + rim;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}
