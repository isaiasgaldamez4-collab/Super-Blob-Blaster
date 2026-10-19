import { PowerDef, PowerId } from '../types/game.ts';

export const POWERS: Record<PowerId, PowerDef> = {
  emp_blast: {
    id: 'emp_blast',
    name: 'Pulso EMP Sobrecargado',
    description: 'Desata una onda expansiva eléctrica de 10m que aturde y daña a todos los enemigos cercanos.',
    cooldown: 14000,
    duration: 3500,
    icon: '⚡',
    color: '#06b6d4',
    hexColor: 0x06b6d4
  },
  kinetic_shield: {
    id: 'kinetic_shield',
    name: 'Burbuja de Hiper-Escudo',
    description: 'Genera una barrera impenetrable de energía que absorbe el 100% del daño y recarga escudos.',
    cooldown: 18000,
    duration: 5000,
    icon: '🛡️',
    color: '#10b981',
    hexColor: 0x10b981
  },
  hyper_overdrive: {
    id: 'hyper_overdrive',
    name: 'Sobrecarga de Fuego (Overdrive)',
    description: 'Duplica la cadencia de disparo y otorga munición infinita sin necesidad de recargar.',
    cooldown: 16000,
    duration: 6000,
    icon: '🔥',
    color: '#f97316',
    hexColor: 0xf97316
  },
  quantum_dash: {
    id: 'quantum_dash',
    name: 'Salto Cuántico (Blink)',
    description: 'Te teletransporta instantáneamente 6 metros hacia adelante atravesando el fuego enemigo.',
    cooldown: 8000,
    duration: 800,
    icon: '🌀',
    color: '#a855f7',
    hexColor: 0xa855f7
  }
};
