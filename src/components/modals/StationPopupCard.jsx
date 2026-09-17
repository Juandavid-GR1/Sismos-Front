import React, { memo } from 'react';
import { RadioTower, MapPin, X } from 'lucide-react';

export const StationPopupCard = memo(({ station, isDark, onClose }) => {
  const isActive = station.status === 'activa';
  const lat = Number(station.lat);
  const lon = Number(station.lon);

  return (
    <div
      className={`min-w-[220px] max-w-[260px] p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 font-sans relative overflow-hidden ${
        isDark
          ? 'bg-zinc-900/95 border-zinc-800/80 text-zinc-100 shadow-2xl shadow-orange-500/5'
          : 'bg-white/98 border-amber-200/70 text-zinc-800 shadow-xl shadow-amber-900/10'
      }`}
    >
      {/* Luz ambiental decorativa de fondo */}
      <div
        className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
          isActive
            ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/25'
            : isDark ? 'bg-red-500/20' : 'bg-red-400/25'
        }`}
      />

      {/* Cabecera */}
      <div className={`flex items-start justify-between gap-2 border-b pb-2.5 mb-3 ${
        isDark ? 'border-zinc-800/80' : 'border-amber-100'
      }`}>
        <div className="flex items-center space-x-2.5 min-w-0">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isActive
                ? isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDark
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            <RadioTower className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className={`font-black text-xs truncate tracking-wide uppercase ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}>
              {station.name}
            </h4>
            <p className={`text-[10px] font-semibold ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              {station.dept}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className={`p-1 rounded-lg transition-colors shrink-0 ${
            isDark 
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' 
              : 'hover:bg-amber-100/80 text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Estado */}
        <div
          className={`p-2 rounded-xl border flex flex-col justify-center ${
            isDark 
              ? 'bg-zinc-950/50 border-zinc-800/60' 
              : 'bg-amber-50/50 border-amber-200/50'
          }`}
        >
          <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
            isDark ? 'text-zinc-500' : 'text-zinc-500'
          }`}>
            Estado
          </span>
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              }`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                isActive
                  ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                  : isDark ? 'text-red-400' : 'text-red-600'
              }`}
            >
              {station.status}
            </span>
          </div>
        </div>

        {/* Alcance */}
        <div
          className={`p-2 rounded-xl border flex flex-col justify-center ${
            isDark 
              ? 'bg-zinc-950/50 border-zinc-800/60' 
              : 'bg-amber-50/50 border-amber-200/50'
          }`}
        >
          <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
            isDark ? 'text-zinc-500' : 'text-zinc-500'
          }`}>
            Alcance
          </span>
          <span className={`font-mono text-xs font-black ${
            isDark ? 'text-orange-400' : 'text-orange-600'
          }`}>
            {station.coverage} <span className={`text-[9px] font-semibold ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}>km</span>
          </span>
        </div>
      </div>

      {/* Coordenadas */}
      <div className={`flex items-center justify-between text-[10px] font-mono pt-2 border-t ${
        isDark ? 'border-zinc-800/60 text-zinc-400' : 'border-amber-100 text-zinc-600'
      }`}>
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
          <span>{!isNaN(lat) ? lat.toFixed(4) : '0'}° N</span>
        </div>
        <span>{!isNaN(lon) ? lon.toFixed(4) : '0'}° W</span>
      </div>
    </div>
  );
});