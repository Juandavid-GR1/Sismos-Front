import React, { useCallback, useEffect, useState } from 'react';
import { Undo2, Loader2 } from 'lucide-react';
import { historialService } from '../../services/historialService';
import { useAccionRegistrada } from '../../hooks/useEstadoCambiado';

/**
 * Global "Deshacer" button (section 13). Shows how many actions can be
 * undone and, on hover, which one is next. Undo restores the exact
 * previous state in the backend and notifies every page to reload.
 */
export const UndoButton = ({ isDark }) => {
  const [acciones, setAcciones] = useState([]);
  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setAcciones(await historialService.listar());
    } catch {
      setAcciones([]);
    }
  }, []);

  // No polling: the counter loads once and then only when an action is
  // recorded (every service announces it) or when the user comes back to
  // this tab (changes made from another tab or from Postman).
  useEffect(() => {
    cargar();
    const alVolver = () => {
      if (document.visibilityState === 'visible') cargar();
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, [cargar]);

  useAccionRegistrada(cargar);

  useEffect(() => {
    if (!aviso) return undefined;
    const id = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(id);
  }, [aviso]);

  const deshacer = async () => {
    if (!acciones.length || trabajando) return;
    try {
      setTrabajando(true);
      const r = await historialService.deshacer();
      setAviso({ tipo: 'ok', texto: r.mensaje });
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setTrabajando(false);
      cargar();
    }
  };

  const siguiente = acciones[0];
  const deshabilitado = !siguiente || trabajando;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={deshacer}
        disabled={deshabilitado}
        title={siguiente ? `Deshacer: ${siguiente.descripcion} (${siguiente.hora})` : 'No hay acciones para deshacer'}
        className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all ${
          deshabilitado
            ? isDark
              ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'border-zinc-200 text-zinc-400 cursor-not-allowed'
            : isDark
              ? 'border-zinc-700 text-zinc-200 hover:border-orange-500 hover:text-orange-400'
              : 'border-amber-200 text-zinc-700 hover:border-orange-400 hover:text-orange-600'
        }`}
      >
        {trabajando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
        <span>Deshacer</span>
        {acciones.length > 0 && (
          <span className="ml-0.5 min-w-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] leading-[18px] text-center">
            {acciones.length}
          </span>
        )}
      </button>

      {aviso && (
        <div
          className={`absolute right-0 top-full mt-2 w-72 z-50 p-2.5 rounded-xl text-[11px] font-semibold shadow-lg border ${
            aviso.tipo === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          } ${isDark ? 'backdrop-blur bg-zinc-950/90' : 'bg-white'}`}
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
};
