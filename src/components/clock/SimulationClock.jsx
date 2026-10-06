import React, { useState } from 'react';
import { Clock, FastForward, ChevronDown, Loader2 } from 'lucide-react';
import { useSimulationClock } from '../../hooks/SimulationClock';
import { aInputFecha, deInputFecha } from '../../utils/formato';

const SALTOS = [1, 6, 24, 72];

const fmt = (fecha, opciones, esUtc) => fecha.toLocaleString('es-CO', esUtc ? { timeZone: 'UTC', ...opciones } : opciones);

/**
 * Scenario clock (backend /reloj). Shows the time in UTC and lets the user
 * move it forward (+1 h, +6 h, +24 h, +72 h, to a date, or to "now").
 * It never goes back: the backend refuses it.
 *
 * Props: theme, flotante (absolute top-right over the map; default true).
 */
export const SimulationClock = ({ theme, flotante = true }) => {
  const isDark = theme === 'dark';
  const { time, esUtc, avanzando, error, avanzarHoras, avanzarA } = useSimulationClock();
  const [abierto, setAbierto] = useState(false);
  const [destino, setDestino] = useState('');

  const irAFecha = async (e) => {
    e.preventDefault();
    if (destino && (await avanzarA(deInputFecha(destino)))) setDestino('');
  };

  const boton = `px-2 py-1 rounded-lg text-[11px] font-black transition-colors disabled:opacity-50 ${
    isDark ? 'bg-zinc-800 hover:bg-orange-500/20 hover:text-orange-400' : 'bg-zinc-100 hover:bg-orange-100 hover:text-orange-600'
  }`;

  return (
    <div className={`${flotante ? 'absolute top-4 right-4 z-20' : 'relative'} w-fit`}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        title="Reloj de simulación del escenario (UTC)"
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
          isDark ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-100' : 'bg-white/90 border-amber-200 text-zinc-800'
        }`}
      >
        <span className="flex items-center space-x-2 text-orange-500 font-mono font-black text-sm tracking-wider">
          {avanzando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
          <span>{time ? fmt(time, { hour: '2-digit', minute: '2-digit', second: '2-digit' }, esUtc) : '--:--:--'}</span>
        </span>
        <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {time ? `${fmt(time, { year: 'numeric', month: '2-digit', day: '2-digit' }, esUtc)}${esUtc ? ' UTC' : ''}` : 'sin conexión'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div
          className={`absolute right-0 mt-2 w-72 p-3 rounded-2xl border shadow-2xl space-y-3 z-30 ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-amber-200 text-zinc-800'
          }`}
        >
          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            El reloj del escenario solo avanza por una acción tuya. Ningún evento puede ocurrir después de él y
            define la antigüedad usada para archivar ramas (T).
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <FastForward className="w-3.5 h-3.5 text-orange-500" />
            {SALTOS.map((h) => (
              <button key={h} type="button" disabled={avanzando} className={boton} onClick={() => avanzarHoras(h)}>
                +{h} h
              </button>
            ))}
            <button
              type="button"
              disabled={avanzando || !time || time >= new Date()}
              className={boton}
              title="Lleva el reloj a la hora real actual (si está atrasado)"
              onClick={() => avanzarA(new Date().toISOString())}
            >
              Ahora
            </button>
          </div>
          <form onSubmit={irAFecha} className="flex gap-1.5">
            <input
              type="datetime-local"
              step="1"
              value={destino}
              min={time ? aInputFecha(time.toISOString()) : undefined}
              onChange={(e) => setDestino(e.target.value)}
              aria-label="Avanzar el reloj hasta una fecha"
              className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-[11px] ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            />
            <button type="submit" disabled={avanzando || !destino} className={boton}>Ir</button>
          </form>
          {error && <p className="text-[11px] font-semibold text-rose-400">{error}</p>}
        </div>
      )}
    </div>
  );
};
