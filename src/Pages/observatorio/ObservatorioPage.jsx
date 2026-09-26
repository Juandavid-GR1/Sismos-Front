
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Navbar } from '../../components/Navbar';
import { EventAnalyzer } from '../../components/observatorio/EventAnalyzer';
import { EventQueue } from '../../components/observatorio/EventQueue';
import { MetricBar } from '../../components/observatorio/MetricBar';
import { ModoAutomaticoModal } from '../../components/modals/observatorio/ModoAutomaticoModal';

import {
  descartarReporte,
  obtenerColaReportes,
  validarYEmitirReporte,
} from '../../services/colaReportesService';

import {
  iniciarModoAutomatico,
  detenerModoAutomatico,
} from '../../services/ModoAutoService';

/**
 * Transforma la estructura de un reporte provisto por el backend
 * al formato uniforme consumido por los componentes visuales.
 *
 * IMPORTANTE:
 * El id NO utiliza el index, porque el index cambia
 * cuando un reporte sale de la cola.
 */
const adaptarReporte = (reporte) => {
  const urgency =
    reporte.magnitude >= 5
      ? 'high'
      : reporte.magnitude >= 3
      ? 'medium'
      : 'low';

  return {
    id: `SISMO-${reporte.sismo_id}-${reporte.station_id}-${reporte.revision}`,

    sismo_id: reporte.sismo_id,

    formatted_id:
      reporte.formatted_id ??
      `SIS-${String(reporte.sismo_id).padStart(6, '0')}`,

    revision: reporte.revision,

    station_id: reporte.station_id,

    detectedBy: [reporte.station_id],

    magnitude: reporte.magnitude,

    depthKm: reporte.depth,

    depth: reporte.depth,

    location: `Epicentro: ${reporte.epicenter_y}, ${reporte.epicenter_x}`,

    timestamp: new Date(
      reporte.timestamp
    ).toLocaleTimeString(),

    epicenter_x: reporte.epicenter_x,

    epicenter_y: reporte.epicenter_y,

    originalTimestamp: reporte.timestamp,

    urgency,
  };
};

/**
 * Convierte las decisiones internas del backend
 * en mensajes comprensibles para el usuario.
 */
const obtenerMensajeDecision = (
  decision,
  detalle
) => {
  switch (decision) {
    case 'correccion':
      return {
        titulo: 'Reporte procesado correctamente',
        mensaje:
          detalle ||
          'Se aplicó una corrección al evento sísmico.',
        tipo: 'success',
      };

    case 'confirmacion':
      return {
        titulo: 'Reporte confirmado',
        mensaje:
          detalle ||
          'El reporte confirma la información existente del evento.',
        tipo: 'success',
      };

    case 'reporte_antiguo':
      return {
        titulo: 'Reporte inválido para reportar',
        mensaje:
          detalle ||
          'El reporte corresponde a una revisión anterior y fue rechazado.',
        tipo: 'warning',
      };

    case 'conflicto':
      return {
        titulo: 'Reporte inválido para reportar',
        mensaje:
          detalle ||
          'El reporte entra en conflicto con la información registrada para esta revisión.',
        tipo: 'warning',
      };

    case 'ruido':
      return {
        titulo: 'Reporte descartado',
        mensaje:
          detalle ||
          'El reporte fue descartado como ruido instrumental.',
        tipo: 'warning',
      };

    default:
      return {
        titulo: 'Reporte procesado',
        mensaje:
          detalle ||
          'El reporte fue procesado por el sistema.',
        tipo: 'info',
      };
  }
};

export const ObservatorioPage = () => {
  // ---------------------------------------------------------
  // CONFIGURACIÓN Y TEMA
  // ---------------------------------------------------------

  const [theme, setTheme] = useState('dark');

  const [stressMode, setStressMode] =
    useState(false);

  // ---------------------------------------------------------
  // DATOS DE EVENTOS
  // ---------------------------------------------------------

  const [pendingEvents, setPendingEvents] =
    useState([]);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [decision, setDecision] =
    useState(null);

  // ---------------------------------------------------------
  // ESTADOS DE OPERACIÓN
  // ---------------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState(null);

  // ---------------------------------------------------------
  // MODO AUTOMÁTICO
  // ---------------------------------------------------------

  const [modoAutomatico, setModoAutomatico] =
    useState(false);

  const [
    mostrarModalAutomatico,
    setMostrarModalAutomatico,
  ] = useState(false);

  const [
    intervaloAutomatico,
    setIntervaloAutomatico,
  ] = useState(3);

  const isDark = theme === 'dark';

  // ---------------------------------------------------------
  // CARGAR COLA
  // ---------------------------------------------------------

  /**
   * Carga la cola desde el backend.
   *
   * seleccionarPrimero:
   * - true  -> selecciona el primer reporte.
   * - false -> solamente actualiza la lista.
   *
   * mostrarLoading:
   * - true  -> muestra el overlay inicial.
   * - false -> actualiza silenciosamente.
   */
  const cargarCola = useCallback(
    async (
      seleccionarPrimero = true,
      mostrarLoading = true
    ) => {
      try {
        if (mostrarLoading) {
          setLoading(true);
        }

        setError(null);

        const cola =
          await obtenerColaReportes();

        const eventosAdaptados =
          cola.map(adaptarReporte);

        setPendingEvents(
          eventosAdaptados
        );

        if (seleccionarPrimero) {
          setSelectedEvent(
            eventosAdaptados[0] || null
          );
        }
      } catch (err) {
        console.error(
          'Error al cargar la cola de reportes:',
          err
        );

        setError(
          err.message ||
            'No se pudo cargar la cola de reportes.'
        );
      } finally {
        if (mostrarLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  // ---------------------------------------------------------
  // CARGA INICIAL
  // ---------------------------------------------------------

  useEffect(() => {
    cargarCola(true);
  }, [cargarCola]);

  // ---------------------------------------------------------
  // RECHAZAR REPORTE
  // ---------------------------------------------------------

  const handleReject = async () => {
    if (!selectedEvent || processing) {
      return;
    }

    try {
      setProcessing(true);
      setDecision(null);
      setError(null);

      const resultado =
        await descartarReporte();

      const decisionFormateada =
        obtenerMensajeDecision(
          resultado.decision || 'ruido',
          resultado.detalle_decision ||
            resultado.mensaje
        );

      setDecision({
        tipo:
          resultado.decision || 'ruido',

        titulo:
          decisionFormateada.titulo,

        mensaje:
          decisionFormateada.mensaje,

        tipoVisual:
          decisionFormateada.tipo,
      });

      setSelectedEvent(null);

      // Actualizamos la cola sin overlay
      await cargarCola(false, false);
    } catch (err) {
      console.error(
        'Error al descartar el reporte:',
        err
      );

      setError(
        err.message ||
          'Ocurrió un error al descartar el reporte.'
      );
    } finally {
      setProcessing(false);
    }
  };

  // ---------------------------------------------------------
  // APROBAR / EMITIR REPORTE
  // ---------------------------------------------------------

  const handleApprove = async () => {
    if (!selectedEvent || processing) {
      return;
    }

    try {
      setProcessing(true);
      setDecision(null);
      setError(null);

      const resultado =
        await validarYEmitirReporte();

      const decisionFormateada =
        obtenerMensajeDecision(
          resultado.decision,
          resultado.detalle_decision ||
            resultado.mensaje
        );

      setDecision({
        tipo: resultado.decision,

        titulo:
          decisionFormateada.titulo,

        mensaje:
          decisionFormateada.mensaje,

        tipoVisual:
          decisionFormateada.tipo,
      });

      setSelectedEvent(null);

      // Actualizamos la cola sin overlay
      await cargarCola(false, false);
    } catch (err) {
      console.error(
        'Error al emitir el reporte:',
        err
      );

      // Las decisiones de negocio
      // no se consideran errores técnicos.
      if (err.decision) {
        const decisionFormateada =
          obtenerMensajeDecision(
            err.decision,
            err.detalle_decision ||
              err.mensaje ||
              err.message
          );

        setDecision({
          tipo: err.decision,

          titulo:
            decisionFormateada.titulo,

          mensaje:
            decisionFormateada.mensaje,

          tipoVisual:
            decisionFormateada.tipo,
        });

        setError(null);

        setSelectedEvent(null);

        await cargarCola(false, false);
      } else {
        setError(
          err.message ||
            'Ocurrió un error al emitir el reporte.'
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  // ---------------------------------------------------------
  // PROCESAMIENTO AUTOMÁTICO
  // ---------------------------------------------------------

  const procesarAutomaticamente =
    useCallback(async () => {
      /**
       * Evitamos que dos ejecuciones del intervalo
       * procesen simultáneamente.
       */
      if (processing) {
        return;
      }

      try {
        setProcessing(true);
        setDecision(null);
        setError(null);

        // ---------------------------------------------------
        // 1. Consultar cola actual
        // ---------------------------------------------------

        const cola =
          await obtenerColaReportes();

        // ---------------------------------------------------
        // 2. Si no hay reportes
        // ---------------------------------------------------

        if (!cola || cola.length === 0) {
          setPendingEvents([]);
          setSelectedEvent(null);
          return;
        }

        // ---------------------------------------------------
        // 3. Adaptar cola
        // ---------------------------------------------------

        const eventosAdaptados =
          cola.map(adaptarReporte);

        setPendingEvents(
          eventosAdaptados
        );

        // ---------------------------------------------------
        // 4. Seleccionar primer reporte
        // ---------------------------------------------------

        const primerReporte =
          eventosAdaptados[0];

        setSelectedEvent(
          primerReporte
        );

        // ---------------------------------------------------
        // 5. Procesar primer reporte
        // ---------------------------------------------------

        const resultado =
          await validarYEmitirReporte();

        // ---------------------------------------------------
        // 6. Mostrar decisión
        // ---------------------------------------------------

        const decisionFormateada =
          obtenerMensajeDecision(
            resultado.decision,
            resultado.detalle_decision ||
              resultado.mensaje
          );

        setDecision({
          tipo: resultado.decision,

          titulo:
            decisionFormateada.titulo,

          mensaje:
            decisionFormateada.mensaje,

          tipoVisual:
            decisionFormateada.tipo,
        });

        // ---------------------------------------------------
        // 7. Consultar nuevamente la cola
        // ---------------------------------------------------

        const nuevaCola =
          await obtenerColaReportes();

        const nuevosEventos =
          nuevaCola.map(adaptarReporte);

        // ---------------------------------------------------
        // 8. Actualizar lista
        // ---------------------------------------------------

        setPendingEvents(
          nuevosEventos
        );

        // ---------------------------------------------------
        // 9. Seleccionar siguiente reporte
        // ---------------------------------------------------

        setSelectedEvent(
          nuevosEventos[0] || null
        );
      } catch (err) {
        /**
         * Algunas decisiones del backend representan
         * decisiones normales del negocio:
         *
         * - reporte_antiguo
         * - conflicto
         * - ruido
         *
         * Por eso no las mostramos como errores técnicos.
         */
        if (err.decision) {
          const decisionFormateada =
            obtenerMensajeDecision(
              err.decision,
              err.detalle_decision ||
                err.mensaje ||
                err.message
            );

          setDecision({
            tipo: err.decision,

            titulo:
              decisionFormateada.titulo,

            mensaje:
              decisionFormateada.mensaje,

            tipoVisual:
              decisionFormateada.tipo,
          });

          setError(null);

          // Actualizar cola después de la decisión
          try {
            const nuevaCola =
              await obtenerColaReportes();

            const nuevosEventos =
              nuevaCola.map(adaptarReporte);

            setPendingEvents(
              nuevosEventos
            );

            setSelectedEvent(
              nuevosEventos[0] || null
            );
          } catch (refreshError) {
            console.error(
              'Error actualizando cola:',
              refreshError
            );
          }
        } else {
          console.error(
            'Error en procesamiento automático:',
            err
          );

          setError(
            err.message ||
              'Error durante el procesamiento automático.'
          );
        }
      } finally {
        setProcessing(false);
      }
    }, [processing]);

  // ---------------------------------------------------------
  // ACTIVAR MODO AUTOMÁTICO
  // ---------------------------------------------------------

  const activarModoAutomatico =
    useCallback(
      (segundos) => {
        try {
          // Detener cualquier intervalo anterior
          detenerModoAutomatico();

          setIntervaloAutomatico(
            segundos
          );

          setModoAutomatico(true);

          setMostrarModalAutomatico(
            false
          );

          /**
           * IMPORTANTE:
           * El servicio recibe primero
           * el intervalo y después el callback.
           */
          iniciarModoAutomatico(
            segundos,
            procesarAutomaticamente
          );
        } catch (err) {
          console.error(
            'Error activando modo automático:',
            err
          );

          setError(
            err.message ||
              'No se pudo activar el modo automático.'
          );
        }
      },
      [procesarAutomaticamente]
    );

  // ---------------------------------------------------------
  // DETENER MODO AUTOMÁTICO
  // ---------------------------------------------------------

  const desactivarModoAutomatico =
    useCallback(() => {
      detenerModoAutomatico();

      setModoAutomatico(false);

      setProcessing(false);
    }, []);

  // ---------------------------------------------------------
  // LIMPIAR INTERVALO AL SALIR
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      detenerModoAutomatico();
    };
  }, []);

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-500 select-none ${
        isDark
          ? 'bg-zinc-950 text-zinc-100'
          : 'bg-amber-50/20 text-zinc-900'
      }`}
    >
      {/* Navegación Superior */}

      <Navbar
        theme={theme}
        onToggleTheme={() =>
          setTheme(
            isDark ? 'light' : 'dark'
          )
        }
      />

      {/* Barra de Métricas Globales */}

      <MetricBar
        isDark={isDark}
        networkStatus="OPERATIVA (98%)"
        todayEventsCount={14}
        pendingCount={
          pendingEvents.length
        }
      />

      {/* Área Principal */}

      <div className="flex flex-1 relative overflow-hidden">
        {/* Cola */}

        <EventQueue
          events={pendingEvents}
          selectedEvent={selectedEvent}
          isDark={isDark}
          onSelectEvent={(event) => {
            /**
             * No permitimos selección manual
             * mientras el modo automático está activo.
             */
            if (modoAutomatico) {
              return;
            }

            setSelectedEvent(event);
            setDecision(null);
            setError(null);
          }}
          stressMode={stressMode}
        />

        {/* Panel Central */}

        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Botones superiores */}

          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            {/* MODO AUTOMÁTICO */}

            {!modoAutomatico ? (
              <button
                type="button"
                onClick={() =>
                  setMostrarModalAutomatico(
                    true
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all border shadow-sm flex items-center gap-2 ${
                  isDark
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />

                Modo Automático
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  desactivarModoAutomatico
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all border shadow-sm flex items-center gap-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/40"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />

                Automático ·{' '}
                {intervaloAutomatico}s

                <span className="ml-1 opacity-70">
                  Detener
                </span>
              </button>
            )}

            {/* MODO ESTRÉS */}

            <button
              type="button"
              onClick={() =>
                setStressMode(
                  (prev) => !prev
                )
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all border shadow-sm flex items-center gap-2 ${
                stressMode
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/50 animate-pulse'
                  : isDark
                  ? 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                  : 'bg-white/80 hover:bg-white text-zinc-700 border-zinc-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  stressMode
                    ? 'bg-rose-500'
                    : 'bg-zinc-400'
                }`}
              />

              {stressMode
                ? 'Desactivar Modo Estrés'
                : 'Modo Estrés'}
            </button>
          </div>

          {/* Analizador */}

          <EventAnalyzer
            event={selectedEvent}
            isDark={isDark}
            onApprove={handleApprove}
            onReject={handleReject}
            processing={processing}
            decision={decision}
          />
        </div>

        {/* Overlay de carga */}

        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md transition-all">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />

            <p className="text-xs font-medium tracking-wide text-zinc-200">
              Sincronizando cola de reportes...
            </p>
          </div>
        )}

        {/* Overlay de procesamiento */}

        {processing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />

            <p className="text-xs font-medium tracking-wide text-zinc-200">
              {modoAutomatico
                ? 'Procesando reporte automáticamente...'
                : 'Procesando y emitiendo evento...'}
            </p>
          </div>
        )}

        {/* Error técnico */}

        {error && !loading && (
          <div className="absolute bottom-6 right-6 z-50 max-w-md animate-bounce-short">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/90 border border-rose-700/60 text-rose-200 shadow-2xl backdrop-blur-md">
              <svg
                className="w-5 h-5 text-rose-400 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <div className="flex-1 text-xs">
                <h4 className="font-bold text-rose-300 mb-0.5">
                  Error de operación
                </h4>

                <p className="opacity-90 leading-relaxed">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError(null)
                }
                className="text-rose-400 hover:text-white p-1 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL MODO AUTOMÁTICO
          ===================================================== */}

      <ModoAutomaticoModal
        isDark={isDark}
        abierto={mostrarModalAutomatico}
        intervaloActual={
          intervaloAutomatico
        }
        onClose={() =>
          setMostrarModalAutomatico(
            false
          )
        }
        onActivar={
          activarModoAutomatico
        }
      />
    </div>
  );
};
