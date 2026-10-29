'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowRight, 
  ChevronDown, 
  Sparkles, 
  Building2, 
  Cog, 
  Cpu, 
  X, 
  ArrowLeft,
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  createAtmosphericSkyDome,
  createHorizonMistBand,
  createMultiLayerFogSystem,
  createAtmosphericParticles,
} from './atmospheric-shaders';

// ============================================================================
// AMBIENT CINEMATIC AUDIO SYNTHESIZER (Web Audio API)
// Pure client-side harmonic soundscape — zero external audio assets required.
// Matches Guillaume Colombel's ambient sound toggle experience.
// ============================================================================
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  public isPlaying = false;

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  private start() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.14, now + 1.8);

      // Warm low-pass filter for dusk atmosphere
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, now);
      filter.Q.setValueAtTime(1.8, now);

      this.masterGain.connect(filter);
      filter.connect(this.ctx.destination);

      // Three harmonic drone frequencies (A1 = 55Hz, A2 = 110.2Hz, E3 = 164.8Hz)
      const freqs = [55.0, 110.2, 164.8];
      this.oscs = freqs.map((f, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);

        const oscGain = this.ctx!.createGain();
        oscGain.gain.value = i === 0 ? 0.6 : 0.28;

        osc.connect(oscGain);
        oscGain.connect(this.masterGain!);
        osc.start();
        return osc;
      });

      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  }

  private stop() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      setTimeout(() => {
        this.oscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch (_) {}
        });
        this.oscs = [];
        this.ctx?.close();
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
      }, 950);
    } catch (e) {
      console.warn('Audio stop error:', e);
    }
  }
}

// Global audio engine singleton
let globalAudioEngine: AmbientAudioEngine | null = null;
function getAudioEngine(): AmbientAudioEngine {
  if (!globalAudioEngine && typeof window !== 'undefined') {
    globalAudioEngine = new AmbientAudioEngine();
  }
  return globalAudioEngine!;
}

// ============================================================================
// IDLEX THREE CORE DIMENSIONS
// ============================================================================
export interface DimensionItem {
  id: string;
  num: string;
  category: 'space' | 'equipment' | 'digital';
  titleLine1: string;
  titleLine2: string;
  shortName: string;
  tagline: string;
  telemetry: string;
  description: string;
  icon: any;
  featuredAssets: {
    id: string;
    title: string;
    location: string;
    rate: string;
    specs: string;
    status: string;
    tag: string;
  }[];
}

const DIMENSIONS: DimensionItem[] = [
  {
    id: 'space',
    num: '01',
    category: 'space',
    titleLine1: 'PROPERTY',
    titleLine2: '& SPACES',
    shortName: 'PROPERTY & SPACES',
    tagline: '01 / ARCHITECTURAL CAPACITY & CONTROLLED ENVIRONMENTS',
    telemetry: '14 VERIFIED FACILITIES · ZERO-COLLISION SCHEDULING',
    description:
      'ISO Class 4–7 cleanrooms, acoustic anechoic chambers, high-bay robotics arenas, and high-voltage testing bays unlocked across premier institutions.',
    icon: Building2,
    featuredAssets: [
      {
        id: 'res-cam-bio',
        title: 'Cambridge Biosafety Level-3 Testing Facility',
        location: 'West Cambridge Science Park',
        rate: '£1,200 / day',
        specs: 'ISO Class 5 · Air Shower Interlock · BSL-3 Certified',
        status: 'Available Now',
        tag: 'Pristine Condition',
      },
      {
        id: 'res-mag-bay',
        title: 'Superconducting Magnetics High-Bay Arena',
        location: 'Harwell Science Campus',
        rate: '£2,400 / day',
        specs: 'Cryogenic 4K Line · 10-Ton Overhead Gantry Crane',
        status: 'Available Now',
        tag: 'Operator Gated',
      },
      {
        id: 'res-anechoic',
        title: 'Bristol Advanced Acoustic Anechoic Chamber',
        location: 'Bristol Precision Engineering Hub',
        rate: '£850 / day',
        specs: 'Cutoff: 20Hz · < 12dBA Floor · Pneumatic Isolation',
        status: 'Available Tomorrow',
        tag: 'Instant Lock',
      },
    ],
  },
  {
    id: 'equipment',
    num: '02',
    category: 'equipment',
    titleLine1: 'PHYSICAL',
    titleLine2: 'ASSETS',
    shortName: 'PHYSICAL ASSETS',
    tagline: '02 / PRECISION METROLOGY & HEAVY INDUSTRIAL HARDWARE',
    telemetry: '42 VERIFIED INSTRUMENTS · DETERMINISTIC SKILLGATE',
    description:
      'Field-emission SEMs, 5-axis CNC machining centers, confocal laser scanning microscopes, and supersonic wind tunnel testbenches.',
    icon: Cog,
    featuredAssets: [
      {
        id: 'res-sem-fib',
        title: 'FEI Helios NanoLab 600 DualBeam SEM/FIB',
        location: 'Oxford Physics Department',
        rate: '£180 / hour',
        specs: 'Sub-nm 0.9nm resolution · Ga+ Ion Source · EDAX EDS',
        status: 'Available Now',
        tag: 'SkillGate Level 3',
      },
      {
        id: 'res-cnc-hermle',
        title: 'Hermle C400 5-Axis CNC Machining Center',
        location: 'Imperial College Mechanical Bay',
        rate: '£140 / hour',
        specs: '30,000 RPM Spindle · Heidenhain TNC 640 · Renishaw Probe',
        status: 'SkillGate Required',
        tag: 'Prerequisite Clear',
      },
      {
        id: 'res-squid-mag',
        title: 'SQUID Magnetometer & Susceptometer',
        location: 'Cambridge Cavendish Laboratory',
        rate: '£320 / hour',
        specs: '±7 Tesla · 10^-8 emu Sensitivity · 1.8K to 400K Base',
        status: 'Available Now',
        tag: 'High Demand',
      },
    ],
  },
  {
    id: 'digital',
    num: '03',
    category: 'digital',
    titleLine1: 'DIGITAL',
    titleLine2: '& TECH',
    shortName: 'DIGITAL & TECH',
    tagline: '03 / HIGH-PERFORMANCE COMPUTE & QUANTUM SIMULATORS',
    telemetry: '1,280 TFLOPS CAPACITY · FAIRSHARE SLURM BATCH',
    description:
      'Dedicated NVIDIA H100/A100 Slurm cluster partitions, PCIe FPGA emulation testbenches, and isolated confidential compute nodes.',
    icon: Cpu,
    featuredAssets: [
      {
        id: 'res-h100-node',
        title: '8x NVIDIA H100 SXM5 Slurm Cluster Partition',
        location: 'London Science Datacenter',
        rate: '£48 / hour',
        specs: '8x H100 80GB · 800 Gb/s NDR InfiniBand · Isolated Enclave',
        status: 'Available Now',
        tag: 'FairShare Queued',
      },
      {
        id: 'res-fpga-rig',
        title: 'AMD Xilinx UltraScale+ U280 PCIe Emulation Rig',
        location: 'Cambridge Computer Laboratory',
        rate: '£24 / hour',
        specs: '8GB HBM2 · Dual 100G QSFP28 · Vivado / Vitis Verified',
        status: 'Available Now',
        tag: 'Instant Provision',
      },
      {
        id: 'res-dwave-sim',
        title: 'D-Wave Quantum Annealing Simulator Node',
        location: 'Edinburgh Supercomputing Centre',
        rate: '£65 / hour',
        specs: '5,000+ Qubits Topology · Ocean SDK · Slurm Batch Gateway',
        status: 'Available Now',
        tag: 'Direct API Seat',
      },
    ],
  },
];

export default function CinematicHeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);

  // Active dimension index: 0, 1, or 2 (updates only on step transitions)
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Track item DOM refs for 60/120 FPS high-performance DOM updates
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Carousel angular state (in radians)
  // Station 0 = 0 rad (Property & Spaces), Station 1 = 2π/3 (Physical Assets), Station 2 = 4π/3 (Digital & Tech)
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const lastInputTimeRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  // Interactive Inspection Overlay ("Open" state inspired by Guillaume Colombel project detail)
  const [inspectingDimension, setInspectingDimension] = useState<DimensionItem | null>(null);

  // About Manifesto Modal ("About" state inspired by Guillaume Colombel about page)
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Audio playing state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartAngleRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const lastDragXRef = useRef(0);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const monolithGroupRef = useRef<THREE.Group | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Angular constants
  const SPACING = (2 * Math.PI) / 3; // 120° in radians

  // Helper to normalize angle in [-π, π]
  const normalizeDelta = useCallback((delta: number) => {
    let d = delta % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }, []);

  // Set target angle to rotate directly to dimension k
  const rotateToDimension = useCallback(
    (targetIdx: number) => {
      const cur = targetAngleRef.current;
      const targetBase = targetIdx * SPACING;
      const delta = normalizeDelta(targetBase - cur);
      targetAngleRef.current = cur + delta;
    },
    [SPACING, normalizeDelta]
  );

  // Audio Toggle Handler
  const handleToggleAudio = () => {
    const engine = getAudioEngine();
    const playing = engine.toggle();
    setIsAudioPlaying(playing);
  };

  // Keyboard Navigation: Left/Right arrows, Enter/Space, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectingDimension) {
          setInspectingDimension(null);
        } else if (showAboutModal) {
          setShowAboutModal(false);
        }
      } else if (!inspectingDimension && !showAboutModal) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          rotateToDimension((activeIndexRef.current + 1) % 3);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          rotateToDimension((activeIndexRef.current + 2) % 3);
        } else if (e.key === 'Enter' || e.key === ' ') {
          setInspectingDimension(DIMENSIONS[activeIndexRef.current]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingDimension, showAboutModal, rotateToDimension]);

  // Pointer / Drag Handling for Carousel
  useEffect(() => {
    const holder = containerRef.current;
    if (!holder) return;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
      if (inspectingDimension || showAboutModal) return;

      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartAngleRef.current = targetAngleRef.current;
      lastDragXRef.current = e.clientX;
      lastDragTimeRef.current = performance.now();
      lastInputTimeRef.current = performance.now();
      dragVelocityRef.current = 0;
      scrollVelocityRef.current = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      const now = performance.now();
      const dt = Math.max(1, now - lastDragTimeRef.current);
      const instantVelocity = (e.clientX - lastDragXRef.current) / dt;

      dragVelocityRef.current = instantVelocity;
      lastDragXRef.current = e.clientX;
      lastDragTimeRef.current = now;
      lastInputTimeRef.current = now;

      const angleDelta = -(dx / 460) * SPACING;
      targetAngleRef.current = dragStartAngleRef.current + angleDelta;
    };

    const onPointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // Impart fluid momentum without hard snapping
      const angularVelocity = -(dragVelocityRef.current / 460) * SPACING * 16.67;
      scrollVelocityRef.current = Math.max(-0.06, Math.min(0.06, angularVelocity * 0.025));
      lastInputTimeRef.current = performance.now();
    };

    let wheelIdleTimer: NodeJS.Timeout | null = null;
    const onWheel = (e: WheelEvent) => {
      if (inspectingDimension || showAboutModal) return;
      const rect = holder.getBoundingClientRect();
      if (rect.top > 10 || rect.bottom < window.innerHeight - 10) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 1) return;

      const now = performance.now();
      lastInputTimeRef.current = now;
      isUserScrollingRef.current = true;

      // Fluid angular delta (supports trackpad, mouse wheel, and reverse scrolling)
      const angularDelta = delta * 0.0016;
      targetAngleRef.current += angularDelta;
      scrollVelocityRef.current = scrollVelocityRef.current * 0.4 + angularDelta * 0.6;

      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 90);
    };

    holder.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    holder.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      holder.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      holder.removeEventListener('wheel', onWheel);
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
    };
  }, [inspectingDimension, showAboutModal, SPACING]);

  // Pointer parallax listener for camera
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

  // Three.js 3D Scene Initialization
  useEffect(() => {
    const holder = canvasHolderRef.current;
    if (!holder) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0504);
    scene.fog = new THREE.FogExp2(0x1a0d0a, 0.016);

    // 2. Camera Setup (Monumental low angle looking slightly up, framing full height)
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 200);
    camera.position.set(0, 0.38, isMobile ? 9.8 : 9.2);
    camera.lookAt(0, 0.22, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    holder.appendChild(renderer.domElement);

    // 4. ATMOSPHERIC WORLD ENVIRONMENT
    // A. Vast Warm Desert Dusk Sky Dome
    const { mesh: skyDome, material: skyMat } = createAtmosphericSkyDome();
    scene.add(skyDome);

    // B. Horizon Mist Band (Warm peach-amber ribbon across distant horizon)
    const { mesh: mistBandMesh, update: updateMistBand, dispose: disposeMistBand } =
      createHorizonMistBand();
    scene.add(mistBandMesh);

    // C. Volumetric Drifting Fog System (Ground mist + midground wisps)
    const fogSystem = createMultiLayerFogSystem();
    scene.add(fogSystem.group);

    // D. Floating Atmospheric Particulate Dust Motes
    const { points: dustPoints, update: updateDust, dispose: disposeDust } =
      createAtmosphericParticles(180);
    scene.add(dustPoints);

    // E. Reflective Water / Wet Lacquer Ground Plane (Reflects warm monolith glow)
    const waterGeom = new THREE.PlaneGeometry(42, 42, 1, 1);
    waterGeom.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x140a08,
      roughness: 0.24,
      metalness: 0.82,
      depthWrite: false,
    });
    const waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.set(0, -1.44, 0);
    scene.add(waterMesh);

    // 5. STUDIO DUSK 3-POINT LIGHTING
    const ambientLight = new THREE.AmbientLight(0x3a1913, 1.9);
    scene.add(ambientLight);

    // Warm frontal key light
    const keyLight = new THREE.DirectionalLight(0xffeedb, 1.6);
    keyLight.position.set(1.8, 3.8, 5.0);
    scene.add(keyLight);

    // Deep terracotta warm fill light
    const fillLight = new THREE.DirectionalLight(0xd9653b, 1.5);
    fillLight.position.set(-2.8, 2.6, 4.5);
    scene.add(fillLight);

    // Horizon backlight / contouring rim light
    const horizonRimLight = new THREE.DirectionalLight(0xf4aa8d, 2.2);
    horizonRimLight.position.set(0.0, 3.6, -4.5);
    scene.add(horizonRimLight);

    // Water highlight point light
    const waterLight = new THREE.PointLight(0xd9653b, 1.2, 10);
    waterLight.position.set(0, -1.2, 1.5);
    scene.add(waterLight);

    // 6. ASSET CONTAINERS: MONOLITH & TERRAIN
    const monolithGroup = new THREE.Group();
    monolithGroup.position.set(0, 0.28, 0);
    scene.add(monolithGroup);
    monolithGroupRef.current = monolithGroup;

    const terrainGroup = new THREE.Group();
    terrainGroup.position.set(0, -1.45, 0);
    scene.add(terrainGroup);

    // Contact shadow decal directly beneath monolith
    const shadowGeom = new THREE.CircleGeometry(1.8, 32);
    shadowGeom.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x050201,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeom, shadowMat);
    contactShadow.position.set(0, -1.43, 0);
    scene.add(contactShadow);

    // 7. LOAD 3D ASSETS VIA GLTFLoader
    const gltfLoader = new GLTFLoader();

    // Primary: idlex-amber-crystal.glb
    gltfLoader.load(
      '/models/idlex-amber-crystal.glb',
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.geometry && !mesh.geometry.attributes.normal) {
              mesh.geometry.computeVertexNormals();
            }

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat.map) {
                mat.map.colorSpace = THREE.SRGBColorSpace;
                mat.map.needsUpdate = true;
              }
              if (mat.normalMap) {
                mat.normalScale.set(1.0, 1.0);
                mat.normalMap.needsUpdate = true;
              }
              mat.roughness = 0.32;
              mat.metalness = 0.02;
              mat.envMapIntensity = 1.25;
              mat.side = THREE.DoubleSide;
              mat.needsUpdate = true;
            }
          }
        });

        // Center crystal vertically & laterally
        const bbox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        model.position.set(-center.x, -center.y, -center.z);

        monolithGroup.clear();
        monolithGroup.add(model);
      },
      undefined,
      (err) => console.error('Error loading amber crystal:', err)
    );

    // Terrain: idlex-terrain.glb
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
      (err) => console.error('Error loading terrain:', err)
    );

    // 8. Responsive Resize
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      if (w < 768) {
        camera.fov = 36;
        camera.position.set(0, 0.40, 9.8);
      } else {
        camera.fov = 34;
        camera.position.set(0, 0.38, 9.2);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 9. Continuous Animation Loop (Runs at 60/120 FPS smoothly)
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Physics & Soft Magnetic Locking
      const now = performance.now();
      const timeSinceInput = now - lastInputTimeRef.current;

      // 1. Momentum coasting (fluid continuation from flick or drag release)
      if (!isDraggingRef.current && Math.abs(scrollVelocityRef.current) > 0.00005) {
        targetAngleRef.current += scrollVelocityRef.current;
        scrollVelocityRef.current *= 0.88; // Viscous fluid friction
        if (Math.abs(scrollVelocityRef.current) < 0.00005) {
          scrollVelocityRef.current = 0;
        }
      }

      // 2. Soft Velocity-Aware Magnetic Attraction
      // When scrolling decelerates or pauses, the nearest dimension station gently attracts rotation.
      // High-speed scrolling carries free momentum through stations without resistance.
      if (!isDraggingRef.current) {
        const nearestStation = Math.round(targetAngleRef.current / SPACING) * SPACING;
        const distToStation = nearestStation - targetAngleRef.current;

        // Velocity damping factor: 0 at high speed, 1 at rest
        const speed = Math.abs(scrollVelocityRef.current);
        const speedFactor = Math.max(0, 1.0 - speed / 0.008);
        
        // Time ramp: gentle attraction onset after input pauses
        const timeFactor = isUserScrollingRef.current 
          ? Math.max(0, (timeSinceInput - 60) / 100) 
          : Math.min(1.0, timeSinceInput / 80);

        // Gaussian attraction curve (peaks near anchor, tapers gently across spacing)
        const normalizedDist = Math.abs(distToStation) / (SPACING * 0.5);
        const distanceFactor = Math.exp(-normalizedDist * normalizedDist * 1.8);

        const magneticForce = 0.055 * speedFactor * Math.min(1.0, timeFactor) * distanceFactor;
        targetAngleRef.current += distToStation * magneticForce;
      }

      // Smooth damped lerp toward targetAngle
      const angleLerpFactor = 0.095;
      currentAngleRef.current +=
        (targetAngleRef.current - currentAngleRef.current) * angleLerpFactor;
      const angle = currentAngleRef.current;

      // Determine active dimension index from angle
      const rawIdx = Math.round(angle / SPACING);
      const normalizedIdx = ((rawIdx % 3) + 3) % 3;
      if (normalizedIdx !== activeIndexRef.current) {
        activeIndexRef.current = normalizedIdx;
        setActiveIndex(normalizedIdx);
      }

      // HIGH-PERFORMANCE DIRECT DOM CYLINDRICAL TRANSFORM UPDATES
      // Updates 3 title stations without triggering 60 FPS React re-renders!
      const isMob = window.innerWidth < 768;
      const radius = isMob ? 340 : 460;

      for (let i = 0; i < 3; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const dimAngle = i * SPACING;
        let delta = (dimAngle - angle) % (2 * Math.PI);
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        const isCentered = Math.abs(delta) < 0.24;

        // Cylindrical projection coordinates
        const tx = Math.sin(delta) * radius;
        const tz = (Math.cos(delta) - 1) * 140;
        const rotY = delta * 30; // degrees
        const scale = Math.max(0.74, 1.0 + tz / (2 * radius));
        const opacity = Math.max(0.35, 1.0 - Math.abs(delta) * 0.45);

        el.style.transform = `translate3d(${tx.toFixed(1)}px, 0px, ${tz.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = isCentered ? '25' : '10';

        const h2 = el.querySelector('h2');
        if (h2) {
          if (isCentered) {
            h2.style.color = '#ffffff';
            (h2.style as any).webkitTextStroke = '0px transparent';
            h2.style.filter = 'drop-shadow(0 16px 36px rgba(0,0,0,0.95))';
          } else {
            h2.style.color = 'transparent';
            (h2.style as any).webkitTextStroke = '1.5px rgba(255, 255, 255, 0.45)';
            h2.style.filter = 'none';
          }
        }

        const badge = el.querySelector('.active-dim-badge');
        if (badge) {
          (badge as HTMLElement).style.opacity = isCentered ? '1' : '0';
          (badge as HTMLElement).style.pointerEvents = isCentered ? 'auto' : 'none';
        }
      }

      // Subtle mouse parallax
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Update atmospheric shaders
      skyMat.uniforms.uTime.value = elapsedTime;
      updateMistBand(elapsedTime);
      fogSystem.update(elapsedTime, 0.5);
      updateDust(elapsedTime);

      // Monolith positioning & synchronized rotation
      // Towering presence: scales to ~0.84 on desktop, ~0.72 on mobile
      const baseScale = isMob ? 0.72 : 0.84;
      const floatY = 0.28 + Math.sin(elapsedTime * 0.6) * 0.014;

      // Monolith rotation Y is strictly synchronized with carousel angle
      monolithGroup.rotation.y = -angle;
      monolithGroup.position.y = floatY;
      monolithGroup.scale.set(baseScale, baseScale, baseScale);

      // Subtle organic sway & mouse parallax
      monolithGroup.rotation.x =
        Math.sin(elapsedTime * 0.4) * 0.01 + mouse.y * 0.012;
      monolithGroup.rotation.z =
        Math.cos(elapsedTime * 0.35) * 0.008 - mouse.x * 0.012;

      // Camera positioning with gentle parallax
      camera.position.x = mouse.x * 0.08;
      camera.position.y = 0.38 + mouse.y * 0.04;
      camera.lookAt(0, 0.22, 0);

      renderer.render(scene, camera);
    };

    animate();

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
      waterGeom.dispose();
      waterMat.dispose();

      renderer.dispose();
      if (holder.contains(renderer.domElement)) {
        holder.removeChild(renderer.domElement);
      }
    };
  }, [SPACING]);

  // Smooth scroll to Section 1 below hero
  const scrollToNarrative = () => {
    const nextSec = document.getElementById('narrative-section');
    if (nextSec) {
      nextSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeDim = DIMENSIONS[activeIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0a0504] select-none touch-none"
    >
      {/* =========================================================================
          FULL-VIEWPORT THREE.JS 3D STAGE
          ========================================================================= */}
      <div
        ref={canvasHolderRef}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing"
      />

      {/* Atmospheric Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,#0a0504_95%)] pointer-events-none opacity-40" />

      {/* =========================================================================
          EDGE-ALIGNED MINIMAL HEADER (Guillaume Colombel Style)
          ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 sm:px-12 py-7 flex items-center justify-between pointer-events-none">
        {/* Top-Left: Minimal Brand & Live Status */}
        <div className="pointer-events-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-[#D4FF00] shadow-[0_0_10px_#D4FF00] group-hover:scale-125 transition-transform" />
            <span className="font-sans font-bold text-base tracking-tight text-white uppercase">
              IDLEX<span className="text-[#D4FF00]">.</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-wider text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
            NETWORK LIVE · 1,420kw/h IDLE
          </span>
        </div>

        {/* Top-Right: Quiet Navigation Links & About Toggle */}
        <div className="pointer-events-auto flex items-center gap-5 sm:gap-8 text-xs font-mono tracking-widest">
          <Link
            href="/explore"
            className="text-neutral-400 hover:text-white transition-colors uppercase text-[11px]"
          >
            Explore
          </Link>
          <Link
            href="/match"
            className="hidden sm:inline text-neutral-400 hover:text-white transition-colors uppercase text-[11px]"
          >
            Intent Match
          </Link>
          <button
            onClick={() => setShowAboutModal(true)}
            className="text-neutral-400 hover:text-white transition-colors uppercase text-[11px] cursor-pointer"
          >
            About
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-sans font-bold px-4 py-1.5 rounded-full transition-all text-[11px] uppercase tracking-wider shadow-lg shadow-[#D4FF00]/15"
          >
            <span>Launch App</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* =========================================================================
          THE SIGNATURE CYLINDRICAL 3D TITLE CAROUSEL
          Wraps around the lower base of the monolith, overlapping water reflection.
          Active title solid white in center; flanking titles in outlined 3D curve.
          ========================================================================= */}
      <div className="absolute inset-x-0 bottom-16 sm:bottom-20 z-30 pointer-events-none flex flex-col items-center justify-end px-4">
        {/* The 3D Track Container with CSS Perspective */}
        <div
          className="relative w-full max-w-5xl h-36 sm:h-44 flex items-center justify-center pointer-events-auto"
          style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
        >
          {DIMENSIONS.map((dim, idx) => (
            <div
              key={dim.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onClick={() => {
                if (activeIndexRef.current === idx) {
                  setInspectingDimension(dim);
                } else {
                  rotateToDimension(idx);
                }
              }}
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer pointer-events-auto will-change-transform"
            >
              {/* Monumental 2-Line Condensed Title */}
              <div className="text-center select-none group">
                <h2 className="font-sans font-black tracking-tighter uppercase leading-[0.84] text-4xl sm:text-6xl md:text-7xl lg:text-8xl transition-colors duration-200">
                  <div>{dim.titleLine1}</div>
                  <div>{dim.titleLine2}</div>
                </h2>

                {/* Active Subtitle & Click-to-Inspect Hint */}
                <div className="active-dim-badge mt-3.5 flex flex-col items-center gap-2 transition-opacity duration-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#170D0A]/90 border border-[#AD7257]/30 text-[11px] font-mono text-[#D4FF00] backdrop-blur-md shadow-lg">
                    <dim.icon className="w-3.5 h-3.5" />
                    <span>{dim.telemetry}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-neutral-400 group-hover:text-white transition-colors mt-0.5">
                    <span>[ CLICK TITLE TO INSPECT ASSETS ]</span>
                    <ArrowUpRight className="w-3 h-3 text-[#D4FF00]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          EDGE-ALIGNED MINIMAL FOOTER TELEMETRY & AUDIO TOGGLE
          ========================================================================= */}
      <footer className="absolute bottom-6 left-6 sm:left-12 right-6 sm:right-12 flex items-center justify-between text-[11px] font-mono text-neutral-400 pointer-events-none select-none z-40">
        {/* Bottom-Left: Dimension Tracker */}
        <div className="flex items-center gap-2.5">
          <span className="text-[#D4FF00] font-bold">[{activeDim.num} / 03]</span>
          <span className="hidden sm:inline text-neutral-300 font-medium">
            {activeDim.shortName}
          </span>
        </div>

        {/* Bottom-Center: Smooth Scroll Hint to Narrative */}
        <button
          onClick={scrollToNarrative}
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
        >
          <span className="text-[10px] tracking-widest uppercase">OVERVIEW & NARRATIVE</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#D4FF00]" />
        </button>

        {/* Bottom-Right: Ambient Sound Toggle Button (Speaker wave icon) */}
        <div className="pointer-events-auto flex items-center gap-4">
          <button
            onClick={handleToggleAudio}
            type="button"
            aria-label={isAudioPlaying ? 'Mute atmospheric sound' : 'Unmute atmospheric sound'}
            className="flex items-center gap-2 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer backdrop-blur-sm group"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-4 h-4 text-[#D4FF00] animate-pulse" />
                <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-[#D4FF00]">
                  SOUND ON
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-neutral-400 group-hover:text-white">
                  SOUND OFF
                </span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE DIMENSION INSPECTOR VIEW ("Open" Portal State)
          Inspired by Guillaume Colombel's project detail screen.
          Reveals live database assets, real-time specifications, rates, and direct actions.
          ========================================================================= */}
      {inspectingDimension && (
        <div className="absolute inset-0 z-50 flex flex-col justify-between bg-[#0a0504]/90 backdrop-blur-xl p-6 sm:p-12 animate-in fade-in duration-300 overflow-y-auto pointer-events-auto">
          {/* Top Header inside Detail View */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono tracking-widest text-[#D4FF00] uppercase">
                [{inspectingDimension.num} / DIMENSION PORTAL]
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                {inspectingDimension.shortName}
              </span>
            </div>

            <button
              onClick={() => setInspectingDimension(null)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Central Portal Showcase: Dimension Narrative & Real Available Assets */}
          <div className="max-w-6xl mx-auto w-full py-8 my-auto">
            {/* Dimension Editorial Lead */}
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4FF00] block mb-2">
                {inspectingDimension.tagline}
              </span>
              <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-white uppercase leading-none mb-4">
                {inspectingDimension.titleLine1} {inspectingDimension.titleLine2}
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                {inspectingDimension.description}
              </p>
            </div>

            {/* Curated Real Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {inspectingDimension.featuredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-6 rounded-2xl bg-[#170D0A]/90 border border-[#AD7257]/30 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#D4FF00]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-3">
                      <span className="text-[#D4FF00] font-semibold">{asset.tag}</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {asset.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-[#D4FF00] transition-colors">
                      {asset.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400 mb-4">{asset.location}</p>

                    <div className="p-3 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-xs text-neutral-300 mb-6">
                      {asset.specs}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        Rate Telemetry
                      </div>
                      <div className="text-sm font-bold text-[#D4FF00] font-mono">{asset.rate}</div>
                    </div>

                    <Link
                      href={`/explore?category=${inspectingDimension.category}`}
                      className="inline-flex items-center gap-1.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-sans font-bold text-xs uppercase px-4 py-2 rounded-full transition-all shadow-md shadow-[#D4FF00]/15"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Portal Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
            <button
              onClick={() => {
                const prev = (activeIndexRef.current + 2) % 3;
                rotateToDimension(prev);
                setInspectingDimension(DIMENSIONS[prev]);
              }}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>PREVIOUS DIMENSION</span>
            </button>

            <Link
              href={`/explore?category=${inspectingDimension.category}`}
              className="text-white hover:text-[#D4FF00] transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-[#D4FF00]"
            >
              EXPLORE ALL {inspectingDimension.shortName} IN MARKETPLACE ↗
            </Link>

            <button
              onClick={() => {
                const next = (activeIndexRef.current + 1) % 3;
                rotateToDimension(next);
                setInspectingDimension(DIMENSIONS[next]);
              }}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>NEXT DIMENSION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE ABOUT MANIFESTO OVERLAY (Guillaume Colombel About Page Style)
          Clean editorial layout, high contrast, institutional specifications.
          ========================================================================= */}
      {showAboutModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-between bg-[#0a0504]/94 backdrop-blur-xl p-6 sm:p-14 animate-in fade-in duration-300 overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="font-sans font-bold text-base tracking-tight text-white uppercase">
              IDLEX<span className="text-[#D4FF00]">.</span>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Editorial Manifesto Body */}
          <div className="max-w-3xl mx-auto w-full py-10 my-auto">
            <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-white leading-tight mb-6">
              IdleX, the intelligent institutional resource exchange.
            </h1>

            <p className="text-base sm:text-xl text-neutral-300 font-light leading-relaxed mb-6">
              Across premier universities, national laboratories, and engineering clusters, over
              ₹14.2 billion in specialized capital equipment sits dark after hours. IdleX builds
              the real-time discovery, verified operator credentialing, and transactional integrity
              protocol to turn dormant capacity into breakthrough innovation.
            </p>

            <p className="text-sm text-neutral-400 font-light leading-relaxed mb-10">
              Departmental budgeting has traditionally incentivized hoarding. Without standardized
              condition handovers or automated fallback guarantees, researchers lose months
              waiting for external commercial vendors. IdleX eliminates these opaque administrative
              walls.
            </p>

            {/* Architecture Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-white/10 mb-8 font-mono text-xs">
              <div>
                <div className="text-2xl font-bold text-[#D4FF00] font-sans">₹14.2B+</div>
                <div className="text-neutral-400 mt-1">Dormant Capital Monitored</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-sans">100%</div>
                <div className="text-neutral-400 mt-1">ACID Atomic Lock Guarantee</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#D4FF00] font-sans">0 min</div>
                <div className="text-neutral-400 mt-1">Double Booking Collision</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-sans">42+</div>
                <div className="text-neutral-400 mt-1">Verified Instruments & Bays</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
              <Link
                href="/explore"
                onClick={() => setShowAboutModal(false)}
                className="text-white hover:text-[#D4FF00] transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-[#D4FF00]"
              >
                Browse Marketplace
              </Link>
              <Link
                href="/match"
                onClick={() => setShowAboutModal(false)}
                className="text-white hover:text-[#D4FF00] transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-[#D4FF00]"
              >
                Intent Matching Engine
              </Link>
              <Link
                href="/incidents"
                onClick={() => setShowAboutModal(false)}
                className="text-white hover:text-[#D4FF00] transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-[#D4FF00]"
              >
                Promise Protection Protocol
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setShowAboutModal(false)}
                className="text-white hover:text-[#D4FF00] transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-[#D4FF00]"
              >
                Launch App
              </Link>
            </div>
          </div>

          {/* Footer inside About modal */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-6 border-t border-white/10">
            <span>IDLEX PROTOCOL V2.6</span>
            <span>© 2026 IDLEX INC.</span>
          </div>
        </div>
      )}
    </div>
  );
}
