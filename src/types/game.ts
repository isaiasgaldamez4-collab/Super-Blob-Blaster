export type CameraViewMode = 'first' | 'third';

export type CharacterId = 'rex' | 'viper' | 'titan' | 'aria';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  role: string;
  color: number;
  armorColor: number;
  speed: number;
  maxHp: number;
  bonus: string;
  portrait: string;
}

export type WeaponId = 'blaster' | 'shotgun' | 'rocket' | 'railgun';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  damage: number;
  fireRate: number; // ms
  magSize: number;
  reloadTime: number; // ms
  color: string;
  hexColor: number;
  projectileSpeed: number;
  isExplosive: boolean;
  spread: number;
  pellets: number;
  iconName: string;
}

export type MapId = 0 | 1 | 2 | 3;

export interface MapTheme {
  id: MapId;
  name: string;
  sector: string;
  wallPrimaryColor: string;
  wallStripeColor: string;
  floorColor: string;
  ceilingColor: string;
  ambientLight: number;
  directionalLight: number;
  fogColor: number;
  fogDensity: number;
  skyColor: string;
}

export interface Enemy {
  id: number;
  mesh: any;
  type: 'crawler' | 'mech' | 'destroyer';
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  speed: number;
  attackCooldown: number;
  isDead: boolean;
  patrolAngle: number;
}

export interface Projectile {
  mesh: any;
  startX: number;
  startZ: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  damage: number;
  isExplosive: boolean;
  weaponId: WeaponId;
  color: number;
  fromPlayer: boolean;
}

export interface WallExplosion {
  mesh: any;
  particles?: any[];
  life: number;
  maxLife: number;
  scale: number;
  color: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: 'combat' | 'survival' | 'exploration' | 'mastery';
}

export type PowerId = 'emp_blast' | 'kinetic_shield' | 'hyper_overdrive' | 'quantum_dash';

export interface PowerDef {
  id: PowerId;
  name: string;
  description: string;
  cooldown: number; // in ms
  duration: number; // in ms
  icon: string;
  color: string;
  hexColor: number;
}


