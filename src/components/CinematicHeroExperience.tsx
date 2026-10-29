'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, ChevronDown, Sparkles, Building2, Cog, Cpu } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  createAtmosphericSkyDome,
  createHorizonMistBand,
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
    rotationDeg: 120,
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
    rotationDeg: 240,
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
    rotationDeg: 360,
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

      // Rotation degrees synchronized with scroll sequence (0° -> 120° -> 240° -> 360°)
      let calculatedDeg = 0;
      if (p <= 0.22) {
        calculatedDeg = (p / 0.22) * 15; // Subtle entrance tilt
      } else if (p <= 0.48) {
        const factor = (p - 0.22) / (0.48 - 0.22);
        calculatedDeg = 15 + factor * 105; // Reaches 120°
      } else if (p <= 0.74) {
        const factor = (p - 0.48) / (0.74 - 0.48);
        calculatedDeg = 120 + factor * 120; // Reaches 240°
      } else {
        const factor = Math.min(1, (p - 0.74) / (1.00 - 0.74));
        calculatedDeg = 240 + factor * 120; // Reaches 360°
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

  // Three.js 3D Scene Initialization with Real Procedural Assets from monolith_assets.py
  useEffect(() => {
    const holder = canvasHolderRef.current;
    if (!holder) return;

    // 1. Scene Setup with dusk atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0504);
    scene.fog = new THREE.FogExp2(0x1a0d0a, 0.016);

    // 2. Stable Camera Setup (Calibrated for complete silhouette visibility & breathing room)
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 200);
    camera.position.set(0, 0.44, 9.6);
    camera.lookAt(0, 0.25, 0);

    // 3. High-Performance WebGL Renderer (Tuned exposure so rich terracotta/burnt orange never bleaches)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    holder.appendChild(renderer.domElement);

    // 4. ATMOSPHERIC WORLD ENVIRONMENT
    // A. Vast Warm Desert Dusk Sky Dome
    const { mesh: skyDome, material: skyMat } = createAtmosphericSkyDome();
    scene.add(skyDome);

    // B. Horizon Mist Band (Warm Peach-Amber Ribbon across distant horizon)
    const { mesh: mistBandMesh, update: updateMistBand, dispose: disposeMistBand } =
      createHorizonMistBand();
    scene.add(mistBandMesh);

    // C. Volumetric Drifting Fog System (Ground mist + midground wisps)
    const fogSystem = createMultiLayerFogSystem();
    scene.add(fogSystem.group);

    // D. Floating Atmospheric Particulate Dust Motes
    const { points: dustPoints, update: updateDust, dispose: disposeDust } =
      createAtmosphericParticles(160);
    scene.add(dustPoints);

    // 5. BALANCED STUDIO 3-POINT DUSK LIGHTING (Illuminates 360° contours & strata without pale washouts)
    const ambientLight = new THREE.AmbientLight(0x381912, 1.8);
    scene.add(ambientLight);

    // Frontal Key Light (Warm golden-amber, illuminates front & right without bleaching)
    const keyLight = new THREE.DirectionalLight(0xffcaa0, 1.5);
    keyLight.position.set(1.8, 3.8, 5.0);
    scene.add(keyLight);

    // Fill Directional Light (Deep terracotta warm fill illuminating left flank so it stays rich & vibrant)
    const fillLight = new THREE.DirectionalLight(0xd9653b, 1.4);
    fillLight.position.set(-2.8, 2.6, 4.5);
    scene.add(fillLight);

    // Horizon Backlight / Contouring Rim Light (Soft peach rim highlighting sculptural biomorphic silhouette)
    const horizonRimLight = new THREE.DirectionalLight(0xf2aa8d, 1.9);
    horizonRimLight.position.set(0.0, 3.6, -4.5);
    scene.add(horizonRimLight);

    // 6. ASSET CONTAINERS: MONOLITH & TERRAIN GROUPS
    const monolithGroup = new THREE.Group();
    monolithGroup.position.set(0, 0.35, 0);
    scene.add(monolithGroup);

    const terrainGroup = new THREE.Group();
    terrainGroup.position.set(0, -1.45, 0);
    scene.add(terrainGroup);

    // Soft grounded contact shadow decal directly beneath the monolith
    const shadowGeom = new THREE.CircleGeometry(1.6, 32);
    shadowGeom.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x050201,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeom, shadowMat);
    contactShadow.position.set(0, -1.44, 0);
    scene.add(contactShadow);

    // 7. LOAD PROCEDURAL 3D ASSETS VIA GLTFLoader
    const gltfLoader = new GLTFLoader();

    // Load idlex-monolith.glb
    gltfLoader.load(
      '/models/idlex-monolith.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.material = new THREE.MeshStandardMaterial({
              vertexColors: true,
              roughness: 0.92, // Soft matte stone texture
              metalness: 0.02,
              envMapIntensity: 0.5,
            });
          }
        });
        monolithGroup.clear();
        monolithGroup.add(model);
      },
      undefined,
      (err) => console.error('Error loading idlex-monolith.glb:', err)
    );

    // Load idlex-terrain.glb
    gltfLoader.load(
      '/models/idlex-terrain.glb',
      (gltf) => {
        const terrainModel = gltf.scene;
        terrainModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.receiveShadow = true;
            mesh.material = new THREE.MeshStandardMaterial({
              vertexColors: true,
              roughness: 0.95,
              metalness: 0.01,
            });
          }
        });
        terrainGroup.clear();
        terrainGroup.add(terrainModel);
      },
      undefined,
      (err) => console.error('Error loading idlex-terrain.glb:', err)
    );

    // 8. Responsive Resize Handler
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      if (w < 768) {
        camera.fov = 36;
        camera.position.set(0, 0.44, 10.0);
      } else {
        camera.fov = 34;
        camera.position.set(0, 0.44, 9.6);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();
    window.addEventListener('resize', onResize);

    // 9. Continuous Animation Loop (Synchronized Spin, Scroll Choreography & Camera Stability)
    let animId: number;
    const startTime = performance.now();

    let smoothScrollRotY = 0;
    let currentPosX = 0;
    let currentPosY = 0.35;

    // Smooth controlled rotation rate (~24 seconds per full 360° turnaround)
    const continuousSpinSpeed = 0.26; // radians per second

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;
      const p = progressRef.current; // 0.00 to 1.00

      // Subtle mouse parallax (kept modest so camera remains stable)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Update atmospheric shaders
      skyMat.uniforms.uTime.value = elapsedTime;
      updateMistBand(elapsedTime);
      fogSystem.update(elapsedTime, p);
      updateDust(elapsedTime);

      // Target transforms per stage with generous 18-22% breathing room above crown
      const isMobile = window.innerWidth < 1024;
      let targetPosX = 0;
      let targetPosY = isMobile ? 0.36 : 0.35;
      let targetScale = isMobile ? 0.54 : 0.64;

      // Continuous autonomous rotation around vertical axis
      const continuousAngle = elapsedTime * continuousSpinSpeed;

      // Scroll-driven target rotation (radians): 0 -> 120° -> 240° -> 360°
      let scrollTargetRotY = 0;
      if (p <= 0.22) {
        scrollTargetRotY = 0;
      } else if (p <= 0.48) {
        const factor = (p - 0.22) / (0.48 - 0.22);
        scrollTargetRotY = factor * ((2 * Math.PI) / 3); // 0 to 120°
      } else if (p <= 0.74) {
        const factor = (p - 0.48) / (0.74 - 0.48);
        scrollTargetRotY = ((2 * Math.PI) / 3) + factor * ((2 * Math.PI) / 3); // 120° to 240°
      } else {
        const factor = Math.min(1, (p - 0.74) / (1.00 - 0.74));
        scrollTargetRotY = ((4 * Math.PI) / 3) + factor * ((2 * Math.PI) / 3); // 240° to 360°
      }

      // Damped lerp for responsive, reversible scroll rotation
      smoothScrollRotY += (scrollTargetRotY - smoothScrollRotY) * 0.08;
      currentPosX += (targetPosX - currentPosX) * 0.08;
      currentPosY += (targetPosY - currentPosY) * 0.08;

      // Total rotation: continuous spin + scroll choreography
      // The monolith itself visibly spins on its vertical axis
      monolithGroup.rotation.y = -(continuousAngle + smoothScrollRotY);
      monolithGroup.position.x = currentPosX;
      monolithGroup.position.y = currentPosY + Math.sin(elapsedTime * 0.7) * 0.015; // Gentle organic float
      monolithGroup.scale.set(targetScale, targetScale, targetScale);

      // Subtle organic tilt and mouse responsiveness
      monolithGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.012 + 0.02 + mouse.y * 0.015;
      monolithGroup.rotation.z = Math.cos(elapsedTime * 0.35) * 0.008 - mouse.x * 0.015;

      // Stable camera with gentle parallax
      camera.position.x = mouse.x * 0.08;
      camera.position.y = 0.46 + mouse.y * 0.04;
      camera.lookAt(0, 0.22, 0);

      // Stage-specific environmental lighting transitions
      if (p >= 0.74) {
        keyLight.color.setHex(0xffcaa0);
        horizonRimLight.color.setHex(0xf4beaa);
      } else if (p >= 0.48) {
        keyLight.color.setHex(0xffcfab);
        horizonRimLight.color.setHex(0xeea488);
      } else {
        keyLight.color.setHex(0xffcaa0);
        horizonRimLight.color.setHex(0xf2aa8d);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Clean-up WebGL resources on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);

      skyDome.geometry.dispose();
      skyMat.dispose();

      disposeMistBand();
      fogSystem.dispose();
      disposeDust();

      shadowGeom.dispose();
      shadowMat.dispose();

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
    if (index === 2) targetFraction = 0.61;
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
            FLANKED ADJACENT CHAPTER LABELS (Angled Outlined Edge Text)
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

        {/* =========================================================================
            EDITORIAL TYPOGRAPHY STAGES (Centered in Lower-Middle, Reference Style)
            ========================================================================= */}
        
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

        {/* STAGE 1: LAND, PROPERTY & SPACES (120°) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-16 sm:pb-20 px-6 text-center transition-all duration-700 ease-out ${
            activeChapterIndex === 1
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#170D0A]/90 border border-[#AD7257]/30 text-xs font-mono text-[#D4FF00] mb-2 backdrop-blur-sm">
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

        {/* STAGE 2: PHYSICAL ASSETS (240°) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-16 sm:pb-20 px-6 text-center transition-all duration-700 ease-out ${
            activeChapterIndex === 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#170D0A]/90 border border-[#AD7257]/30 text-xs font-mono text-white mb-2 backdrop-blur-sm">
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

        {/* STAGE 3: DIGITAL & TECH (360°) */}
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-16 sm:pb-20 px-6 text-center transition-all duration-700 ease-out ${
            activeChapterIndex === 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#170D0A]/90 border border-[#AD7257]/30 text-xs font-mono text-[#D4FF00] mb-2 backdrop-blur-sm">
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
            MINIMAL PERIMETER LABELS & SCROLL PROGRESS
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

          {/* Bottom-Right: Angular Telemetry */}
          <div className="flex items-center gap-2 font-mono">
            <span className="hidden sm:inline text-neutral-400">INDEX:</span>
            <span className="text-white font-bold">{currentDeg.toFixed(0)}°</span>
            <span className="text-neutral-400">/ 360°</span>
          </div>

        </div>

      </div>
    </div>
  );
}
