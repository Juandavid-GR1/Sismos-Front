import React, { useState } from 'react';

const RECORRIDOS = [
  { clave: 'inorden', etiqueta: 'Inorden' },
  { clave: 'preorden', etiqueta: 'Preorden' },
  { clave: 'postorden', etiqueta: 'Postorden' },
  { clave: 'niveles', etiqueta: 'Anchura' },
];

/** The four traversals of the active AVL (ids in visit order). */
export const RecorridosPanel = ({ recorridos, isDark }) => {
  const [activo, setActivo] = useState('inorden');
  if (!recorridos) return null;
  const lista = recorridos[activo] ?? [];

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase text-zinc-500 block">Recorridos</span>
      <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
        {RECORRIDOS.map((r) => (
          <button
            key={r.clave}
            type="button"
            onClick={() => setActivo(r.clave)}
            className={`flex-1 px-1.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              activo === r.clave ? 'bg-orange-500 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {r.etiqueta}
          </button>
        ))}
      </div>
      <p className={`text-[11px] font-mono leading-relaxed break-words ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
        {lista.length ? lista.map((clave) => clave[2]).join(' → ') : '—'}
      </p>
    </div>
  );
};
