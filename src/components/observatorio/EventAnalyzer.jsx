
import React from 'react';

import {
  Activity,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

import { DepthClassifier } from './DepthClassifier';

export const EventAnalyzer = ({
  event,
  isDark,
  onApprove,
  onReject,
  processing = false,
  decision = null,
}) => {

  /*
   * Cuando el reporte ya fue retirado de la cola,
   * event será null y mostramos el resultado de la operación.
   */
  if (!event) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center max-w-lg w-full">

          {decision ? (
            <div
              className={`p-7 rounded-3xl border backdrop-blur-2xl shadow-2xl ${
                decision.tipoVisual === 'success'
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-700/50 shadow-emerald-950/30'
                    : 'bg-emerald-50/90 border-emerald-300 shadow-emerald-200/30'
                  : decision.tipoVisual === 'warning'
                  ? isDark
                    ? 'bg-amber-950/40 border-amber-700/50 shadow-amber-950/30'
                    : 'bg-amber-50/90 border-amber-300 shadow-amber-200/30'
                  : isDark
                  ? 'bg-zinc-900/80 border-zinc-700 shadow-black/30'
                  : 'bg-white/90 border-zinc-300 shadow-zinc-200/30'
              }`}
            >

              {/* Icono */}
              <div
                className={`mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center ${
                  decision.tipoVisual === 'success'
                    ? isDark
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-emerald-100 text-emerald-600'
                    : decision.tipoVisual === 'warning'
                    ? isDark
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-amber-100 text-amber-600'
                    : isDark
                    ? 'bg-zinc-800 text-zinc-400'
                    : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {decision.tipoVisual === 'success' ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : decision.tipoVisual === 'warning' ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <Info className="w-8 h-8" />
                )}
              </div>

              {/* Etiqueta */}
              <p
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  decision.tipoVisual === 'success'
                    ? isDark
                      ? 'text-emerald-400'
                      : 'text-emerald-600'
                    : decision.tipoVisual === 'warning'
                    ? isDark
                      ? 'text-amber-400'
                      : 'text-amber-600'
                    : isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-500'
                }`}
              >
                {decision.tipoVisual === 'success'
                  ? 'OPERACIÓN COMPLETADA'
                  : decision.tipoVisual === 'warning'
                  ? 'REPORTE RETIRADO'
                  : 'RESULTADO'}
              </p>

              {/* Título */}
              <h2
                className={`text-xl font-black mt-3 ${
                  isDark
                    ? 'text-zinc-100'
                    : 'text-zinc-800'
                }`}
              >
                {decision.titulo || 'Reporte procesado'}
              </h2>

              {/* Motivo / detalle */}
              <p
                className={`text-sm mt-3 leading-relaxed ${
                  isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-600'
                }`}
              >
                {decision.mensaje}
              </p>

              {/* Estado de la cola */}
              <div
                className={`mt-6 pt-5 border-t ${
                  isDark
                    ? 'border-zinc-800'
                    : 'border-zinc-200'
                }`}
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    decision.tipoVisual === 'success'
                      ? isDark
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-emerald-100 text-emerald-700'
                      : decision.tipoVisual === 'warning'
                      ? isDark
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-amber-100 text-amber-700'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {decision.tipoVisual === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}

                  <span>
                    Reporte retirado de la cola
                  </span>
                </div>
              </div>

              {/* Información adicional */}
              <p
                className={`text-[10px] mt-4 uppercase tracking-wider ${
                  isDark
                    ? 'text-zinc-600'
                    : 'text-zinc-400'
                }`}
              >
                Selecciona otro reporte de la cola para continuar.
              </p>

            </div>
          ) : (
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-widest ${
                  isDark
                    ? 'text-zinc-600'
                    : 'text-zinc-400'
                }`}
              >
                Selecciona un reporte de la cola para analizar.
              </p>
            </div>
          )}

        </div>
      </div>
    );
  }

  const eventId =
    event.formatted_id ||
    `SIS-${String(event.sismo_id).padStart(6, '0')}`;

  const station =
    event.station_id ||
    event.stationId ||
    'N/A';

  const revision = event.revision ?? 'N/A';

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">

      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Tarjeta principal */}
        <div
          className={`p-7 rounded-3xl border transition-all duration-500 backdrop-blur-2xl relative overflow-hidden ${
            isDark
              ? 'bg-zinc-900/50 border-zinc-800/80 shadow-2xl shadow-black/50'
              : 'bg-white/80 border-amber-200/60 shadow-xl shadow-orange-500/5'
          }`}
        >

          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">

            <div>

              <span className="text-[10px] font-mono font-black tracking-widest text-orange-500 uppercase bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                ANALIZADOR HIPOCENTRAL
              </span>

              <h1
                className={`text-2xl font-black tracking-tight mt-3 ${
                  isDark
                    ? 'text-zinc-100'
                    : 'text-zinc-800'
                }`}
              >
                {event.location}
              </h1>

              {/* Detalles del Reporte */}
              <div
                className={`text-xs font-mono mt-3 space-y-1.5 ${
                  isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-500'
                }`}
              >

                <p className="flex items-center gap-2">
                  <span>ID Evento:</span>

                  <span
                    className={`font-bold ${
                      isDark
                        ? 'text-zinc-200'
                        : 'text-zinc-800'
                    }`}
                  >
                    {eventId}
                  </span>
                </p>

                <p className="flex items-center gap-2">
                  <span>Estación Emisora:</span>

                  <span
                    className={`font-bold ${
                      isDark
                        ? 'text-zinc-200'
                        : 'text-zinc-800'
                    }`}
                  >
                    {station}
                  </span>
                </p>

                <p className="flex items-center gap-2">
                  <span>Revisión:</span>

                  <span
                    className={`font-bold ${
                      isDark
                        ? 'text-amber-400'
                        : 'text-orange-600'
                    }`}
                  >
                    #{revision}
                  </span>
                </p>

                <p className="flex items-center gap-2">
                  <span>Hora de Arribo:</span>

                  <span
                    className={
                      isDark
                        ? 'font-semibold text-zinc-300'
                        : 'font-semibold text-zinc-600'
                    }
                  >
                    {event.timestamp}
                  </span>
                </p>

              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-start">

              <button
                type="button"
                onClick={() => onReject(event.id)}
                disabled={processing}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-2 active:scale-95 shadow-sm ${
                  processing
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  isDark
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50'
                    : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-4 h-4" />

                <span>
                  Descartar Ruido
                </span>
              </button>

              <button
                type="button"
                onClick={() => onApprove(event.id)}
                disabled={processing}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 flex items-center gap-2 active:scale-95 ring-2 ring-orange-400/20 ${
                  processing
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />

                <span>
                  Validar y Emitir Reporte
                </span>
              </button>

            </div>
          </div>

          {/* Decisión tomada mientras el reporte todavía está visible */}
          {decision && (
            <div
              className={`mb-6 p-4 rounded-2xl border ${
                decision.tipoVisual === 'success'
                  ? isDark
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-emerald-50 border-emerald-200'
                  : decision.tipoVisual === 'warning'
                  ? isDark
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-amber-50 border-amber-200'
                  : isDark
                  ? 'bg-zinc-800/50 border-zinc-700'
                  : 'bg-zinc-100 border-zinc-200'
              }`}
            >

              <div className="flex items-start gap-3">

                {decision.tipoVisual === 'success' ? (
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                    }`}
                  />
                ) : decision.tipoVisual === 'warning' ? (
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isDark
                        ? 'text-amber-400'
                        : 'text-amber-600'
                    }`}
                  />
                ) : (
                  <Info
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isDark
                        ? 'text-zinc-400'
                        : 'text-zinc-500'
                    }`}
                  />
                )}

                <div>

                  <p
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      decision.tipoVisual === 'success'
                        ? isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-600'
                        : decision.tipoVisual === 'warning'
                        ? isDark
                          ? 'text-amber-400'
                          : 'text-amber-600'
                        : isDark
                        ? 'text-zinc-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    Decisión tomada
                  </p>

                  <p
                    className={`text-sm font-bold mt-1 ${
                      isDark
                        ? 'text-zinc-100'
                        : 'text-zinc-800'
                    }`}
                  >
                    {decision.titulo || decision.tipo}
                  </p>

                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isDark
                        ? 'text-zinc-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {decision.mensaje}
                  </p>

                </div>
              </div>
            </div>
          )}

          {/* Tarjetas de Métricas */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t ${
              isDark
                ? 'border-zinc-800/80'
                : 'border-amber-200/60'
            }`}
          >

            {/* Magnitud */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                isDark
                  ? 'bg-zinc-950/60 border-zinc-800/80 shadow-inner'
                  : 'bg-amber-50/60 border-amber-200/80'
              }`}
            >

              <div>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    isDark
                      ? 'text-zinc-500'
                      : 'text-zinc-400'
                  }`}
                >
                  Magnitud Calculada
                </span>

                <p className="text-3xl font-black text-amber-500 mt-1 tracking-tight">
                  {event.magnitude}{' '}

                  <span className="text-xs font-medium text-zinc-400">
                    M_L
                  </span>
                </p>

              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Activity className="w-7 h-7 text-amber-500" />
              </div>

            </div>

            {/* Profundidad */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                isDark
                  ? 'bg-zinc-950/60 border-zinc-800/80 shadow-inner'
                  : 'bg-amber-50/60 border-amber-200/80'
              }`}
            >

              <div>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    isDark
                      ? 'text-zinc-500'
                      : 'text-zinc-400'
                  }`}
                >
                  Profundidad del Hipocentro
                </span>

                <p className="text-3xl font-black text-orange-500 mt-1 tracking-tight">
                  {event.depthKm}{' '}

                  <span className="text-xs font-medium text-zinc-400">
                    km
                  </span>
                </p>

              </div>

              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <ArrowDown className="w-7 h-7 text-orange-500" />
              </div>

            </div>

          </div>
        </div>

        <DepthClassifier
          depthKm={event.depthKm}
          isDark={isDark}
        />

      </div>
    </main>
  );
};

