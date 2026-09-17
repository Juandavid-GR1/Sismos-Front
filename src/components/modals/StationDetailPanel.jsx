import React from 'react';
import { 
  X, 
  RadioTower, 
  MapPin, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Activity, 
  FileSpreadsheet 
} from 'lucide-react';

export const StationDetailPanel = ({ 
  station, 
  theme, 
  onClose, 
  onReportSeism 
}) => {
  if (!station) return null;

  const isDark = theme === 'dark';
  const isActive = station.status === 'activa';
  const lat = Number(station.lat);
  const lon = Number(station.lon);

  return (
    <aside 
      className={`fixed top-16 right-0 bottom-0 w-80 sm:w-96 border-l z-30 transition-transform duration-300 ease-in-out backdrop-blur-xl flex flex-col shadow-2xl ${
        isDark 
          ? 'bg-zinc-950/95 border-zinc-800/80 text-zinc-100 shadow-black/50' 
          : 'bg-white/95 border-amber-200/80 text-zinc-800 shadow-xl'
      }`}
    >
      {/* 1. Header con botón de cerrar */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDark ? 'border-zinc-800/60 bg-zinc-900/30' : 'border-amber-100 bg-amber-50/40'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl ${
            isActive 
              ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
          }`}>
            <RadioTower className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm uppercase tracking-wide">
              Detalles de Estación
            </h2>
            <p className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              ID: {station.id || 'N/A'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-amber-100 text-zinc-500'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        
        {/* Nombre y departamento */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">
            {station.dept}
          </span>
          <h3 className="text-xl font-black">{station.name}</h3>
        </div>

        {/* Tarjeta Estado & Señal */}
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-zinc-900/50 border-zinc-800/60' : 'bg-amber-50/40 border-amber-200/60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Estado Operativo
            </span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5 ${
              isActive 
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                : 'bg-red-500/15 text-red-500 border border-red-500/30'
            }`}>
              {isActive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{station.status}</span>
            </span>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200/60'
          }`}>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Radio Cobertura
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-orange-500">{station.coverage}</span>
              <span className="text-xs font-semibold text-zinc-500">km</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200/60'
          }`}>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Ubicación
            </span>
            <div className="flex items-center space-x-1 text-xs font-semibold text-zinc-500">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">{station.dept}</span>
            </div>
          </div>
        </div>

        {/* Coordenadas Geográficas */}
        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-zinc-900/30 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200/60'
        }`}>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Coordenadas GPS
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
            <div>
              <span className="text-zinc-500 text-[10px] block font-sans">Latitud</span>
              <span>{!isNaN(lat) ? lat.toFixed(5) : '0'}° N</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block font-sans">Longitud</span>
              <span>{!isNaN(lon) ? lon.toFixed(5) : '0'}° W</span>
            </div>
          </div>
        </div>

        {/* Sección de Actividad Sísmica Reciente (Visual) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>Monitoreo en Tiempo Real</span>
          </div>
          <div className={`p-3 rounded-xl border text-center text-xs font-medium ${
            isDark ? 'bg-zinc-900/20 border-zinc-800/40 text-zinc-400' : 'bg-amber-50/30 border-amber-100 text-zinc-500'
          }`}>
            Estación transmitiendo telemetría continua.
          </div>
        </div>
      </div>

      {/* 3. Footer con Botón de Acción */}
      <div className={`p-4 border-t ${
        isDark ? 'border-zinc-800/60 bg-zinc-950' : 'border-amber-100 bg-white'
      }`}>
        <button
          onClick={() => onReportSeism && onReportSeism(station)}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-orange-500/25 active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reportar Sismo</span>
        </button>
      </div>
    </aside>
  );
};