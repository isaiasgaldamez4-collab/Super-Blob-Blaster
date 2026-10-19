import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Camera, Volume2, VolumeX, Eye, Crosshair, Zap, RotateCcw, Shield, Heart, MapPin, Users, Award, Play, Trophy, CheckCircle2, Lock, Home, Sparkles } from 'lucide-react';
import { CameraViewMode, CharacterId, WeaponId, MapId, Enemy, Projectile, WallExplosion, Achievement, PowerId } from '../types/game.ts';
import { soundManager } from '../utils/sound.ts';
import { MAP_THEMES, MAP_LAYOUTS, createMapTextures } from '../utils/mapGenerator.ts';
import { CHARACTERS, createPlayerMesh, createWeaponMesh, CharacterMeshGroup } from '../utils/characters.ts';
import { WEAPONS } from '../utils/weapons.ts';
import { POWERS } from '../utils/powers.ts';
import { loadAchievements, saveAchievements } from '../utils/achievements.ts';
import { CyberLobby } from './CyberLobby.tsx';

export function CyberStrike3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Game UI State (Starts in Lobby)
  const [isInLobby, setIsInLobby] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<CameraViewMode>('first');
  const [selectedChar, setSelectedChar] = useState<CharacterId>('rex');
  const [selectedPower, setSelectedPower] = useState<PowerId>('emp_blast');
  const [selectedMap, setSelectedMap] = useState<MapId>(0);
  const [showCharModal, setShowCharModal] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Tactical Power HUD Timers
  const [powerCooldownPercent, setPowerCooldownPercent] = useState<number>(0);
  const [powerIsActive, setPowerIsActive] = useState<boolean>(false);

  // Live Gameplay Stats
  const [hp, setHp] = useState<number>(100);
  const [maxHp, setMaxHp] = useState<number>(100);
  const [shield, setShield] = useState<number>(50);
  const [activeWeapon, setActiveWeapon] = useState<WeaponId>('blaster');
  const [ammo, setAmmo] = useState<number>(18);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [coresCollected, setCoresCollected] = useState<number>(0);
  const [totalCores, setTotalCores] = useState<number>(4);
  const [enemiesLeft, setEnemiesLeft] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // References to keep game loop in sync
  const stateRef = useRef({
    isPlaying: false,
    viewMode: 'first' as CameraViewMode,
    charId: 'rex' as CharacterId,
    mapId: 0 as MapId,
    hp: 100,
    maxHp: 100,
    shield: 50,
    activeWeapon: 'blaster' as WeaponId,
    ammo: { blaster: 18, shotgun: 6, rocket: 4, railgun: 5 },
    isReloading: false,
    lastShotTime: 0,
    coresCollected: 0,
    totalCores: 4,
    enemiesLeft: 0,
    score: 0,
    playerPos: new THREE.Vector3(2.5, 0, 2.5),
    playerAngle: 0,
    playerPitch: 0,
    walkCycle: 0,
    recoil: 0,
    screenShake: 0,
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false
    },
    updatePlayerMesh: null as (() => void) | null,
    updateFpWeapon: null as (() => void) | null,
    buildLevel: null as ((id: MapId) => void) | null,
    fireWeapon: null as (() => void) | null,
    damageTakenInCurrentMap: 0,
    enemiesKilledTotal: 0,
    weaponsFiredSet: new Set<WeaponId>(),
    unlockAchievement: null as ((id: string) => void) | null,
    isInLobby: true,
    powerId: 'emp_blast' as PowerId,
    powerActiveUntil: 0,
    powerCooldownUntil: 0,
    triggerEmpShockwave: null as (() => void) | null,
    triggerQuantumDash: null as (() => void) | null,
    activatePower: null as (() => void) | null
  });

  // Pointer lock state
  const isLockedRef = useRef<boolean>(false);

  // Activate Tactical Power
  const activatePower = useCallback(() => {
    const s = stateRef.current;
    if (s.isInLobby) return;
    const now = performance.now();
    const p = POWERS[s.powerId];

    if (now < s.powerCooldownUntil) return;

    s.powerActiveUntil = now + p.duration;
    s.powerCooldownUntil = now + p.cooldown;
    soundManager.playPowerActivate(s.powerId);

    if (s.powerId === 'emp_blast') {
      s.triggerEmpShockwave?.();
    } else if (s.powerId === 'kinetic_shield') {
      s.shield = 50;
      setShield(50);
    } else if (s.powerId === 'quantum_dash') {
      s.triggerQuantumDash?.();
    }
  }, []);

  // Return to Lobby
  const returnToLobby = useCallback(() => {
    setIsInLobby(true);
    stateRef.current.isInLobby = true;
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, []);

  // Unlock Achievement Handler
  const unlockAchievement = useCallback((achId: string) => {
    setAchievements((prev) => {
      const target = prev.find((a) => a.id === achId);
      if (!target || target.unlocked) return prev;

      const updated = prev.map((a) =>
        a.id === achId ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
      );
      saveAchievements(updated);
      soundManager.playAchievement();

      // Trigger On-Screen Toast Notification
      setActiveToast({ ...target, unlocked: true });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => {
        setActiveToast(null);
      }, 4500);

      return updated;
    });
  }, []);

  // Handle Sound Toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  // Switch View Mode (1st / 3rd Person)
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const next = prev === 'first' ? 'third' : 'first';
      stateRef.current.viewMode = next;
      return next;
    });
  }, []);

  // Switch Character
  const selectCharacter = (charId: CharacterId) => {
    setSelectedChar(charId);
    stateRef.current.charId = charId;
    const charDef = CHARACTERS[charId];
    stateRef.current.maxHp = charDef.maxHp;
    stateRef.current.hp = charDef.maxHp;
    setHp(charDef.maxHp);
    setMaxHp(charDef.maxHp);
    setShowCharModal(false);
    stateRef.current.updatePlayerMesh?.();
  };

  // Switch Map
  const selectMap = (mapId: MapId) => {
    setSelectedMap(mapId);
    stateRef.current.mapId = mapId;
    setShowMapModal(false);
    restartGame(mapId);
  };

  // Switch Weapon
  const switchWeapon = useCallback((weaponId: WeaponId) => {
    if (stateRef.current.isReloading) return;
    setActiveWeapon(weaponId);
    stateRef.current.activeWeapon = weaponId;
    setAmmo(stateRef.current.ammo[weaponId]);
    stateRef.current.updateFpWeapon?.();
    stateRef.current.updatePlayerMesh?.();
  }, []);

  // Reload Current Weapon
  const triggerReload = useCallback(() => {
    const s = stateRef.current;
    const w = WEAPONS[s.activeWeapon];
    if (s.isReloading || s.ammo[s.activeWeapon] === w.magSize) return;

    s.isReloading = true;
    setIsReloading(true);
    soundManager.playReload();

    setTimeout(() => {
      s.ammo[s.activeWeapon] = w.magSize;
      s.isReloading = false;
      setIsReloading(false);
      setAmmo(w.magSize);
    }, w.reloadTime);
  }, []);

  // Restart / Start
  const restartGame = useCallback((targetMapId?: MapId) => {
    const s = stateRef.current;
    const mapIdToUse = targetMapId !== undefined ? targetMapId : s.mapId;
    const charDef = CHARACTERS[s.charId];

    s.mapId = mapIdToUse;
    s.hp = charDef.maxHp;
    s.maxHp = charDef.maxHp;
    s.shield = 50;
    s.damageTakenInCurrentMap = 0;
    s.isReloading = false;
    s.coresCollected = 0;
    s.ammo = { blaster: 18, shotgun: 6, rocket: 4, railgun: 5 };
    s.activeWeapon = 'blaster';
    s.playerPos.set(2.5, 0, 2.5);
    s.playerAngle = 0;
    s.playerPitch = 0;
    s.isPlaying = true;

    setHp(charDef.maxHp);
    setMaxHp(charDef.maxHp);
    setShield(50);
    setCoresCollected(0);
    setActiveWeapon('blaster');
    setAmmo(18);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPlaying(true);
    stateRef.current.buildLevel?.(mapIdToUse);
    stateRef.current.updatePlayerMesh?.();
    stateRef.current.updateFpWeapon?.();
  }, []);

  // Launch match from Lobby
  const launchFromLobby = useCallback(() => {
    const s = stateRef.current;
    s.charId = selectedChar;
    s.powerId = selectedPower;
    s.mapId = selectedMap;
    s.isInLobby = false;
    setIsInLobby(false);
    restartGame(selectedMap);
  }, [selectedChar, selectedPower, selectedMap, restartGame]);

  // THREE.JS Engine Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // 2. Map & Scene Objects Container
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // 3. Dynamic Lists
    let enemies: Enemy[] = [];
    let projectiles: Projectile[] = [];
    let wallExplosions: WallExplosion[] = [];
    let pickups: { mesh: THREE.Mesh; type: 'core' | 'health' | 'ammo' | 'shield'; x: number; z: number }[] = [];
    let barrels: { mesh: THREE.Group; x: number; z: number; hp: number }[] = [];

    // 4. Player 3D Character Model (for 3rd Person View)
    let playerMesh: CharacterMeshGroup | null = null;

    // 5. 1st Person Weapon Viewmodel
    const fpWeaponGroup = new THREE.Group();
    scene.add(fpWeaponGroup);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const muzzleFlashLight = new THREE.PointLight(0x06b6d4, 0, 10);
    scene.add(muzzleFlashLight);

    // Build Current Map
    const buildLevel = (mapId: MapId) => {
      // Clear previous map
      while (mapGroup.children.length > 0) {
        const obj = mapGroup.children[0];
        mapGroup.remove(obj);
      }
      enemies = [];
      projectiles = [];
      wallExplosions = [];
      pickups = [];
      barrels = [];

      const theme = MAP_THEMES[mapId];
      const layout = MAP_LAYOUTS[mapId];

      scene.fog = new THREE.FogExp2(theme.fogColor, theme.fogDensity);
      scene.background = new THREE.Color(theme.fogColor);
      ambientLight.color.setHex(theme.ambientLight);
      dirLight.color.setHex(theme.directionalLight);

      const { wallTexture, floorTexture, ceilingTexture } = createMapTextures(mapId);

      const wallMat = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.4,
        metalness: 0.6
      });
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.7,
        metalness: 0.3
      });
      const ceilMat = new THREE.MeshStandardMaterial({
        map: ceilingTexture,
        roughness: 0.8,
        metalness: 0.2
      });

      // Floor & Ceiling Plane
      const floorGeo = new THREE.PlaneGeometry(50, 50);
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(25, 0, 25);
      mapGroup.add(floor);

      const ceilGeo = new THREE.PlaneGeometry(50, 50);
      const ceil = new THREE.Mesh(ceilGeo, ceilMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(25, 3.5, 25);
      mapGroup.add(ceil);

      // Wall Geometry Instance/Group
      const wallBoxGeo = new THREE.BoxGeometry(2.5, 3.5, 2.5);

      let coreCount = 0;
      let enemyIdCounter = 0;

      for (let r = 0; r < layout.length; r++) {
        for (let c = 0; c < layout[r].length; c++) {
          const val = layout[r][c];
          const x = c * 2.5 + 1.25;
          const z = r * 2.5 + 1.25;

          if (val === 1) {
            // Wall
            const wall = new THREE.Mesh(wallBoxGeo, wallMat);
            wall.position.set(x, 1.75, z);
            mapGroup.add(wall);
          } else if (val === 2) {
            // Player spawn
            stateRef.current.playerPos.set(x, 0, z);
          } else if (val === 3) {
            // Quantum Energy Core Objective
            coreCount++;
            const coreGeo = new THREE.OctahedronGeometry(0.45, 0);
            const coreMat = new THREE.MeshStandardMaterial({
              color: 0x06b6d4,
              emissive: 0x06b6d4,
              emissiveIntensity: 0.8,
              roughness: 0.1,
              metalness: 0.9
            });
            const coreMesh = new THREE.Mesh(coreGeo, coreMat);
            coreMesh.position.set(x, 1.2, z);
            mapGroup.add(coreMesh);
            pickups.push({ mesh: coreMesh, type: 'core', x, z });
          } else if (val === 4) {
            // Explosive Barrel
            const barrelGroup = new THREE.Group();
            const bGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 12);
            const bMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.6 });
            const bMesh = new THREE.Mesh(bGeo, bMat);
            bMesh.position.y = 0.5;
            const stripeGeo = new THREE.CylinderGeometry(0.41, 0.41, 0.25, 12);
            const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
            const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
            stripeMesh.position.y = 0.5;
            barrelGroup.add(bMesh, stripeMesh);
            barrelGroup.position.set(x, 0, z);
            mapGroup.add(barrelGroup);
            barrels.push({ mesh: barrelGroup, x, z, hp: 30 });
          } else {
            // Random pickups or enemy spawn in empty corridors
            const rand = Math.random();
            if (rand < 0.12) {
              // Spawn Enemy
              const enemyType: 'crawler' | 'mech' | 'destroyer' =
                rand < 0.05 ? 'destroyer' : rand < 0.09 ? 'mech' : 'crawler';

              const enemyMesh = createEnemyMesh(enemyType, theme.wallStripeColor);
              enemyMesh.position.set(x, 0, z);
              mapGroup.add(enemyMesh);

              enemies.push({
                id: enemyIdCounter++,
                mesh: enemyMesh,
                type: enemyType,
                x,
                z,
                hp: enemyType === 'destroyer' ? 140 : enemyType === 'mech' ? 65 : 35,
                maxHp: enemyType === 'destroyer' ? 140 : enemyType === 'mech' ? 65 : 35,
                speed: enemyType === 'crawler' ? 0.045 : 0.025,
                attackCooldown: 0,
                isDead: false,
                patrolAngle: Math.random() * Math.PI * 2
              });
            } else if (rand < 0.16) {
              // Health or Ammo pickup
              const isHealth = Math.random() > 0.5;
              const pGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
              const pMat = new THREE.MeshStandardMaterial({
                color: isHealth ? 0x10b981 : 0xf59e0b,
                emissive: isHealth ? 0x10b981 : 0xf59e0b,
                emissiveIntensity: 0.5
              });
              const pMesh = new THREE.Mesh(pGeo, pMat);
              pMesh.position.set(x, 0.6, z);
              mapGroup.add(pMesh);
              pickups.push({ mesh: pMesh, type: isHealth ? 'health' : 'ammo', x, z });
            }
          }
        }
      }

      stateRef.current.totalCores = coreCount;
      stateRef.current.coresCollected = 0;
      stateRef.current.enemiesLeft = enemies.length;
      setTotalCores(coreCount);
      setCoresCollected(0);
      setEnemiesLeft(enemies.length);
    };

    // Enemy Mesh Builder
    function createEnemyMesh(type: 'crawler' | 'mech' | 'destroyer', themeColor: string): THREE.Group {
      const g = new THREE.Group();
      if (type === 'crawler') {
        // Fast scuttler drone
        const bodyGeo = new THREE.SphereGeometry(0.38, 8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.45;
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.15), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        eye.position.set(0, 0.48, 0.32);
        g.add(body, eye);
      } else if (type === 'mech') {
        // Armed cyborg turret
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 0.5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.8;
        const canonGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
        const canon = new THREE.Mesh(canonGeo, new THREE.MeshBasicMaterial({ color: 0xf97316 }));
        canon.rotation.x = Math.PI / 2;
        canon.position.set(0.25, 0.8, 0.4);
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.1), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
        eye.position.set(0, 1.0, 0.26);
        g.add(body, canon, eye);
      } else {
        // Heavy Destroyer
        const baseGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.4, 10);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2, metalness: 0.9 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.9;
        const coreGeo = new THREE.SphereGeometry(0.35, 12, 12);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 1.2, 0);
        g.add(base, core);
      }
      return g;
    }

    // Refresh Player Mesh when character changes
    const updatePlayerMesh = () => {
      if (playerMesh) scene.remove(playerMesh);
      const charDef = CHARACTERS[stateRef.current.charId];
      playerMesh = createPlayerMesh(charDef, stateRef.current.activeWeapon);
      scene.add(playerMesh);
    };

    // Refresh 1st Person Weapon Model
    const updateFpWeapon = () => {
      while (fpWeaponGroup.children.length > 0) {
        fpWeaponGroup.remove(fpWeaponGroup.children[0]);
      }
      const model = createWeaponMesh(stateRef.current.activeWeapon);
      model.scale.set(1.4, 1.4, 1.4);
      model.position.set(0.28, -0.32, -0.6);
      fpWeaponGroup.add(model);
    };

    // Wall Explosion Burst (Particles + Glow)
    const createWallExplosion = (pos: THREE.Vector3, color: number, isHeavy: boolean) => {
      const g = new THREE.Group();

      // Core flash sphere
      const sphereGeo = new THREE.SphereGeometry(isHeavy ? 1.0 : 0.45, 12, 12);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.95
      });
      const flash = new THREE.Mesh(sphereGeo, sphereMat);
      flash.position.copy(pos);
      g.add(flash);

      // Particle sparks
      const particleCount = isHeavy ? 24 : 12;
      const particles: { mesh: THREE.Mesh; vx: number; vy: number; vz: number }[] = [];
      const sparkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
      const sparkMat = new THREE.MeshBasicMaterial({ color: color });

      for (let i = 0; i < particleCount; i++) {
        const p = new THREE.Mesh(sparkGeo, sparkMat);
        p.position.copy(pos);
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const speed = (Math.random() * 0.15 + 0.05) * (isHeavy ? 1.8 : 1.0);
        particles.push({
          mesh: p,
          vx: Math.cos(angle) * Math.cos(elevation) * speed,
          vy: Math.sin(elevation) * speed + 0.04,
          vz: Math.sin(angle) * Math.cos(elevation) * speed
        });
        g.add(p);
      }

      scene.add(g);
      wallExplosions.push({
        mesh: g,
        particles,
        life: 0,
        maxLife: isHeavy ? 28 : 16,
        scale: 1,
        color
      });

      // Sound & Screen Shake
      soundManager.playWallExplosion(isHeavy);
      if (isHeavy) stateRef.current.screenShake = 0.35;
    };

    // Tactical Powers scene effects
    const triggerEmpShockwave = () => {
      const s = stateRef.current;
      createWallExplosion(s.playerPos.clone().add(new THREE.Vector3(0, 1, 0)), 0x06b6d4, true);
      s.screenShake = 0.45;
      enemies.forEach((enemy) => {
        if (enemy.isDead) return;
        const dist = Math.hypot(s.playerPos.x - enemy.x, s.playerPos.z - enemy.z);
        if (dist < 10.0) {
          enemy.hp -= 70;
          enemy.attackCooldown = -120; // Stun
          createWallExplosion(new THREE.Vector3(enemy.x, 0.8, enemy.z), 0x06b6d4, false);
          if (enemy.hp <= 0) {
            enemy.isDead = true;
            mapGroup.remove(enemy.mesh);
            s.score += enemy.type === 'destroyer' ? 250 : enemy.type === 'mech' ? 120 : 60;
            setScore(s.score);
            s.enemiesLeft--;
            setEnemiesLeft(s.enemiesLeft);
            s.enemiesKilledTotal++;
            if (s.enemiesKilledTotal >= 1) s.unlockAchievement?.('first_kill');
            if (s.enemiesKilledTotal >= 5) s.unlockAchievement?.('hunter');
            if (s.enemiesKilledTotal >= 15) s.unlockAchievement?.('cyber_annihilator');
          }
        }
      });
    };

    const triggerQuantumDash = () => {
      const s = stateRef.current;
      createWallExplosion(s.playerPos.clone().add(new THREE.Vector3(0, 1, 0)), 0xa855f7, false);
      const dashDist = 6.0;
      const targetX = s.playerPos.x + Math.sin(s.playerAngle) * dashDist;
      const targetZ = s.playerPos.z + Math.cos(s.playerAngle) * dashDist;
      if (!isWallCollision(targetX, targetZ, 0.4)) {
        s.playerPos.x = targetX;
        s.playerPos.z = targetZ;
      } else {
        const midX = s.playerPos.x + Math.sin(s.playerAngle) * 3.0;
        const midZ = s.playerPos.z + Math.cos(s.playerAngle) * 3.0;
        if (!isWallCollision(midX, midZ, 0.4)) {
          s.playerPos.x = midX;
          s.playerPos.z = midZ;
        }
      }
      createWallExplosion(s.playerPos.clone().add(new THREE.Vector3(0, 1, 0)), 0xa855f7, false);
    };

    // Shoot Projectile
    const fireWeapon = () => {
      const s = stateRef.current;
      const now = performance.now();
      const weapon = WEAPONS[s.activeWeapon];

      if (s.isReloading) return;
      if (s.ammo[s.activeWeapon] <= 0) {
        triggerReload();
        return;
      }

      const isOverdrive = now < s.powerActiveUntil && s.powerId === 'hyper_overdrive';
      const effectiveFireRate = isOverdrive ? weapon.fireRate * 0.45 : weapon.fireRate;
      if (now - s.lastShotTime < effectiveFireRate) return;

      s.lastShotTime = now;
      if (!isOverdrive) {
        s.ammo[s.activeWeapon] -= 1;
        setAmmo(s.ammo[s.activeWeapon]);
      }
      s.recoil = 0.2;

      s.weaponsFiredSet.add(s.activeWeapon);
      if (s.weaponsFiredSet.size >= 4) {
        s.unlockAchievement?.('master_arsenal');
      }

      // Play Sound
      if (s.activeWeapon === 'blaster') soundManager.playBlaster();
      else if (s.activeWeapon === 'shotgun') soundManager.playShotgun();
      else if (s.activeWeapon === 'rocket') soundManager.playRocket();
      else soundManager.playRailgun();

      // Muzzle flash light
      muzzleFlashLight.color.setHex(weapon.hexColor);
      muzzleFlashLight.intensity = 3;
      muzzleFlashLight.position.copy(s.playerPos).add(new THREE.Vector3(0, 1.4, 0));
      setTimeout(() => {
        muzzleFlashLight.intensity = 0;
      }, 60);

      // Spawn Projectiles
      const pellets = weapon.pellets;
      for (let i = 0; i < pellets; i++) {
        const spreadX = (Math.random() - 0.5) * weapon.spread;
        const spreadY = (Math.random() - 0.5) * weapon.spread;

        const forward = new THREE.Vector3(
          Math.sin(s.playerAngle) + spreadX,
          -Math.sin(s.playerPitch) + spreadY,
          Math.cos(s.playerAngle) + spreadX
        ).normalize();

        const pGeo = weapon.isExplosive
          ? new THREE.SphereGeometry(0.18, 8, 8)
          : new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6);
        const pMat = new THREE.MeshBasicMaterial({ color: weapon.hexColor });
        const pMesh = new THREE.Mesh(pGeo, pMat);

        const spawnPos = s.playerPos.clone().add(new THREE.Vector3(0, 1.4, 0)).add(forward.clone().multiplyScalar(0.6));
        pMesh.position.copy(spawnPos);
        pMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forward);
        scene.add(pMesh);

        projectiles.push({
          mesh: pMesh,
          startX: spawnPos.x,
          startZ: spawnPos.z,
          vx: forward.x * (weapon.projectileSpeed / 60),
          vy: forward.y * (weapon.projectileSpeed / 60),
          vz: forward.z * (weapon.projectileSpeed / 60),
          life: 0,
          damage: weapon.damage,
          isExplosive: weapon.isExplosive,
          weaponId: s.activeWeapon,
          color: weapon.hexColor,
          fromPlayer: true
        });
      }
    };

    // Collision Detection Helper
    const isWallCollision = (x: number, z: number, radius = 0.4) => {
      const layout = MAP_LAYOUTS[stateRef.current.mapId];
      const checkPoints = [
        [x - radius, z - radius],
        [x + radius, z - radius],
        [x - radius, z + radius],
        [x + radius, z + radius]
      ];

      for (const [cx, cz] of checkPoints) {
        const col = Math.floor(cx / 2.5);
        const row = Math.floor(cz / 2.5);
        if (row < 0 || row >= layout.length || col < 0 || col >= layout[0].length) return true;
        if (layout[row][col] === 1) return true;
      }
      return false;
    };

    // Initialize Level
    stateRef.current.buildLevel = buildLevel;
    stateRef.current.updatePlayerMesh = updatePlayerMesh;
    stateRef.current.updateFpWeapon = updateFpWeapon;
    stateRef.current.fireWeapon = fireWeapon;
    stateRef.current.unlockAchievement = unlockAchievement;
    stateRef.current.triggerEmpShockwave = triggerEmpShockwave;
    stateRef.current.triggerQuantumDash = triggerQuantumDash;
    stateRef.current.activatePower = activatePower;

    buildLevel(stateRef.current.mapId);
    updatePlayerMesh();
    updateFpWeapon();

    // Input Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code in s.keys) {
        (s.keys as any)[e.code] = true;
      }
      if (e.code === 'KeyV' || e.code === 'KeyC') toggleViewMode();
      if (e.code === 'KeyR') triggerReload();
      if (e.code === 'KeyQ') activatePower();
      if (e.code === 'Escape') returnToLobby();
      if (e.code === 'Digit1') switchWeapon('blaster');
      if (e.code === 'Digit2') switchWeapon('shotgun');
      if (e.code === 'Digit3') switchWeapon('rocket');
      if (e.code === 'Digit4') switchWeapon('railgun');
      if (e.code === 'Space') fireWeapon();
      if (e.code === 'KeyP') setShowCharModal((v) => !v);
      if (e.code === 'KeyM') setShowMapModal((v) => !v);
      if (e.code === 'KeyT') setShowAchievementsModal((v) => !v);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code in s.keys) {
        (s.keys as any)[e.code] = false;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) fireWeapon();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current) return;
      const s = stateRef.current;
      s.playerAngle -= e.movementX * 0.0028;
      s.playerPitch -= e.movementY * 0.0028;
      s.playerPitch = Math.max(-1.1, Math.min(1.1, s.playerPitch));
    };

    const onWheel = (e: WheelEvent) => {
      const weaponList: WeaponId[] = ['blaster', 'shotgun', 'rocket', 'railgun'];
      const currentIndex = weaponList.indexOf(stateRef.current.activeWeapon);
      const nextIndex = e.deltaY > 0 ? (currentIndex + 1) % 4 : (currentIndex + 3) % 4;
      switchWeapon(weaponList[nextIndex]);
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('click', () => {
      canvasEl.requestPointerLock?.();
    });

    const onPointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === canvasEl;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onWheel);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Main Game Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const s = stateRef.current;
      const charDef = CHARACTERS[s.charId];

      // 1. Player Movement & Rotation
      const keys = s.keys;
      const moveSpeed = charDef.speed;

      // Rotation from Arrow Keys
      if (keys.ArrowLeft) s.playerAngle += 0.045;
      if (keys.ArrowRight) s.playerAngle -= 0.045;

      // Forward/Backward & Strafe
      let dx = 0;
      let dz = 0;

      if (keys.ArrowUp || keys.KeyW) {
        dx += Math.sin(s.playerAngle) * moveSpeed;
        dz += Math.cos(s.playerAngle) * moveSpeed;
      }
      if (keys.ArrowDown || keys.KeyS) {
        dx -= Math.sin(s.playerAngle) * moveSpeed * 0.75;
        dz -= Math.cos(s.playerAngle) * moveSpeed * 0.75;
      }
      if (keys.KeyA) {
        dx += Math.sin(s.playerAngle + Math.PI / 2) * moveSpeed * 0.8;
        dz += Math.cos(s.playerAngle + Math.PI / 2) * moveSpeed * 0.8;
      }
      if (keys.KeyD) {
        dx -= Math.sin(s.playerAngle + Math.PI / 2) * moveSpeed * 0.8;
        dz -= Math.cos(s.playerAngle + Math.PI / 2) * moveSpeed * 0.8;
      }

      // Wall collision check for player
      const nextX = s.playerPos.x + dx;
      const nextZ = s.playerPos.z + dz;

      if (!isWallCollision(nextX, s.playerPos.z, 0.45)) s.playerPos.x = nextX;
      if (!isWallCollision(s.playerPos.x, nextZ, 0.45)) s.playerPos.z = nextZ;

      // Walk cycle animation
      const isMoving = Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001;
      if (isMoving) s.walkCycle += 0.2;

      // Recoil & screen shake decay
      if (s.recoil > 0) s.recoil *= 0.85;
      if (s.screenShake > 0) s.screenShake *= 0.88;

      // 2. Camera Positioning (1st vs 3rd Person)
      const shakeOffset = new THREE.Vector3(
        (Math.random() - 0.5) * s.screenShake,
        (Math.random() - 0.5) * s.screenShake,
        (Math.random() - 0.5) * s.screenShake
      );

      if (s.viewMode === 'first') {
        // First Person: Camera placed at player's eyes
        camera.position.set(s.playerPos.x, 1.6 + Math.sin(s.walkCycle) * 0.04, s.playerPos.z).add(shakeOffset);
        const lookTarget = new THREE.Vector3(
          camera.position.x + Math.sin(s.playerAngle),
          camera.position.y - Math.sin(s.playerPitch),
          camera.position.z + Math.cos(s.playerAngle)
        );
        camera.lookAt(lookTarget);

        // Hide 3D character mesh in 1st person
        if (playerMesh) playerMesh.visible = false;

        // Position 1st Person Weapon viewmodel relative to camera
        fpWeaponGroup.visible = true;
        fpWeaponGroup.position.copy(camera.position);
        fpWeaponGroup.quaternion.copy(camera.quaternion);
        fpWeaponGroup.position.add(new THREE.Vector3(0, -s.recoil * 0.1, s.recoil * 0.2));
      } else {
        // Third Person: Camera behind player looking forward
        if (playerMesh) {
          playerMesh.visible = true;
          playerMesh.position.copy(s.playerPos);
          playerMesh.rotation.y = s.playerAngle;

          // Leg running animation
          if (playerMesh.leftLeg && playerMesh.rightLeg) {
            playerMesh.leftLeg.rotation.x = isMoving ? Math.sin(s.walkCycle) * 0.6 : 0;
            playerMesh.rightLeg.rotation.x = isMoving ? -Math.sin(s.walkCycle) * 0.6 : 0;
          }
        }

        fpWeaponGroup.visible = false;

        const camDist = 3.2;
        const camHeight = 2.2;
        const camX = s.playerPos.x - Math.sin(s.playerAngle) * camDist;
        const camZ = s.playerPos.z - Math.cos(s.playerAngle) * camDist;

        camera.position.set(camX, camHeight, camZ).add(shakeOffset);
        camera.lookAt(s.playerPos.x, 1.4, s.playerPos.z);
      }

      // 3. Projectiles Loop & Wall Collisions
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.mesh.position.x += p.vx;
        p.mesh.position.y += p.vy;
        p.mesh.position.z += p.vz;
        p.life++;

        let hit = false;

        // Check Wall Collision -> EXPLODE!
        if (isWallCollision(p.mesh.position.x, p.mesh.position.z, 0.2) || p.mesh.position.y <= 0 || p.mesh.position.y >= 3.4) {
          createWallExplosion(p.mesh.position, p.color, p.isExplosive);
          hit = true;
        }

        // Check Barrels Collision -> DETONATE BARREL
        if (!hit) {
          for (let bIndex = barrels.length - 1; bIndex >= 0; bIndex--) {
            const b = barrels[bIndex];
            const dist = Math.hypot(b.x - p.mesh.position.x, b.z - p.mesh.position.z);
            if (dist < 0.8) {
              b.hp -= p.damage;
              hit = true;
              createWallExplosion(p.mesh.position, 0xf97316, false);
              if (b.hp <= 0) {
                // Massive chain explosion
                createWallExplosion(new THREE.Vector3(b.x, 0.8, b.z), 0xef4444, true);
                mapGroup.remove(b.mesh);
                barrels.splice(bIndex, 1);
                // Damage surrounding enemies
                enemies.forEach((enemy) => {
                  if (!enemy.isDead && Math.hypot(enemy.x - b.x, enemy.z - b.z) < 4.0) {
                    enemy.hp -= 100;
                    if (enemy.hp <= 0) {
                      enemy.isDead = true;
                      mapGroup.remove(enemy.mesh);
                      s.score += enemy.type === 'destroyer' ? 250 : enemy.type === 'mech' ? 120 : 60;
                      setScore(s.score);
                      s.enemiesLeft--;
                      setEnemiesLeft(s.enemiesLeft);
                      s.enemiesKilledTotal++;
                      s.unlockAchievement?.('explosive_fury');
                      if (s.enemiesKilledTotal >= 1) s.unlockAchievement?.('first_kill');
                      if (s.enemiesKilledTotal >= 5) s.unlockAchievement?.('hunter');
                      if (s.enemiesKilledTotal >= 15) s.unlockAchievement?.('cyber_annihilator');
                    }
                  }
                });
              }
              break;
            }
          }
        }

        // Check Enemy Collisions
        if (!hit && p.fromPlayer) {
          for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dist = Math.hypot(enemy.x - p.mesh.position.x, enemy.z - p.mesh.position.z);
            if (dist < 0.9) {
              enemy.hp -= p.damage;
              hit = true;
              createWallExplosion(p.mesh.position, p.color, p.isExplosive);
              soundManager.playEnemyHit();

              if (enemy.hp <= 0) {
                enemy.isDead = true;
                mapGroup.remove(enemy.mesh);
                s.score += enemy.type === 'destroyer' ? 250 : enemy.type === 'mech' ? 120 : 60;
                setScore(s.score);
                s.enemiesLeft--;
                setEnemiesLeft(s.enemiesLeft);
                s.enemiesKilledTotal++;
                if (s.enemiesKilledTotal >= 1) s.unlockAchievement?.('first_kill');
                if (s.enemiesKilledTotal >= 5) s.unlockAchievement?.('hunter');
                if (s.enemiesKilledTotal >= 15) s.unlockAchievement?.('cyber_annihilator');
              }
              break;
            }
          }
        }

        // Check Player Collision from Enemy Projectiles
        if (!hit && !p.fromPlayer) {
          const dist = Math.hypot(s.playerPos.x - p.mesh.position.x, s.playerPos.z - p.mesh.position.z);
          if (dist < 0.85) {
            hit = true;
            createWallExplosion(p.mesh.position, 0xef4444, false);
            const now = performance.now();
            const isShieldImmune = now < s.powerActiveUntil && s.powerId === 'kinetic_shield';
            if (!isShieldImmune) {
              soundManager.playPlayerHurt();
              s.damageTakenInCurrentMap += p.damage;
              if (s.shield > 0) s.shield = Math.max(0, s.shield - p.damage);
              else s.hp = Math.max(0, s.hp - p.damage);
              setShield(s.shield);
              setHp(s.hp);
              s.screenShake = 0.25;
            } else {
              createWallExplosion(s.playerPos.clone().add(new THREE.Vector3(0, 1, 0)), 0x10b981, false);
            }
          }
        }

        // Projectile expiration or hit
        if (hit || p.life > 120) {
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
        }
      }

      // 4. Wall Explosions Animation (Expanding, particle flight, fading)
      for (let i = wallExplosions.length - 1; i >= 0; i--) {
        const exp = wallExplosions[i];
        exp.life++;
        const progress = exp.life / exp.maxLife;

        // Animate particles
        if (exp.particles) {
          exp.particles.forEach((pt) => {
            pt.mesh.position.x += pt.vx;
            pt.mesh.position.y += pt.vy;
            pt.mesh.position.z += pt.vz;
            pt.vy -= 0.003; // gravity
          });
        }

        exp.mesh.scale.setScalar(1 + progress * 1.5);
        if (exp.life >= exp.maxLife) {
          scene.remove(exp.mesh);
          wallExplosions.splice(i, 1);
        }
      }

      // 5. Enemies AI Loop
      enemies.forEach((enemy) => {
        if (enemy.isDead) return;

        const distToPlayer = Math.hypot(s.playerPos.x - enemy.x, s.playerPos.z - enemy.z);

        if (distToPlayer < 12.0) {
          // Pursue player
          const angle = Math.atan2(s.playerPos.x - enemy.x, s.playerPos.z - enemy.z);
          enemy.mesh.rotation.y = angle;

          if (distToPlayer > 1.2) {
            const ex = enemy.x + Math.sin(angle) * enemy.speed;
            const ez = enemy.z + Math.cos(angle) * enemy.speed;
            if (!isWallCollision(ex, ez, 0.4)) {
              enemy.x = ex;
              enemy.z = ez;
              enemy.mesh.position.set(ex, 0, ez);
            }
          }

          // Enemy attack logic
          enemy.attackCooldown++;
          if (enemy.type === 'crawler' && distToPlayer < 1.3 && enemy.attackCooldown > 45) {
            enemy.attackCooldown = 0;
            // Melee damage to player
            const now = performance.now();
            const isShieldImmune = now < s.powerActiveUntil && s.powerId === 'kinetic_shield';
            if (!isShieldImmune) {
              soundManager.playPlayerHurt();
              s.damageTakenInCurrentMap += 15;
              if (s.shield > 0) s.shield = Math.max(0, s.shield - 15);
              else s.hp = Math.max(0, s.hp - 15);
              setShield(s.shield);
              setHp(s.hp);
              s.screenShake = 0.25;
            } else {
              createWallExplosion(s.playerPos.clone().add(new THREE.Vector3(0, 1, 0)), 0x10b981, false);
            }
          } else if ((enemy.type === 'mech' || enemy.type === 'destroyer') && distToPlayer < 8.0 && enemy.attackCooldown > 75) {
            enemy.attackCooldown = 0;
            // Ranged energy bolt towards player
            const forward = new THREE.Vector3(
              (s.playerPos.x - enemy.x) / distToPlayer,
              0,
              (s.playerPos.z - enemy.z) / distToPlayer
            );
            const boltGeo = new THREE.SphereGeometry(0.14, 6, 6);
            const boltMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const boltMesh = new THREE.Mesh(boltGeo, boltMat);
            boltMesh.position.set(enemy.x, 1.0, enemy.z);
            scene.add(boltMesh);

            projectiles.push({
              mesh: boltMesh,
              startX: enemy.x,
              startZ: enemy.z,
              vx: forward.x * 0.22,
              vy: 0,
              vz: forward.z * 0.22,
              life: 0,
              damage: 18,
              isExplosive: false,
              weaponId: 'blaster',
              color: 0xef4444,
              fromPlayer: false
            });
          }
        }
      });

      // 6. Check Pickups Collision
      for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.mesh.rotation.y += 0.03;
        const dist = Math.hypot(s.playerPos.x - p.x, s.playerPos.z - p.z);
        if (dist < 1.2) {
          soundManager.playPickup();
          if (p.type === 'core') {
            s.coresCollected++;
            setCoresCollected(s.coresCollected);
            s.score += 200;
            setScore(s.score);
            if (s.coresCollected >= s.totalCores) {
              setIsVictory(true);
              s.unlockAchievement?.('quantum_gatherer');
              s.unlockAchievement?.('sector_champion');
              if (s.damageTakenInCurrentMap === 0) {
                s.unlockAchievement?.('flawless_sector');
              }
            }
          } else if (p.type === 'health') {
            s.hp = Math.min(s.maxHp, s.hp + 35);
            setHp(s.hp);
          } else if (p.type === 'ammo') {
            s.ammo[s.activeWeapon] = WEAPONS[s.activeWeapon].magSize;
            setAmmo(s.ammo[s.activeWeapon]);
          }
          mapGroup.remove(p.mesh);
          pickups.splice(i, 1);
        }
      }

      // 7. Check Game Over
      if (s.hp <= 0 && !isGameOver) {
        setIsGameOver(true);
        s.isPlaying = false;
      }

      // Update Tactical Power Timers
      const currentPowerDef = POWERS[s.powerId];
      const nowTime = performance.now();
      setPowerIsActive(nowTime < s.powerActiveUntil);
      if (nowTime < s.powerCooldownUntil) {
        const remaining = s.powerCooldownUntil - nowTime;
        setPowerCooldownPercent(Math.min(100, (remaining / currentPowerDef.cooldown) * 100));
      } else {
        setPowerCooldownPercent(0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const activeWeaponDef = WEAPONS[activeWeapon];
  const activeCharDef = CHARACTERS[selectedChar];
  const activeMapTheme = MAP_THEMES[selectedMap];

  return (
    <div className="relative w-full h-full bg-slate-950 font-sans select-none overflow-hidden" ref={containerRef}>
      {/* 1. HUD TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-base font-black tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              CYBERSTRIKE 3D
            </h1>
            <span className="text-xs text-slate-400 font-mono tracking-tight">{activeMapTheme.sector}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2.5 py-1 bg-slate-900/80 border border-slate-700/60 rounded">
            <span className="text-xs text-slate-400">Puntaje:</span>
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">{score}</span>
          </div>
        </div>

        {/* Center Mission Objective */}
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded backdrop-blur-sm">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-200">
            Núcleos: <strong className="text-cyan-400 tabular-nums">{coresCollected}</strong> / {totalCores}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-medium text-slate-300">
            Hostiles: <strong className="text-red-400 tabular-nums">{enemiesLeft}</strong>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Return to Lobby Button */}
          <button
            onClick={returnToLobby}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-cyan-300 hover:text-white transition-colors"
            title="Volver a la Sala de Operaciones / Lobby [Esc]"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Lobby [Esc]</span>
          </button>

          {/* 1st / 3rd Person Toggle */}
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 hover:text-white transition-colors"
            title="Alternar Cámara [V]"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{viewMode === 'first' ? '1ª Persona' : '3ª Persona'} [V]</span>
          </button>

          {/* Character Selector */}
          <button
            onClick={() => setShowCharModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 hover:text-white transition-colors"
            title="Cambiar Personaje [P]"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{activeCharDef.name.split(' ')[0]}</span>
          </button>

          {/* Map Selector */}
          <button
            onClick={() => setShowMapModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 hover:text-white transition-colors"
            title="Cambiar Mapa [M]"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Mapas</span>
          </button>

          {/* Achievements Button */}
          <button
            onClick={() => setShowAchievementsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 hover:text-white transition-colors"
            title="Ver Logros [T]"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Logros</span>
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] rounded font-bold">
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Silenciar' : 'Activar Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* ON-SCREEN ACHIEVEMENT NOTIFICATION TOAST */}
      {activeToast && (
        <div
          onClick={() => setShowAchievementsModal(true)}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto cursor-pointer max-w-md w-[92%] sm:w-auto bg-slate-900/95 border-2 border-amber-400/90 shadow-2xl shadow-amber-500/30 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 hover:scale-105 animate-bounce-short"
        >
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {activeToast.icon}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                ¡LOGRO DESBLOQUEADO!
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <h3 className="text-sm font-bold text-white leading-tight">{activeToast.title}</h3>
            <p className="text-xs text-slate-300 leading-tight mt-0.5">{activeToast.description}</p>
          </div>
        </div>
      )}

      {/* 2. HUD BOTTOM BAR (Health, Shield, Weapons, Ammo) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-wrap items-end justify-between p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-auto">
        {/* Health & Shield */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 w-36 sm:w-44">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Heart className="w-3.5 h-3.5 fill-emerald-500/20" /> SALUD
              </span>
              <span className="font-mono text-emerald-300 font-bold tabular-nums">{hp}</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-1">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Shield className="w-3.5 h-3.5 fill-cyan-500/20" /> ESCUDO
              </span>
              <span className="font-mono text-cyan-300 font-bold tabular-nums">{shield}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, (shield / 50) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weapon Selector Bar */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-lg border border-slate-800 backdrop-blur-md">
          {(Object.keys(WEAPONS) as WeaponId[]).map((wId, idx) => {
            const w = WEAPONS[wId];
            const isCurrent = activeWeapon === wId;
            return (
              <button
                key={wId}
                onClick={() => switchWeapon(wId)}
                className={`relative px-3 py-2 rounded flex flex-col items-center gap-1 transition-all ${
                  isCurrent
                    ? 'bg-slate-800 border border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500">[{idx + 1}]</span>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{w.name.split(' ')[0]}</span>
                </div>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: w.color, boxShadow: isCurrent ? `0 0 8px ${w.color}` : 'none' }}
                />
              </button>
            );
          })}
        </div>

        {/* Ammo & Reload Display */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">{activeWeaponDef.name}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-mono tracking-tight text-white tabular-nums">
                {isReloading ? '--' : ammo}
              </span>
              <span className="text-sm font-mono text-slate-500 tabular-nums">/ {activeWeaponDef.magSize}</span>
            </div>
          </div>

          <button
            onClick={triggerReload}
            disabled={isReloading}
            className={`px-3 py-2 rounded flex items-center gap-1.5 text-xs font-bold transition-all ${
              isReloading
                ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
            }`}
            title="Recargar Arma [R]"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
            <span>{isReloading ? 'Recargando' : 'Recargar [R]'}</span>
          </button>
        </div>
      </div>

      {/* ON-SCREEN MOVEMENT CONTROLS (D-PAD & FIRE BUTTON) */}
      <div className="absolute bottom-24 left-4 z-20 pointer-events-auto flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
        <button
          onPointerDown={() => { stateRef.current.keys.ArrowUp = true; }}
          onPointerUp={() => { stateRef.current.keys.ArrowUp = false; }}
          onPointerLeave={() => { stateRef.current.keys.ArrowUp = false; }}
          className="w-11 h-11 bg-slate-900/90 active:bg-cyan-600 border border-slate-700 active:border-cyan-400 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg select-none"
          title="Avanzar [↑]"
        >
          ▲
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={() => { stateRef.current.keys.ArrowLeft = true; }}
            onPointerUp={() => { stateRef.current.keys.ArrowLeft = false; }}
            onPointerLeave={() => { stateRef.current.keys.ArrowLeft = false; }}
            className="w-11 h-11 bg-slate-900/90 active:bg-cyan-600 border border-slate-700 active:border-cyan-400 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg select-none"
            title="Girar Izquierda [←]"
          >
            ◀
          </button>
          <button
            onPointerDown={() => { stateRef.current.keys.ArrowDown = true; }}
            onPointerUp={() => { stateRef.current.keys.ArrowDown = false; }}
            onPointerLeave={() => { stateRef.current.keys.ArrowDown = false; }}
            className="w-11 h-11 bg-slate-900/90 active:bg-cyan-600 border border-slate-700 active:border-cyan-400 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg select-none"
            title="Retroceder [↓]"
          >
            ▼
          </button>
          <button
            onPointerDown={() => { stateRef.current.keys.ArrowRight = true; }}
            onPointerUp={() => { stateRef.current.keys.ArrowRight = false; }}
            onPointerLeave={() => { stateRef.current.keys.ArrowRight = false; }}
            className="w-11 h-11 bg-slate-900/90 active:bg-cyan-600 border border-slate-700 active:border-cyan-400 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg select-none"
            title="Girar Derecha [→]"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="absolute bottom-24 right-4 z-20 pointer-events-auto flex flex-col items-end gap-2.5">
        {/* Tactical Power Button */}
        <button
          onClick={activatePower}
          disabled={powerCooldownPercent > 0}
          className={`relative px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all select-none overflow-hidden ${
            powerIsActive
              ? 'bg-amber-500 text-black border-amber-300 ring-2 ring-amber-400 font-black shadow-lg shadow-amber-500/40 animate-pulse'
              : powerCooldownPercent > 0
              ? 'bg-slate-900/80 text-slate-400 border-slate-800 opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 text-white border-amber-500/60 shadow-lg shadow-amber-500/20 active:scale-95'
          }`}
          title="Activar Poder Táctico [Q]"
        >
          {powerCooldownPercent > 0 && (
            <div
              className="absolute inset-0 bg-slate-950/80 transition-all pointer-events-none"
              style={{ width: `${powerCooldownPercent}%` }}
            />
          )}
          <span className="text-xl relative z-10">{POWERS[selectedPower].icon}</span>
          <div className="flex flex-col items-start relative z-10">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300">
              [Q] {powerIsActive ? 'SOBRECARGA ACTIVA' : powerCooldownPercent > 0 ? `RECARGANDO (${((powerCooldownPercent * POWERS[selectedPower].cooldown) / 100000).toFixed(0)}s)` : 'PODER LISTO'}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[140px]">
              {POWERS[selectedPower].name}
            </span>
          </div>
        </button>

        <button
          onPointerDown={() => { stateRef.current.fireWeapon?.(); }}
          className="px-5 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 active:scale-95 text-white font-black text-sm tracking-wider uppercase rounded-xl border border-red-400 shadow-xl shadow-red-600/30 flex items-center gap-2 select-none"
          title="Disparar [Espacio o Clic]"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>DISPARAR</span>
        </button>
      </div>

      {/* 3. CENTER RETICLE / CROSSHAIR (Only in 1st Person) */}
      {viewMode === 'first' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            <div className="absolute top-0 w-0.5 h-2 bg-cyan-400/80" />
            <div className="absolute bottom-0 w-0.5 h-2 bg-cyan-400/80" />
            <div className="absolute left-0 w-2 h-0.5 bg-cyan-400/80" />
            <div className="absolute right-0 w-2 h-0.5 bg-cyan-400/80" />
          </div>
        </div>
      )}

      {/* 4. CHARACTER SELECTOR MODAL */}
      {showCharModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> SELECCIONAR PERSONAJE
              </h2>
              <button onClick={() => setShowCharModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(CHARACTERS) as CharacterId[]).map((cId) => {
                const char = CHARACTERS[cId];
                const isSelected = selectedChar === cId;
                return (
                  <button
                    key={cId}
                    onClick={() => selectCharacter(cId)}
                    className={`p-3.5 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{char.portrait}</span>
                        {char.name}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wide">{char.role}</span>
                    </div>
                    <p className="text-xs text-slate-400">{char.bonus}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                      <span>HP: {char.maxHp}</span>
                      <span>·</span>
                      <span>Velocidad: {(char.speed * 1000).toFixed(0)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. MAP SELECTOR MODAL */}
      {showMapModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> SELECCIONAR MAPA / SECTOR
              </h2>
              <button onClick={() => setShowMapModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(MAP_THEMES) as unknown as MapId[]).map((mId) => {
                const theme = MAP_THEMES[mId];
                const isSelected = selectedMap === Number(mId);
                return (
                  <button
                    key={mId}
                    onClick={() => selectMap(Number(mId) as MapId)}
                    className={`p-3.5 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{theme.name}</span>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.wallStripeColor }} />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{theme.sector}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS MODAL */}
      {showAchievementsModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[88vh] bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-wide uppercase">SISTEMA DE LOGROS</h2>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                  {achievements.filter((a) => a.unlocked).length} de {achievements.length} Desbloqueados
                </span>
              </div>
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 max-h-[62vh]">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-lg border flex items-start gap-3 transition-all ${
                    ach.unlocked
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center text-2xl shrink-0 ${
                      ach.unlocked
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-inner'
                        : 'bg-slate-800 border border-slate-700 text-slate-500'
                    }`}
                  >
                    {ach.unlocked ? ach.icon : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-bold truncate ${ach.unlocked ? 'text-amber-200' : 'text-slate-400'}`}>
                        {ach.title}
                      </h4>
                      {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight mt-1">{ach.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {ach.category}
                      </span>
                      {ach.unlocked && (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          ★ Completado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. GAME OVER OR VICTORY MODAL */}
      {(isGameOver || isVictory) && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isVictory ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isVictory ? <Award className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
            </div>

            <h2 className="text-2xl font-black tracking-wide text-white uppercase">
              {isVictory ? '¡SECTOR ASIGNADO Y COMPLETADO!' : '¡MISIÓN FALLIDA!'}
            </h2>

            <p className="text-sm text-slate-300">
              {isVictory
                ? 'Has recuperado todos los Núcleos Cuánticos y asegurado el sector. ¡Excelente disparo operativo!'
                : 'Tu blindaje se ha agotado. Reagrupa al escuadrón y vuelve a intentarlo.'}
            </p>

            <div className="flex items-center gap-6 py-2 text-xs font-mono text-slate-400">
              <div>
                Puntaje: <strong className="text-white text-sm">{score}</strong>
              </div>
              <div>
                Núcleos: <strong className="text-cyan-400 text-sm">{coresCollected}</strong> / {totalCores}
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setIsGameOver(false);
                  setIsVictory(false);
                  returnToLobby();
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>Lobby</span>
              </button>
              <button
                onClick={() => {
                  if (isVictory) {
                    // Progress to next map
                    const nextMap = ((selectedMap + 1) % 4) as MapId;
                    selectMap(nextMap);
                  } else {
                    restartGame();
                  }
                }}
                className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isVictory ? 'Siguiente Sector' : 'Reintentar Misión'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRE-GAME LOBBY SCREEN (SALA DE OPERACIONES) */}
      {isInLobby && (
        <div className="absolute inset-0 z-50">
          <CyberLobby
            selectedChar={selectedChar}
            selectedPower={selectedPower}
            selectedMap={selectedMap}
            onSelectChar={(cId) => selectCharacter(cId)}
            onSelectPower={(pId) => {
              setSelectedPower(pId);
              stateRef.current.powerId = pId;
            }}
            onSelectMap={(mId) => {
              setSelectedMap(mId);
              stateRef.current.mapId = mId;
            }}
            onLaunchGame={launchFromLobby}
            onOpenAchievements={() => setShowAchievementsModal(true)}
          />
        </div>
      )}
    </div>
  );
}
