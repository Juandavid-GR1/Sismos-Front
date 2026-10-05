import React from 'react';
import { ETIQUETA_PRIORIDAD } from '../../utils/formato';

const COLOR = { 1: 'bg-sky-500', 2: 'bg-amber-500', 3: 'bg-rose-500' };

/** Horizontal bars with how many active events have each priority. */
export const BarrasPrioridad = ({ porPrioridad = {}, isDark }) => {
  const filas = [3, 2, 1].map((p) => ({ p, n: Number(porPrioridad?.[p] ?? porPrioridad?.[String(p)] ?? 0) }));
  const maximo = Math.max(1, ...filas.map((f) => f.n));
  return (
    <div className="space-y-3">
      {filas.map(({ p, n }) => (
        <div key={p}>
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span>P{p} · {ETIQUETA_PRIORIDAD[p]}</span>
            <span>{n}</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
            <div className={`h-full rounded-full ${COLOR[p]}`} style={{ width: `${(n / maximo) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
