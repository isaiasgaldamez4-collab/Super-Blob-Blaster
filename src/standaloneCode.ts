/**
 * Código fuente completo del archivo index.html para Super Blob Blaster 3D (Clon exacto de Emupedia).
 * - Muerte de 1 solo tiro para todos los blobs.
 * - Dos armas disponibles: [1] Lanzagranadas clásico y [2] Rifle Láser Rápido de doble cañón (tecla Q o 1/2).
 * - Control completo con Flechitas (↑ Avanzar, ↓ Retroceder, ←/→ Girar) y disparo con Espacio o Clic.
 * - Recarga con la tecla [R].
 * - Laberinto gigante 24x24 con radar minimapa.
 */
export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Super Blob Blaster 3D - Clon Emupedia (2 Armas & 1-Hit Kill)</title>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background-color: #000; font-family: -apple-system, sans-serif; }
    #game-wrapper { position: relative; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; }
    #render-canvas { width: 100%; height: 100%; display: block; }

    #title-screen {
      position: absolute; inset: 0; background-color: #294a73;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 50; cursor: pointer; text-align: center; p: 20px;
    }
    .title-super {
      font-family: 'Georgia', cursive, serif; font-style: italic; font-size: clamp(32px, 5vw, 54px);
      color: #0b1523; margin-bottom: -15px; letter-spacing: 2px;
    }
    .title-blob-blaster {
      font-family: 'Impact', 'Arial Black', sans-serif; font-size: clamp(52px, 8.5vw, 98px);
      color: #ffffff; text-transform: uppercase; letter-spacing: 2px;
      -webkit-text-stroke: 4px #000000;
      text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000, 6px 6px 0 rgba(0,0,0,0.6);
    }
    .title-click {
      margin-top: 40px; font-size: clamp(18px, 3vw, 28px); font-weight: 700; color: #607b9e;
      letter-spacing: 1.5px; animation: pulse 1.6s infinite ease-in-out;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }

    #hud { position: absolute; inset: 0; pointer-events: none; z-index: 20; display: none; }
    .hud-kills {
      position: absolute; top: 24px; left: 32px;
      font-family: 'Arial Black', Impact, sans-serif; font-size: 38px; color: #ffffff;
      -webkit-text-stroke: 2px #000; text-shadow: 3px 3px 0 #000; font-weight: 900;
    }
    .hud-weapon-select {
      position: absolute; top: 24px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 8px; background: rgba(5,10,20,0.85); padding: 6px 12px;
      border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); pointer-events: auto;
    }
    .btn-wpn {
      background: #1e293b; color: #fff; border: 1px solid #475569; padding: 6px 12px;
      border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer;
    }
    .btn-wpn.active-grenade { background: #f59e0b; color: #000; border-color: #fbbf24; }
    .btn-wpn.active-laser { background: #38bdf8; color: #000; border-color: #7dd3fc; }

    .hud-bottom-bar {
      position: absolute; bottom: 24px; left: 36px; display: flex; align-items: center; gap: 45px;
    }
    .hud-health {
      display: flex; align-items: center; gap: 12px; font-family: 'Arial Black', Impact, sans-serif;
      font-size: 42px; color: #ffffff; -webkit-text-stroke: 2px #000; text-shadow: 3px 3px 0 #000;
    }
    .hud-health .cross { color: #e11d48; font-size: 46px; -webkit-text-stroke: 2px #000; }

    .hud-ammo-box { display: flex; flex-direction: column; }
    .hud-ammo {
      display: flex; align-items: center; gap: 12px; font-family: 'Arial Black', Impact, sans-serif;
      font-size: 42px; color: #ffffff; -webkit-text-stroke: 2px #000; text-shadow: 3px 3px 0 #000;
    }
    .hud-ammo-icon {
      width: 36px; height: 36px; border-radius: 50%; background: #111; border: 2px solid #000;
      position: relative; display: flex; align-items: center; justify-content: center;
    }
    .hud-reload-btn {
      font-size: 13px; font-weight: bold; color: #f59e0b; cursor: pointer; pointer-events: auto;
    }

    #radar-container {
      position: absolute; top: 20px; right: 24px; width: 130px; height: 130px;
      border: 3px solid #38bdf8; border-radius: 50%; background: rgba(10, 15, 30, 0.8);
      overflow: hidden; pointer-events: none;
    }
    #radar-canvas { width: 100%; height: 100%; display: block; }

    #blood-splatter {
      position: absolute; top: 0; left: 0; width: 220px; height: 220px; pointer-events: none;
      z-index: 25; opacity: 0; transition: opacity 0.15s ease-out;
    }
    #damage-flash {
      position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 30%, rgba(225, 29, 72, 0.45) 100%);
      pointer-events: none; z-index: 24; opacity: 0; transition: opacity 0.1s ease-out;
    }
    #gun-viewmodel {
      position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
      width: 340px; height: 255px; pointer-events: none; z-index: 22;
    }
    #crosshair {
      position: absolute; top: 50%; left: 50%; width: 12px; height: 12px; transform: translate(-50%, -50%); pointer-events: none; z-index: 21;
    }
    #crosshair::before { content: ''; position: absolute; top: 5px; left: -10px; width: 32px; height: 2px; background: rgba(255, 255, 255, 0.85); }
    #crosshair::after { content: ''; position: absolute; top: -10px; left: 5px; width: 2px; height: 32px; background: rgba(255, 255, 255, 0.85); }
    #reload-banner {
      position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%);
      font-family: 'Arial Black', Impact, sans-serif; font-size: 26px; color: #fbbf24; text-shadow: 2px 2px 0 #000; display: none;
    }
    #gameover-screen {
      position: absolute; inset: 0; background: rgba(10, 15, 25, 0.92); display: none;
      flex-direction: column; align-items: center; justify-content: center; z-index: 60;
    }
    .gameover-title { font-family: 'Arial Black', Impact, sans-serif; font-size: 60px; color: #ef4444; margin-bottom: 20px; }
    .btn-restart {
      padding: 14px 36px; font-size: 20px; font-weight: bold; color: #000; background: #38bdf8; border: none; border-radius: 8px; cursor: pointer;
    }
  </style>
</head>
<body>

  <div id="game-wrapper">
    <canvas id="render-canvas"></canvas>

    <div id="title-screen">
      <div class="title-super">Super</div>
      <div class="title-blob-blaster">BLOB BLASTER</div>
      <div class="title-click">Click to Start</div>
      <div style="margin-top: 15px; color: #93c5fd; font-size: 14px;">
        (O presiona cualquier flechita para empezar)
      </div>
    </div>

    <div id="hud">
      <div class="hud-kills">Kills: <span id="hud-kills-val">0</span></div>

      <!-- Selector de Armas -->
      <div class="hud-weapon-select">
        <button class="btn-wpn active-grenade" id="btn-wpn-1">[1] Granadas</button>
        <button class="btn-wpn" id="btn-wpn-2">[2] Láser Rápido</button>
        <span style="color:#94a3b8; font-size:11px; align-self:center;">[Q]</span>
      </div>

      <div id="radar-container">
        <canvas id="radar-canvas" width="130" height="130"></canvas>
      </div>

      <div class="hud-bottom-bar">
        <div class="hud-health">
          <span id="hud-health-val">100</span>
          <span class="cross">+</span>
        </div>
        <div class="hud-ammo-box">
          <div class="hud-ammo">
            <span id="hud-ammo-val">16</span>
            <div class="hud-ammo-icon" id="hud-ammo-icon">💥</div>
          </div>
          <span class="hud-reload-btn" id="btn-reload-action">[R] Recargar</span>
        </div>
      </div>

      <div id="reload-banner">RECARGANDO...</div>
      <div id="crosshair"></div>
      <canvas id="gun-viewmodel" width="320" height="240"></canvas>
      <canvas id="blood-splatter" width="220" height="220"></canvas>
      <div id="damage-flash"></div>
    </div>

    <div id="gameover-screen">
      <div class="gameover-title">¡HAS MUERTO!</div>
      <div style="color: #fff; font-size: 24px; margin-bottom: 30px;" id="gameover-stats">Kills: 0</div>
      <button class="btn-restart" id="btn-restart">REINTENTAR</button>
    </div>
  </div>

  <script>
  const AudioFX = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    shootGrenade() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(480, t); osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);
      gain.gain.setValueAtTime(0.35, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(t + 0.2);
    },
    shootLaser() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(880, t); osc.frequency.exponentialRampToValueAtTime(180, t + 0.1);
      gain.gain.setValueAtTime(0.25, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(t + 0.1);
    },
    explosion() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, t); filter.frequency.exponentialRampToValueAtTime(45, t + 0.4);
      const gain = this.ctx.createGain(); gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination); noise.start();
    },
    reload() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(220, t); osc.frequency.linearRampToValueAtTime(700, t + 0.45);
      gain.gain.setValueAtTime(0.2, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(t + 0.5);
    },
    switchWeapon() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(350, t); osc.frequency.linearRampToValueAtTime(550, t + 0.12);
      gain.gain.setValueAtTime(0.2, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(t + 0.12);
    },
    emptyClick() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(800, t); gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.05); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(t + 0.05);
    },
    blobAttack() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(180, t); osc.frequency.linearRampToValueAtTime(550, t + 0.1);
      gain.gain.setValueAtTime(0.25, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.22);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(t + 0.22);
    },
    playerHit() {
      this.init(); if (!this.ctx) return;
      const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(140, t); osc.frequency.linearRampToValueAtTime(50, t + 0.22);
      gain.gain.setValueAtTime(0.35, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.22);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(t + 0.22);
    }
  };

  function createSciFiWallTexture(hue = 'brown') {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = hue === 'brown' ? '#5a3d2e' : '#234d4d';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 250);
    ctx.fillStyle = hue === 'brown' ? '#6e4b38' : '#2f5f5f';
    ctx.fillRect(16, 24, 224, 96); ctx.fillRect(16, 136, 224, 96);
    ctx.strokeRect(16, 24, 224, 96); ctx.strokeRect(16, 136, 224, 96);
    ctx.fillStyle = hue === 'brown' ? '#ea580c' : '#38bdf8';
    ctx.fillRect(100, 56, 56, 26); ctx.strokeRect(100, 56, 56, 26);
    const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter; return tex;
  }

  function createFloorTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#3c2b22'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 250);
    ctx.fillStyle = '#1c1410'; ctx.fillRect(18, 18, 220, 220); ctx.strokeRect(18, 18, 220, 220);
    ctx.fillStyle = '#4a362b';
    for (let x = 32; x < 230; x += 18) {
      for (let y = 32; y < 230; y += 18) ctx.fillRect(x, y, 10, 10);
    }
    const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter; return tex;
  }

  function createCeilingTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#422e23'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 250);
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(128, 128, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter; return tex;
  }

  function createHornedBlobTexture() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(36, 44); ctx.quadraticCurveTo(28, 20, 34, 14); ctx.quadraticCurveTo(46, 24, 48, 44); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(92, 44); ctx.quadraticCurveTo(100, 20, 94, 14); ctx.quadraticCurveTo(82, 24, 80, 44); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.ellipse(64, 72, 44, 48, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#bfdbfe'; ctx.beginPath(); ctx.ellipse(64, 82, 32, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(48, 62, 4, 0, Math.PI * 2); ctx.arc(80, 62, 4, 0, Math.PI * 2); ctx.fill();
    const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter; return tex;
  }

  function drawWeapon(canvas, weaponType, kickback, isReloading) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 320, 240);
    const offsetY = isReloading ? 45 + Math.sin(performance.now() * 0.015) * 8 : kickback * 25;
    ctx.save(); ctx.translate(0, offsetY);

    if (weaponType === 'grenade') {
      ctx.fillStyle = '#222327'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(90, 240); ctx.lineTo(110, 160); ctx.lineTo(135, 140); ctx.lineTo(185, 140); ctx.lineTo(210, 160); ctx.lineTo(230, 240);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#31343c'; ctx.beginPath(); ctx.ellipse(160, 155, 48, 38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const glowColor = isReloading ? '#facc15' : '#f97316';
      ctx.fillStyle = glowColor; ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(132, 142, 56, 9, 4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(124, 158, 72, 11, 5); ctx.fill(); ctx.stroke();
      if (kickback > 0.4 && !isReloading) {
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(160, 115, 26, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(95, 240); ctx.lineTo(115, 150); ctx.lineTo(130, 110); ctx.lineTo(190, 110); ctx.lineTo(205, 150); ctx.lineTo(225, 240);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(135, 90, 20, 45); ctx.strokeRect(135, 90, 20, 45);
      ctx.fillRect(165, 90, 20, 45); ctx.strokeRect(165, 90, 20, 45);
      const laserGlow = isReloading ? '#facc15' : '#38bdf8';
      ctx.fillStyle = laserGlow;
      ctx.fillRect(137, 98, 16, 8); ctx.fillRect(137, 114, 16, 8);
      ctx.fillRect(167, 98, 16, 8); ctx.fillRect(167, 114, 16, 8);
      if (kickback > 0.4 && !isReloading) {
        ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.arc(145, 80, 20, 0, Math.PI * 2); ctx.arc(175, 80, 20, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawBlood(canvas) {
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 220, 220);
    ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(60, 50, 38, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 40; i++) {
      ctx.beginPath(); ctx.arc(60 + (Math.random() - 0.5) * 90, 50 + (Math.random() - 0.5) * 80 + Math.random() * 40, Math.random() * 7 + 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  const MAP_SIZE = 24, TILE_SIZE = 5;
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

  function isWalkable(x, z, margin = 1.0) {
    const corners = [
      { cx: x - margin, cz: z - margin }, { cx: x + margin, cz: z - margin },
      { cx: x - margin, cz: z + margin }, { cx: x + margin, cz: z + margin }
    ];
    for (const c of corners) {
      const col = Math.floor(c.cx / TILE_SIZE), row = Math.floor(c.cz / TILE_SIZE);
      if (col < 0 || col >= MAP_SIZE || row < 0 || row >= MAP_SIZE) return false;
      if (MAP[row][col] > 0) return false;
    }
    return true;
  }

  let scene, camera, renderer;
  let player = {
    x: 10, z: 10, angle: 0, health: 100, weapon: 'grenade',
    ammoGrenade: 16, maxAmmoGrenade: 16, ammoLaser: 50, maxAmmoLaser: 50,
    kills: 0, bobTimer: 0, kickback: 0, isReloading: false
  };

  const keys = {};
  let isGameRunning = false, enemies = [], projectiles = [];

  function init3D() {
    const canvas = document.getElementById('render-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x101726, 0.035);
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 120);
    scene.add(new THREE.AmbientLight(0x555555));
    camera.add(new THREE.PointLight(0xffeedd, 1.2, 22)); scene.add(camera);

    const floorTex = createFloorTexture(); floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(MAP_SIZE, MAP_SIZE);
    const ceilTex = createCeilingTexture(); ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping; ceilTex.repeat.set(MAP_SIZE, MAP_SIZE);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE), new THREE.MeshBasicMaterial({ map: floorTex }));
    floor.rotation.x = -Math.PI / 2; floor.position.set((MAP_SIZE * TILE_SIZE)/2, 0, (MAP_SIZE * TILE_SIZE)/2); scene.add(floor);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE), new THREE.MeshBasicMaterial({ map: ceilTex }));
    ceil.rotation.x = Math.PI / 2; ceil.position.set((MAP_SIZE * TILE_SIZE)/2, TILE_SIZE, (MAP_SIZE * TILE_SIZE)/2); scene.add(ceil);

    const wallBrown = createSciFiWallTexture('brown'), wallTeal = createSciFiWallTexture('teal');
    const boxGeo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);
    const bMat = new THREE.MeshBasicMaterial({ map: wallBrown }), tMat = new THREE.MeshBasicMaterial({ map: wallTeal });

    for (let r = 0; r < MAP_SIZE; r++) {
      for (let c = 0; c < MAP_SIZE; c++) {
        if (MAP[r][c] > 0) {
          const w = new THREE.Mesh(boxGeo, MAP[r][c] === 1 ? bMat : tMat);
          w.position.set(c * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2); scene.add(w);
        }
      }
    }

    drawWeapon(document.getElementById('gun-viewmodel'), 'grenade', 0, false);
    drawBlood(document.getElementById('blood-splatter'));

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (!isGameRunning) startGame();

      keys[e.code] = true; keys[e.key] = true;

      if (!isGameRunning) return;
      if (e.code === 'Space') shoot();
      if (e.code === 'KeyR' || e.key.toLowerCase() === 'r') reload();
      if (e.code === 'Digit1' || e.key === '1') switchWeapon('grenade');
      if (e.code === 'Digit2' || e.key === '2') switchWeapon('laser');
      if (e.code === 'KeyQ' || e.key.toLowerCase() === 'q') switchWeapon();
    }, { passive: false });

    window.addEventListener('keyup', (e) => { keys[e.code] = false; keys[e.key] = false; });

    canvas.addEventListener('click', () => { if (isGameRunning) canvas.requestPointerLock?.(); });
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvas && isGameRunning) player.angle -= e.movementX * 0.0035;
    });
    window.addEventListener('mousedown', (e) => {
      if (!isGameRunning) { startGame(); return; }
      if (e.button === 0) shoot();
    });

    document.getElementById('btn-wpn-1').addEventListener('click', () => switchWeapon('grenade'));
    document.getElementById('btn-wpn-2').addEventListener('click', () => switchWeapon('laser'));
    document.getElementById('btn-reload-action').addEventListener('click', reload);
  }

  function spawnEnemies() {
    enemies.forEach(e => scene.remove(e.sprite)); enemies = [];
    const tex = createHornedBlobTexture(), mat = new THREE.SpriteMaterial({ map: tex, transparent: true });

    for (let r = 1; r < MAP_SIZE - 1; r++) {
      for (let c = 1; c < MAP_SIZE - 1; c++) {
        if (r < 5 && c < 5) continue;
        if (MAP[r][c] === 0 && Math.random() < 0.22) {
          const sprite = new THREE.Sprite(mat.clone()); sprite.scale.set(3, 3, 1);
          const x = c * TILE_SIZE + TILE_SIZE / 2, z = r * TILE_SIZE + TILE_SIZE / 2;
          sprite.position.set(x, 1.5, z); scene.add(sprite);
          enemies.push({ sprite, x, z, speed: 3.2 + Math.random() * 1.6, attackTimer: 0 });
        }
      }
    }
  }

  function killBlob(idx, ex, ez) {
    const enemy = enemies[idx]; if (!enemy) return;
    scene.remove(enemy.sprite); enemies.splice(idx, 1);
    player.kills++; document.getElementById('hud-kills-val').innerText = player.kills;
    const flash = new THREE.PointLight(0xff3300, 4, 10); flash.position.set(ex, 1.5, ez);
    scene.add(flash); setTimeout(() => scene.remove(flash), 160);
    AudioFX.explosion();
    if (enemies.length < 8) spawnEnemies();
  }

  function shoot() {
    if (player.isReloading) return;
    const isLaser = player.weapon === 'laser';
    const curAmmo = isLaser ? player.ammoLaser : player.ammoGrenade;
    if (curAmmo <= 0) { AudioFX.emptyClick(); reload(); return; }

    if (isLaser) {
      player.ammoLaser--; document.getElementById('hud-ammo-val').innerText = player.ammoLaser;
      AudioFX.shootLaser();
    } else {
      player.ammoGrenade--; document.getElementById('hud-ammo-val').innerText = player.ammoGrenade;
      AudioFX.shootGrenade();
    }

    player.kickback = 1;
    const dirX = -Math.sin(player.angle), dirZ = -Math.cos(player.angle);

    if (isLaser) {
      const geo = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      mesh.rotation.x = Math.PI / 2; mesh.rotation.z = player.angle;
      mesh.position.set(player.x + dirX * 1.0, 1.7, player.z + dirZ * 1.0);
      scene.add(mesh);
      projectiles.push({ mesh, type: 'laser', vx: dirX * 42, vy: 0, vz: dirZ * 42, life: 1.2 });
    } else {
      const geo = new THREE.SphereGeometry(0.38, 12, 12);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      mesh.position.set(player.x + dirX * 0.8, 1.8, player.z + dirZ * 0.8);
      scene.add(mesh);
      projectiles.push({ mesh, type: 'grenade', vx: dirX * 20, vy: 2.2, vz: dirZ * 20, life: 2.2 });
    }
  }

  function switchWeapon(type) {
    if (player.isReloading) return;
    player.weapon = type || (player.weapon === 'grenade' ? 'laser' : 'grenade');
    const isLaser = player.weapon === 'laser';
    document.getElementById('hud-ammo-val').innerText = isLaser ? player.ammoLaser : player.ammoGrenade;
    document.getElementById('hud-ammo-icon').innerText = isLaser ? '⚡' : '💥';
    document.getElementById('btn-wpn-1').className = 'btn-wpn ' + (isLaser ? '' : 'active-grenade');
    document.getElementById('btn-wpn-2').className = 'btn-wpn ' + (isLaser ? 'active-laser' : '');
    AudioFX.switchWeapon();
  }

  function reload() {
    const isLaser = player.weapon === 'laser';
    const max = isLaser ? player.maxAmmoLaser : player.maxAmmoGrenade;
    const cur = isLaser ? player.ammoLaser : player.ammoGrenade;
    if (player.isReloading || cur === max) return;
    player.isReloading = true; AudioFX.reload();
    document.getElementById('reload-banner').style.display = 'block';

    setTimeout(() => {
      if (isLaser) { player.ammoLaser = player.maxAmmoLaser; document.getElementById('hud-ammo-val').innerText = player.ammoLaser; }
      else { player.ammoGrenade = player.maxAmmoGrenade; document.getElementById('hud-ammo-val').innerText = player.ammoGrenade; }
      player.isReloading = false;
      document.getElementById('reload-banner').style.display = 'none';
    }, 1000);
  }

  function renderRadar() {
    const radar = document.getElementById('radar-canvas'); if (!radar) return;
    const ctx = radar.getContext('2d'), rw = radar.width, rh = radar.height;
    ctx.clearRect(0, 0, rw, rh);
    const pCol = player.x / TILE_SIZE, pRow = player.z / TILE_SIZE, scale = 5.2;

    ctx.save(); ctx.translate(rw / 2, rh / 2);
    ctx.fillStyle = '#1e3a5f';
    for (let r = 0; r < MAP_SIZE; r++) {
      for (let c = 0; c < MAP_SIZE; c++) {
        if (MAP[r][c] > 0) ctx.fillRect((c - pCol) * scale, (r - pRow) * scale, scale, scale);
      }
    }
    ctx.fillStyle = '#ef4444';
    enemies.forEach((enemy) => {
      ctx.beginPath(); ctx.arc((enemy.x / TILE_SIZE - pCol) * scale, (enemy.z / TILE_SIZE - pRow) * scale, 2.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(-Math.sin(player.angle) * 10, -Math.cos(player.angle) * 10); ctx.stroke();
    ctx.restore();
  }

  let lastTime = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now(), dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (!isGameRunning) { renderer.render(scene, camera); return; }

    let moveF = 0, moveS = 0;
    if (keys['ArrowUp'] || keys['KeyW'] || keys['w'] || keys['W']) moveF += 1;
    if (keys['ArrowDown'] || keys['KeyS'] || keys['s'] || keys['S']) moveF -= 1;
    if (keys['KeyA'] || keys['a'] || keys['A']) moveS -= 1;
    if (keys['KeyD'] || keys['d'] || keys['D']) moveS += 1;

    if (keys['ArrowLeft']) player.angle += 3.6 * dt;
    if (keys['ArrowRight']) player.angle -= 3.6 * dt;

    if (moveF !== 0 || moveS !== 0) {
      player.bobTimer += dt * 10;
      const speed = 10.0;
      const dx = (-Math.sin(player.angle) * moveF + Math.cos(player.angle) * moveS) * speed * dt;
      const dz = (-Math.cos(player.angle) * moveF - Math.sin(player.angle) * moveS) * speed * dt;
      if (isWalkable(player.x + dx, player.z, 0.9)) player.x += dx;
      if (isWalkable(player.x, player.z + dz, 0.9)) player.z += dz;
    }

    camera.position.set(player.x, 2.2 + Math.sin(player.bobTimer) * 0.12, player.z);
    camera.rotation.y = player.angle;

    if (player.kickback > 0) player.kickback = Math.max(0, player.kickback - dt * 7);
    drawWeapon(document.getElementById('gun-viewmodel'), player.weapon, player.kickback, player.isReloading);

    // Actualizar Proyectiles y colisión de 1 solo tiro
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i]; pr.life -= dt;
      if (pr.type === 'grenade') pr.vy -= 9.8 * dt;
      pr.mesh.position.x += pr.vx * dt; pr.mesh.position.y += pr.vy * dt; pr.mesh.position.z += pr.vz * dt;

      if (pr.type === 'grenade' && pr.mesh.position.y < 0.4) {
        pr.mesh.position.y = 0.4; pr.vy = -pr.vy * 0.55;
      }

      let hitBlob = false;
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

      const col = Math.floor(pr.mesh.position.x / TILE_SIZE), row = Math.floor(pr.mesh.position.z / TILE_SIZE);
      const hitWall = (col >= 0 && col < MAP_SIZE && row >= 0 && row < MAP_SIZE && MAP[row][col] > 0);

      if (hitBlob || hitWall || pr.life <= 0) {
        scene.remove(pr.mesh); projectiles.splice(i, 1);
      }
    }

    // Enemigos
    enemies.forEach((enemy) => {
      const dx = player.x - enemy.x, dz = player.z - enemy.z, dist = Math.hypot(dx, dz);
      if (dist < 24) {
        const step = enemy.speed * dt;
        const nextEx = enemy.x + (dx / dist) * step, nextEz = enemy.z + (dz / dist) * step;
        if (isWalkable(nextEx, nextEz, 0.8)) { enemy.x = nextEx; enemy.z = nextEz; }
        else { enemy.x += (dx / dist) * step * 0.5; enemy.z += (dz / dist) * step * 0.5; }
        enemy.sprite.position.x = enemy.x; enemy.sprite.position.z = enemy.z;

        if (dist < 1.8) {
          enemy.attackTimer = (enemy.attackTimer || 0) + dt;
          if (enemy.attackTimer > 0.75) {
            enemy.attackTimer = 0; player.health -= 15;
            document.getElementById('hud-health-val').innerText = Math.max(0, player.health);
            AudioFX.blobAttack(); AudioFX.playerHit();
            const b = document.getElementById('blood-splatter'), f = document.getElementById('damage-flash');
            b.style.opacity = f.style.opacity = '1';
            setTimeout(() => { b.style.opacity = f.style.opacity = '0'; }, 550);
            if (player.health <= 0) triggerGameOver();
          }
        }
      }
    });

    renderRadar();
    renderer.render(scene, camera);
  }

  function startGame() {
    AudioFX.init();
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    document.getElementById('gameover-screen').style.display = 'none';
    player.x = 10; player.z = 10; player.angle = 0; player.health = 100;
    player.weapon = 'grenade'; player.ammoGrenade = 16; player.ammoLaser = 50;
    player.kills = 0; player.isReloading = false;
    document.getElementById('hud-health-val').innerText = '100';
    document.getElementById('hud-ammo-val').innerText = '16';
    document.getElementById('hud-kills-val').innerText = '0';
    spawnEnemies();
    isGameRunning = true;
    document.getElementById('render-canvas').requestPointerLock?.();
  }

  function triggerGameOver() {
    isGameRunning = false;
    if (document.exitPointerLock) document.exitPointerLock();
    document.getElementById('gameover-stats').innerText = 'Kills conseguidas: ' + player.kills;
    document.getElementById('gameover-screen').style.display = 'flex';
  }

  document.getElementById('title-screen').addEventListener('click', startGame);
  document.getElementById('btn-restart').addEventListener('click', startGame);

  window.addEventListener('DOMContentLoaded', () => {
    init3D(); animate();
  });
  </script>
</body>
</html>
`;
