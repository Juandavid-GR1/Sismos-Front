import React, { useEffect, useState } from 'react';

import { Navbar } from '../../components/Navbar';
import { EventAnalyzer } from '../../components/observatorio/EventAnalyzer';
import { EventQueue } from '../../components/observatorio/EventQueue';
import { MetricBar } from '../../components/observatorio/MetricBar';
import {
  descartarReporte,
  obtenerColaReportes,
  validarYEmitirReporte,
} from '../../services/colaReportesService';

export const ObservatorioPage = () => {
  const [theme, setTheme] = useState('dark');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [stressMode, setStressMode] = useState(false);

  const isDark = theme === 'dark';

  const adaptarReporte = (reporte, index) => ({
    id: `SISMO-${reporte.sismo_id}-${index}`,
    sismo_id: reporte.sismo_id,
    magnitude: reporte.magnitude,
    depthKm: reporte.depth,
    location: `Epicentro: ${reporte.epicenter_y}, ${reporte.epicenter_x}`,
    timestamp: new Date(reporte.timestamp).toLocaleTimeString(),
    detectedBy: [reporte.station_id],
    urgency:
      reporte.magnitude >= 5
        ? 'high'
        : reporte.magnitude >= 3
        ? 'medium'
        : 'low',
    station_id: reporte.station_id,
    depth: reporte.depth,
    epicenter_x: reporte.epicenter_x,
    epicenter_y: reporte.epicenter_y,
    originalTimestamp: reporte.timestamp,
  });

  const cargarCola = async () => {
    try {
      setLoading(true);
      setError(null);

      const cola = await obtenerColaReportes();
      const eventosAdaptados = cola.map(adaptarReporte);

      setPendingEvents(eventosAdaptados);
      setSelectedEvent(eventosAdaptados[0] || null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'No se pudo cargar la cola de reportes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCola();
  }, []);

  const handleReject = async () => {
    if (!selectedEvent || processing) return;

    try {
      setProcessing(true);
      await descartarReporte();
      await cargarCola();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEvent || processing) return;

    try {
      setProcessing(true);
      const resultado = await validarYEmitirReporte();
      console.log('Reporte procesado correctamente:', resultado);
      await cargarCola();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={`
        h-screen w-screen flex flex-col overflow-hidden font-sans
        transition-colors duration-500 select-none
        ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-amber-50/20 text-zinc-900'}
      `}
    >
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
      />

      <MetricBar
        isDark={isDark}
        networkStatus="OPERATIVA (98%)"
        todayEventsCount={14}
        pendingCount={pendingEvents.length}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Componente de Lista / Cola Separado */}
        <EventQueue
          events={pendingEvents}
          selectedEvent={selectedEvent}
          isDark={isDark}
          onSelectEvent={setSelectedEvent}
          stressMode={stressMode}
        />

        {/* Panel de Análisis del Sismo */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Botón Flotante para Alternar Modo Estrés */}
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={() => setStressMode(!stressMode)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all border shadow-sm
                flex items-center gap-2
                ${
                  stressMode
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/50 animate-pulse'
                    : isDark
                    ? 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                    : 'bg-white/80 hover:bg-white text-zinc-700 border-zinc-300'
                }
              `}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  stressMode ? 'bg-rose-500' : 'bg-zinc-400'
                }`}
              />
              {stressMode ? 'Desactivar Modo Estrés' : 'Modo Estrés'}
            </button>
          </div>

          <EventAnalyzer
            event={selectedEvent}
            isDark={isDark}
            onApprove={handleApprove}
            onReject={handleReject}
            processing={processing}
          />
        </div>

        {/* Overlay de Carga Inicial */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md transition-all">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium tracking-wide text-zinc-200">
              Sincronizando cola de reportes...
            </p>
          </div>
        )}

        {/* Overlay de Procesamiento de Acciones */}
        {processing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium tracking-wide text-zinc-200">
              Procesando y emitiendo evento...
            </p>
          </div>
        )}

        {/* Notificación Flotante de Error */}
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
                <h4 className="font-bold text-rose-300 mb-0.5">Error de operación</h4>
                <p className="opacity-90 leading-relaxed">{error}</p>
              </div>
              <button
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