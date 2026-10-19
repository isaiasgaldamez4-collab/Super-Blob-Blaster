import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Download, RefreshCw, Volume2, VolumeX, Shield, Play } from 'lucide-react';
import { STANDALONE_HTML_CODE } from '../standaloneCode.ts';

// Web Audio Sound FX
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  shootGrenade() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.2);
  }

  shootLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.1);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.1);
  }

  explosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, t);
    filter.frequency.exponentialRampToValueAtTime(45, t + 0.4);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  reload() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(700, t + 0.45);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.5);
  }

  switchWeapon() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.linearRampToValueAtTime(550, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.12);
  }

  emptyClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.05);
  }

  blobAttack() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(550, t + 0.1);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.22);
  }

  playerHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.22);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.22);
  }
}

const audioFX = new SoundFX();

// Texture generators
function createSciFiWallTexture(hue: 'brown' | 'teal') {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = hue === 'brown' ? '#5a3d2e' : '#234d4d';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);
  ctx.fillStyle = hue === 'brown' ? '#6e4b38' : '#2f5f5f';
  ctx.fillRect(16, 24, 224, 96);
  ctx.fillRect(16, 136, 224, 96);
  ctx.strokeRect(16, 24, 224, 96);
  ctx.strokeRect(16, 136, 224, 96);
  ctx.fillStyle = hue === 'brown' ? '#ea580c' : '#38bdf8';
  ctx.fillRect(100, 56, 56, 26);
  ctx.strokeRect(100, 56, 56, 26);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function createFloorTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#3c2b22';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);
  ctx.fillStyle = '#1c1410';
  ctx.fillRect(18, 18, 220, 220);
  ctx.strokeRect(18, 18, 220, 220);
  ctx.fillStyle = '#4a362b';
  for (let x = 32; x < 230; x += 18) {
    for (let y = 32; y < 230; y += 18) ctx.fillRect(x, y, 10, 10);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function createCeilingTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#422e23';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(128, 128, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function createHornedBlobTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  // Horns
  ctx.beginPath();
  ctx.moveTo(36, 44);
  ctx.quadraticCurveTo(28, 20, 34, 14);
  ctx.quadraticCurveTo(46, 24, 48, 44);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(92, 44);
  ctx.quadraticCurveTo(100, 20, 94, 14);
  ctx.quadraticCurveTo(82, 24, 80, 44);
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.ellipse(64, 72, 44, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly
  ctx.fillStyle = '#bfdbfe';
  ctx.beginPath();
  ctx.ellipse(64, 82, 32, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(48, 62, 4, 0, Math.PI * 2);
  ctx.arc(80, 62, 4, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function drawWeapon(canvas: HTMLCanvasElement | null, weaponType: 'grenade' | 'laser', kickback: number, isReloading: boolean) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 320, 240);
  const offsetY = isReloading ? 45 + Math.sin(performance.now() * 0.015) * 8 : kickback * 25;
  ctx.save();
  ctx.translate(0, offsetY);

  if (weaponType === 'grenade') {
    ctx.fillStyle = '#222327';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(90, 240);
    ctx.lineTo(110, 160);
    ctx.lineTo(135, 140);
    ctx.lineTo(185, 140);
    ctx.lineTo(210, 160);
    ctx.lineTo(230, 240);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#31343c';
    ctx.beginPath();
    ctx.ellipse(160, 155, 48, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const glowColor = isReloading ? '#facc15' : '#f97316';
    ctx.fillStyle = glowColor;
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(132, 142, 56, 9, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(124, 158, 72, 11, 5);
    ctx.fill();
    ctx.stroke();

    if (kickback > 0.4 && !isReloading) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(160, 115, 26, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(95, 240);
    ctx.lineTo(115, 150);
    ctx.lineTo(130, 110);
    ctx.lineTo(190, 110);
    ctx.lineTo(205, 150);
    ctx.lineTo(225, 240);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(135, 90, 20, 45);
    ctx.strokeRect(135, 90, 20, 45);
    ctx.fillRect(165, 90, 20, 45);
    ctx.strokeRect(165, 90, 20, 45);

    const laserGlow = isReloading ? '#facc15' : '#38bdf8';
    ctx.fillStyle = laserGlow;
    ctx.fillRect(137, 98, 16, 8);
    ctx.fillRect(137, 114, 16, 8);
    ctx.fillRect(167, 98, 16, 8);
    ctx.fillRect(167, 114, 16, 8);

    if (kickback > 0.4 && !isReloading) {
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(145, 80, 20, 0, Math.PI * 2);
      ctx.arc(175, 80, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBlood(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 220, 220);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(60, 50, 38, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc(
      60 + (Math.random() - 0.5) * 90,
      50 + (Math.random() - 0.5) * 80 + Math.random() * 40,
      Math.random() * 7 + 1.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

const MAP_SIZE = 24;
const TILE_SIZE = 5;
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,2,2,2,2,0,1,0,2,2,2,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,2,0,0,2,0,1,0,2,0,0,2,0,0,0,1],
  [1,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
  [1,1,0,1,1,0,0,0,0,1,1,2,2,1,1,0,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
  [1,0,2,2,2,0,1,0,0,1,0,0,0,0,1,0,0,1,0,2,2,2,0,1],
  [1,0,2,0,2,0,0,0,0,0,0,1,1,0,0,0,0,0,0,2,0,2,0,1],
  [1,0,2,2,2,0,1,1,0,1,0,1,1,0,1,0,1,1,0,2,2,2,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
  [1,1,0,1,1,0,1,0,0,1,1,0,0,1,1,0,0,1,0,1,1,0,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,0,2,2,2,0,1,1,0,2,2,2,0,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,2,0,2,0,1,1,0,2,0,2,0,0,0,0,1,0,1],
  [1,0,1,1,0,1,0,2,2,2,0,0,0,0,2,2,2,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,0,1,0,1,1,1,0,1,0,0,0,0,1,0,1,1,1,0,1,0,1,1],
  [1,0,0,1,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,1,0,0,1],
  [1,0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function isWalkable(x: number, z: number, margin = 1.0) {
  const corners = [
    { cx: x - margin, cz: z - margin },
    { cx: x + margin, cz: z - margin },
    { cx: x - margin, cz: z + margin },
    { cx: x + margin, cz: z + margin }
  ];
  for (const c of corners) {
    const col = Math.floor(c.cx / TILE_SIZE);
    const row = Math.floor(c.cz / TILE_SIZE);
    if (col < 0 || col >= MAP_SIZE || row < 0 || row >= MAP_SIZE) return false;
    if (MAP[row][col] > 0) return false;
  }
  return true;
}

interface EnemyBlob {
  sprite: THREE.Sprite;
  x: number;
  z: number;
  speed: number;
  attackTimer: number;
}

interface ProjectileBlob {
  mesh: THREE.Mesh;
  type: 'grenade' | 'laser';
  vx: number;
  vy: number;
  vz: number;
  life: number;
}

interface Props {
  onSwitchToCyberStrike?: () => void;
}

export function BlobBlaster3D({ onSwitchToCyberStrike }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const gunCanvasRef = useRef<HTMLCanvasElement>(null);
  const bloodCanvasRef = useRef<HTMLCanvasElement>(null);

  // React State for UI
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [kills, setKills] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [weapon, setWeapon] = useState<'grenade' | 'laser'>('grenade');
  const [ammoGrenade, setAmmoGrenade] = useState<number>(16);
  const [ammoLaser, setAmmoLaser] = useState<number>(50);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [damageFlash, setDamageFlash] = useState<boolean>(false);

  // References for game loop
  const stateRef = useRef({
    isPlaying: false,
    player: {
      x: 10,
      z: 10,
      angle: 0,
      health: 100,
      weapon: 'grenade' as 'grenade' | 'laser',
      ammoGrenade: 16,
      maxAmmoGrenade: 16,
      ammoLaser: 50,
      maxAmmoLaser: 50,
      kills: 0,
      bobTimer: 0,
      kickback: 0,
      isReloading: false
    },
    enemies: [] as EnemyBlob[],
    projectiles: [] as ProjectileBlob[],
    keys: {} as Record<string, boolean>,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    hornedBlobMat: null as THREE.SpriteMaterial | null,
    shootFn: null as (() => void) | null,
    reloadFn: null as (() => void) | null,
    switchWeaponFn: null as ((type?: 'grenade' | 'laser') => void) | null,
    startFn: null as (() => void) | null
  });

  const downloadStandalone = useCallback(() => {
    const blob = new Blob([STANDALONE_HTML_CODE], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SuperBlobBlaster3D_Emupedia.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      audioFX.enabled = !prev;
      return !prev;
    });
  }, []);

  const handleStartGame = useCallback(() => {
    stateRef.current.startFn?.();
  }, []);

  const handleShoot = useCallback(() => {
    stateRef.current.shootFn?.();
  }, []);

  const handleReload = useCallback(() => {
    stateRef.current.reloadFn?.();
  }, []);

  const handleSwitchWeapon = useCallback((type?: 'grenade' | 'laser') => {
    stateRef.current.switchWeaponFn?.(type);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x101726, 0.035);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 120);
    scene.add(new THREE.AmbientLight(0x555555));
    const playerLight = new THREE.PointLight(0xffeedd, 1.2, 22);
    camera.add(playerLight);
    scene.add(camera);

    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;

    // Build World Textures & Geometry
    const floorTex = createFloorTexture();
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(MAP_SIZE, MAP_SIZE);

    const ceilTex = createCeilingTexture();
    ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping;
    ceilTex.repeat.set(MAP_SIZE, MAP_SIZE);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE),
      new THREE.MeshBasicMaterial({ map: floorTex })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((MAP_SIZE * TILE_SIZE) / 2, 0, (MAP_SIZE * TILE_SIZE) / 2);
    scene.add(floor);

    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE),
      new THREE.MeshBasicMaterial({ map: ceilTex })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set((MAP_SIZE * TILE_SIZE) / 2, TILE_SIZE, (MAP_SIZE * TILE_SIZE) / 2);
    scene.add(ceil);

    const wallBrown = createSciFiWallTexture('brown');
    const wallTeal = createSciFiWallTexture('teal');
    const boxGeo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);
    const bMat = new THREE.MeshBasicMaterial({ map: wallBrown });
    const tMat = new THREE.MeshBasicMaterial({ map: wallTeal });

    for (let r = 0; r < MAP_SIZE; r++) {
      for (let c = 0; c < MAP_SIZE; c++) {
        if (MAP[r][c] > 0) {
          const w = new THREE.Mesh(boxGeo, MAP[r][c] === 1 ? bMat : tMat);
          w.position.set(c * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
          scene.add(w);
        }
      }
    }

    // Horned Blob Material
    const hornedBlobTex = createHornedBlobTexture();
    const hornedBlobMat = new THREE.SpriteMaterial({ map: hornedBlobTex, transparent: true });
    stateRef.current.hornedBlobMat = hornedBlobMat;

    // Initial 2D draws
    drawWeapon(gunCanvasRef.current, 'grenade', 0, false);
    drawBlood(bloodCanvasRef.current);

    // Radar rendering
    function renderRadar() {
      const radar = radarCanvasRef.current;
      if (!radar) return;
      const ctx = radar.getContext('2d');
      if (!ctx) return;
      const rw = radar.width;
      const rh = radar.height;
      ctx.clearRect(0, 0, rw, rh);

      const pCol = stateRef.current.player.x / TILE_SIZE;
      const pRow = stateRef.current.player.z / TILE_SIZE;
      const scale = 5.2;

      ctx.save();
      ctx.translate(rw / 2, rh / 2);

      // Maze walls
      ctx.fillStyle = '#1e3a5f';
      for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
          if (MAP[r][c] > 0) {
            ctx.fillRect((c - pCol) * scale, (r - pRow) * scale, scale, scale);
          }
        }
      }

      // Red Blobs
      ctx.fillStyle = '#ef4444';
      stateRef.current.enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc((enemy.x / TILE_SIZE - pCol) * scale, (enemy.z / TILE_SIZE - pRow) * scale, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player cyan dot and direction line
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-Math.sin(stateRef.current.player.angle) * 10, -Math.cos(stateRef.current.player.angle) * 10);
      ctx.stroke();

      ctx.restore();
    }

    // Enemy Spawning
    function spawnEnemies() {
      stateRef.current.enemies.forEach(e => scene.remove(e.sprite));
      stateRef.current.enemies = [];

      for (let r = 1; r < MAP_SIZE - 1; r++) {
        for (let c = 1; c < MAP_SIZE - 1; c++) {
          if (r < 5 && c < 5) continue;
          if (MAP[r][c] === 0 && Math.random() < 0.22) {
            const sprite = new THREE.Sprite(hornedBlobMat.clone());
            sprite.scale.set(3, 3, 1);
            const x = c * TILE_SIZE + TILE_SIZE / 2;
            const z = r * TILE_SIZE + TILE_SIZE / 2;
            sprite.position.set(x, 1.5, z);
            scene.add(sprite);
            stateRef.current.enemies.push({
              sprite,
              x,
              z,
              speed: 3.2 + Math.random() * 1.6,
              attackTimer: 0
            });
          }
        }
      }
    }

    // Kill blob (1-shot kill)
    function killBlob(idx: number, ex: number, ez: number) {
      const enemy = stateRef.current.enemies[idx];
      if (!enemy) return;
      scene.remove(enemy.sprite);
      stateRef.current.enemies.splice(idx, 1);

      stateRef.current.player.kills++;
      setKills(stateRef.current.player.kills);

      const flash = new THREE.PointLight(0xff3300, 4, 10);
      flash.position.set(ex, 1.5, ez);
      scene.add(flash);
      setTimeout(() => scene.remove(flash), 160);

      audioFX.explosion();

      if (stateRef.current.enemies.length < 8) {
        spawnEnemies();
      }
    }

    // Reload
    function reload() {
      const p = stateRef.current.player;
      const isLaser = p.weapon === 'laser';
      const max = isLaser ? p.maxAmmoLaser : p.maxAmmoGrenade;
      const cur = isLaser ? p.ammoLaser : p.ammoGrenade;
      if (p.isReloading || cur === max) return;

      p.isReloading = true;
      setIsReloading(true);
      audioFX.reload();

      setTimeout(() => {
        if (isLaser) {
          p.ammoLaser = p.maxAmmoLaser;
          setAmmoLaser(p.ammoLaser);
        } else {
          p.ammoGrenade = p.maxAmmoGrenade;
          setAmmoGrenade(p.ammoGrenade);
        }
        p.isReloading = false;
        setIsReloading(false);
      }, 1000);
    }
    stateRef.current.reloadFn = reload;

    // Switch weapon
    function switchWeapon(type?: 'grenade' | 'laser') {
      const p = stateRef.current.player;
      if (p.isReloading) return;
      p.weapon = type || (p.weapon === 'grenade' ? 'laser' : 'grenade');
      setWeapon(p.weapon);
      audioFX.switchWeapon();
    }
    stateRef.current.switchWeaponFn = switchWeapon;

    // Shoot
    function shoot() {
      const p = stateRef.current.player;
      if (p.isReloading || !stateRef.current.isPlaying) return;

      const isLaser = p.weapon === 'laser';
      const curAmmo = isLaser ? p.ammoLaser : p.ammoGrenade;
      if (curAmmo <= 0) {
        audioFX.emptyClick();
        reload();
        return;
      }

      if (isLaser) {
        p.ammoLaser--;
        setAmmoLaser(p.ammoLaser);
        audioFX.shootLaser();
      } else {
        p.ammoGrenade--;
        setAmmoGrenade(p.ammoGrenade);
        audioFX.shootGrenade();
      }

      p.kickback = 1;
      const dirX = -Math.sin(p.angle);
      const dirZ = -Math.cos(p.angle);

      if (isLaser) {
        const geo = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8);
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.z = p.angle;
        mesh.position.set(p.x + dirX * 1.0, 1.7, p.z + dirZ * 1.0);
        scene.add(mesh);
        stateRef.current.projectiles.push({
          mesh,
          type: 'laser',
          vx: dirX * 42,
          vy: 0,
          vz: dirZ * 42,
          life: 1.2
        });
      } else {
        const geo = new THREE.SphereGeometry(0.38, 12, 12);
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
        mesh.position.set(p.x + dirX * 0.8, 1.8, p.z + dirZ * 0.8);
        scene.add(mesh);
        stateRef.current.projectiles.push({
          mesh,
          type: 'grenade',
          vx: dirX * 20,
          vy: 2.2,
          vz: dirZ * 20,
          life: 2.2
        });
      }
    }
    stateRef.current.shootFn = shoot;

    // Start Game
    function startGame() {
      const p = stateRef.current.player;
      p.x = 10;
      p.z = 10;
      p.angle = 0;
      p.health = 100;
      p.weapon = 'grenade';
      p.ammoGrenade = 16;
      p.ammoLaser = 50;
      p.kills = 0;
      p.isReloading = false;

      setHealth(100);
      setKills(0);
      setWeapon('grenade');
      setAmmoGrenade(16);
      setAmmoLaser(50);
      setIsGameOver(false);
      setIsPlaying(true);
      stateRef.current.isPlaying = true;

      spawnEnemies();
      canvas?.requestPointerLock?.();
    }
    stateRef.current.startFn = startGame;

    function triggerGameOver() {
      stateRef.current.isPlaying = false;
      setIsPlaying(false);
      setIsGameOver(true);
      if (document.exitPointerLock) document.exitPointerLock();
    }

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!stateRef.current.isPlaying) {
        renderer.render(scene, camera);
        return;
      }

      const p = stateRef.current.player;
      const keys = stateRef.current.keys;

      let moveF = 0;
      let moveS = 0;
      if (keys['ArrowUp'] || keys['KeyW'] || keys['w'] || keys['W']) moveF += 1;
      if (keys['ArrowDown'] || keys['KeyS'] || keys['s'] || keys['S']) moveF -= 1;
      if (keys['KeyA'] || keys['a'] || keys['A']) moveS -= 1;
      if (keys['KeyD'] || keys['d'] || keys['D']) moveS += 1;

      if (keys['ArrowLeft']) p.angle += 3.6 * dt;
      if (keys['ArrowRight']) p.angle -= 3.6 * dt;

      if (moveF !== 0 || moveS !== 0) {
        p.bobTimer += dt * 10;
        const speed = 10.0;
        const dx = (-Math.sin(p.angle) * moveF + Math.cos(p.angle) * moveS) * speed * dt;
        const dz = (-Math.cos(p.angle) * moveF - Math.sin(p.angle) * moveS) * speed * dt;
        if (isWalkable(p.x + dx, p.z, 0.9)) p.x += dx;
        if (isWalkable(p.x, p.z + dz, 0.9)) p.z += dz;
      }

      camera.position.set(p.x, 2.2 + Math.sin(p.bobTimer) * 0.12, p.z);
      camera.rotation.y = p.angle;

      if (p.kickback > 0) p.kickback = Math.max(0, p.kickback - dt * 7);
      drawWeapon(gunCanvasRef.current, p.weapon, p.kickback, p.isReloading);

      // Projectiles update
      const projectiles = stateRef.current.projectiles;
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const pr = projectiles[i];
        pr.life -= dt;
        if (pr.type === 'grenade') pr.vy -= 9.8 * dt;
        pr.mesh.position.x += pr.vx * dt;
        pr.mesh.position.y += pr.vy * dt;
        pr.mesh.position.z += pr.vz * dt;

        if (pr.type === 'grenade' && pr.mesh.position.y < 0.4) {
          pr.mesh.position.y = 0.4;
          pr.vy = -pr.vy * 0.55;
        }

        let hitBlob = false;
        const enemies = stateRef.current.enemies;
        for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
          const enemy = enemies[eIdx];
          const dist = Math.hypot(enemy.x - pr.mesh.position.x, enemy.z - pr.mesh.position.z);
          const hitRadius = pr.type === 'laser' ? 2.0 : 3.8;
          if (dist < hitRadius) {
            killBlob(eIdx, enemy.x, enemy.z);
            hitBlob = true;
            break;
          }
        }

        const col = Math.floor(pr.mesh.position.x / TILE_SIZE);
        const row = Math.floor(pr.mesh.position.z / TILE_SIZE);
        const hitWall = col >= 0 && col < MAP_SIZE && row >= 0 && row < MAP_SIZE && MAP[row][col] > 0;

        if (hitBlob || hitWall || pr.life <= 0) {
          scene.remove(pr.mesh);
          projectiles.splice(i, 1);
        }
      }

      // Enemies update
      stateRef.current.enemies.forEach(enemy => {
        const dx = p.x - enemy.x;
        const dz = p.z - enemy.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 24) {
          const step = enemy.speed * dt;
          const nextEx = enemy.x + (dx / dist) * step;
          const nextEz = enemy.z + (dz / dist) * step;
          if (isWalkable(nextEx, nextEz, 0.8)) {
            enemy.x = nextEx;
            enemy.z = nextEz;
          } else {
            enemy.x += (dx / dist) * step * 0.5;
            enemy.z += (dz / dist) * step * 0.5;
          }
          enemy.sprite.position.x = enemy.x;
          enemy.sprite.position.z = enemy.z;

          if (dist < 1.8) {
            enemy.attackTimer = (enemy.attackTimer || 0) + dt;
            if (enemy.attackTimer > 0.75) {
              enemy.attackTimer = 0;
              p.health = Math.max(0, p.health - 15);
              setHealth(p.health);
              audioFX.blobAttack();
              audioFX.playerHit();
              setDamageFlash(true);
              setTimeout(() => setDamageFlash(false), 550);
              if (p.health <= 0) {
                triggerGameOver();
              }
            }
          }
        }
      });

      renderRadar();
      renderer.render(scene, camera);
    }

    animate();

    // Event Listeners
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (!stateRef.current.isPlaying && !isGameOver) {
        startGame();
      }

      stateRef.current.keys[e.code] = true;
      stateRef.current.keys[e.key] = true;

      if (!stateRef.current.isPlaying) return;
      if (e.code === 'Space') shoot();
      if (e.code === 'KeyR' || e.key.toLowerCase() === 'r') reload();
      if (e.code === 'Digit1' || e.key === '1') switchWeapon('grenade');
      if (e.code === 'Digit2' || e.key === '2') switchWeapon('laser');
      if (e.code === 'KeyQ' || e.key.toLowerCase() === 'q') switchWeapon();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
      stateRef.current.keys[e.key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas && stateRef.current.isPlaying) {
        stateRef.current.player.angle -= e.movementX * 0.0035;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!stateRef.current.isPlaying && !isGameOver) {
        startGame();
        return;
      }
      if (e.button === 0) {
        shoot();
      }
    };

    const handleCanvasClick = () => {
      if (stateRef.current.isPlaying) {
        canvas.requestPointerLock?.();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('click', handleCanvasClick);
      if (document.exitPointerLock && document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-black font-sans">
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top Bar Utilities */}
      <div className="absolute top-3 left-4 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={toggleSound}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shadow transition flex items-center gap-1.5 text-xs font-semibold"
          title={soundEnabled ? 'Silenciar Sonido' : 'Activar Sonido'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          <span className="hidden sm:inline">{soundEnabled ? 'Sonido ON' : 'Sonido OFF'}</span>
        </button>

        <button
          onClick={downloadStandalone}
          className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 shadow transition flex items-center gap-1.5 text-xs font-bold"
          title="Descarga el archivo autónomo original index.html para jugar sin internet"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Descargar index.html (Autónomo)</span>
        </button>

        {onSwitchToCyberStrike && (
          <button
            onClick={onSwitchToCyberStrike}
            className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-100 border border-cyan-500/40 shadow transition flex items-center gap-1.5 text-xs font-bold"
            title="Cambiar a CyberStrike 3D con 4 mapas y personajes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>CyberStrike 3D</span>
          </button>
        )}
      </div>

      {/* Title Screen */}
      {!isPlaying && !isGameOver && (
        <div
          onClick={handleStartGame}
          className="absolute inset-0 bg-[#294a73] flex flex-col items-center justify-center z-50 cursor-pointer text-center p-5 select-none"
        >
          <div className="font-serif italic text-4xl sm:text-6xl text-[#0b1523] -mb-3 sm:-mb-5 tracking-wider">
            Super
          </div>
          <div
            className="font-black text-6xl sm:text-8xl lg:text-9xl text-white uppercase tracking-wider drop-shadow-2xl"
            style={{
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              WebkitTextStroke: '4px #000000',
              textShadow: '-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000, 6px 6px 0 rgba(0,0,0,0.6)'
            }}
          >
            BLOB BLASTER
          </div>

          <div className="mt-10 sm:mt-14 text-xl sm:text-3xl font-black text-[#607b9e] tracking-widest animate-pulse">
            Click to Start
          </div>

          <div className="mt-4 text-sky-200 text-sm sm:text-base font-medium max-w-md bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-sky-400/20">
            (O presiona cualquier flechita para empezar)
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-300 max-w-lg bg-black/40 p-3 rounded-xl border border-white/10">
            <div>🎮 <b className="text-white">WASD / Flechas:</b> Moverte y Girar</div>
            <div>💥 <b className="text-white">Clic / Espacio:</b> Disparar</div>
            <div>🔄 <b className="text-white">[R]:</b> Recargar</div>
            <div>🔫 <b className="text-white">[Q] o 1/2:</b> Cambiar Arma</div>
          </div>
        </div>
      )}

      {/* In-Game HUD */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Kills Counter */}
          <div
            className="absolute top-16 sm:top-5 left-5 font-black text-3xl sm:text-4xl text-white drop-shadow"
            style={{
              fontFamily: "'Arial Black', Impact, sans-serif",
              WebkitTextStroke: '2px #000',
              textShadow: '3px 3px 0 #000'
            }}
          >
            Kills: <span>{kills}</span>
          </div>

          {/* Weapon Selector */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 pointer-events-auto">
            <button
              onClick={() => handleSwitchWeapon('grenade')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                weapon === 'grenade'
                  ? 'bg-amber-500 text-black border border-amber-300 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'
              }`}
            >
              [1] Granadas
            </button>
            <button
              onClick={() => handleSwitchWeapon('laser')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                weapon === 'laser'
                  ? 'bg-sky-400 text-black border border-sky-200 shadow-md shadow-sky-400/30'
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'
              }`}
            >
              [2] Láser Rápido
            </button>
            <span className="text-slate-400 text-[11px] font-bold px-1">[Q]</span>
          </div>

          {/* Circular Radar Minimap */}
          <div className="absolute top-5 right-5 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-sky-400 bg-slate-950/80 overflow-hidden shadow-lg shadow-sky-950/50 pointer-events-none">
            <canvas ref={radarCanvasRef} width={130} height={130} className="w-full h-full block" />
          </div>

          {/* Bottom Bar: Health & Ammo */}
          <div className="absolute bottom-6 left-6 flex items-center gap-8 sm:gap-12 pointer-events-auto">
            {/* Health */}
            <div
              className="flex items-center gap-2 font-black text-3xl sm:text-5xl text-white"
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                WebkitTextStroke: '2px #000',
                textShadow: '3px 3px 0 #000'
              }}
            >
              <span>{health}</span>
              <span className="text-rose-500 text-4xl sm:text-6xl font-black">+</span>
            </div>

            {/* Ammo & Reload */}
            <div className="flex flex-col">
              <div
                className="flex items-center gap-3 font-black text-3xl sm:text-5xl text-white"
                style={{
                  fontFamily: "'Arial Black', Impact, sans-serif",
                  WebkitTextStroke: '2px #000',
                  textShadow: '3px 3px 0 #000'
                }}
              >
                <span>{weapon === 'laser' ? ammoLaser : ammoGrenade}</span>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900 border-2 border-black flex items-center justify-center text-lg sm:text-2xl shadow-inner">
                  {weapon === 'laser' ? '⚡' : '💥'}
                </div>
              </div>
              <button
                onClick={handleReload}
                className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 text-left cursor-pointer transition select-none"
              >
                [R] Recargar
              </button>
            </div>
          </div>

          {/* Reloading Banner */}
          {isReloading && (
            <div
              className="absolute bottom-28 left-1/2 -translate-x-1/2 font-black text-2xl sm:text-3xl text-amber-400 animate-pulse"
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                textShadow: '2px 2px 0 #000'
              }}
            >
              RECARGANDO...
            </div>
          )}

          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
            <div className="absolute top-1/2 left-[-10px] w-8 h-[2px] -translate-y-1/2 bg-white/85 shadow-sm" />
            <div className="absolute left-1/2 top-[-10px] w-[2px] h-8 -translate-x-1/2 bg-white/85 shadow-sm" />
          </div>

          {/* Gun Viewmodel Canvas */}
          <canvas
            ref={gunCanvasRef}
            width={320}
            height={240}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[340px] h-[225px] sm:h-[255px] pointer-events-none z-20"
          />

          {/* Blood Splatter */}
          <canvas
            ref={bloodCanvasRef}
            width={220}
            height={220}
            className={`absolute top-0 left-0 w-44 sm:w-56 h-44 sm:h-56 pointer-events-none z-20 transition-opacity duration-200 ${
              damageFlash ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Damage Vignette Flash */}
          <div
            className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-150 ${
              damageFlash ? 'opacity-100 bg-rose-600/35' : 'opacity-0'
            }`}
          />
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 p-6 text-center select-none">
          <div
            className="font-black text-5xl sm:text-7xl text-rose-500 mb-4"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}
          >
            ¡HAS MUERTO!
          </div>
          <div className="text-white text-2xl sm:text-3xl font-bold mb-8">
            Kills conseguidas: <span className="text-amber-400 font-extrabold">{kills}</span>
          </div>
          <button
            onClick={handleStartGame}
            className="px-8 py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xl shadow-lg shadow-sky-400/30 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            REINTENTAR
          </button>
        </div>
      )}
    </div>
  );
}
