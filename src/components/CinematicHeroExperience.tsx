'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, ChevronDown, Sparkles, Building2, Cog, Cpu } from 'lucide-react';
import * as THREE from 'three';
import { createOrganicMonolithGeometry } from './organic-monolith-geometry';
import { createOrganicMonolithMaterial } from './organic-monolith-material';
import {
  createAtmosphericSkyDome,
  createHorizonMistBand,
  createDistantTerrainRidges,
  createAtmosphericGround,
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
  prevName: string;
  nextName: string;
}

const CHAPTERS: DimensionChapter[] = [
  {
    id: 'overview',
    num: '00',
    name: 'OVERVIEW',
    heroKicker: 'IDLEX — THE INTELLIGENT RESOURCE EXCHANGE',
    headlineLine1: 'EVERY RESOURCE.',
    headlineLine2: 'A NEW POSSIBILITY.',
    copy: 'Discover the spaces, equipment and technical resources already around you.',
    ctaText: 'EXPLORE RESOURCES',
    ctaHref: '/explore',
    rotationDeg: 0,
    prevName: '[03] DIGITAL & TECH',
    nextName: '[01] PROPERTY & SPACES',
  },
  {
    id: 'spaces',
    num: '01',
    name: 'LAND, PROPERTY & SPACES',
    heroKicker: '01 / ARCHITECTURAL CAPACITY',
    headlineLine1: 'SPACE',
    headlineLine2: 'TO BUILD.',
    copy: 'Discover land, properties, laboratories, workshops and collaborative spaces.',
    ctaText: 'BROWSE SPACES & FACILITIES',
    ctaHref: '/explore?category=space',
    rotationDeg: 0,
    prevName: '[00] OVERVIEW',
    nextName: '[02] PHYSICAL ASSETS',
  },
  {
    id: 'equipment',
    num: '02',
    name: 'PHYSICAL ASSETS',
    heroKicker: '02 / PRECISION HARDWARE',
    headlineLine1: 'TOOLS',
    headlineLine2: 'IN MOTION.',
    copy: 'Find the equipment, instruments and tools that turn ideas into reality.',
    ctaText: 'BROWSE PHYSICAL ASSETS',
    ctaHref: '/explore?category=equipment',
    rotationDeg: 120,
    prevName: '[01] PROPERTY & SPACES',
    nextName: '[03] DIGITAL & TECH',
  },
  {
    id: 'digital',
    num: '03',
    name: 'DIGITAL & TECH',
    heroKicker: '03 / COMPUTATIONAL ALLOCATION',
    headlineLine1: 'ACCESS',
    headlineLine2: "WHAT'S NEXT.",
    copy: 'Discover licensed software, authorised APIs and shared technical capabilities.',
    ctaText: 'EXPLORE DIGITAL & COMPUTE',
    ctaHref: '/explore?category=digital',
    rotationDeg: 240,
    prevName: '[02] PHYSICAL ASSETS',
    nextName: '[00] OVERVIEW',
  },
];

export default function CinematicHeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentDeg, setCurrentDeg] = useState(0);

  const progressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Pinned hero scroll listener tracking progress across 4 stages
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

  // Three.js Atmospheric 3D Scene Initialization
  useEffect(() => {
    const holder = canvasHolderRef.current;
    if (!holder) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0504);
    scene.fog = new THREE.FogExp2(0x1a0d0a, 0.022);

    // 2. Camera Setup (Tuned to frame organic monolith in upper-middle viewport with expansive desert landscape)
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 180);
    camera.position.set(0, 0.58, 8.4);
    camera.lookAt(0, 0.38, 0);

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
    // A. Vast Warm Desert Dusk Sky & Horizon Dome
    const { mesh: skyDome, material: skyMat } = createAtmosphericSkyDome();
    scene.add(skyDome);

    // B. Horizon Mist Band (Warm Peach-Amber Ribbon across horizon)
    const { mesh: mistBandMesh, material: mistBandMat, update: updateMistBand, dispose: disposeMistBand } =
      createHorizonMistBand();
    scene.add(mistBandMesh);

    // C. Low Desert Mountain Ridge Silhouettes along Horizon
    const { mesh: ridgesMesh, material: ridgesMat, dispose: disposeRidges } =
      createDistantTerrainRidges();
    scene.add(ridgesMesh);

    // D. Dark Desert Ground Plane with Dynamic Contact Shadow
    const { mesh: groundMesh, material: groundMat, update: updateGround, dispose: disposeGround } =
      createAtmosphericGround();
    scene.add(groundMesh);

    // E. Multi-Layer Volumetric Drifting Fog System (Ground mist + midground wisps)
    const fogSystem = createMultiLayerFogSystem();
    scene.add(fogSystem.group);

    // F. Floating Atmospheric Particulate Dust Motes
    const { points: dustPoints, material: dustMat, update: updateDust, dispose: disposeDust } =
      createAtmosphericParticles(280);
    scene.add(dustPoints);

    // 5. STUDIO & ENVIRONMENTAL LIGHTING RIG
    const ambientLight = new THREE.AmbientLight(0x2a140e, 2.4);
    scene.add(ambientLight);

    // Key Directional Light (Warm desert sunlight)
    const keyLight = new THREE.DirectionalLight(0xffeedb, 4.2);
    keyLight.position.set(5.5, 7.0, 5.0);
    scene.add(keyLight);

    // Fill Light (Terracotta atmospheric bounce)
    const fillLight = new THREE.DirectionalLight(0x7a3a22, 2.4);
    fillLight.position.set(-6.0, 3.5, 4.0);
    scene.add(fillLight);

    // Horizon Backlight / Contouring Rim Light (Soft peach rim highlighting sculptural silhouette)
    const horizonRimLight = new THREE.DirectionalLight(0xf2cfb8, 3.8);
    horizonRimLight.position.set(0.0, 4.5, -6.5);
    scene.add(horizonRimLight);

    // Acid-Lime Underglow Point Light (Subtle brand underglow bounce at the base)
    const limeAccentLight = new THREE.PointLight(0xd4ff00, 2.4, 9.0);
    limeAccentLight.position.set(0, -1.8, 1.2);
    scene.add(limeAccentLight);

    // 6. ASSEMBLE 3D PROCEDURAL ORGANIC MONOLITH
    // Weathered, cloud-banded terracotta sculptural stone inspired by "CLARTÉ WORLD"
    const monolithGeom = createOrganicMonolithGeometry();
    const monolithMat = createOrganicMonolithMaterial();
    const monolithMesh = new THREE.Mesh(monolithGeom, monolithMat);

    // Balanced scale: occupies ~52% of viewport height, grounded in desert mist
    monolithMesh.scale.set(0.96, 0.96, 0.96);
    monolithMesh.position.set(0, 0.62, 0);
    scene.add(monolithMesh);

    // 7. Resize Handler
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      if (w < 768) {
        camera.fov = 38;
        camera.position.set(0, 0.58, 8.8);
      } else {
        camera.fov = 34;
        camera.position.set(0, 0.58, 8.4);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();
    window.addEventListener('resize', onResize);

    // 8. Continuous Animation Loop (Synchronized to Scroll & Mouse Parallax)
    let animId: number;
    const startTime = performance.now();

    let currentRotY = 0;
    let currentPosX = 0;
    let currentPosY = 0.62;

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
      monolithMat.uniforms.uTime.value = elapsedTime;
      updateMistBand(elapsedTime);
      updateGround(elapsedTime);
      fogSystem.update(elapsedTime, p);
      updateDust(elapsedTime);

      // Choreographed Target Transform based on scroll progress:
      // The organic monolith rotates smoothly around vertical axis to reveal its sculptural profile
      let targetRotY = 0;
      let targetPosX = 0;
      let targetPosY = 0.62;
      let targetScale = 0.96;

      const isMobile = window.innerWidth < 1024;

      if (p <= 0.22) {
        // Stage 0: Hero Overview (Front Organic Silhouette)
        targetRotY = 0;
        targetPosX = 0;
        targetPosY = isMobile ? 0.65 : 0.62;
        targetScale = isMobile ? 0.86 : 0.96;
      } else if (p <= 0.48) {
        // Stage 1: Property & Spaces (Rotates ~55° to reveal undulating side contour)
        const stageFactor = (p - 0.22) / (0.48 - 0.22);
        targetRotY = -0.95 * Math.min(1, stageFactor * 1.05);
        targetPosX = 0;
        targetPosY = isMobile ? 0.68 : 0.64;
        targetScale = isMobile ? 0.88 : 0.98;
      } else if (p <= 0.74) {
        // Stage 2: Physical Assets (Rotates ~120° to reveal rear terracotta strata)
        const stageFactor = (p - 0.48) / (0.74 - 0.48);
        targetRotY = -0.95 - 1.15 * Math.min(1, stageFactor * 1.05);
        targetPosX = 0;
        targetPosY = isMobile ? 0.68 : 0.64;
        targetScale = isMobile ? 0.88 : 0.98;
      } else {
        // Stage 3: Digital & Tech (Rotates ~200° to reveal right sculptural swell & cream band)
        const stageFactor = Math.min(1, (p - 0.74) / (1.00 - 0.74));
        targetRotY = -2.10 - 1.35 * stageFactor;
        targetPosX = 0;
        targetPosY = isMobile ? 0.68 : 0.64;
        targetScale = isMobile ? 0.90 : 1.00;
      }

      // Smooth damped lerp towards target transforms
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentPosX += (targetPosX - currentPosX) * 0.08;
      currentPosY += (targetPosY - currentPosY) * 0.08;

      monolithMesh.rotation.y = currentRotY;
      monolithMesh.position.x = currentPosX;
      monolithMesh.position.y = currentPosY + Math.sin(elapsedTime * 0.7) * 0.015; // Gentle organic float
      monolithMesh.scale.set(targetScale, targetScale, targetScale);

      // Subtle dynamic tilt and mouse parallax
      monolithMesh.rotation.x = Math.sin(elapsedTime * 0.4) * 0.012 + 0.02 + mouse.y * 0.02;
      monolithMesh.rotation.z = Math.cos(elapsedTime * 0.35) * 0.008 - mouse.x * 0.015;

      // Update ground contact shadow position to track monolith
      groundMat.uniforms.uRotorPos.value.set(currentPosX, 0.0);

      // Camera parallax
      camera.position.x = mouse.x * 0.18;
      camera.position.y = 0.58 + mouse.y * 0.10;
      camera.lookAt(currentPosX * 0.15, currentPosY * 0.70, 0);

      // Stage-specific environmental lighting transitions
      if (p >= 0.74) {
        // Stage 3: Luminous amber-peach dusk
        keyLight.color.setHex(0xffedd8);
        horizonRimLight.color.setHex(0xf4d2be);
        limeAccentLight.intensity = 3.0;
      } else if (p >= 0.48) {
        // Stage 2: Rich terracotta warmth
        keyLight.color.setHex(0xfff0e2);
        horizonRimLight.color.setHex(0xebae94);
        limeAccentLight.intensity = 2.4;
      } else {
        // Stage 0 & 1: Deep dusk terracotta
        keyLight.color.setHex(0xffeedb);
        horizonRimLight.color.setHex(0xf2cfb8);
        limeAccentLight.intensity = 2.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Clean-up WebGL resources on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);

      skyDome.geometry.dispose();
      skyMat.dispose();

      disposeMistBand();
      disposeRidges();
      disposeGround();
      fogSystem.dispose();
      disposeDust();

      monolithGeom.dispose();
      monolithMat.dispose();

      renderer.dispose();
      if (holder.contains(renderer.domElement)) {
        holder.removeChild(renderer.domElement);
      }
    };
  }, []);

  const scrollToChapter = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const totalDist = containerRef.current.offsetHeight - window.innerHeight;

    let targetFraction = 0;
    if (index === 1) targetFraction = 0.35;
    if (index === 2) targetFraction = 0.60;
    if (index === 3) targetFraction = 0.88;

    window.scrollTo({
      top: containerTop + targetFraction * totalDist,
      behavior: 'smooth',
    });
  };

  const currentChapter = CHAPTERS[activeChapterIndex];

  return (
    <div ref={containerRef} className="relative w-full h-[440vh] bg-[#0a0504]">
      
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

        {/* Soft Radial Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#0a0504_98%)] pointer-events-none opacity-25" />

        {/* =========================================================================
            FLANKED ADJACENT CHAPTER LABELS (Reference Style: Angled Outlined Edge Text)
            ========================================================================= */}
        {/* Left Edge: Previous Chapter Indicator */}
        <div className="absolute left-6 sm:left-12 bottom-28 sm:bottom-32 pointer-events-auto hidden md:block select-none z-20">
          <button
            onClick={() => scrollToChapter(activeChapterIndex === 0 ? 3 : activeChapterIndex - 1)}
            className="group flex items-center gap-2 text-left cursor-pointer transition-all duration-300"
          >
            <span className="text-[10px] font-mono tracking-widest text-neutral-600 group-hover:text-[#D4FF00] transition-colors">
              ← PREV
            </span>
            <span className="text-xs font-mono font-medium tracking-wider text-neutral-500 group-hover:text-white transition-colors">
              {currentChapter.prevName}
            </span>
          </button>
        </div>

        {/* Right Edge: Next Chapter Indicator */}
        <div className="absolute right-6 sm:right-12 bottom-28 sm:bottom-32 pointer-events-auto hidden md:block select-none z-20">
          <button
            onClick={() => scrollToChapter(activeChapterIndex === 3 ? 0 : activeChapterIndex + 1)}
            className="group flex items-center gap-2 text-right cursor-pointer transition-all duration-300 ml-auto"
          >
            <span className="text-xs font-mono font-medium tracking-wider text-neutral-500 group-hover:text-white transition-colors">
              {currentChapter.nextName}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-600 group-hover:text-[#D4FF00] transition-colors">
              NEXT →
            </span>
          </button>
        </div>

        {/* =====================================================================
            EDITORIAL TYPOGRAPHY STAGES (Centered in Lower-Middle, Reference Style)
            ===================================================================== */}
        
        {/* STAGE 0: HERO OVERVIEW */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-16 sm:pb-20 px-6 text-center transition-all duration-700 ease-out ${
            activeChapterIndex === 0
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#D4FF00] uppercase block mb-2 drop-shadow">
              {CHAPTERS[0].heroKicker}
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]">
              <div>EVERY RESOURCE.</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-[#D4FF00]">
                A NEW POSSIBILITY.
              </div>
            </h1>

            <p className="mt-3 max-w-lg text-sm sm:text-base text-neutral-300 font-normal leading-relaxed drop-shadow-md mx-auto">
              {CHAPTERS[0].copy}
            </p>

            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-4 mt-5">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-xl shadow-[#D4FF00]/20"
              >
                <span>Explore Resources</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => scrollToChapter(1)}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-full border border-white/10 transition-all cursor-pointer backdrop-blur-sm"
              >
                <span>Discover Three Dimensions</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#D4FF00]" />
              </button>
            </div>
          </div>
        </div>

        {/* STAGE 1: LAND, PROPERTY & SPACES (Architectural Relief at 0°) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-16 sm:pb-20 px-6 text-center transition-all duration-700 ease-out ${
            activeChapterIndex === 1
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a151d]/90 border border-white/10 text-xs font-mono text-[#D4FF00] mb-2 backdrop-blur-sm">
              <Building2 className="w-3.5 h-3.5" />
              <span>01 / ARCHITECTURAL CAPACITY</span>
            </div>
            
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]">
              SPACE TO BUILD.
            </h2>

            <p className="mt-3 max-w-lg text-sm sm:text-base text-neutral-300 leading-relaxed drop-shadow-md mx-auto">
              {CHAPTERS[1].copy}
            </p>

            <div className="pointer-events-auto mt-5">
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

        {/* STAGE 2: PHYSICAL ASSETS (Mechanical Relief at 120°) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-16 sm:pb-20 px-6 text-center transition-all duration-700 ease-out ${
            activeChapterIndex === 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a151d]/90 border border-white/10 text-xs font-mono text-white mb-2 backdrop-blur-sm">
              <Cog className="w-3.5 h-3.5 text-[#D4FF00]" />
              <span>02 / PRECISION HARDWARE</span>
            </div>
            
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]">
              TOOLS IN MOTION.
            </h2>

            <p className="mt-3 max-w-lg text-sm sm:text-base text-neutral-300 leading-relaxed drop-shadow-md mx-auto">
              {CHAPTERS[2].copy}
            </p>

            <div className="pointer-events-auto mt-5">
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

        {/* STAGE 3: DIGITAL & TECH (Computational Relief at 240°) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-16 sm:pb-20 px-6 text-center transition-all duration-700 ease-out ${
            activeChapterIndex === 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a151d]/90 border border-white/10 text-xs font-mono text-[#D4FF00] mb-2 backdrop-blur-sm">
              <Cpu className="w-3.5 h-3.5" />
              <span>03 / COMPUTATIONAL ALLOCATION</span>
            </div>
            
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]">
              ACCESS WHAT'S NEXT.
            </h2>

            <p className="mt-3 max-w-lg text-sm sm:text-base text-neutral-300 leading-relaxed drop-shadow-md mx-auto">
              {CHAPTERS[3].copy}
            </p>

            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-4 mt-5">
              <Link
                href="/explore?category=digital"
                className="inline-flex items-center gap-2.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-xl shadow-[#D4FF00]/20"
              >
                <span>Explore Digital & Compute</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/match"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-full border border-white/10 transition-all backdrop-blur-sm"
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
        <div className="absolute bottom-6 left-6 sm:left-12 right-6 sm:right-12 flex items-center justify-between text-[11px] font-mono text-neutral-400 pointer-events-none select-none z-30">
          
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
