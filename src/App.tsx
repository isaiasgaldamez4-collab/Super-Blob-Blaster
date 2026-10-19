import React, { useState } from 'react';
import { BlobBlaster3D } from './components/BlobBlaster3D.tsx';
import { CyberStrike3D } from './components/CyberStrike3D.tsx';

export default function App() {
  const [activeGame, setActiveGame] = useState<'blob' | 'cyber'>('blob');

  return (
    <div className="w-screen h-screen overflow-hidden bg-black select-none m-0 p-0 flex items-center justify-center relative">
      {activeGame === 'blob' ? (
        <BlobBlaster3D onSwitchToCyberStrike={() => setActiveGame('cyber')} />
      ) : (
        <div className="relative w-full h-full">
          <button
            onClick={() => setActiveGame('blob')}
            className="absolute top-3 right-4 z-40 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-100 border border-amber-500/40 shadow transition flex items-center gap-1.5 text-xs font-bold pointer-events-auto"
            title="Volver al primer juego (Super Blob Blaster 3D Original)"
          >
            ← Volver a Super Blob Blaster Original
          </button>
          <CyberStrike3D />
        </div>
      )}
    </div>
  );
}
