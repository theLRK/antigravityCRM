"use client";

import React from 'react';

const CUBE_SIZE = 14;
const COS30 = 0.866025;
const SIN30 = 0.5;

function IsoCube({ x, y, z }: { x: number, y: number, z: number }) {
  // Center projection within SVG bounding box (100x100)
  const px = 50 + (x - y) * CUBE_SIZE * COS30;
  // Offset py so the F is perfectly centered
  const py = 75 + (x + y) * CUBE_SIZE * SIN30 - z * CUBE_SIZE;

  const top = `
    ${px},${py - CUBE_SIZE} 
    ${px + CUBE_SIZE * COS30},${py - CUBE_SIZE * (1 - SIN30)} 
    ${px},${py} 
    ${px - CUBE_SIZE * COS30},${py - CUBE_SIZE * (1 - SIN30)}
  `;
  const right = `
    ${px},${py} 
    ${px + CUBE_SIZE * COS30},${py - CUBE_SIZE * (1 - SIN30)} 
    ${px + CUBE_SIZE * COS30},${py + CUBE_SIZE * SIN30} 
    ${px},${py + CUBE_SIZE}
  `;
  const left = `
    ${px},${py} 
    ${px - CUBE_SIZE * COS30},${py - CUBE_SIZE * (1 - SIN30)} 
    ${px - CUBE_SIZE * COS30},${py + CUBE_SIZE * SIN30} 
    ${px},${py + CUBE_SIZE}
  `;

  return (
    <g strokeWidth="0.5" strokeLinejoin="round">
      <polygon points={top} fill="#853953" stroke="#853953" />
      <polygon points={left} fill="#4A1E2E" stroke="#4A1E2E" />
      <polygon points={right} fill="#612D53" stroke="#612D53" />
    </g>
  );
}

export function Logo({ className = "", lightText = false }: { className?: string; lightText?: boolean }) {
  // Define coordinates for the 3D 'F' shape blocks
  const blocks = [
    // Stem
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 2 },
    { x: 0, y: 0, z: 3 },
    // Top Arm
    { x: 1, y: 0, z: 3 },
    { x: 2, y: 0, z: 3 },
    // Middle Arm
    { x: 1, y: 0, z: 1 },
  ];

  // We sort blocks by painters algorithm: back-to-front 
  // x+y-z ascending ensures blocks in the back draw first.
  const sortedBlocks = [...blocks].sort((a, b) => (a.x + a.y - a.z) - (b.x + b.y - b.z));

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative w-14 h-14 flex items-center justify-center -ml-2 drop-shadow-md">
        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {sortedBlocks.map((b, i) => (
            <IsoCube key={i} x={b.x} y={b.y} z={b.z} />
          ))}
        </svg>
      </div>
      
      <div className="flex flex-col justify-center translate-y-0.5">
        <span className={`text-2xl font-black tracking-tighter ${lightText ? 'text-white' : 'text-[#2C1E26]'}`} style={{ fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>
          FORMATIVE
        </span>
        <span className={`text-[9px] font-bold tracking-[0.25em] uppercase ${lightText ? 'text-white/70' : 'text-gray-500'}`} style={{ marginTop: '-4px' }}>
          CRM Intelligence
        </span>
      </div>
    </div>
  );
}
