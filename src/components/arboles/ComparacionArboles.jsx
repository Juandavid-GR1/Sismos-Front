import React from 'react';
import { formatearNumero } from '../../utils/formato';

const FILAS = [
  { clave: 'altura', etiqueta: 'Altura' },
  { clave: 'hojas', etiqueta: 'Hojas' },
  { clave: 'comparaciones_insercion', etiqueta: 'Comparaciones al insertar' },
  { clave: 'comparaciones_busqueda_promedio', etiqueta: 'Búsqueda: promedio', decimales: 2 },
  { clave: 'comparaciones_busqueda_maximas', etiqueta: 'Búsqueda: peor caso' },
  { clave: 'comparaciones_busqueda_total', etiqueta: 'Búsqueda: total' },
];

// Small segmented control (BST / AVL)
const Segmentos = ({ opciones, valor, onCambiar, isDark }) => (
  <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
    {opciones.map((o) => (
      <button
        key={o.valor}
        type="button"
        onClick={() => onCambiar(o.valor)}
        className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
          valor === o.valor ? 'bg-orange-500 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        {o.etiqueta}
      </button>
    ))}
  </div>
);

/** Which of the two compared trees is drawn on the canvas. */
export const SelectorDibujo = ({ valor, onCambiar, isDark }) => (
  <Segmentos
    opciones={[{ valor: 'bst', etiqueta: 'BST' }, { valor: 'avl', etiqueta: 'AVL' }]}
    valor={valor}
    onCambiar={onCambiar}
    isDark={isDark}
  />
);

/**
 * Same keys, in their original order, inserted into an AVL and into a plain BST; table with height,
 * leaves and comparisons of both.
 * `resultado` is one element of GET /arbol/comparacion -> resultados.
 */
export const ComparacionArboles = ({ resultado, isDark }) => {
  if (!resultado) return null;
  const { avl, bst } = resultado;
  const celda = 'py-1.5 text-xs font-bold text-right';
  return (
    <div className="space-y-2">
      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {resultado.cantidad_nodos} claves insertadas en el orden de llegada de los eventos.
      </p>
      <table className="w-full">
        <thead>
          <tr className="text-[10px] uppercase font-black text-zinc-500 border-b border-zinc-500/15">
            <th className="py-1.5 text-left">Métrica</th>
            <th className="py-1.5 text-right text-orange-500">AVL</th>
            <th className="py-1.5 text-right">BST</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((f) => {
            const a = avl?.[f.clave];
            const b = bst?.[f.clave];
            const mejor = typeof a === 'number' && typeof b === 'number' && f.clave !== 'hojas' && a < b;
            return (
              <tr key={f.clave} className="border-b border-zinc-500/10 last:border-0">
                <td className="py-1.5 text-[11px] font-semibold">{f.etiqueta}</td>
                <td className={`${celda} ${mejor ? 'text-emerald-500' : ''}`}>{formatearNumero(a, f.decimales ?? 0)}</td>
                <td className={celda}>{formatearNumero(b, f.decimales ?? 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};