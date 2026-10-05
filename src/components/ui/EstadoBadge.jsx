import React from 'react';
import { ETIQUETA_ESTADO, ETIQUETA_PRIORIDAD } from '../../utils/formato';

const COLOR_ESTADO = {
  activo: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
  archivado: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  retirado: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
  eliminado: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
  Pendiente: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
  Revisado: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
};

const COLOR_PRIORIDAD = {
  1: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  2: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
  3: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
};

const base = 'inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wide whitespace-nowrap';

/** Badge for persistence state (activo/archivado/...) or attention (Pendiente/Revisado). */
export const EstadoBadge = ({ estado }) => (
  <span className={`${base} ${COLOR_ESTADO[estado] ?? COLOR_ESTADO.retirado}`}>
    {ETIQUETA_ESTADO[estado] ?? estado ?? '—'}
  </span>
);

/** Badge for priority P = 1 (baja), 2 (media), 3 (alta). */
export const PrioridadBadge = ({ prioridad }) => (
  <span className={`${base} ${COLOR_PRIORIDAD[prioridad] ?? COLOR_ESTADO.retirado}`}>
    P{prioridad ?? '?'} · {ETIQUETA_PRIORIDAD[prioridad] ?? '—'}
  </span>
);
