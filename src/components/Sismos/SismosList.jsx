import React, { useState } from 'react';
import { 
  Eye, 
  Trash2, 
  Loader2, 
  ChevronRight, 
  Plus,
  Activity,
  Calendar,
  Edit3,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { sismosService } from '../../services/SismosServices';
import { notificarCambioDeEstado } from '../../services/historialService';

export const SismosList = ({
  events = [],
  selectedEvent,
  onSelectEvent,
  onEditEvent, // 💡 Corregido: Prop única para edición
  onCreateEvent,
  onEventDeletedSuccess,
  isDark,
  isCollapsed
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);

  // Section 6: mark as reviewed. Does not change the key K (no
  // reinsertion) and is recorded as an undoable action.
  const handleMarcarRevisado = async (id, e) => {
    e.stopPropagation();
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (!numericId || isNaN(numericId)) return;
    try {
      setReviewingId(id);
      await sismosService.marcarRevisado(numericId);
      notificarCambioDeEstado();      // pages reload their data
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo marcar como revisado');
    } finally {
      setReviewingId(null);
    }
  };

  // Asegurar que events sea un arreglo
  const safeEvents = Array.isArray(events) ? events.filter(Boolean) : [];

  // Formateador seguro de fecha
  const formatTimestamp = (ts) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
    } catch (e) {
      return String(ts);
    }
  };

  const handleDeleteSismo = async (id, e) => {
    e.stopPropagation();
    if (id === null || id === undefined) return;

    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;

    if (!numericId || isNaN(numericId)) {
      alert('El ID del sismo no es válido.');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este evento sísmico?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await sismosService.delete(numericId);
      
      if (onEventDeletedSuccess) {
        onEventDeletedSuccess(id);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar el evento sísmico');
    } finally {
      setDeletingId(null);
    }
  };

  const getMagnitudeBadge = (mag) => {
    const magnitude = Number(mag) || 0;
    if (magnitude >= 5.0) {
      return 'bg-red-500/15 text-red-500 border-red-500/30';
    } else if (magnitude >= 3.0) {
      return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    }
    return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-4 py-3 border-b flex justify-between items-center ${
        isDark ? 'border-zinc-800/40 bg-zinc-900/20' : 'border-amber-100 bg-amber-50/30'
      } ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Eventos Sísmicos
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                {safeEvents.length}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => onCreateEvent && onCreateEvent()}
              title="Reportar nuevo sismo"
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors ${
                isDark 
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo</span>
            </button>
          </>
        ) : (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
            {safeEvents.length}
          </span>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {safeEvents.length === 0 ? (
          <div className={`text-center py-8 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {!isCollapsed && 'No hay sismos registrados.'}
          </div>
        ) : (
          safeEvents.map((sismo, index) => {
            if (!sismo) return null;

            const rawId = sismo.id ?? sismo.formatted_id ?? `sismo-${index}`;
            const location = typeof sismo.location === 'string' 
              ? sismo.location 
              : sismo.epicenter || sismo.formatted_id || sismo.refRegion || 'Evento Sísmico';
            
            const lat = sismo.lat ?? sismo.epicenter_y ?? 'N/A';
            const lon = sismo.lon ?? sismo.epicenter_x ?? 'N/A';
            
            const isSelected = selectedEvent && (selectedEvent.id === sismo.id || selectedEvent.formatted_id === rawId);
            const isDeleting = deletingId === rawId || deletingId === sismo.id;
            const dateStr = formatTimestamp(sismo.timestamp);

            return (
              <div
                key={rawId}
                title={isCollapsed ? `M ${sismo.magnitude || 'N/A'} - ${location}` : ''}
                onClick={() => onSelectEvent && onSelectEvent(sismo)}
                className={`rounded-2xl border transition-all duration-300 relative group overflow-hidden cursor-pointer ${
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
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectEvent) onSelectEvent(sismo);
                      }}
                      className="p-1.5 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] font-bold text-orange-500">
                      {sismo.magnitude ? `${sismo.magnitude}M` : '—'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="pr-2">
                        <h3 className={`font-bold text-xs ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                          {String(location)}
                        </h3>
                        {/* Attention status: Pendiente / Revisado */}
                        {sismo.status && (
                          <span
                            className={`mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                              sismo.status === 'Revisado'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                            }`}
                          >
                            {sismo.status === 'Revisado' ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                            {sismo.status}
                          </span>
                        )}
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center space-x-1 shrink-0 ${getMagnitudeBadge(sismo.magnitude)}`}>
                        <Activity className="h-3 w-3" />
                        <span>M {sismo.magnitude ?? 'N/A'}</span>
                      </span>
                    </div>

                    <div className={`text-[11px] space-y-1 mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <p className="font-mono">
                        Prof: {sismo.depth ? `${sismo.depth} km` : 'N/A'} • Lat: {String(lat)}, Lon: {String(lon)}
                      </p>
                      {dateStr && (
                        <p className="flex items-center space-x-1 text-[10px] opacity-80">
                          <Calendar className="h-3 w-3 inline" />
                          <span>{dateStr}</span>
                        </p>
                      )}
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
                      <span className="text-[11px] font-bold text-orange-500 hover:text-amber-500 flex items-center space-x-1 transition-colors group/btn">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver en mapa</span>
                        <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </span>

                      <div className="flex items-center space-x-1">
                        {/* Mark as reviewed (only while pending) */}
                        {sismo.status !== 'Revisado' && (
                          <button
                            type="button"
                            disabled={reviewingId === (sismo.id ?? rawId)}
                            onClick={(e) => handleMarcarRevisado(sismo.id ?? rawId, e)}
                            title="Marcar como revisado"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400'
                                : 'hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600'
                            }`}
                          >
                            {reviewingId === (sismo.id ?? rawId) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}

                        {/* Botón Editar Vinculado */}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditEvent) onEditEvent(sismo);
                          }}
                          title="Editar sismo"
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark 
                              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-amber-400' 
                              : 'hover:bg-amber-100/60 text-zinc-400 hover:text-orange-600'
                          }`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Botón Eliminar */}
                        <button 
                          type="button"
                          disabled={isDeleting}
                          onClick={(e) => handleDeleteSismo(sismo.id ?? rawId, e)}
                          title="Eliminar sismo"
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
          })
        )}
      </div>
    </div>
  );
};