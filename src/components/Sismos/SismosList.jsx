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
  Clock,
  Link2,
} from 'lucide-react';

import { sismosService } from '../../services/SismosServices';
import { notificarCambioDeEstado } from '../../services/historialService';
import { obtenerReferenciasSismo } from '../../services/ReferenciaService';
import {ReferenciasSismoModal} from '../modals/sismos/ReferenciaModal';

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

const parseNumericId = (id) => {
  if (id === null || id === undefined) return null;
  const parsed =
    typeof id === 'string'
      ? parseInt(id.replace(/\D/g, ''), 10)
      : Number(id);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatTimestamp = (ts) => {
  if (!ts) return null;
  try {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
  } catch {
    return String(ts);
  }
};

const getMagnitudeBadge = (mag) => {
  const magnitude = Number(mag) || 0;
  if (magnitude >= 5.0) return 'bg-red-500/15 text-red-500 border-red-500/30';
  if (magnitude >= 3.0) return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
  return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
};

// ==========================================
// COMPONENTE TARJETA DE SISMO
// ==========================================

const SismoCard = ({
  sismo,
  index,
  isSelected,
  isDeleting,
  isReviewing,
  isDark,
  isCollapsed,
  onSelect,
  onMarcarRevisado,
  onAbrirReferencias,
  onEdit,
  onDelete,
}) => {
  const rawId = sismo.id ?? sismo.formatted_id ?? `sismo-${index}`;
  const location =
    typeof sismo.location === 'string'
      ? sismo.location
      : sismo.epicenter || sismo.formatted_id || sismo.refRegion || 'Evento Sísmico';

  const lat = sismo.lat ?? sismo.epicenter_y ?? 'N/A';
  const lon = sismo.lon ?? sismo.epicenter_x ?? 'N/A';
  const currentReviewId = sismo.id ?? rawId;
  const dateStr = formatTimestamp(sismo.timestamp);

  const containerStyle = isSelected
    ? isDark
      ? 'bg-gradient-to-r from-orange-950/40 to-zinc-900 border-orange-500/60 shadow-lg shadow-orange-500/10'
      : 'bg-gradient-to-r from-amber-100/60 to-orange-50/80 border-orange-400 shadow-md shadow-orange-500/10'
    : isDark
      ? 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/70'
      : 'bg-white border-zinc-100 hover:border-amber-200 hover:bg-amber-50/30 shadow-sm';

  if (isCollapsed) {
    return (
      <div
        title={`M ${sismo.magnitude || 'N/A'} - ${location}`}
        onClick={() => onSelect?.(sismo)}
        className={`p-2 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 relative group cursor-pointer ${containerStyle}`}
      >
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-r-full" />
        )}
        <div className="flex flex-col items-center space-y-2 w-full">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(sismo);
            }}
            title="Ver sismo en el mapa"
            className="p-1.5 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>

          <span className="text-[10px] font-bold text-orange-500">
            {sismo.magnitude ? `${sismo.magnitude}M` : '—'}
          </span>

          <button
            type="button"
            onClick={(e) => onAbrirReferencias(sismo, e)}
            title="Gestionar referencia sísmica"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-blue-400 hover:bg-zinc-800' : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(sismo)}
      className={`p-3.5 rounded-2xl border transition-all duration-300 relative group overflow-hidden cursor-pointer ${containerStyle}`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-r-full" />
      )}

      {/* Encabezado */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="pr-2 min-w-0">
          <h3 className={`font-bold text-xs ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
            {String(location)}
          </h3>

          {sismo.status && (
            <span
              className={`mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                sismo.status === 'Revisado'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : 'bg-sky-500/10 text-sky-500 border-sky-500/30'
              }`}
            >
              {sismo.status === 'Revisado' ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <Clock className="h-2.5 w-2.5" />
              )}
              {sismo.status}
            </span>
          )}
        </div>

        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center space-x-1 shrink-0 ${getMagnitudeBadge(
            sismo.magnitude
          )}`}
        >
          <Activity className="h-3 w-3" />
          <span>M {sismo.magnitude ?? 'N/A'}</span>
        </span>
      </div>

      {/* Detalle */}
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

      {/* Acciones de la tarjeta */}
      <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
        <span className="text-[11px] font-bold text-orange-500 hover:text-amber-500 flex items-center space-x-1 transition-colors group/btn">
          <Eye className="h-3.5 w-3.5" />
          <span>Ver en mapa</span>
          <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </span>

        <div className="flex items-center space-x-1">
          {sismo.status !== 'Revisado' && (
            <button
              type="button"
              disabled={isReviewing}
              onClick={(e) => onMarcarRevisado(currentReviewId, e)}
              title="Marcar como revisado"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400'
                  : 'hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600'
              }`}
            >
              {isReviewing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => onAbrirReferencias(sismo, e)}
            title="Gestionar referencia sísmica"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-blue-400'
                : 'hover:bg-blue-50 text-zinc-400 hover:text-blue-600'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(sismo);
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

          <button
            type="button"
            disabled={isDeleting}
            onClick={(e) => onDelete(sismo.id ?? rawId, e)}
            title="Eliminar sismo"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-red-400'
                : 'hover:bg-red-50 text-zinc-400 hover:text-red-500'
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
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const SismosList = ({
  events = [],
  selectedEvent,
  onSelectEvent,
  onEditEvent,
  onCreateEvent,
  onEventDeletedSuccess,
  isDark,
  isCollapsed,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);

  // Estado del modal de referencias
  const [referenciasModalOpen, setReferenciasModalOpen] = useState(false);
  const [sismoParaReferencias, setSismoParaReferencias] = useState(null);
  const [referencias, setReferencias] = useState([]);
  const [loadingReferencias, setLoadingReferencias] = useState(false);

  // Marcar un sismo como revisado
  const handleMarcarRevisado = async (id, e) => {
    e.stopPropagation();
    const numericId = parseNumericId(id);
    if (!numericId) return;

    try {
      setReviewingId(id);
      await sismosService.marcarRevisado(numericId);
      notificarCambioDeEstado();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'No se pudo marcar como revisado'
      );
    } finally {
      setReviewingId(null);
    }
  };

  // Abrir modal y consultar candidatos
  const handleAbrirReferencias = async (sismo, e) => {
    e.stopPropagation();
    const rawId = sismo.id ?? sismo.formatted_id;
    const sismoId = parseNumericId(rawId);

    if (!sismoId) {
      alert('No se pudo identificar el sismo.');
      return;
    }

    setSismoParaReferencias(sismo);
    setReferencias([]);
    setLoadingReferencias(true);
    setReferenciasModalOpen(true);

    try {
      const respuesta = await obtenerReferenciasSismo(sismoId);
      const candidatos = Array.isArray(respuesta)
        ? respuesta
        : respuesta?.referencias ?? [];

      setReferencias(candidatos);
    } catch (error) {
      console.error('Error cargando candidatos de referencia:', error);
      setReferencias([]);
      alert(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los candidatos de referencia.'
      );
    } finally {
      setLoadingReferencias(false);
    }
  };

  // Cerrar el modal
  const handleCerrarReferencias = () => {
    setReferenciasModalOpen(false);
    setSismoParaReferencias(null);
    setReferencias([]);
    setLoadingReferencias(false);
  };

  // Eliminar sismo
  const handleDeleteSismo = async (id, e) => {
    e.stopPropagation();
    if (id === null || id === undefined) return;

    const numericId = parseNumericId(id);
    if (!numericId) {
      alert('El ID del sismo no es válido.');
      return;
    }

    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar este evento sísmico?'
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await sismosService.delete(numericId);
      if (onEventDeletedSuccess) {
        onEventDeletedSuccess(id);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Error al eliminar el evento sísmico'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const safeEvents = Array.isArray(events) ? events.filter(Boolean) : [];

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={`px-4 py-3 border-b flex justify-between items-center ${
            isDark
              ? 'border-zinc-800/40 bg-zinc-900/20'
              : 'border-amber-100 bg-amber-50/30'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
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
                onClick={() => onCreateEvent?.()}
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

        {/* Lista de sismos */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {safeEvents.length === 0 ? (
            <div
              className={`text-center py-8 text-xs ${
                isDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              {!isCollapsed && 'No hay sismos registrados.'}
            </div>
          ) : (
            safeEvents.map((sismo, index) => {
              if (!sismo) return null;

              const rawId = sismo.id ?? sismo.formatted_id ?? `sismo-${index}`;
              const isSelected =
                selectedEvent &&
                (selectedEvent.id === sismo.id || selectedEvent.formatted_id === rawId);

              const isDeleting = deletingId === rawId || deletingId === sismo.id;
              const currentReviewId = sismo.id ?? rawId;
              const isReviewing = reviewingId === currentReviewId;

              return (
                <SismoCard
                  key={rawId}
                  sismo={sismo}
                  index={index}
                  isSelected={Boolean(isSelected)}
                  isDeleting={Boolean(isDeleting)}
                  isReviewing={Boolean(isReviewing)}
                  isDark={isDark}
                  isCollapsed={isCollapsed}
                  onSelect={onSelectEvent}
                  onMarcarRevisado={handleMarcarRevisado}
                  onAbrirReferencias={handleAbrirReferencias}
                  onEdit={onEditEvent}
                  onDelete={handleDeleteSismo}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Referencias */}
      <ReferenciasSismoModal
        isOpen={referenciasModalOpen}
        onClose={handleCerrarReferencias}
        sismo={sismoParaReferencias}
        referencias={referencias}
        loading={loadingReferencias}
        isDark={isDark}
      />
    </>
  );
};