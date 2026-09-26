import React, { useCallback, useEffect, useState } from 'react';
import {
  X,
  RadioTower,
  MapPin,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers
} from 'lucide-react';

import { sismosService } from '../../services/SismosServices';

/**
 * Extrae y normaliza el identificador numérico de un objeto de sismo.
 *
 * @param {Object} sismo - Objeto que representa el evento sísmico.
 * @param {number|string} [sismo.numericId] - ID numérico explícito.
 * @param {number|string} sismo.id - Identificador único principal.
 * @returns {number} ID numérico del sismo.
 */
const getSismoNumericId = (sismo) => {
  if (sismo.numericId) return Number(sismo.numericId);

  if (typeof sismo.id === 'string') {
    return parseInt(sismo.id.replace(/\D/g, ''), 10);
  }

  return Number(sismo.id);
};

/**
 * Panel lateral para la visualización de métricas de una estación sísmica
 * y gestión de la emisión de reportes con asignación manual de revisión.
 *
 * @param {Object} props
 * @param {Object} props.station - Datos de la estación seleccionada.
 * @param {string} props.station.id - ID único de la estación.
 * @param {string} props.station.name - Nombre de la estación.
 * @param {string} props.station.status - Estado operativo ('activa', etc.).
 * @param {number|string} props.station.lat - Latitud geográfica.
 * @param {number|string} props.station.lon - Longitud geográfica.
 * @param {number|string} props.station.coverage - Cobertura en kilómetros.
 * @param {string} [props.station.dept] - Departamento o región.
 * @param {'dark'|'light'} props.theme - Tema visual activo.
 * @param {Function} props.onClose - Callback para cerrar el panel.
 */
export const StationDetailPanel = ({ station, theme, onClose }) => {
  // Estados de datos y carga
  const [sismos, setSismos] = useState([]);
  const [loadingSismos, setLoadingSismos] = useState(false);
  const [reportingId, setReportingId] = useState(null);
  const [reportMessage, setReportMessage] = useState(null);

  // Estados para la gestión del formulario de reporte
  const [sismoParaReportar, setSismoParaReportar] = useState(null);
  const [revisionReporte, setRevisionReporte] = useState('');

  // Variables calculadas
  const isDark = theme === 'dark';
  const isActive = station?.status === 'activa';
  const lat = Number(station?.lat);
  const lon = Number(station?.lon);
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Consulta el servicio de sismos para refrescar la lista de eventos disponibles.
   *
   * @param {boolean} [mostrarLoading=false] - Indica si activa el spinner global.
   */
  const cargarSismos = useCallback(async (mostrarLoading = false) => {
    try {
      if (mostrarLoading) setLoadingSismos(true);

      const data = await sismosService.getAll();
      const lista = Array.isArray(data) ? data : data?.sismos || [];

      setSismos(lista);
    } catch (error) {
      console.error('Error cargando sismos:', error);

      if (mostrarLoading) {
        setSismos([]);
        setReportMessage({
          type: 'error',
          text: 'No se pudieron cargar los sismos.'
        });
      }
    } finally {
      if (mostrarLoading) setLoadingSismos(false);
    }
  }, []);

  // Carga inicial y actualización periódica (polling cada 3 segundos)
  useEffect(() => {
    if (!station) return;

    cargarSismos(true);

    const intervalId = setInterval(() => {
      cargarSismos(false);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [station, cargarSismos]);

  /**
   * Selecciona un sismo y abre el formulario para asignar el número de revisión.
   *
   * @param {Object} sismo - Evento sísmico seleccionado.
   */
  const prepararReporte = (sismo) => {
    setSismoParaReportar(sismo);
    setRevisionReporte(
      sismo.revision !== undefined && sismo.revision !== null
        ? String(sismo.revision)
        : ''
    );
    setReportMessage(null);
  };

  /**
   * Cancela la selección del sismo y limpia el formulario de reporte.
   */
  const cancelarReporte = () => {
    setSismoParaReportar(null);
    setRevisionReporte('');
  };

  /**
   * Valida los parámetros y realiza la petición HTTP POST para registrar el reporte.
   *
   * @param {Object} sismo - Evento sísmico a reportar.
   * @param {string|number} revision - Valor de la revisión especificado por el usuario.
   */
  const reportarSismo = async (sismo, revision) => {
    try {
      setReportingId(sismo.id);
      setReportMessage(null);

      const revisionNumerica = Number(revision);

      if (!Number.isInteger(revisionNumerica) || revisionNumerica <= 0) {
        throw new Error('La revisión debe ser un número entero mayor que cero.');
      }

      const payload = {
        sismo_id: getSismoNumericId(sismo),
        station_id: station.id,
        magnitude: Number(sismo.magnitude),
        depth: Number(sismo.depth),
        epicenter_x: Number(sismo.epicenter_x ?? sismo.lon ?? sismo.x),
        epicenter_y: Number(sismo.epicenter_y ?? sismo.lat ?? sismo.y),
        timestamp: sismo.timestamp || new Date().toISOString(),
        revision: revisionNumerica
      };

      const response = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'No se pudo reportar el sismo.'
        );
      }

      // Actualización reactiva del estado local
      const sismoActualizado = data?.sismo;

      if (sismoActualizado) {
        const updatedId = getSismoNumericId(sismoActualizado);

        setSismos((listaActual) =>
          listaActual.map((item) =>
            getSismoNumericId(item) === updatedId
              ? { ...item, ...sismoActualizado }
              : item
          )
        );
      }

      setReportMessage({
        type: 'success',
        text: 'Reporte registrado exitosamente.'
      });

      cancelarReporte();
      await cargarSismos(false);
    } catch (error) {
      console.error('Error reportando sismo:', error);

      setReportMessage({
        type: 'error',
        text: error.message || 'Error al enviar el reporte.'
      });
    } finally {
      setReportingId(null);
    }
  };

  if (!station) return null;

  return (
    <aside
      className={`fixed top-16 right-0 bottom-0 w-85 sm:w-96 border-l z-30 transition-all duration-300 backdrop-blur-2xl flex flex-col shadow-2xl ${
        isDark
          ? 'bg-zinc-950/95 border-zinc-800/80 text-zinc-100 shadow-black/60'
          : 'bg-white/95 border-zinc-200/80 text-zinc-800 shadow-2xl shadow-orange-950/5'
      }`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER: Métricas operativas e información de la estación          */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={`p-5 border-b relative overflow-hidden ${
          isDark
            ? 'border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 to-zinc-950/40'
            : 'border-zinc-200/60 bg-gradient-to-b from-orange-50/40 to-white'
        }`}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-2xl border transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : isDark
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-rose-50 border-rose-200 text-rose-600'
              }`}
            >
              <RadioTower className="w-5 h-5" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 block">
                {station.dept || 'Estación'}
              </span>

              <h2 className="font-extrabold text-base leading-tight tracking-tight">
                {station.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white active:scale-95'
                : 'hover:bg-zinc-100 text-zinc-500 active:scale-95'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indicadores rápidos */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-500/10 text-[11px]">
          {/* Estado */}
          <div
            className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg border font-bold uppercase ${
              isActive
                ? isDark
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : isDark
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {isActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>

            <span className="text-[10px] truncate">{station.status}</span>
          </div>

          {/* Coordenadas */}
          <div
            className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg border font-mono ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                : 'bg-zinc-100/80 border-zinc-200/80 text-zinc-600'
            }`}
          >
            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
            <span className="truncate">
              {!isNaN(lat) ? lat.toFixed(2) : '0'}°, {!isNaN(lon) ? lon.toFixed(2) : '0'}°
            </span>
          </div>

          {/* Cobertura */}
          <div
            className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg border font-medium ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                : 'bg-zinc-100/80 border-zinc-200/80 text-zinc-600'
            }`}
          >
            <Activity className="w-3 h-3 text-orange-500 shrink-0" />
            <span>{station.coverage} km</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PANEL DE EVENTOS: Formularios, estado de red y lista de sismos     */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {/* Cabecera del listado */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-orange-500/10 text-orange-500">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Eventos Disponibles
            </h3>
          </div>

          <span
            className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
              isDark
                ? 'bg-zinc-900 text-orange-400 border border-zinc-800'
                : 'bg-orange-50 text-orange-600 border border-orange-200/60'
            }`}
          >
            {sismos.length}
          </span>
        </div>

        {/* Mensajes de notificación */}
        {reportMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 ${
              reportMessage.type === 'success'
                ? isDark
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : isDark
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {reportMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}

            <span className="flex-1">{reportMessage.text}</span>
          </div>
        )}

        {/* Formulario de preparación de reporte */}
        {sismoParaReportar && (
          <div
            className={`p-4 rounded-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800'
                : 'bg-orange-50/50 border-orange-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                  Reportar sismo
                </p>
                <p className="text-sm font-bold mt-1">
                  {sismoParaReportar.formatted_id ||
                    `SIS-${String(getSismoNumericId(sismoParaReportar)).padStart(6, '0')}`}
                </p>
              </div>

              <button
                type="button"
                onClick={cancelarReporte}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-zinc-800 text-zinc-400'
                    : 'hover:bg-zinc-100 text-zinc-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">
              Revisión del reporte
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={revisionReporte}
              onChange={(e) => setRevisionReporte(e.target.value)}
              placeholder="Ej: 1"
              className={`w-full px-3 py-2.5 rounded-xl border outline-none text-sm font-bold transition-all ${
                isDark
                  ? 'bg-zinc-950 border-zinc-700 text-zinc-100 focus:border-orange-500'
                  : 'bg-white border-zinc-200 text-zinc-800 focus:border-orange-400'
              }`}
            />

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={cancelarReporte}
                className={`flex-1 px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border transition-all ${
                  isDark
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={
                  reportingId !== null ||
                  revisionReporte === '' ||
                  !Number.isInteger(Number(revisionReporte)) ||
                  Number(revisionReporte) <= 0
                }
                onClick={() => reportarSismo(sismoParaReportar, revisionReporte)}
                className={`flex-1 px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-all ${
                  reportingId !== null ||
                  revisionReporte === '' ||
                  !Number.isInteger(Number(revisionReporte)) ||
                  Number(revisionReporte) <= 0
                    ? 'bg-zinc-700 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-95 shadow-md shadow-orange-500/20'
                }`}
              >
                {reportingId !== null ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Reportar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Estado de Carga / Vacío / Lista de Sismos */}
        {loadingSismos ? (
          <div
            className={`py-12 rounded-2xl border flex flex-col items-center justify-center gap-3 ${
              isDark
                ? 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500'
                : 'bg-zinc-50/50 border-zinc-200/60 text-zinc-500'
            }`}
          >
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-xs font-medium">Sincronizando sismos...</span>
          </div>
        ) : sismos.length === 0 ? (
          <div
            className={`py-10 px-4 rounded-2xl border text-center text-xs ${
              isDark
                ? 'bg-zinc-900/20 border-zinc-800/40 text-zinc-500'
                : 'bg-zinc-50/50 border-zinc-200/60 text-zinc-500'
            }`}
          >
            No hay eventos sísmicos pendientes de reporte.
          </div>
        ) : (
          <div className="space-y-2">
            {sismos.map((sismo) => {
              const sismoId = getSismoNumericId(sismo);
              const isReporting = reportingId === sismo.id;

              return (
                <div
                  key={sismo.id}
                  className={`group relative p-3.5 rounded-2xl border transition-all duration-200 ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800/80 hover:border-orange-500/40 hover:bg-zinc-900/90'
                      : 'bg-white border-zinc-200/80 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono tracking-tight">
                          {sismo.formatted_id ||
                            `SIS-${String(sismoId).padStart(6, '0')}`}
                        </span>

                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-500 border border-orange-500/20">
                          M {sismo.magnitude}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          Prof:
                          <strong
                            className={isDark ? 'text-zinc-200' : 'text-zinc-700'}
                          >
                            {sismo.depth} km
                          </strong>
                        </span>

                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-zinc-500" />
                          <strong
                            className={isDark ? 'text-zinc-200' : 'text-zinc-700'}
                          >
                            #{sismo.revision ?? 0}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isReporting}
                      onClick={() => prepararReporte(sismo)}
                      className={`shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider text-white transition-all flex items-center gap-1.5 ${
                        isReporting
                          ? 'bg-zinc-700 cursor-not-allowed opacity-80'
                          : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-95 shadow-md shadow-orange-500/20'
                      }`}
                    >
                      {isReporting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Enviando</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Reportar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};