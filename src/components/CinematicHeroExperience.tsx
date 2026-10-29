'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown, Compass, Sparkles, Shield, Cpu, Building2, Cog } from 'lucide-react';
import * as THREE from 'three';
import {
  createRotorCoreGeometry,
  createTitaniumAccentsGeometry,
  createSlatePanelsGeometry,
  createPropertySpacesMotifGeometry,
  createPhysicalAssetsMotifGeometry,
  createDigitalTechMotifGeometry,
} from './rotor-geometry';
import {
  createAtmosphericSkyDome,
  createAtmosphericGround,
  createDistantMonoliths,
  createMultiLayerFogSystem,
  createAtmosphericParticles,
} from './atmospheric-shaders';

interface DimensionChapter {
  id: string;
  num: string;
  name: string;
  heroKicker: string;
  headlineLine1: string;
  headlineLine2: string;
  copy: string;
  ctaText: string;
  ctaHref: string;
  rotationDeg: number;
}

const CHAPTERS: DimensionChapter[] = [
  {
    id: 'hero',
    num: '00',
    name: 'OVERVIEW',
    heroKicker: 'IDLEX — THE INTELLIGENT RESOURCE EXCHANGE',
    headlineLine1: 'EVERY RESOURCE.',
    headlineLine2: 'A NEW POSSIBILITY.',
    copy: 'Discover the spaces, equipment and technical resources already around you.',
    ctaText: 'EXPLORE RESOURCES',
    ctaHref: '/explore',
    rotationDeg: 0,
  },
  {
    id: 'spaces',
    num: '01',
    name: 'LAND, PROPERTY & SPACES',
    heroKicker: 'DIMENSION 01 — ARCHITECTURAL CAPACITY',
    headlineLine1: 'SPACE',
    headlineLine2: 'TO BUILD.',
    copy: 'Discover land, properties, laboratories, workshops and collaborative spaces.',
    ctaText: 'BROWSE SPACES & FACILITIES',
    ctaHref: '/explore?category=space',
    rotationDeg: 0,
  },
  {
    id: 'assets',
    num: '02',
    name: 'PHYSICAL ASSETS',
    heroKicker: 'DIMENSION 02 — PRECISION ENGINEERING',
    headlineLine1: 'TOOLS',
    headlineLine2: 'IN MOTION.',
    copy: 'Find the equipment, instruments and tools that turn ideas into reality.',
    ctaText: 'BROWSE PHYSICAL ASSETS',
    ctaHref: '/explore?category=equipment',
    rotationDeg: 120,
  },
  {
    id: 'digital',
    num: '03',
    name: 'DIGITAL & TECH',
    heroKicker: 'DIMENSION 03 — DISTRIBUTED COMPUTE',
    headlineLine1: 'ACCESS',
    headlineLine2: "WHAT'S NEXT.",
    copy: 'Discover licensed software, authorised APIs and shared technical capabilities.',
    ctaText: 'EXPLORE DIGITAL & COMPUTE',
    ctaHref: '/explore?category=digital',
    rotationDeg: 240,
  },
];

export default function CinematicHeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentDeg, setCurrentDeg] = useState(0);

  // References for Three.js animation synchronization
  const progressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Scroll listener tracking overall pinned hero progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / totalScrollable));
      progressRef.current = p;
      setScrollProgress(p);

      // Determine active chapter:
      // 0.00 - 0.22 -> Chapter 0 (Hero Overview)
      // 0.22 - 0.48 -> Chapter 1 (Property & Spaces)
      // 0.48 - 0.74 -> Chapter 2 (Physical Assets)
      // 0.74 - 1.00 -> Chapter 3 (Digital & Tech)
      let chapterIdx = 0;
      if (p >= 0.74) {
        chapterIdx = 3;
      } else if (p >= 0.48) {
        chapterIdx = 2;
      } else if (p >= 0.22) {
        chapterIdx = 1;
      } else {
        chapterIdx = 0;
      }
      setActiveChapterIndex(chapterIdx);

      // Rotation degrees (from 0° to 240°)
      let calculatedDeg = 0;
      if (p <= 0.22) {
        calculatedDeg = 0;
      } else if (p <= 0.48) {
        const factor = (p - 0.22) / (0.48 - 0.22);
        calculatedDeg = factor * 120;
      } else if (p <= 0.74) {
        const factor = (p - 0.48) / (0.74 - 0.48);
        calculatedDeg = 120 + factor * 120;
      } else {
        calculatedDeg = 240;
      }
      setCurrentDeg(Math.round(calculatedDeg));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pointer parallax listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Three.js Full-Viewport Scene Setup
  useEffect(() => {
    const holder = canvasHolderRef.current;
    if (!holder) return;

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071118);
    scene.fog = new THREE.FogExp2(0x132a36, 0.025);

    // 2. Camera Setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 120);
    camera.position.set(0, 0.35, 6.2);

    // 3. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    holder.appendChild(renderer.domElement);

    // 4. ATMOSPHERIC WORLD ENVIRONMENT
    // A. Sky & Horizon Gradient Dome (Petroleum-teal horizon fade)
    const { mesh: skyDome, material: skyMat } = createAtmosphericSkyDome();
    scene.add(skyDome);

    // B. Reflective Ground Plane with Dynamic Contact Shadow
    const { mesh: groundMesh, material: groundMat } = createAtmosphericGround();
    scene.add(groundMesh);

    // C. Distant Architectural Monolith Silhouettes in Haze
    const { group: monolithGroup, materials: monolithMats } = createDistantMonoliths();
    scene.add(monolithGroup);

    // D. Multi-Layer Volumetric Drifting Fog System
    const fogSystem = createMultiLayerFogSystem();
    scene.add(fogSystem.group);

    // E. Floating Atmospheric Particulate Dust Motes
    const { points: dustPoints, material: dustMat, update: updateDust, dispose: disposeDust } =
      createAtmosphericParticles(380);
    scene.add(dustPoints);

    // 5. STUDIO & ENVIRONMENTAL LIGHTING RIG
    const ambientLight = new THREE.AmbientLight(0x192730, 2.0);
    scene.add(ambientLight);

    // Key Directional Light (Warm-neutral specular from upper right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(4.5, 6.0, 4.5);
    scene.add(keyLight);

    // Fill Light (Desaturated teal atmospheric bounce from left)
    const fillLight = new THREE.DirectionalLight(0x7694a8, 2.2);
    fillLight.position.set(-5.0, 3.0, 3.5);
    scene.add(fillLight);

    // Horizon Backlight / Contouring Rim Light (Defines metallic edges against fog)
    const horizonRimLight = new THREE.DirectionalLight(0x9bc2d9, 3.0);
    horizonRimLight.position.set(0.0, 4.0, -5.5);
    scene.add(horizonRimLight);

    // Acid-Lime Underglow Point Light (Bounces onto base collar and ground)
    const limeAccentLight = new THREE.PointLight(0xd4ff00, 3.2, 9.0);
    limeAccentLight.position.set(0, -2.8, 1.8);
    scene.add(limeAccentLight);

    // 6. ROTOR MATERIALS (Industrial Graphite, Brushed Titanium, Anodized Slate, Lime)
    const matGraphite = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.88,
      roughness: 0.36,
      envMapIntensity: 0.8,
    });

    const matTitanium = new THREE.MeshStandardMaterial({
      color: 0xb4b9c2,
      metalness: 0.95,
      roughness: 0.22,
      envMapIntensity: 1.4,
    });

    const matSlate = new THREE.MeshStandardMaterial({
      color: 0x1b1f26,
      metalness: 0.82,
      roughness: 0.42,
    });

    const matLimeAccent = new THREE.MeshStandardMaterial({
      color: 0xd4ff00,
      emissive: 0xd4ff00,
      emissiveIntensity: 0.65,
      metalness: 0.1,
      roughness: 0.3,
    });

    // 7. ASSEMBLE 3D PROCEDURAL ROTOR MESHES
    const coreGeom = createRotorCoreGeometry();
    const coreMesh = new THREE.Mesh(coreGeom, matGraphite);

    const titaniumGeom = createTitaniumAccentsGeometry();
    const titaniumMesh = new THREE.Mesh(titaniumGeom, matTitanium);

    const slateGeom = createSlatePanelsGeometry();
    const slateMesh = new THREE.Mesh(slateGeom, matSlate);

    const motif1Geom = createPropertySpacesMotifGeometry();
    const motif1Mesh = new THREE.Mesh(motif1Geom, matTitanium);

    const motif2Geom = createPhysicalAssetsMotifGeometry();
    const motif2Mesh = new THREE.Mesh(motif2Geom, matTitanium);

    const motif3Geom = createDigitalTechMotifGeometry();
    const motif3Mesh = new THREE.Mesh(motif3Geom, matTitanium);

    // Crown Lime Torus
    const crownRingGeom = new THREE.TorusGeometry(0.85, 0.022, 16, 64);
    crownRingGeom.rotateX(Math.PI / 2);
    crownRingGeom.translate(0, 1.66, 0);
    const crownRingMesh = new THREE.Mesh(crownRingGeom, matLimeAccent);

    // Group holding the complete rotor
    const rotorGroup = new THREE.Group();
    rotorGroup.add(coreMesh);
    rotorGroup.add(titaniumMesh);
    rotorGroup.add(slateMesh);
    rotorGroup.add(motif1Mesh);
    rotorGroup.add(motif2Mesh);
    rotorGroup.add(motif3Mesh);
    rotorGroup.add(crownRingMesh);

    // Scale up the rotor for a monumental, sculptural presence
    rotorGroup.scale.set(1.28, 1.28, 1.28);
    rotorGroup.position.set(0, 0.38, 0);
    scene.add(rotorGroup);

    // 8. Resize Handler
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      if (w < 768) {
        camera.fov = 42;
        camera.position.z = 6.8;
      } else {
        camera.fov = 34;
        camera.position.z = 6.2;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();
    window.addEventListener('resize', onResize);

    // 9. Continuous Animation Loop (Synchronized to Scroll & Mouse Parallax)
    let animId: number;
    const startTime = performance.now();
    const FACE_STEP_RAD = (2 * Math.PI) / 3; // 120° in radians

    let currentRotY = 0;
    let currentPosX = 0;
    let currentPosY = -0.05;
    let currentPosZ = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;
      const p = progressRef.current; // 0.00 to 1.00

      // Mouse parallax smoothing
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Update Environmental Shaders
      skyMat.uniforms.uTime.value = elapsedTime;
      groundMat.uniforms.uTime.value = elapsedTime;
      fogSystem.update(elapsedTime, p);
      updateDust(elapsedTime);

      // Choreographed Target Transform based on scroll progress:
      let targetRotY = 0;
      let targetPosX = 0;
      let targetPosY = 0.38;
      let targetScale = 1.28;

      const isMobile = window.innerWidth < 1024;

      if (p <= 0.22) {
        // Stage 0: Hero Overview
        targetRotY = 0;
        targetPosX = 0;
        targetPosY = isMobile ? 0.2 : 0.38;
        targetScale = isMobile ? 1.08 : 1.28;
      } else if (p <= 0.48) {
        // Stage 1: Property & Spaces (Face 1 at 0°)
        const stageFactor = (p - 0.22) / (0.48 - 0.22);
        targetRotY = 0;
        targetPosX = isMobile ? 0 : 1.25; // Shift right to let typography sit across lower-left
        targetPosY = isMobile ? 0.45 : 0.38;
        targetScale = isMobile ? 1.05 : 1.28;
      } else if (p <= 0.74) {
        // Stage 2: Physical Assets (Face 2 at 120°)
        const stageFactor = (p - 0.48) / (0.74 - 0.48);
        targetRotY = -FACE_STEP_RAD * Math.min(1, stageFactor * 1.06);
        targetPosX = isMobile ? 0 : -1.25; // Shift left to let typography sit across lower-right
        targetPosY = isMobile ? 0.45 : 0.38;
        targetScale = isMobile ? 1.05 : 1.28;
      } else {
        // Stage 3: Digital & Tech (Face 3 at 240°)
        const stageFactor = Math.min(1, (p - 0.74) / (1.00 - 0.74));
        targetRotY = -FACE_STEP_RAD * (1 + stageFactor);
        targetPosX = 0; // Re-center with dramatic scale
        targetPosY = isMobile ? 0.3 : 0.32;
        targetScale = isMobile ? 1.15 : 1.32;
      }

      // Smooth damped lerp towards target transforms
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentPosX += (targetPosX - currentPosX) * 0.08;
      currentPosY += (targetPosY - currentPosY) * 0.08;

      rotorGroup.rotation.y = currentRotY;
      rotorGroup.position.x = currentPosX;
      rotorGroup.position.y = currentPosY + Math.sin(elapsedTime * 0.8) * 0.025; // breathing float
      rotorGroup.scale.set(targetScale, targetScale, targetScale);

      // Subtle dynamic tilt and mouse parallax
      rotorGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.02 + 0.04 + mouse.y * 0.035;
      rotorGroup.rotation.z = Math.cos(elapsedTime * 0.45) * 0.012 - mouse.x * 0.025;

      // Update ground contact shadow position to track rotor's X position
      groundMat.uniforms.uRotorPos.value.set(currentPosX, 0.0);

      // Camera parallax
      camera.position.x = mouse.x * 0.25;
      camera.position.y = 0.1 + mouse.y * 0.18;
      camera.lookAt(currentPosX * 0.3, currentPosY * 0.5, 0);

      // Stage-specific environmental lighting transitions
      if (p >= 0.74) {
        // Digital stage: intensify cyan/lime luminous details
        limeAccentLight.intensity = 4.0;
        skyMat.uniforms.uHorizonColor.value.setHex(0x0e2430);
      } else if (p >= 0.48) {
        // Physical stage: high-contrast metallic highlights
        limeAccentLight.intensity = 2.4;
        keyLight.intensity = 4.2;
        skyMat.uniforms.uHorizonColor.value.setHex(0x0a1c26);
      } else {
        // Spaces / Overview stage: architectural twilight atmosphere
        limeAccentLight.intensity = 2.8;
        keyLight.intensity = 3.6;
        skyMat.uniforms.uHorizonColor.value.setHex(0x0c1b24);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);

      coreGeom.dispose();
      titaniumGeom.dispose();
      slateGeom.dispose();
      motif1Geom.dispose();
      motif2Geom.dispose();
      motif3Geom.dispose();
      crownRingGeom.dispose();

      matGraphite.dispose();
      matTitanium.dispose();
      matSlate.dispose();
      matLimeAccent.dispose();

      skyDome.geometry.dispose();
      skyMat.dispose();

      groundMesh.geometry.dispose();
      groundMat.dispose();

      monolithGroup.children.forEach((c) => {
        if (c instanceof THREE.Mesh) c.geometry.dispose();
      });
      monolithMats.forEach((m) => m.dispose());

      fogSystem.dispose();
      disposeDust();

      renderer.dispose();
      if (renderer.domElement && holder.contains(renderer.domElement)) {
        holder.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Programmatic scroll helper to jump to a specific chapter
  const scrollToChapter = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentY = window.scrollY;
    const containerTop = currentY + rect.top;
    const totalDist = rect.height - window.innerHeight;

    let targetFraction = 0.05;
    if (index === 1) targetFraction = 0.32;
    if (index === 2) targetFraction = 0.60;
    if (index === 3) targetFraction = 0.88;

    window.scrollTo({
      top: containerTop + targetFraction * totalDist,
      behavior: 'smooth',
    });
  };

  const currentChapter = CHAPTERS[activeChapterIndex];

  return (
    <div ref={containerRef} className="relative w-full h-[440vh] bg-[#05070A]">
      
      {/* =========================================================================
          STICKY FULL-VIEWPORT 3D CANVAS & EDITORIAL CHOREOGRAPHY
          ========================================================================= */}
      <div className="sticky top-0 w-full h-screen overflow-hidden select-none">
        
        {/* =========================================================================
            EDGE-ALIGNED MINIMALIST PERIMETER NAVIGATION (Quiet, High-Taste Header)
            ========================================================================= */}
        <header className="absolute top-0 left-0 right-0 z-50 px-6 sm:px-12 py-7 flex items-center justify-between pointer-events-none select-none">
          
          {/* Top-Left: Minimalist Brand */}
          <div className="pointer-events-auto flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] shadow-[0_0_10px_#D4FF00] group-hover:scale-125 transition-transform" />
              <span className="font-mono font-black text-sm tracking-widest text-white uppercase">
                IDLEX<span className="text-[#D4FF00]">.</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400 border border-white/10 px-1.5 py-0.5 rounded tracking-widest">
                V2.6
              </span>
            </Link>
          </div>

          {/* Top-Right: Quiet Navigation & App Launch Link */}
          <div className="pointer-events-auto flex items-center gap-6 sm:gap-8 text-xs font-mono tracking-widest">
            <Link
              href="/explore"
              className="hidden sm:inline text-neutral-400 hover:text-white transition-colors uppercase text-[11px]"
            >
              Explore
            </Link>
            <Link
              href="/match"
              className="hidden sm:inline text-neutral-400 hover:text-white transition-colors uppercase text-[11px]"
            >
              Match
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-bold px-4 py-1.5 rounded-full transition-all text-[11px] uppercase tracking-wider shadow-lg shadow-[#D4FF00]/15"
            >
              <span>Launch App</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Fullscreen 3D Three.js WebGL Scene Canvas */}
        <div ref={canvasHolderRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#05070A_98%)] pointer-events-none opacity-30" />

        {/* =====================================================================
            EDITORIAL TYPOGRAPHY STAGES (Positioned Prominently in Lower-Middle)
            ===================================================================== */}
        
        {/* STAGE 0: HERO OVERVIEW */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-center px-6 sm:px-12 lg:px-16 pt-24 pb-16 transition-all duration-700 ease-out ${
            activeChapterIndex === 0
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-3xl">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#D4FF00] uppercase block mb-3">
              {CHAPTERS[0].heroKicker}
            </span>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.88] drop-shadow-2xl">
              <div>EVERY RESOURCE.</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-[#D4FF00]">
                A NEW POSSIBILITY.
              </div>
            </h1>

            <p className="mt-4 max-w-md text-sm sm:text-base text-neutral-300 font-normal leading-relaxed drop-shadow-md">
              {CHAPTERS[0].copy}
            </p>

            <div className="pointer-events-auto flex flex-wrap items-center gap-4 mt-6">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-xl shadow-[#D4FF00]/20"
              >
                <span>Explore Resources</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => scrollToChapter(1)}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-full border border-white/10 transition-all cursor-pointer"
              >
                <span>Discover Three Dimensions</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#D4FF00]" />
              </button>
            </div>
          </div>
        </div>

        {/* STAGE 1: LAND, PROPERTY & SPACES (Left-aligned, Rotor on Right) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end pb-24 sm:pb-28 px-6 sm:px-12 lg:px-16 transition-all duration-700 ease-out ${
            activeChapterIndex === 1
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-12 pointer-events-none'
          }`}
        >
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101920]/90 border border-white/10 text-xs font-mono text-[#D4FF00] mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>01 / ARCHITECTURAL CAPACITY</span>
            </div>
            
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-4 drop-shadow-xl">
              SPACE <br />
              <span className="text-neutral-400">TO BUILD.</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 max-w-lg drop-shadow-md">
              {CHAPTERS[1].copy}
            </p>

            <div className="pointer-events-auto">
              <Link
                href="/explore?category=space"
                className="inline-flex items-center gap-2.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg shadow-[#D4FF00]/15"
              >
                <span>Browse Spaces & Facilities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* STAGE 2: PHYSICAL ASSETS (Right-aligned, Rotor on Left) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-end pb-24 sm:pb-28 px-6 sm:px-12 lg:px-16 transition-all duration-700 ease-out ${
            activeChapterIndex === 2
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-12 pointer-events-none'
          }`}
        >
          <div className="max-w-xl text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101920]/90 border border-white/10 text-xs font-mono text-white mb-3">
              <Cog className="w-3.5 h-3.5 text-[#D4FF00]" />
              <span>02 / PRECISION HARDWARE</span>
            </div>
            
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-4 drop-shadow-xl">
              TOOLS <br />
              <span className="text-neutral-400">IN MOTION.</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 max-w-lg ml-auto drop-shadow-md">
              {CHAPTERS[2].copy}
            </p>

            <div className="pointer-events-auto">
              <Link
                href="/explore?category=equipment"
                className="inline-flex items-center gap-2.5 bg-white hover:bg-neutral-200 text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg"
              >
                <span>Browse Physical Assets</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* STAGE 3: DIGITAL & TECH (Centered Panoramic Composition) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end pb-24 sm:pb-28 px-6 sm:px-12 lg:px-16 transition-all duration-700 ease-out ${
            activeChapterIndex === 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12 pointer-events-none'
          }`}
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101920]/90 border border-white/10 text-xs font-mono text-[#D4FF00] mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>03 / COMPUTATIONAL ALLOCATION</span>
            </div>
            
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-4 drop-shadow-xl">
              ACCESS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4FF00] to-white">
                WHAT'S NEXT.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 max-w-xl drop-shadow-md">
              {CHAPTERS[3].copy}
            </p>

            <div className="pointer-events-auto flex flex-wrap items-center gap-4">
              <Link
                href="/explore?category=digital"
                className="inline-flex items-center gap-2.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-xl shadow-[#D4FF00]/20"
              >
                <span>Explore Digital & Compute</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/match"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-full border border-white/10 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>Test Natural Intent Engine</span>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MINIMAL PERIMETER LABELS & SCROLL PROGRESS (Art-directed portfolio style)
            ========================================================================= */}
        <div className="absolute bottom-6 left-6 sm:left-12 right-6 sm:right-12 flex items-center justify-between text-[11px] font-mono text-neutral-400 pointer-events-none select-none">
          
          {/* Bottom-Left: Dimension Tracker */}
          <div className="flex items-center gap-2">
            <span className="text-[#D4FF00] font-bold">
              [{currentChapter.num} / 03]
            </span>
            <span className="hidden sm:inline text-neutral-300">
              {currentChapter.name}
            </span>
          </div>

          {/* Bottom-Center: Animated Scroll Indicator */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="tracking-widest uppercase text-[9px] text-neutral-400">
              {scrollProgress >= 0.95 ? 'CONTINUE EXPLORING ↓' : 'SCROLL TO EXPLORE'}
            </span>
            <div className="w-24 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4FF00] transition-all duration-150"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
          </div>

          {/* Bottom-Right: Rotor Angular Telemetry */}
          <div className="flex items-center gap-2 font-mono">
            <span className="hidden sm:inline text-neutral-400">INDEX:</span>
            <span className="text-white font-bold">{currentDeg.toFixed(1)}°</span>
            <span className="text-neutral-400">/ 360°</span>
          </div>

        </div>

      </div>
    </div>
  );
}
