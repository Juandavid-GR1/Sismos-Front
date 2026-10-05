import React from 'react';

/** Metric tile: label, big value and optional detail. */
export const Indicador = ({ icono: Icono, etiqueta, valor, detalle, isDark, resaltado = false }) => (
  <div
    className={`p-3.5 rounded-2xl border transition-colors group ${
      resaltado
        ? isDark ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700'
        : isDark ? 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700' : 'bg-zinc-50/80 border-zinc-200/80 hover:border-zinc-300'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500">{etiqueta}</span>
      {Icono && <Icono className={`w-4 h-4 shrink-0 ${resaltado ? 'text-orange-500' : 'text-zinc-500 group-hover:text-orange-500'} transition-colors`} />}
    </div>
    <div className="mt-2 text-xl font-black tracking-tight break-words">{valor}</div>
    {detalle && <div className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{detalle}</div>}
  </div>
);
