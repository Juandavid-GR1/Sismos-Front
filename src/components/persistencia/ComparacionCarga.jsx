import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { formatearClave } from '../../utils/formato';
import { resumenTopologia } from '../../utils/topologia';

/**
 * Load by insertions: the same events, comparator and order
 * inserted into the AVL (balanced) and into a plain BST. Shows root,
 * height, maximum depth and leaves of both trees.
 * `resultado` is one element of GET /arbol/comparacion?orden=original.
 */
export const ComparacionCarga = ({ resultado, isDark }) => {
  if (!resultado) return null;
  const avl = resumenTopologia(resultado.topologia?.avl);
  const bst = resumenTopologia(resultado.topologia?.bst);
  const filas = [
    { etiqueta: 'Raíz', avl: formatearClave(avl.raiz), bst: formatearClave(bst.raiz), mono: true },
    { etiqueta: 'Altura', avl: resultado.avl?.altura, bst: resultado.bst?.altura },
    { etiqueta: 'Profundidad máxima', avl: avl.profundidadMaxima ?? '—', bst: bst.profundidadMaxima ?? '—' },
    { etiqueta: 'Hojas', avl: resultado.avl?.hojas, bst: resultado.bst?.hojas },
  ];
  const celda = 'py-1.5 text-xs font-bold text-right';

  return (
    <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-50/80 border-zinc-200/80'}`}>
      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {resultado.cantidad_nodos} eventos insertados en el orden del archivo, con el mismo comparador K = (P, M, I), en un AVL y en un BST sin balanceo.
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
          {filas.map((f) => (
            <tr key={f.etiqueta} className="border-b border-zinc-500/10 last:border-0">
              <td className="py-1.5 text-[11px] font-semibold">{f.etiqueta}</td>
              <td className={`${celda} ${f.mono ? 'font-mono' : ''}`}>{f.avl}</td>
              <td className={`${celda} ${f.mono ? 'font-mono' : ''}`}>{f.bst}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/observatorio/arboles?vista=bst" className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:underline">
        <GitBranch className="w-3.5 h-3.5" /> Ver los dos árboles dibujados
      </Link>
    </div>
  );
};
