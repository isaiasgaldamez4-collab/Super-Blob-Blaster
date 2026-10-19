import { Achievement } from '../types/game.ts';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_kill',
    title: 'Primer Contacto',
    description: 'Elimina a tu primer enemigo en combate.',
    icon: '🎯',
    unlocked: false,
    category: 'combat'
  },
  {
    id: 'hunter',
    title: 'Cazador de Hostiles',
    description: 'Elimina a 5 enemigos.',
    icon: '🏹',
    unlocked: false,
    category: 'combat'
  },
  {
    id: 'cyber_annihilator',
    title: 'Aniquilador Cyber',
    description: 'Elimina a 15 enemigos.',
    icon: '💀',
    unlocked: false,
    category: 'combat'
  },
  {
    id: 'flawless_sector',
    title: 'Intocable (Sin Daño)',
    description: 'Completa un mapa o sector sin recibir ningún daño a tu salud.',
    icon: '🛡️',
    unlocked: false,
    category: 'survival'
  },
  {
    id: 'explosive_fury',
    title: 'Furia Explosiva',
    description: 'Elimina a un enemigo detonando un barril explosivo.',
    icon: '💥',
    unlocked: false,
    category: 'combat'
  },
  {
    id: 'master_arsenal',
    title: 'Maestro del Arsenal',
    description: 'Dispara con las 4 armas distintas en una partida.',
    icon: '⚡',
    unlocked: false,
    category: 'mastery'
  },
  {
    id: 'quantum_gatherer',
    title: 'Recolector Cuántico',
    description: 'Reúne todos los Núcleos de Energía de un sector.',
    icon: '💎',
    unlocked: false,
    category: 'exploration'
  },
  {
    id: 'sector_champion',
    title: 'Dominador de Sectores',
    description: 'Completa la misión de cualquier mapa con éxito.',
    icon: '🏆',
    unlocked: false,
    category: 'mastery'
  }
];

const STORAGE_KEY = 'cyberstrike_achievements_v1';

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: Record<string, { unlocked: boolean; unlockedAt?: number }> = JSON.parse(raw);
      return INITIAL_ACHIEVEMENTS.map((ach) => ({
        ...ach,
        unlocked: saved[ach.id]?.unlocked ?? false,
        unlockedAt: saved[ach.id]?.unlockedAt
      }));
    }
  } catch (e) {
    // fallback if localStorage not available
  }
  return [...INITIAL_ACHIEVEMENTS];
}

export function saveAchievements(achievements: Achievement[]) {
  try {
    const data: Record<string, { unlocked: boolean; unlockedAt?: number }> = {};
    achievements.forEach((a) => {
      if (a.unlocked) {
        data[a.id] = { unlocked: true, unlockedAt: a.unlockedAt };
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // fallback
  }
}
