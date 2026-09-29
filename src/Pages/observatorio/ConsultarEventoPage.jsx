import React, { useState } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  SlidersHorizontal,
  Activity,
  MapPin,
  XCircle
} from 'lucide-react';

import { Navbar } from '../../components/Navbar';

/**
 * Página de "Consulta de un evento" (sección 6 del enunciado):
 * "El usuario podrá localizar un evento mediante su identificador...
 * El resultado debe indicar si está activo, archivado o eliminado."
 *
 * Es una búsqueda DIRECTA por id -- no depende de navegar a una
 * estación específica primero, a diferencia del botón "ⓘ" dentro de
 * StationDetailPanel (que solo lista sismos de una estación).
 */
export const ConsultarEventoPage = () => {
  const [theme, setTheme] = useState('dark');
  const [idBusqueda, setIdBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [yaSeBusco, setYaSeBusco] = useState(false);

  const isDark = theme === 'dark';
  const API_URL = import.meta.env.VITE_API_URL;

  const buscarEvento = async (e) => {
    e.preventDefault();

    const idNumerico = Number(idBusqueda);
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      setError('Ingresa un identificador numérico válido (entero positivo).');
      return;
    }

    try {
      setBuscando(true);
      setError(null);
      setResultado(null);
      setYaSeBusco(true);

      const respuesta = await fetch(`${API_URL}/sismos/${idNumerico}`);
      const data = await respuesta.json();

      if (!respuesta.ok && respuesta.status !== 200) {
        throw new Error(data?.message || data?.error || 'No se pudo consultar el evento.');
      }

      setResultado(data);
    } catch (err) {
      console.error('Error consultando evento:', err);
      setError(err.message || 'Error al consultar el evento.');
    } finally {
      setBuscando(false);
    }
  };

  const Campo = ({ label, value, mono = false }) => (
    <div className="flex items-center justify-between py-2 border-b border-zinc-500/10 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      <span className={`text-sm font-bold text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );

  const Seccion = ({ titulo, icon: Icon, children, acento = false }) => (
    <div
      className={`p-4 rounded-2xl border ${
        acento
          ? isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50/60 border-orange-200/60'
          : isDark ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-white border-zinc-200'
      }`}
    >
      <h4 className={`text-[10px] font-black uppercase tracking-wide mb-1 flex items-center gap-1.5 ${
        acento ? 'text-orange-500' : 'text-zinc-500'
      }`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {titulo}
      </h4>
      {children}
    </div>
  );

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
      }`}
    >
      <Navbar theme={theme} onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 space-y-5">
        {/* Encabezado */}
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-500" />
            Consultar evento
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Localiza un evento por su identificador, aunque su prioridad o magnitud hayan cambiado desde la creación.
          </p>
        </div>

        {/* Buscador */}
        <form onSubmit={buscarEvento} className="flex gap-2">
          <input
            type="number"
            min="1"
            step="1"
            value={idBusqueda}
            onChange={(e) => setIdBusqueda(e.target.value)}
            placeholder="Identificador del evento (ej: 3)"
            className={`flex-1 px-4 py-3 rounded-2xl border outline-none text-sm font-bold transition-all ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-orange-500'
                : 'bg-white border-zinc-200 text-zinc-800 focus:border-orange-400'
            }`}
          />
          <button
            type="submit"
            disabled={buscando}
            className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wide text-white flex items-center gap-2 transition-all ${
              buscando
                ? 'bg-zinc-700 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-95 shadow-md shadow-orange-500/20'
            }`}
          >
            {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </form>

        {/* Error de red / validación */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resultado: eliminado */}
        {!error && resultado && resultado.estado === 'eliminado' && (
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
            <div className="flex items-center gap-2 text-zinc-400 font-black text-sm uppercase mb-2">
              <XCircle className="w-4 h-4" />
              Identificador retirado
            </div>
            <p className="text-sm">{resultado.mensaje}</p>
            <p className={`text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              ID: {resultado.id} · No puede reutilizarse ni reactivarse mediante un reporte.
            </p>
          </div>
        )}

        {/* Resultado: activo */}
        {!error && resultado && resultado.estado === 'activo' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-black uppercase">
              <CheckCircle2 className="w-4 h-4" />
              Activo · {resultado.status} · {resultado.formatted_id}
            </div>

            <Seccion titulo="Datos vigentes" icon={Activity}>
              <Campo label="Magnitud" value={`M ${resultado.magnitude}`} />
              <Campo label="Profundidad hipocentro" value={`${resultado.depth} km`} />
              <Campo label="Epicentro" value={`${resultado.epicenter_x}, ${resultado.epicenter_y}`} mono />
              <Campo label="Revisión" value={resultado.revision} />
              <Campo label="Estaciones que reportaron" value={(resultado.reporting_stations || []).join(', ') || '—'} />
            </Seccion>

            <Seccion titulo="Zona y prioridad" icon={MapPin}>
              <Campo
                label="Zona poblada"
                value={resultado.zona_poblada === null ? '—' : resultado.zona_poblada ? 'Sí' : 'No'}
              />
              <Campo label="Prioridad" value={resultado.prioridad ?? '—'} />
              <Campo label="Clave K=(P,M,I)" value={resultado.clave ? `(${resultado.clave.join(', ')})` : '—'} mono />
            </Seccion>

            <Seccion titulo="Datos del árbol AVL" icon={SlidersHorizontal} acento>
              <Campo label="Profundidad del nodo" value={resultado.profundidad_nodo ?? 'No sincronizado'} />
              <Campo label="Altura del nodo" value={resultado.altura_nodo ?? 'No sincronizado'} />
              <Campo label="Factor de balance" value={resultado.factor_balance ?? 'No sincronizado'} />
            </Seccion>

          </div>
        )}

        {/* Estado inicial */}
        {!yaSeBusco && !error && (
          <div className={`py-16 text-center text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Escribe un identificador y presiona Buscar.
          </div>
        )}
      </main>
    </div>
  );
};
