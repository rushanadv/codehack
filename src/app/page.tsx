'use client';

import React from 'react';
import CinematicHeroExperience from '@/components/CinematicHeroExperience';

export default function HomePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0B1510] text-[#F1F0E5] selection:bg-[#82996D] selection:text-[#0B1510]">
      {/* 3D FULL-VIEWPORT HORIZONTAL EXPERIENCE ONLY (NO VERTICAL SCROLL) */}
      <CinematicHeroExperience />
    </div>
  );
}
