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
import { SismosList } from '../components/Sismos/SismosList';

export const Sidebar = ({ 
  theme,
  stations = [], 
  events = [],
  selectedStation,
  selectedEvent,
  onSelectStation, 
  onSelectEvent,
  onEditStation, 
  onEditEvent, // 💡 Prop recibida para la edición de sismos
  onDeleteSuccess,
  onCreateEvent,
  onEventDeletedSuccess,
  onEventsDeletedSuccess 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('stations'); // 'stations' | 'events'
  const [deletingId, setDeletingId] = useState(null);

  const isDark = theme === 'dark';

  // Eliminar estación
  const handleDeleteStation = async (id) => {
    if (!id) return;
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta estación?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await estacionesService.delete(id);
      if (onDeleteSuccess) onDeleteSuccess(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar la estación');
    } finally {
      setDeletingId(null);
    }
  };

  const safeStations = Array.isArray(stations) ? stations : [];

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
        type="button"
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

      {/* 1. Encabezado Capas Visibles */}
      <div className={`p-4 border-b space-y-3 ${isDark ? 'border-zinc-800/60' : 'border-amber-100'}`}>
        <div className={`flex items-center space-x-2 text-orange-500 text-[11px] font-bold uppercase tracking-wider ${isCollapsed ? 'justify-center' : ''}`}>
          <Layers className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Capas del Visor</span>}
        </div>
      </div>

      {/* 2. Selector de Pestañas (Tabs) */}
      <div className={`p-1.5 mx-3 mt-3 rounded-xl border flex space-x-1 text-xs font-bold ${
        isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-amber-50/60 border-amber-100'
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab('stations')}
          title="Ver Estaciones"
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'stations'
              ? isDark
                ? 'bg-zinc-800 text-orange-400 shadow'
                : 'bg-white text-orange-600 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Radio className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Estaciones</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          title="Ver Sismos"
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'events'
              ? isDark
                ? 'bg-zinc-800 text-orange-400 shadow'
                : 'bg-white text-orange-600 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Sismos</span>}
        </button>
      </div>

      {/* 3. Contenido Dinámico de Pestañas */}
      <div className="flex-1 overflow-hidden flex flex-col mt-2">
        {activeTab === 'stations' ? (
          /* TAB DE ESTACIONES */
          <>
            <div className={`px-4 py-3 border-b flex justify-between items-center ${
              isDark ? 'border-zinc-800/40 bg-zinc-900/20' : 'border-amber-100 bg-amber-50/30'
            } ${isCollapsed ? 'justify-center' : ''}`}>
              {!isCollapsed ? (
                <>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Estaciones Registradas
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    {safeStations.length} total
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  {safeStations.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              {safeStations.map((station) => {
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
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-r-full" />
                    )}

                    {isCollapsed ? (
                      <div className="flex flex-col items-center space-y-2 w-full">
                        <button
                          type="button"
                          onClick={() => onSelectStation && onSelectStation(station)}
                          className="p-1.5 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <h3 className={`font-bold text-xs ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                              {station.name}
                            </h3>
                          </div>
                          
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

                        <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
                          <button 
                            type="button"
                            onClick={() => onSelectStation && onSelectStation(station)}
                            className="text-[11px] font-bold text-orange-500 hover:text-amber-500 flex items-center space-x-1 transition-colors group/btn"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver en mapa</span>
                            <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>

                          <div className="flex items-center space-x-1">
                            <button 
                              type="button"
                              onClick={() => onEditStation && onEditStation(station)}
                              title="Editar estación"
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark 
                                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-amber-400' 
                                  : 'hover:bg-amber-100/60 text-zinc-400 hover:text-orange-600'
                              }`}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            
                            <button 
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteStation(station.id)}
                              title="Eliminar estación"
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
          </>
        ) : (
          /* TAB DE SISMOS (COMPONENTE MODULAR) */
          <SismosList
            events={events}
            selectedEvent={selectedEvent}
            onSelectEvent={onSelectEvent}
            onCreateEvent={onCreateEvent}
            onEditEvent={onEditEvent} // 💡 Pasar prop a SismosList
            onEventDeletedSuccess={onEventDeletedSuccess}
            isDark={isDark}
            isCollapsed={isCollapsed}
          />
        )}
      </div>
    </aside>
  );
};