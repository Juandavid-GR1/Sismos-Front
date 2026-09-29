
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Navbar } from '../../components/Navbar';
import { useEstadoCambiado } from '../../hooks/useEstadoCambiado';
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
 * Adapta toda la cola y garantiza que cada elemento tenga un id
 * ÚNICO.
 *
 * Dos reportes con la misma estación, sismo y revisión producen el
 * mismo id base. Si ese id se usa como `key` de React, las claves
 * duplicadas hacen que React quite del panel el elemento equivocado
 * (el reporte "se queda ahí"). Por eso a la n-ésima repetición se le
 * añade un sufijo.
 *
 * El sufijo se basa en el orden de aparición dentro de la cola, no en
 * el index global: los reportes salen siempre por el frente, así que
 * al procesar uno los repetidos restantes conservan claves estables.
 */
const adaptarCola = (cola) => {
  const repeticiones = {};

  return cola.map((reporte) => {
    const adaptado = adaptarReporte(reporte);
    const n = repeticiones[adaptado.id] ?? 0;

    repeticiones[adaptado.id] = n + 1;

    return n === 0
      ? adaptado
      : { ...adaptado, id: `${adaptado.id}#${n}` };
  });
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

    case 'alta':
      return {
        titulo: 'Evento nuevo registrado',
        mensaje:
          detalle ||
          'El identificador era desconocido: se registró un evento nuevo a partir del reporte.',
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

    case 'identificador_retirado':
      return {
        titulo: 'Identificador retirado',
        mensaje:
          detalle ||
          'Este identificador fue eliminado y está retirado: no puede reactivarse mediante un reporte.',
        tipo: 'warning',
      };

    case 'datos_invalidos':
      return {
        titulo: 'Reporte rechazado por datos inválidos',
        mensaje:
          detalle ||
          'El reporte contenía datos fuera de rango y fue retirado de la cola.',
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

  // Aviso informativo de orden FIFO. Va por su propio canal y NO usa
  // `decision`: esa variable la usa EventAnalyzer para mostrar el
  // resultado de una decisión ya tomada, y mezclarlas dejaba el
  // panel en un estado que no permitía continuar.
  const [aviso, setAviso] =
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
          adaptarCola(cola);

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

  // Undo can put a report back in the queue: reload it silently.
  useEstadoCambiado(() => cargarCola(true, false));

  // ---------------------------------------------------------
  // COLA FIFO: solo se puede procesar el reporte del FRENTE
  // ---------------------------------------------------------

  /**
   * El backend procesa SIEMPRE el primer reporte de la cola
   * (sección 8 del enunciado: cola FIFO, un reporte por paso).
   * Los endpoints /cola/validar y /cola/descartar no reciben un id.
   *
   * Si el usuario selecciona otro reporte y pulsa Aprobar/Rechazar,
   * el backend actuaría sobre uno distinto al que ve en pantalla.
   * Por eso, si lo seleccionado no es el frente, no se llama al
   * backend: se selecciona el primero y se avisa.
   *
   * Retorna true si se puede continuar con la acción.
   */
  const verificarEsElFrente = () => {
    // Cualquier aviso anterior se limpia; si hay que rebotar, se
    // vuelve a fijar abajo (React aplica solo el último valor).
    setAviso(null);

    const frente = pendingEvents[0];

    if (!frente || !selectedEvent || selectedEvent.id === frente.id) {
      return true;
    }

    setSelectedEvent(frente);
    setDecision(null);
    setAviso({
      titulo: 'Los reportes se procesan en orden de llegada',
      mensaje: `El primero de la cola es ${frente.formatted_id} (estación ${frente.station_id}, revisión ${frente.revision}). Se seleccionó ese: revísalo y vuelve a aprobarlo o rechazarlo.`,
    });

    return false;
  };

  // ---------------------------------------------------------
  // RECHAZAR REPORTE
  // ---------------------------------------------------------

  const handleReject = async () => {
    if (!selectedEvent || processing) {
      return;
    }

    if (!verificarEsElFrente()) {
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

      await cargarCola(false, false);
    } catch (err) {
      console.error(
        'Error al descartar el reporte:',
        err
      );

      // La cola del backend pudo haber cambiado (ej. ya estaba
      // vacía): se resincroniza antes de mostrar el error.
      await cargarCola(true, false);

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

    if (!verificarEsElFrente()) {
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

      await cargarCola(false, false);
    } catch (err) {
      console.error(
        'Error al emitir el reporte:',
        err
      );

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
        // Error sin decisión de negocio (ej. 404 "no hay reportes
        // pendientes"): la cola del backend pudo haber cambiado sin
        // que la pantalla lo sepa. Se resincroniza ANTES de mostrar
        // el error (cargarCola limpia el error al empezar).
        await cargarCola(true, false);

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
      if (processing) {
        return;
      }

      try {
        setProcessing(true);
        setDecision(null);
        setError(null);

        const cola =
          await obtenerColaReportes();

        if (!cola || cola.length === 0) {
          setPendingEvents([]);
          setSelectedEvent(null);
          return;
        }

        const eventosAdaptados =
          adaptarCola(cola);

        setPendingEvents(
          eventosAdaptados
        );

        const primerReporte =
          eventosAdaptados[0];

        setSelectedEvent(
          primerReporte
        );

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

        const nuevaCola =
          await obtenerColaReportes();

        const nuevosEventos =
          adaptarCola(nuevaCola);

        setPendingEvents(
          nuevosEventos
        );

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
         * - identificador_retirado
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

          try {
            const nuevaCola =
              await obtenerColaReportes();

            const nuevosEventos =
              adaptarCola(nuevaCola);

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
          detenerModoAutomatico();

          setIntervaloAutomatico(
            segundos
          );

          setModoAutomatico(true);

          setMostrarModalAutomatico(
            false
          );

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
      <Navbar
        theme={theme}
        onToggleTheme={() =>
          setTheme(
            isDark ? 'light' : 'dark'
          )
        }
      />

      <MetricBar
        isDark={isDark}
        networkStatus="OPERATIVA (98%)"
        todayEventsCount={14}
        pendingCount={
          pendingEvents.length
        }
      />

      <div className="flex flex-1 relative overflow-hidden">
        <EventQueue
          events={pendingEvents}
          selectedEvent={selectedEvent}
          isDark={isDark}
          onSelectEvent={(event) => {
            if (modoAutomatico) {
              return;
            }

            setSelectedEvent(event);
            setDecision(null);
            setError(null);
            setAviso(null);
          }}
          stressMode={stressMode}
        />

        <div className="flex-1 relative flex flex-col overflow-hidden">
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
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

          <EventAnalyzer
            event={selectedEvent}
            isDark={isDark}
            onApprove={handleApprove}
            onReject={handleReject}
            processing={processing}
            decision={decision}
          />
        </div>

        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md transition-all">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />

            <p className="text-xs font-medium tracking-wide text-zinc-200">
              Sincronizando cola de reportes...
            </p>
          </div>
        )}

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

        {/* Aviso informativo: orden FIFO de la cola */}

        {aviso && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/90 border border-amber-700/60 text-amber-100 shadow-2xl backdrop-blur-md">
              <svg
                className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <div className="flex-1 text-xs">
                <h4 className="font-bold text-amber-300 mb-0.5">
                  {aviso.titulo}
                </h4>

                <p className="opacity-90 leading-relaxed">
                  {aviso.mensaje}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAviso(null)
                }
                className="text-amber-400 hover:text-white p-1 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
