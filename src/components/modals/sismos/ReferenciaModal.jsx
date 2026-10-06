import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Loader2,
  Link2,
  MapPin,
  Activity,
  AlertCircle,
  Ruler,
  Check,
  Sparkles,
  RefreshCw,
  Compass,
} from 'lucide-react';

import {
  guardarReferenciaSismo,
  obtenerReferenciaActual,
} from '../../../services/ReferenciaService';

const parseNumericId = (id) => {
  if (id === null || id === undefined) return null;

  const parsed =
    typeof id === 'string'
      ? parseInt(id.replace(/\D/g, ''), 10)
      : Number(id);

  return Number.isNaN(parsed) ? null : parsed;
};

export const ReferenciasSismoModal = ({
  isOpen,
  onClose,
  sismo,
  referencias = [],
  referenciaActual: propReferenciaActual = null,
  loading = false,
  isDark = false,
}) => {
  const [selectedReferenciaId, setSelectedReferenciaId] = useState(null);
  const [referenciaActual, setReferenciaActual] = useState(propReferenciaActual);
  const [loadingActual, setLoadingActual] = useState(false);
  const [saving, setSaving] = useState(false);

  const rawSismoId = sismo?.id ?? sismo?.formatted_id;
  const sismoId = parseNumericId(rawSismoId);

  // 📡 Función para consultar la referencia actual al servicio
  const fetchReferenciaActual = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoadingActual(true);
      const res = await obtenerReferenciaActual(id);
      if (res) {
        setReferenciaActual(res);
        setSelectedReferenciaId(res.referencia_id ?? res.id ?? null);
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener la referencia actual desde la API:', error);
      setReferenciaActual(propReferenciaActual);
    } finally {
      setLoadingActual(false);
    }
  }, [propReferenciaActual]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedReferenciaId(null);
      setReferenciaActual(null);
      return;
    }

    if (propReferenciaActual) {
      setReferenciaActual(propReferenciaActual);
      setSelectedReferenciaId(
        propReferenciaActual.referencia_id ?? propReferenciaActual.id ?? null
      );
    }

    if (sismoId) {
      fetchReferenciaActual(sismoId);
    }
  }, [isOpen, sismoId, propReferenciaActual, fetchReferenciaActual]);

  if (!isOpen) return null;

  const location =
    sismo?.location ||
    sismo?.epicenter ||
    sismo?.refRegion ||
    'Evento Sísmico';

  const magnitude = sismo?.magnitude;
  const referenciaActualId = referenciaActual?.referencia_id ?? referenciaActual?.id ?? null;

  const handleSeleccionarReferencia = (referenciaId) => {
    if (saving) return;

    setSelectedReferenciaId((prev) =>
      prev === referenciaId ? null : referenciaId
    );
  };

  const handleGuardarReferencia = async () => {
    if (!sismoId) {
      alert('No se pudo identificar el sismo.');
      return;
    }

    if (selectedReferenciaId === null) {
      alert('Selecciona un sismo de referencia.');
      return;
    }

    if (
      referenciaActualId !== null &&
      selectedReferenciaId === referenciaActualId
    ) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await guardarReferenciaSismo(sismoId, selectedReferenciaId);
      await fetchReferenciaActual(sismoId);
      onClose();
    } catch (error) {
      console.error('❌ Error guardando referencia:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la referencia.'
      );
    } finally {
      setSaving(false);
    }
  };

  const theme = {
    overlay: isDark ? 'bg-zinc-950/80' : 'bg-zinc-900/40',
    modal: isDark
      ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-emerald-950/10'
      : 'bg-white/95 border-zinc-200 text-zinc-800 shadow-xl',
    border: isDark ? 'border-zinc-800/80' : 'border-zinc-200/80',
    textSub: isDark ? 'text-zinc-400' : 'text-zinc-500',
    textMuted: isDark ? 'text-zinc-500' : 'text-zinc-400',
    badge: isDark
      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      : 'bg-blue-50 text-blue-600 border border-blue-200',
    closeBtn: isDark
      ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
      : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700',
    footer: isDark
      ? 'border-zinc-800/80 bg-zinc-950/50'
      : 'border-zinc-200/80 bg-zinc-50/80',
    cancelBtn: isDark
      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200',
  };

  const isSaveDisabled =
    selectedReferenciaId === null ||
    saving ||
    (referenciaActualId !== null && selectedReferenciaId === referenciaActualId);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className={`absolute inset-0 ${theme.overlay}`} />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border backdrop-blur-md shadow-2xl transition-all ${theme.modal}`}
      >
        {/* HEADER */}
        <div className={`px-6 py-5 border-b ${theme.border}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 ${theme.badge}`}
              >
                <Link2 className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">
                    Referencia del Sismo
                  </h2>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      isDark
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    #{sismoId || 'N/A'}
                  </span>
                </div>

                {/* ATRIBUTOS DEL SISMO + INDICADOR DE REFERENCIA ACTUAL */}
                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-xs ${theme.textSub}`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    {String(location)}
                  </span>

                  {magnitude !== undefined && magnitude !== null && (
                    <span className="flex items-center gap-1.5 font-semibold text-amber-500">
                      <Activity className="h-3.5 w-3.5" />
                      M {magnitude}
                    </span>
                  )}

                  {/* 🟢 INDICADOR DE REFERENCIA ACTUAL */}
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors ${
                      referenciaActualId
                        ? isDark
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isDark
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                    }`}
                  >
                    <Sparkles
                      className={`h-3 w-3 ${
                        referenciaActualId ? 'text-emerald-500' : 'text-zinc-400'
                      }`}
                    />
                    Ref. actual:{' '}
                    <strong className="font-bold">
                      {referenciaActualId ? `#${referenciaActualId}` : 'Sin asignar'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              title="Cerrar modal"
              disabled={saving}
              className={`p-2 rounded-xl transition-all duration-200 ${theme.closeBtn}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading || loadingActual ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-9 w-9 animate-spin text-blue-500" />
              <p className={`mt-3 text-xs font-medium ${theme.textSub}`}>
                Cargando referencias sísmicas...
              </p>
            </div>
          ) : (
            <>
              {/* 1. TARJETA DETALLADA DE LA REFERENCIA ACTUAL */}
              {referenciaActual ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme.textSub}`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      Referencia Activa
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isDark
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ASIGNADA
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 transition-all ${
                      isDark
                        ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                        : 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>

                        <div className="min-w-0">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isDark ? 'text-zinc-100' : 'text-zinc-800'
                            }`}
                          >
                            Sismo #{referenciaActual.referencia_id ?? referenciaActual.id}
                          </h3>
                          <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
                            Este sismo sirve como punto de comparación patrón.
                          </p>
                        </div>
                      </div>

                      {referenciaActual.distancia !== undefined && (
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-1 text-sm font-black text-amber-500">
                            <Ruler className="h-4 w-4" />
                            {Number(referenciaActual.distancia).toFixed(2)} km
                          </div>
                          <span
                            className={`text-[10px] font-medium uppercase tracking-wider ${theme.textMuted}`}
                          >
                            Distancia
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-2xl border border-dashed flex items-center gap-3 ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-950/40 text-zinc-400'
                      : 'border-zinc-200 bg-zinc-50/50 text-zinc-500'
                  }`}
                >
                  <Compass className="h-5 w-5 text-zinc-400 shrink-0" />
                  <p className="text-xs">
                    Este sismo aún <strong>no tiene</strong> una referencia asignada. Selecciona una de la lista de candidatos a continuación.
                  </p>
                </div>
              )}

              {/* 2. LISTA DE CANDIDATOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${theme.textSub}`}
                  >
                    {referenciaActual
                      ? 'Cambiar por otro candidato'
                      : 'Candidatos Disponibles'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badge}`}
                  >
                    {referencias.length} disponibles
                  </span>
                </div>

                {referencias.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-zinc-700/50">
                    <div
                      className={`p-3 rounded-2xl ${
                        isDark
                          ? 'bg-zinc-800/80 text-zinc-400'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold">
                      No hay candidatos cercanos
                    </h3>
                    <p className={`mt-1 max-w-xs text-xs ${theme.textMuted}`}>
                      No se encontraron eventos sísmicos cercanos que cumplan
                      los criterios de referencia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {referencias.map((referencia, index) => {
                      const isSelected = selectedReferenciaId === referencia.id;
                      const isCurrent = referenciaActualId === referencia.id;

                      let cardStyle = isDark
                        ? 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70'
                        : 'bg-zinc-50/80 border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30';

                      if (isSelected) {
                        cardStyle = isDark
                          ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50'
                          : 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20';
                      } else if (isCurrent) {
                        cardStyle = isDark
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-emerald-300 bg-emerald-50/40';
                      }

                      return (
                        <button
                          type="button"
                          key={referencia.id ?? `ref-${index}`}
                          onClick={() => handleSeleccionarReferencia(referencia.id)}
                          disabled={saving}
                          className={`w-full text-left rounded-2xl border p-4 transition-all duration-150 active:scale-[0.99] ${cardStyle}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white scale-110'
                                    : isCurrent
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : isDark
                                    ? 'border-zinc-600 bg-zinc-800'
                                    : 'border-zinc-300 bg-white'
                                }`}
                              >
                                {(isSelected || isCurrent) && (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`text-sm font-bold ${
                                      isDark ? 'text-zinc-100' : 'text-zinc-800'
                                    }`}
                                  >
                                    Sismo #{referencia.id}
                                  </h3>
                                  {isCurrent && (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 uppercase tracking-wide">
                                      Actual
                                    </span>
                                  )}
                                </div>

                                <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                                  {isCurrent
                                    ? 'Referencia activa configurada'
                                    : isSelected
                                    ? 'Seleccionado para guardar'
                                    : 'Candidato disponible'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                  <Activity className="h-3.5 w-3.5" />
                                  M {referencia.magnitud}
                                </span>
                              </div>

                              <div className="text-right border-l pl-3 border-zinc-700/30">
                                <span
                                  className={`flex items-center gap-1 text-xs font-bold ${
                                    isDark ? 'text-zinc-200' : 'text-zinc-700'
                                  }`}
                                >
                                  <Ruler className="h-3.5 w-3.5 text-blue-500" />
                                  {Number(referencia.distancia).toFixed(2)} km
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div
          className={`px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${theme.footer}`}
        >
          <div className="flex items-center gap-2 text-xs">
            {selectedReferenciaId !== null ? (
              <span className="flex items-center gap-1.5 font-medium text-blue-500">
                <Check className="h-4 w-4" />
                Seleccionado: Sismo #{selectedReferenciaId}
              </span>
            ) : (
              <span className={theme.textMuted}>
                Ninguna referencia seleccionada
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${theme.cancelBtn}`}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGuardarReferencia}
              disabled={isSaveDisabled}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSaveDisabled
                  ? isDark
                    ? 'bg-zinc-800 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25 active:scale-95'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {referenciaActual ? 'Cambiar referencia' : 'Establecer referencia'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};