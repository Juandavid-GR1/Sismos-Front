import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle, GitBranch, Activity, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

/**
 * Modal de "Consulta de un evento" (sección 6 del enunciado).
 *
 * Muestra los datos vigentes del sismo MÁS los campos que solo el
 * árbol conoce (profundidad del nodo, altura, factor de balance),
 * y el estado de ciclo de vida (activo/eliminado/archivado).
 *
 * Se abre pasándole un sismoId; hace su propio fetch a
 * GET /sismos/{id} -- no depende de que el padre ya tenga los datos
 * enriquecidos (el listado normal de sismos NO trae estos campos).
 */
export const EventoDetalleModal = ({ sismoId, theme, onClose }) => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const isDark = theme === 'dark';
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!sismoId) return;

    let cancelado = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        const respuesta = await fetch(`${API_URL}/sismos/${sismoId}`);
        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(data?.message || data?.error || 'No se pudo consultar el evento.');
        }

        if (!cancelado) setDatos(data);
      } catch (err) {
        console.error('Error consultando evento:', err);
        if (!cancelado) setError(err.message || 'Error al consultar el evento.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => { cancelado = true; };
  }, [sismoId, API_URL]);

  if (!sismoId) return null;

  const Campo = ({ label, value, mono = false }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-500/10 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      <span className={`text-sm font-bold ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">Consulta de evento</h3>
              <p className="text-[11px] text-zinc-500">ID: {sismoId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5">
          {cargando && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-xs text-zinc-500">Consultando...</span>
            </div>
          )}

          {!cargando && error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!cargando && !error && datos && datos.estado === 'eliminado' && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-zinc-500/30 bg-zinc-500/10 text-zinc-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Identificador retirado</p>
                <p>{datos.mensaje}</p>
              </div>
            </div>
          )}

          {!cargando && !error && datos && datos.estado === 'activo' && (
            <div className="space-y-4">
              {/* Estado */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-black uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Activo · {datos.status}
              </div>

              {/* Datos vigentes */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-1">Datos vigentes</h4>
                <Campo label="Magnitud" value={`M ${datos.magnitude}`} />
                <Campo label="Profundidad hipocentro" value={`${datos.depth} km`} />
                <Campo label="Epicentro" value={`${datos.epicenter_x}, ${datos.epicenter_y}`} mono />
                <Campo label="Revisión" value={datos.revision} />
                <Campo label="Estaciones" value={(datos.reporting_stations || []).join(', ') || '—'} />
              </div>

              {/* Prioridad y clave */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-1">Prioridad y clave</h4>
                <Campo label="Prioridad" value={datos.prioridad} />
                <Campo label="Clave K=(P,M,I)" value={datos.clave ? `(${datos.clave.join(', ')})` : '—'} mono />
              </div>

              {/* Datos del árbol -- lo que solo existe gracias a la sección 6/9 */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-orange-500 mb-1 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3" />
                  Datos del árbol AVL
                </h4>
                <Campo label="Profundidad del nodo" value={datos.profundidad_nodo ?? '—'} />
                <Campo label="Altura del nodo" value={datos.altura_nodo ?? '—'} />
                <Campo label="Factor de balance" value={datos.factor_balance ?? '—'} />
              </div>

              {/* Asociaciones -- pendiente sección 7 */}
              <div className={`p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${isDark ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-100 text-zinc-500'}`}>
                <Activity className="w-3.5 h-3.5 shrink-0" />
                Asociaciones: pendiente (sección 7 del enunciado, no construida todavía)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
