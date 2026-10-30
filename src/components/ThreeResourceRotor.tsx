'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createRotorCoreGeometry,
  createTitaniumAccentsGeometry,
  createSlatePanelsGeometry,
  createPropertySpacesMotifGeometry,
  createPhysicalAssetsMotifGeometry,
  createDigitalTechMotifGeometry,
} from './rotor-geometry';

interface ThreeResourceRotorProps {
  /** Active stage index: 0 = Spaces, 1 = Physical Assets, 2 = Digital & Tech */
  stage: number;
  /** Continuous progress (0.0 to 2.0) if driving via continuous scroll scrubbing */
  scrollProgress?: number;
  /** Callback when user drags and snaps to a new stage */
  onStageChange?: (newStage: number) => void;
  className?: string;
}

export default function ThreeResourceRotor({
  stage,
  scrollProgress,
  onStageChange,
  className = '',
}: ThreeResourceRotorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(stage);
  const onStageChangeRef = useRef(onStageChange);
  const scrollProgressRef = useRef(scrollProgress);

  stageRef.current = stage;
  onStageChangeRef.current = onStageChange;
  scrollProgressRef.current = scrollProgress;

  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      50
    );
    camera.position.set(0, 0.25, 6.2);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Lighting setup (Industrial Studio)
    const ambientLight = new THREE.AmbientLight(0x2a3038, 1.4);
    scene.add(ambientLight);

    // Key light (warm industrial white from upper right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4.0, 5.0, 4.5);
    scene.add(keyLight);

    // Fill light (cooler metallic reflection from left)
    const fillLight = new THREE.DirectionalLight(0x8fa3b8, 1.8);
    fillLight.position.set(-4.5, 2.5, 3.0);
    scene.add(fillLight);

    // Rim light (crisp highlight from behind)
    const rimLight = new THREE.DirectionalLight(0xd4e4f7, 2.2);
    rimLight.position.set(0.0, 4.0, -5.0);
    scene.add(rimLight);

    // Under-glow point light (signature acid-lime accent)
    const accentLight = new THREE.PointLight(0xd4ff00, 2.5, 8.0);
    accentLight.position.set(0, -2.6, 2.2);
    scene.add(accentLight);

    // 5. Materials (PBR Graphite, Titanium, Slate, Lime)
    const matGraphite = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.88,
      roughness: 0.38,
      envMapIntensity: 1.0,
    });

    const matTitanium = new THREE.MeshStandardMaterial({
      color: 0xb4b9c2,
      metalness: 0.94,
      roughness: 0.24,
      envMapIntensity: 1.4,
    });

    const matSlate = new THREE.MeshStandardMaterial({
      color: 0x1b1f26,
      metalness: 0.82,
      roughness: 0.42,
    });

    const matAccent = new THREE.MeshStandardMaterial({
      color: 0xd4ff00,
      emissive: 0xd4ff00,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.1,
    });

    // 6. Geometries & Meshes
    const coreGeom = createRotorCoreGeometry();
    const coreMesh = new THREE.Mesh(coreGeom, matGraphite);

    const titaniumGeom = createTitaniumAccentsGeometry();
    const titaniumMesh = new THREE.Mesh(titaniumGeom, matTitanium);

    const slateGeom = createSlatePanelsGeometry();
    const slateMesh = new THREE.Mesh(slateGeom, matSlate);

    // Relief Motifs for each face
    const motif1Geom = createPropertySpacesMotifGeometry();
    const motif1Mesh = new THREE.Mesh(motif1Geom, matTitanium);

    const motif2Geom = createPhysicalAssetsMotifGeometry();
    const motif2Mesh = new THREE.Mesh(motif2Geom, matTitanium);

    const motif3Geom = createDigitalTechMotifGeometry();
    const motif3Mesh = new THREE.Mesh(motif3Geom, matTitanium);

    // Crown accent indicator ring
    const crownRingGeom = new THREE.TorusGeometry(0.85, 0.022, 16, 64);
    crownRingGeom.rotateX(Math.PI / 2);
    crownRingGeom.translate(0, 1.66, 0);
    const crownRingMesh = new THREE.Mesh(crownRingGeom, matAccent);

    // Central rotor group holding all parts
    const rotorGroup = new THREE.Group();
    rotorGroup.add(coreMesh);
    rotorGroup.add(titaniumMesh);
    rotorGroup.add(slateMesh);
    rotorGroup.add(motif1Mesh);
    rotorGroup.add(motif2Mesh);
    rotorGroup.add(motif3Mesh);
    rotorGroup.add(crownRingMesh);

    scene.add(rotorGroup);

    // 7. Interaction and Animation State
    const FACE_STEP_RAD = (2 * Math.PI) / 3; // 120 degrees in radians
    let currentRotY = -stageRef.current * FACE_STEP_RAD;
    let targetRotY = currentRotY;
    let isDragging = false;
    let startPointerX = 0;
    let startRotY = 0;
    let userHasDragged = false;
    let dragVelocity = 0;
    let lastPointerX = 0;

    // Pointer events for direct dragging
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      userHasDragged = true;
      setIsInteracting(true);
      startPointerX = e.clientX;
      lastPointerX = e.clientX;
      startRotY = currentRotY;
      dragVelocity = 0;
      container.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startPointerX;
      dragVelocity = (e.clientX - lastPointerX) * 0.005;
      lastPointerX = e.clientX;
      // 300px drag = ~120 degrees rotation
      targetRotY = startRotY - (deltaX / 300) * FACE_STEP_RAD;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      setIsInteracting(false);
      container.releasePointerCapture?.(e.pointerId);

      // Snap to nearest 120° face
      const snappedIndex = Math.round(-targetRotY / FACE_STEP_RAD);
      // Normalize to 0, 1, 2
      const normalizedStage = ((snappedIndex % 3) + 3) % 3;
      targetRotY = -snappedIndex * FACE_STEP_RAD;

      if (onStageChangeRef.current) {
        onStageChangeRef.current(normalizedStage);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 8. Resize Handler
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // 9. Animation loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // If driven by continuous scrollProgress (when user isn't directly dragging)
      if (!isDragging && scrollProgressRef.current !== undefined) {
        targetRotY = -scrollProgressRef.current * FACE_STEP_RAD;
      } else if (!isDragging && !userHasDragged) {
        targetRotY = -stageRef.current * FACE_STEP_RAD;
      }

      // Smooth damped rotation interpolation
      const lerpSpeed = isDragging ? 0.35 : 0.08;
      currentRotY += (targetRotY - currentRotY) * lerpSpeed;
      rotorGroup.rotation.y = currentRotY;

      // Subtle dynamic float & tilt
      rotorGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.035 + 0.06; // slight top-down view
      rotorGroup.rotation.z = Math.cos(elapsedTime * 0.7) * 0.015;
      rotorGroup.position.y = Math.sin(elapsedTime * 1.1) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();

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
      matAccent.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]"
        title="Click and drag to rotate the Slotly 3-Sided Resource Rotor"
      />
      {/* Interactive Drag Hint Pill */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-wider text-neutral-400 pointer-events-none transition-opacity duration-300 ${
          isInteracting ? 'opacity-0' : 'opacity-80'
        }`}
      >
        <span className="text-[#D4FF00]">↔ DRAG TO ROTATE</span> • 120° INDEXED
      </div>
    </div>
  );
}
