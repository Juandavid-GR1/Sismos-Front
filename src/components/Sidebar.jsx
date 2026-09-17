import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  Edit3, 
  Trash2, 
  Radio, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { estacionesService } from '../services/StationsServices';

export const Sidebar = ({ 
  theme,
  stations = [], 
  selectedStation,
  onSelectStation, 
  onEditStation, 
  onDeleteSuccess
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showStationsLayer, setShowStationsLayer] = useState(true);
  const [showEventsLayer, setShowEventsLayer] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const isDark = theme === 'dark';

  // Manejador del llamado a estacionesService.delete
  const handleDelete = async (id) => {
    if (!id) return;
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta estación?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await estacionesService.delete(id);
      onDeleteSuccess(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar la estación');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside 
      className={`relative border-r flex flex-col h-[calc(100vh-4rem)] z-20 transition-all duration-300 ease-in-out backdrop-blur-xl ${
        isCollapsed ? 'w-20' : 'w-80'
      } ${
        isDark 
          ? 'bg-zinc-950/90 border-zinc-800/60 text-zinc-200' 
          : 'bg-white/90 border-amber-100 text-zinc-800'
      }`}
    >
      {/* Botón Flotante para Colapsar / Expandir */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expandir panel" : "Contraer panel"}
        className={`absolute -right-3 top-6 z-30 p-1.5 rounded-full border shadow-md transition-all duration-300 hover:scale-110 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700 text-orange-400 hover:bg-zinc-800' 
            : 'bg-white border-amber-200 text-orange-500 hover:bg-amber-50'
        }`}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* 1. Capas y Filtros */}
      <div className={`p-4 border-b space-y-3 ${isDark ? 'border-zinc-800/60' : 'border-amber-100'}`}>
        <div className={`flex items-center space-x-2 text-orange-500 text-[11px] font-bold uppercase tracking-wider ${isCollapsed ? 'justify-center' : ''}`}>
          <Layers className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Capas del Visor</span>}
        </div>
        
        <div className="space-y-2">
          {/* Estaciones */}
          <label 
            title={isCollapsed ? "Estaciones Sísmicas" : ""}
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-300 ${
              isCollapsed ? 'justify-center p-2' : ''
            } ${
              isDark 
                ? 'bg-zinc-900/40 border-zinc-800/40 hover:border-orange-500/40' 
                : 'bg-amber-50/50 border-amber-100 hover:border-orange-300'
            }`}
          >
            <span className="flex items-center space-x-2.5 font-medium">
              <Radio className="h-4 w-4 text-amber-500 shrink-0" />
              {!isCollapsed && <span>Estaciones Sísmicas</span>}
            </span>
            {!isCollapsed && (
              <input 
                type="checkbox" 
                checked={showStationsLayer} 
                onChange={(e) => setShowStationsLayer(e.target.checked)}
                className="accent-orange-500 rounded cursor-pointer" 
              />
            )}
          </label>

          {/* Eventos */}
          <label 
            title={isCollapsed ? "Eventos Sísmicos" : ""}
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-300 ${
              isCollapsed ? 'justify-center p-2' : ''
            } ${
              isDark 
                ? 'bg-zinc-900/40 border-zinc-800/40 hover:border-amber-500/40' 
                : 'bg-amber-50/50 border-amber-100 hover:border-orange-300'
            }`}
          >
            <span className="flex items-center space-x-2.5 font-medium">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
              {!isCollapsed && <span>Eventos Sísmicos</span>}
            </span>
            {!isCollapsed && (
              <input 
                type="checkbox" 
                checked={showEventsLayer} 
                onChange={(e) => setShowEventsLayer(e.target.checked)}
                className="accent-orange-500 rounded cursor-pointer" 
              />
            )}
          </label>
        </div>
      </div>

      {/* 2. Header Lista */}
      <div className={`px-4 py-3 border-b flex justify-between items-center ${
        isDark ? 'border-zinc-800/40 bg-zinc-900/20' : 'border-amber-100 bg-amber-50/30'
      } ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed ? (
          <>
            <span className="text-xs font-bold text-zinc-500">ESTACIONES REGISTRADAS</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
              {stations.length} total
            </span>
          </>
        ) : (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
            {stations.length}
          </span>
        )}
      </div>

      {/* 3. Lista de Estaciones */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {stations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const isActive = station.status === 'activa';
          const isDeleting = deletingId === station.id;

          return (
            <div 
              key={station.id ?? `${station.lat}-${station.lon}`}
              title={isCollapsed ? `${station.name} (${station.status})` : ""}
              className={`rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                isCollapsed ? 'p-2 flex flex-col items-center justify-center' : 'p-3.5'
              } ${
                isSelected 
                  ? isDark
                    ? 'bg-gradient-to-r from-orange-950/40 to-zinc-900 border-orange-500/60 shadow-lg shadow-orange-500/10'
                    : 'bg-gradient-to-r from-amber-100/60 to-orange-50/80 border-orange-400 shadow-md shadow-orange-500/10'
                  : isDark
                    ? 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/70'
                    : 'bg-white border-zinc-100 hover:border-amber-200 hover:bg-amber-50/30 shadow-sm'
              }`}
            >
              {/* Indicador Lateral de Selección */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-r-full" />
              )}

              {/* VISTA COLAPSADA */}
              {isCollapsed ? (
                <div className="flex flex-col items-center space-y-2 w-full">
                  <button
                    onClick={() => onSelectStation(station)}
                    className="p-1.5 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                </div>
              ) : (
                /* VISTA EXPANDIDA COMPLETA */
                <>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h3 className={`font-bold text-xs ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                        {station.name}
                      </h3>
                    </div>
                    
                    {/* Badge Status */}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1.5 ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-red-500/15 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                      <span>{station.status}</span>
                    </span>
                  </div>

                  <p className={`text-[11px] mb-3 font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {station.dept} • {station.lat}, {station.lon}
                  </p>

                  {/* Acciones */}
                  <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
                    <button 
                      onClick={() => onSelectStation(station)}
                      className="text-[11px] font-bold text-orange-500 hover:text-amber-500 flex items-center space-x-1 transition-colors group/btn"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ver en mapa</span>
                      <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => onEditStation(station)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-amber-400' : 'hover:bg-amber-100/60 text-zinc-400 hover:text-orange-600'}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      
                      <button 
                        disabled={isDeleting}
                        onClick={() => handleDelete(station.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-red-400' : 'hover:bg-red-50 text-zinc-400 hover:text-red-500'
                        }`}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};