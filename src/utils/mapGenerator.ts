import * as THREE from 'three';
import { MapId, MapTheme } from '../types/game.ts';

export const MAP_THEMES: Record<MapId, MapTheme> = {
  0: {
    id: 0,
    name: 'Estación Orbital Alpha',
    sector: 'Sector 01: Orbit Alpha',
    wallPrimaryColor: '#1e293b',
    wallStripeColor: '#06b6d4',
    floorColor: '#0f172a',
    ceilingColor: '#020617',
    ambientLight: 0x475569,
    directionalLight: 0x38bdf8,
    fogColor: 0x091220,
    fogDensity: 0.045,
    skyColor: '#020617'
  },
  1: {
    id: 1,
    name: 'Distrito Cyberpunk',
    sector: 'Sector 02: Neo-Tokyo Underground',
    wallPrimaryColor: '#261430',
    wallStripeColor: '#ec4899',
    floorColor: '#11091a',
    ceilingColor: '#08030d',
    ambientLight: 0x6b21a8,
    directionalLight: 0xf43f5e,
    fogColor: 0x180726,
    fogDensity: 0.042,
    skyColor: '#10051b'
  },
  2: {
    id: 2,
    name: 'Fundición Magmática',
    sector: 'Sector 03: Lava Core Foundry',
    wallPrimaryColor: '#361814',
    wallStripeColor: '#f97316',
    floorColor: '#1c0c0a',
    ceilingColor: '#120504',
    ambientLight: 0x7c2d12,
    directionalLight: 0xfbbf24,
    fogColor: 0x220704,
    fogDensity: 0.05,
    skyColor: '#1f0603'
  },
  3: {
    id: 3,
    name: 'Cripta Bio-Alienígena',
    sector: 'Sector 04: Hive Vault',
    wallPrimaryColor: '#06281a',
    wallStripeColor: '#10b981',
    floorColor: '#02120b',
    ceilingColor: '#010804',
    ambientLight: 0x064e3b,
    directionalLight: 0x34d399,
    fogColor: 0x021910,
    fogDensity: 0.048,
    skyColor: '#010f08'
  }
};

// 4 distinct 20x20 maze grids (1=Wall, 0=Empty, 2=Spawn, 3=Objective/Core, 4=Explosive Barrel)
export const MAP_LAYOUTS: number[][][] = [
  // Map 0: Orbital Alpha (Corridor network with hub rooms)
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,3,1],
    [1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,4,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,4,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,3,1,0,0,0,1,0,0,1,0,0,0,1,3,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,1,1,1,1,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,0,1,4,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,0,1],
    [1,0,1,4,0,0,1,0,0,0,0,0,0,1,0,0,4,1,0,1],
    [1,3,1,0,1,0,0,0,1,1,1,1,0,0,0,1,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Map 1: Cyberpunk Neo-Tokyo (Diagonal cuts, tech avenues and alleyways)
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,3,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,1,3,1,0,0,0,1,3,1,0,0,0,1,4,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,0,0,1,1,1,0,1,1,1,0,0,1,1,1,1,1],
    [1,0,0,1,0,1,1,0,0,0,0,0,1,1,0,1,0,0,0,1],
    [1,0,0,1,0,1,0,0,1,1,1,0,0,1,0,1,0,1,0,1],
    [1,0,4,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,0,0,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,1,0,1,1,0,1,1,0,1,0,0,0,0,0,1],
    [1,1,1,0,0,1,0,0,0,0,0,0,0,1,0,0,1,1,1,1],
    [1,3,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,4,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,0,1,1,1,0,1,1,1,0,1,1,0,0,1],
    [1,0,0,4,1,1,0,0,0,1,0,1,0,0,0,1,0,0,1,1],
    [1,1,0,0,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1],
    [1,3,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Map 2: Magma Core Foundry (Industrial crucibles, fiery hazards)
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,3,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,1,4,0,0,0,4,1,0,0,0,1,3,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,0,1],
    [1,0,0,0,1,0,0,0,1,3,1,0,0,0,1,0,0,0,1,1],
    [1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,4,0,0,1,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,0,1],
    [1,0,0,0,1,3,1,1,1,0,1,1,1,4,1,0,0,0,0,1],
    [1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
    [1,0,0,0,1,1,1,0,1,1,1,0,1,1,1,0,0,0,0,1],
    [1,0,1,0,0,0,1,0,1,3,1,0,1,0,0,0,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,0,1],
    [1,0,4,0,1,0,0,0,0,0,0,0,0,0,1,4,0,0,1,1],
    [1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,1,1],
    [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Map 3: Hive Vault (Organic Alien Crypt with winding organic catacombs)
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,3,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,4,0,0,0,0,1,3,0,1,0,0,0,0,4,1,0,1],
    [1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,3,1,0,0,1,3,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,4,1,0,0,0,0,4,4,0,0,0,0,1,4,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,4,1,0,0,0,0,0,0,0,0,0,0,1,4,0,0,1],
    [1,3,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ]
];

// Procedural Canvas Texture Generator for each theme
export function createMapTextures(themeId: MapId) {
  const theme = MAP_THEMES[themeId];

  // 1. Wall Texture
  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = 256;
  wallCanvas.height = 256;
  const wctx = wallCanvas.getContext('2d')!;

  wctx.fillStyle = theme.wallPrimaryColor;
  wctx.fillRect(0, 0, 256, 256);

  // Metal panel seams & rivets
  wctx.strokeStyle = '#000000';
  wctx.lineWidth = 4;
  wctx.strokeRect(4, 4, 248, 248);
  wctx.strokeRect(20, 20, 216, 216);

  // Glowing conduits / theme stripe
  wctx.fillStyle = theme.wallStripeColor;
  wctx.fillRect(10, 120, 236, 16);
  wctx.shadowColor = theme.wallStripeColor;
  wctx.shadowBlur = 12;
  wctx.fillRect(30, 124, 196, 8);
  wctx.shadowBlur = 0;

  // Diagonal warning or tech lines
  wctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  wctx.lineWidth = 3;
  for (let i = 0; i < 256; i += 32) {
    wctx.beginPath();
    wctx.moveTo(i, 20);
    wctx.lineTo(i + 16, 60);
    wctx.stroke();
    wctx.beginPath();
    wctx.moveTo(i, 196);
    wctx.lineTo(i + 16, 236);
    wctx.stroke();
  }

  // 2. Floor Texture
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 256;
  floorCanvas.height = 256;
  const fctx = floorCanvas.getContext('2d')!;

  fctx.fillStyle = theme.floorColor;
  fctx.fillRect(0, 0, 256, 256);

  // Grating grid
  fctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  fctx.lineWidth = 2;
  for (let x = 0; x <= 256; x += 16) {
    fctx.beginPath();
    fctx.moveTo(x, 0);
    fctx.lineTo(x, 256);
    fctx.stroke();
  }
  for (let y = 0; y <= 256; y += 16) {
    fctx.beginPath();
    fctx.moveTo(0, y);
    fctx.lineTo(256, y);
    fctx.stroke();
  }

  // Accent highlights
  fctx.strokeStyle = theme.wallStripeColor;
  fctx.lineWidth = 2;
  fctx.strokeRect(16, 16, 224, 224);

  // 3. Ceiling Texture
  const ceilCanvas = document.createElement('canvas');
  ceilCanvas.width = 256;
  ceilCanvas.height = 256;
  const cctx = ceilCanvas.getContext('2d')!;

  cctx.fillStyle = theme.ceilingColor;
  cctx.fillRect(0, 0, 256, 256);

  // Overhead light panel
  cctx.fillStyle = theme.wallStripeColor;
  cctx.shadowColor = theme.wallStripeColor;
  cctx.shadowBlur = 16;
  cctx.beginPath();
  cctx.arc(128, 128, 48, 0, Math.PI * 2);
  cctx.fill();
  cctx.shadowBlur = 0;
  cctx.fillStyle = '#ffffff';
  cctx.beginPath();
  cctx.arc(128, 128, 24, 0, Math.PI * 2);
  cctx.fill();

  const wallTexture = new THREE.CanvasTexture(wallCanvas);
  const floorTexture = new THREE.CanvasTexture(floorCanvas);
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(20, 20);

  const ceilingTexture = new THREE.CanvasTexture(ceilCanvas);
  ceilingTexture.wrapS = THREE.RepeatWrapping;
  ceilingTexture.wrapT = THREE.RepeatWrapping;
  ceilingTexture.repeat.set(10, 10);

  return { wallTexture, floorTexture, ceilingTexture };
}
