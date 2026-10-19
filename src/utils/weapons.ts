import { WeaponDef, WeaponId } from '../types/game.ts';

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  blaster: {
    id: 'blaster',
    name: 'Bláster de Plasma',
    damage: 26,
    fireRate: 180,
    magSize: 18,
    reloadTime: 1100,
    color: '#06b6d4',
    hexColor: 0x06b6d4,
    projectileSpeed: 30,
    isExplosive: false,
    spread: 0.015,
    pellets: 1,
    iconName: 'Zap'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Escopeta de Dispersión',
    damage: 16,
    fireRate: 650,
    magSize: 6,
    reloadTime: 1600,
    color: '#f97316',
    hexColor: 0xf97316,
    projectileSpeed: 25,
    isExplosive: false,
    spread: 0.09,
    pellets: 6,
    iconName: 'Flame'
  },
  rocket: {
    id: 'rocket',
    name: 'Lanzacohetes Pesado',
    damage: 120,
    fireRate: 950,
    magSize: 4,
    reloadTime: 2200,
    color: '#ef4444',
    hexColor: 0xef4444,
    projectileSpeed: 18,
    isExplosive: true,
    spread: 0.01,
    pellets: 1,
    iconName: 'Bomb'
  },
  railgun: {
    id: 'railgun',
    name: 'Cañón de Riel Cuántico',
    damage: 90,
    fireRate: 800,
    magSize: 5,
    reloadTime: 1900,
    color: '#a855f7',
    hexColor: 0xa855f7,
    projectileSpeed: 55,
    isExplosive: false,
    spread: 0.005,
    pellets: 1,
    iconName: 'Crosshair'
  }
};
