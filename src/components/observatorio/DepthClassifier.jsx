import React from 'react';
import { Layers } from 'lucide-react';

export const DepthClassifier = ({ depthKm, isDark }) => {
  return (
    <div className={`p-6 rounded-3xl border transition-all duration-500 ${
      isDark 
        ? 'bg-zinc-900/60 border-zinc-800/80' 
        : 'bg-white/80 border-amber-200/80 shadow-sm'
    }`}>
      <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
        isDark ? 'text-zinc-400' : 'text-zinc-600'
      }`}>
        <Layers className="w-4 h-4 text-orange-500" />
        Clasificación por Profundidad
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {/* Superficial */}
        <div className={`p-3.5 rounded-2xl border text-center transition-all ${
          depthKm <= 70 
            ? isDark 
              ? 'bg-red-500/20 border-red-500 text-red-400 font-bold' 
              : 'bg-red-50 border-red-300 text-red-700 font-bold shadow-sm'
            : isDark 
              ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600' 
              : 'bg-zinc-50 border-zinc-200/80 text-zinc-400'
        }`}>
          <p className="text-xs">Superficial</p>
          <p className="text-[10px] font-mono mt-0.5">0 - 70 km</p>
        </div>

        {/* Intermedio */}
        <div className={`p-3.5 rounded-2xl border text-center transition-all ${
          depthKm > 70 && depthKm <= 300 
            ? isDark 
              ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold' 
              : 'bg-amber-100/80 border-amber-400 text-amber-900 font-bold shadow-sm'
            : isDark 
              ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600' 
              : 'bg-zinc-50 border-zinc-200/80 text-zinc-400'
        }`}>
          <p className="text-xs">Intermedio (Nido)</p>
          <p className="text-[10px] font-mono mt-0.5">70 - 300 km</p>
        </div>

        {/* Profundo */}
        <div className={`p-3.5 rounded-2xl border text-center transition-all ${
          depthKm > 300 
            ? isDark 
              ? 'bg-blue-500/20 border-blue-500 text-blue-400 font-bold' 
              : 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-sm'
            : isDark 
              ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600' 
              : 'bg-zinc-50 border-zinc-200/80 text-zinc-400'
        }`}>
          <p className="text-xs">Profundo</p>
          <p className="text-[10px] font-mono mt-0.5">&gt; 300 km</p>
        </div>
      </div>
    </div>
  );
};