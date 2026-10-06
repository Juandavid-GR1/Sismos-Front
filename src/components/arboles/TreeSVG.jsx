import React, { useMemo } from 'react';

// ============================================================
// Draws any nested topology { clave, factorBalance, balanceado,
// accesoCostoso?, datos?, hijoIzquierdo, hijoDerecho } — the real AVL
// (/arbol/topologia) or the AVL/BST built for the comparison.
// ============================================================

const ESPACIO_HORIZONTAL = 90;
const ESPACIO_VERTICAL = 110;
const RADIO_NODO = 28;
// Empty space around the drawing so no node is cut by the viewBox edge
const MARGEN = RADIO_NODO + 22;

// Node colour by priority P (first component of K)
const COLOR_PRIORIDAD = {
  1: { trazo: '#0ea5e9', nombre: 'P1 baja' },
  2: { trazo: '#f59e0b', nombre: 'P2 media' },
  3: { trazo: '#f43f5e', nombre: 'P3 alta' },
};

/**
 * x = position in the in-order walk (left to right), y = depth.
 * Iterative so a degenerate BST (one long branch) cannot overflow the stack.
 */
function construirGrafo(raiz) {
  if (!raiz) return { nodos: [], enlaces: [], ancho: 0, alto: 0 };

  const nodos = [];
  const posicion = new Map();
  const pila = [];
  let actual = { nodo: raiz, profundidad: 0 };
  let indice = 0;

  while (pila.length || actual?.nodo) {
    while (actual?.nodo) {
      pila.push(actual);
      actual = { nodo: actual.nodo.hijoIzquierdo, profundidad: actual.profundidad + 1 };
    }
    const { nodo, profundidad } = pila.pop();
    const x = MARGEN + indice * ESPACIO_HORIZONTAL;
    const y = MARGEN + profundidad * ESPACIO_VERTICAL;
    indice += 1;
    posicion.set(nodo, { x, y });
    nodos.push({ nodo, x, y, id: nodo.clave.join('-') });
    actual = { nodo: nodo.hijoDerecho, profundidad: profundidad + 1 };
  }

  const enlaces = [];
  nodos.forEach(({ nodo, x, y }) => {
    [nodo.hijoIzquierdo, nodo.hijoDerecho].forEach((hijo) => {
      const p = hijo && posicion.get(hijo);
      if (p) enlaces.push({ x1: x, y1: y, x2: p.x, y2: p.y });
    });
  });

  const ancho = Math.max(...nodos.map((n) => n.x)) + MARGEN;
  const alto = Math.max(...nodos.map((n) => n.y)) + MARGEN;
  return { nodos, enlaces, ancho, alto };
}

export const LeyendaArbol = ({ isDark, conAcceso = true }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
    {Object.entries(COLOR_PRIORIDAD).map(([p, { trazo, nombre }]) => (
      <span key={p} className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: trazo }} /> {nombre}
      </span>
    ))}
    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> desbalanceado</span>
    {conAcceso && (
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full border-2 border-dashed border-violet-500" /> acceso costoso (&gt; L)
      </span>
    )}
    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> revisado</span>
  </div>
);

/**
 * Props: raiz (nested topology), isDark, onSeleccionar(id) optional,
 * vacio (text when there are no nodes).
 */
export const TreeSVG = ({ raiz, isDark, onSeleccionar, vacio = 'El árbol está vacío: inserta eventos para verlo aquí.' }) => {
  const { nodos, enlaces, ancho, alto } = useMemo(() => construirGrafo(raiz), [raiz]);

  if (nodos.length === 0) {
    return <div className="flex items-center justify-center h-full text-zinc-500 text-sm font-bold">{vacio}</div>;
  }

  return (
    <svg
      width={ancho}
      height={alto}
      viewBox={`0 0 ${ancho} ${alto}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
      role="img"
      aria-label={`Árbol con ${nodos.length} nodos`}
    >
      <defs>
        <linearGradient id="treeLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g stroke="url(#treeLineGrad)" strokeWidth="2" strokeDasharray="4 3">
        {enlaces.map((e, i) => <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />)}
      </g>

      {nodos.map(({ nodo, x, y, id: idInterno }) => {
        const [prioridad, magnitud, id] = nodo.clave;
        const desbalanceado = nodo.balanceado === false;
        const costoso = nodo.accesoCostoso || nodo.datos?.acceso_costoso;
        const revisado = nodo.datos?.status === 'Revisado';
        const trazo = COLOR_PRIORIDAD[prioridad]?.trazo ?? '#f97316';
        return (
          <g
            key={idInterno}
            className={`group ${onSeleccionar ? 'cursor-pointer' : ''}`}
            onClick={onSeleccionar ? () => onSeleccionar(id) : undefined}
          >
            <title>{`K=(${nodo.clave.join(', ')}) · altura ${nodo.altura} · fb ${nodo.factorBalance}${costoso ? ' · acceso costoso' : ''}${nodo.datos?.status ? ` · ${nodo.datos.status}` : ''}`}</title>
            {costoso && (
              <circle cx={x} cy={y} r={RADIO_NODO + 6} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5 4" />
            )}
            <circle
              cx={x}
              cy={y}
              r={RADIO_NODO}
              strokeWidth="2.5"
              stroke={desbalanceado ? '#fda4af' : trazo}
              style={{ transformOrigin: `${x}px ${y}px` }}
              className={`transition-transform duration-200 group-hover:scale-110 ${
                desbalanceado ? 'fill-rose-500' : isDark ? 'fill-zinc-900' : 'fill-white'
              }`}
            />
            {revisado && <circle cx={x + RADIO_NODO - 6} cy={y - RADIO_NODO + 6} r="5" fill="#10b981" />}
            <text x={x} y={y - 2} textAnchor="middle"
              className={`text-[11px] font-black select-none pointer-events-none ${desbalanceado ? 'fill-white' : isDark ? 'fill-zinc-100' : 'fill-zinc-900'}`}>
              M{magnitud}
            </text>
            <text x={x} y={y + 11} textAnchor="middle"
              className={`text-[9px] font-bold select-none pointer-events-none ${desbalanceado ? 'fill-rose-100' : 'fill-zinc-500'}`}>
              {id}
            </text>
            <text x={x} y={y + RADIO_NODO + 14} textAnchor="middle"
              className={`text-[9px] font-black select-none pointer-events-none ${desbalanceado ? 'fill-rose-500' : 'fill-zinc-500'}`}>
              fb {nodo.factorBalance} · h {nodo.altura}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
