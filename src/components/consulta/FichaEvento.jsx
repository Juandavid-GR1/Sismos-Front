import React from 'react';
import { Activity, MapPin, SlidersHorizontal, Gauge } from 'lucide-react';
import { formatearClave, formatearFecha, ETIQUETA_PRIORIDAD } from '../../utils/formato';

export const Campo = ({ label, value, mono = false }) => (
  <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-500/10 last:border-0">
    <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</span>
    <span className={`text-sm font-bold text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

export const Seccion = ({ titulo, icon: Icon, children, acento = false, isDark }) => (
  <div className={`p-4 rounded-2xl border ${
    acento
      ? isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50/60 border-orange-200/60'
      : isDark ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-white border-zinc-200'
  }`}>
    <h4 className={`text-[10px] font-black uppercase tracking-wide mb-1 flex items-center gap-1.5 ${acento ? 'text-orange-500' : 'text-zinc-500'}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {titulo}
    </h4>
    {children}
  </div>
);

const sinDato = (v, texto = 'No sincronizado') => (v === null || v === undefined ? texto : v);

/**
 * Data of one event as answered by GET /sismos/{id}. For an active event
 * it also shows its node in the AVL (depth, height, balance factor and
 * costly access against L). Archived / retired events only have data.
 */
export const FichaEvento = ({ evento, isDark }) => {
  const activo = evento.estado === 'activo';
  return (
    <div className="space-y-3">
      <Seccion titulo="Datos vigentes" icon={Activity} isDark={isDark}>
        <Campo label="Magnitud" value={`M ${evento.magnitude}`} />
        <Campo label="Profundidad hipocentro" value={`${evento.depth} km`} />
        <Campo label="Epicentro (x, y)" value={`${evento.epicenter_x}, ${evento.epicenter_y}`} mono />
        <Campo label="Ocurrencia" value={formatearFecha(evento.timestamp)} />
        <Campo label="Revisión" value={evento.revision} />
        <Campo label="Estaciones que reportaron" value={(evento.reporting_stations || []).join(', ') || '—'} />
      </Seccion>

      <Seccion titulo="Zona y prioridad" icon={MapPin} isDark={isDark}>
        {activo && (
          <Campo label="Zona poblada" value={evento.zona_poblada === null || evento.zona_poblada === undefined ? '—' : evento.zona_poblada ? 'Sí' : 'No'} />
        )}
        <Campo label="Prioridad" value={evento.prioridad ? `${evento.prioridad} · ${ETIQUETA_PRIORIDAD[evento.prioridad]}` : '—'} />
        <Campo label="Clave K=(P, M, I)" value={formatearClave(evento.clave)} mono />
        <Campo label="Estado de atención" value={evento.status ?? '—'} />
      </Seccion>

      {activo && (
        <Seccion titulo="Nodo en el árbol AVL" icon={SlidersHorizontal} acento isDark={isDark}>
          <Campo label="Profundidad del nodo" value={sinDato(evento.profundidad_nodo)} />
          <Campo label="Altura del nodo" value={sinDato(evento.altura_nodo)} />
          <Campo label="Factor de balance" value={sinDato(evento.factor_balance)} />
          <Campo label="Nodos visitados para llegar" value={sinDato(evento.nodos_visitados, '—')} />
        </Seccion>
      )}

      {activo && evento.acceso_costoso && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-semibold">
          <Gauge className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Acceso costoso: el nodo está a profundidad {evento.profundidad_nodo}, por encima del límite L = {evento.limite_acceso}.
            Llegar a él requiere visitar {evento.nodos_visitados} nodos.
          </span>
        </div>
      )}
    </div>
  );
};
