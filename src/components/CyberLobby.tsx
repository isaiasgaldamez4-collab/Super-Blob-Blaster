import React, { useState } from 'react';
import { Play, Shield, Zap, Flame, Wind, Crosshair, Users, Trophy, Volume2, VolumeX, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { CharacterId, PowerId, MapId } from '../types/game.ts';
import { CHARACTERS } from '../utils/characters.ts';
import { POWERS } from '../utils/powers.ts';
import { MAP_THEMES } from '../utils/mapGenerator.ts';
import { loadAchievements } from '../utils/achievements.ts';
import { soundManager } from '../utils/sound.ts';

interface CyberLobbyProps {
  selectedChar: CharacterId;
  selectedPower: PowerId;
  selectedMap: MapId;
  onSelectChar: (charId: CharacterId) => void;
  onSelectPower: (powerId: PowerId) => void;
  onSelectMap: (mapId: MapId) => void;
  onLaunchGame: () => void;
  onOpenAchievements: () => void;
}

export function CyberLobby({
  selectedChar,
  selectedPower,
  selectedMap,
  onSelectChar,
  onSelectPower,
  onSelectMap,
  onLaunchGame,
  onOpenAchievements
}: CyberLobbyProps) {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const achievements = loadAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const currentChar = CHARACTERS[selectedChar];
  const currentPower = POWERS[selectedPower];
  const currentMap = MAP_THEMES[selectedMap];

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto select-none font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950 to-black pointer-events-none" />

      {/* TOP HEADER */}
      <header className="relative z-10 w-full px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2">
              CYBERSTRIKE 3D
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SALA DE OPERACIONES
              </span>
            </h1>
            <p className="text-xs text-slate-400">Configura tu Operativo, Habilidad Táctica y Sector de Despliegue.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Achievements shortcut */}
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Logros</span>
            <span className="font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-bold text-[10px]">
              {unlockedCount}/{achievements.length}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Silenciar Audio' : 'Activar Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* MAIN LOBBY CONTAINER */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* 1. SELECCIÓN DE OPERATIVO / PERSONAJE */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              1. Selecciona tu Operativo ({CHARACTERS[selectedChar].name})
            </h2>
            <span className="text-xs text-slate-400 font-mono">4 Clases Disponibles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(CHARACTERS) as CharacterId[]).map((cId) => {
              const char = CHARACTERS[cId];
              const isSelected = selectedChar === cId;
              return (
                <button
                  key={cId}
                  onClick={() => {
                    onSelectChar(cId);
                    soundManager.playEnemyHit();
                  }}
                  className={`p-4 rounded-xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-400 ring-2 ring-cyan-400/40 shadow-xl shadow-cyan-500/10 -translate-y-0.5'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-cyan-400 flex items-center gap-1 text-[10px] font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                      <CheckCircle2 className="w-3 h-3" /> ELEGIDO
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                      {char.portrait}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{char.name}</h3>
                      <span className="text-xs font-mono text-cyan-400">{char.role}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">{char.bonus}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <span>Salud:</span>
                      <strong className="text-white">{char.maxHp} HP</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Vel:</span>
                      <strong className="text-cyan-300">{(char.speed * 1000).toFixed(0)}</strong>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. SELECCIÓN DE PODER / HABILIDAD ESPECIAL */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              2. Equipa tu Habilidad Especial (Activar en combate con Tecla [Q])
            </h2>
            <span className="text-xs text-amber-400/90 font-mono font-medium">Equipado: {currentPower.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(POWERS) as PowerId[]).map((pId) => {
              const power = POWERS[pId];
              const isSelected = selectedPower === pId;
              return (
                <button
                  key={pId}
                  onClick={() => {
                    onSelectPower(pId);
                    soundManager.playPowerActivate(pId);
                  }}
                  className={`p-4 rounded-xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900/90 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/10 -translate-y-0.5'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-amber-400 flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVO
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-slate-700/60"
                      style={{ backgroundColor: `${power.color}15`, borderColor: `${power.color}40` }}
                    >
                      {power.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{power.name}</h3>
                      <span className="text-xs font-mono" style={{ color: power.color }}>
                        Enfriamiento: {(power.cooldown / 1000).toFixed(0)}s
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">{power.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Duración: {(power.duration / 1000).toFixed(1)}s</span>
                    <span className="text-amber-400">Activar: Tecla [Q]</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. SELECCIÓN DE SECTOR / MAPA DE INSERCIÓN */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              3. Sector de Despliegue ({currentMap.name})
            </h2>
            <span className="text-xs text-slate-400 font-mono">4 Zonas Labyrinth 3D</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(MAP_THEMES) as unknown as MapId[]).map((mId) => {
              const mapTheme = MAP_THEMES[mId];
              const isSelected = selectedMap === Number(mId);
              return (
                <button
                  key={mId}
                  onClick={() => {
                    onSelectMap(Number(mId) as MapId);
                    soundManager.playEnemyHit();
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all relative ${
                    isSelected
                      ? 'bg-slate-900/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl shadow-emerald-500/10 -translate-y-0.5'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{mapTheme.name}</span>
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: mapTheme.wallStripeColor }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{mapTheme.sector}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. RESUMEN DE CARGA & BOTÓN DE DESPLIEGUE */}
        <section className="mt-2 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              ESCUADRÓN LISTO PARA DESPLIEGUE
            </span>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              <span>
                Operativo: <strong className="text-white">{currentChar.name}</strong>
              </span>
              <span>·</span>
              <span>
                Poder: <strong className="text-amber-300">{currentPower.name}</strong>
              </span>
              <span>·</span>
              <span>
                Sector: <strong className="text-emerald-300">{currentMap.name}</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Controles: Flechas o WASD para moverte · Clic o Espacio para disparar · [Q] para tu Poder · [V] para 1ª/3ª persona
            </span>
          </div>

          <button
            onClick={() => {
              soundManager.playBlaster();
              onLaunchGame();
            }}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-95 text-white font-black text-sm tracking-wider uppercase rounded-xl border border-cyan-300 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all shrink-0 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>DESPLEGAR EN EL SECTOR</span>
          </button>
        </section>
      </main>
    </div>
  );
}
