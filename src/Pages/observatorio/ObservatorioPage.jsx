
import React, { useCallback, useEffect, useState } from 'react';

import { Navbar } from '../../components/Navbar';

import { EventAnalyzer } from '../../components/observatorio/EventAnalyzer';

import { EventQueue } from '../../components/observatorio/EventQueue';

import { MetricBar } from '../../components/observatorio/MetricBar';

import {
  descartarReporte,
  obtenerColaReportes,
  validarYEmitirReporte,
} from '../../services/colaReportesService';

/**
 * Transforma la estructura de un reporte provisto por el backend al formato
 * uniforme consumido por los componentes visuales del observatorio.
 *
 * @param {Object} reporte - Objeto de reporte sin procesar.
 * @param {number} index - Posición dentro del listado.
 * @returns {Object} Reporte adaptado con propiedades formateadas.
 */
const adaptarReporte = (reporte, index) => {
  const urgency =
    reporte.magnitude >= 5
      ? 'high'
      : reporte.magnitude >= 3
      ? 'medium'
      : 'low';

  return {
    id: `SISMO-${reporte.sismo_id}-${index}`,

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

    timestamp: new Date(reporte.timestamp).toLocaleTimeString(),

    epicenter_x: reporte.epicenter_x,

    epicenter_y: reporte.epicenter_y,

    originalTimestamp: reporte.timestamp,

    urgency,
  };
};

/**
 * Convierte las decisiones internas del backend en mensajes
 * comprensibles para el usuario.
 */
const obtenerMensajeDecision = (decision, detalle) => {
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

/**
 * Vista principal del Observatorio Sísmico para el monitoreo, evaluación
 * y aprobación/descarte en tiempo real de eventos en cola.
 */
export const ObservatorioPage = () => {
  // --- Estados de Configuración y Tema Visual ---
  const [theme, setTheme] = useState('dark');

  const [stressMode, setStressMode] = useState(false);

  // --- Estados de Datos de Eventos ---
  const [pendingEvents, setPendingEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [decision, setDecision] = useState(null);

  // --- Estados de Control de Carga y Operación ---
  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState(null);

  const isDark = theme === 'dark';

  /**
   * Consulta el servicio de API para sincronizar la cola de eventos pendientes.
   *
   * @param {boolean} seleccionarPrimero
   * Define si después de cargar la cola se debe seleccionar
   * automáticamente el primer reporte.
   */
  const cargarCola = useCallback(
    async (seleccionarPrimero = true) => {
      try {
        setLoading(true);

        setError(null);

        const cola = await obtenerColaReportes();

        const eventosAdaptados = cola.map(adaptarReporte);

        setPendingEvents(eventosAdaptados);

        /*
         * Al cargar inicialmente queremos seleccionar el primer evento.
         *
         * Después de procesar un reporte NO queremos seleccionar
         * automáticamente otro.
         */
        if (seleccionarPrimero) {
          setSelectedEvent(eventosAdaptados[0] || null);
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
        setLoading(false);
      }
    },
    []
  );

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarCola(true);
  }, [cargarCola]);

  /**
   * Ejecuta la desestimación del reporte seleccionado.
   */
  const handleReject = async () => {
    if (!selectedEvent || processing) return;

    try {
      setProcessing(true);

      setDecision(null);

      setError(null);

      const resultado = await descartarReporte();

      const decisionFormateada = obtenerMensajeDecision(
        resultado.decision || 'ruido',
        resultado.detalle_decision || resultado.mensaje
      );

      setDecision({
        tipo: resultado.decision || 'ruido',
        titulo: decisionFormateada.titulo,
        mensaje: decisionFormateada.mensaje,
        tipoVisual: decisionFormateada.tipo,
      });

      /*
       * El reporte acaba de salir de la cola.
       * Lo quitamos inmediatamente del analizador.
       */
      setSelectedEvent(null);

      /*
       * Recargamos la cola pero NO seleccionamos otro evento.
       */
      await cargarCola(false);
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

  /**
   * Procesa la aprobación y emisión oficial del reporte seleccionado.
   */
  const handleApprove = async () => {
    if (!selectedEvent || processing) return;

    try {
      setProcessing(true);

      setDecision(null);

      setError(null);

      const resultado = await validarYEmitirReporte();

      const decisionFormateada = obtenerMensajeDecision(
        resultado.decision,
        resultado.detalle_decision || resultado.mensaje
      );

      setDecision({
        tipo: resultado.decision,
        titulo: decisionFormateada.titulo,
        mensaje: decisionFormateada.mensaje,
        tipoVisual: decisionFormateada.tipo,
      });

      /*
       * El reporte ya fue procesado y eliminado de la cola.
       * No debe continuar apareciendo en el analizador.
       */
      setSelectedEvent(null);

      /*
       * Actualizamos la cola sin seleccionar automáticamente
       * otro reporte.
       */
      await cargarCola(false);
    } catch (err) {
      console.error(
        'Error al emitir el reporte:',
        err
      );

      /*
       * Los 409 de negocio también son decisiones válidas:
       *
       * - reporte_antiguo
       * - conflicto
       *
       * En estos casos NO mostramos la alerta de error.
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
          titulo: decisionFormateada.titulo,
          mensaje: decisionFormateada.mensaje,
          tipoVisual: decisionFormateada.tipo,
        });

        /*
         * MUY IMPORTANTE:
         * Un 409 de negocio no debe aparecer
         * como "Error de operación".
         */
        setError(null);

        /*
         * El backend ya retiró el reporte rechazado
         * de la cola.
         */
        setSelectedEvent(null);

        /*
         * Actualizamos la cola sin seleccionar
         * automáticamente otro reporte.
         */
        await cargarCola(false);
      } else {
        /*
         * Solo errores técnicos reales llegan aquí:
         * conexión, 500, backend caído, etc.
         */
        setError(
          err.message ||
            'Ocurrió un error al emitir el reporte.'
        );
      }
    } finally {
      setProcessing(false);
    }
  };

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
          setTheme(isDark ? 'light' : 'dark')
        }
      />

      {/* Barra de Métricas Globales */}
      <MetricBar
        isDark={isDark}
        networkStatus="OPERATIVA (98%)"
        todayEventsCount={14}
        pendingCount={pendingEvents.length}
      />

      {/* Área Principal de Trabajo */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* Listado / Cola Lateral */}
        <EventQueue
          events={pendingEvents}
          selectedEvent={selectedEvent}
          isDark={isDark}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setDecision(null);
            setError(null);
          }}
          stressMode={stressMode}
        />

        {/* Panel Central de Análisis */}
        <div className="flex-1 relative flex flex-col overflow-hidden">

          {/* Botón Flotante para Conmutar Modo Estrés */}
          <div className="absolute top-4 right-4 z-30">

            <button
              type="button"
              onClick={() =>
                setStressMode((prev) => !prev)
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

        {/* Overlays de Estado */}

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
              Procesando y emitiendo evento...
            </p>

          </div>
        )}

        {/* 
         * IMPORTANTE:
         *
         * Ya NO mostramos aquí el resultado de la operación.
         *
         * EventAnalyzer recibe "decision" y se encarga de
         * mostrar todos los casos:
         *
         * - correccion
         * - confirmacion
         * - reporte_antiguo
         * - conflicto
         * - ruido
         *
         * Esto evita que el resultado aparezca como una alerta
         * en la parte inferior.
         */}

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
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-white p-1 rounded-md transition-colors"
              >
                ✕
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

