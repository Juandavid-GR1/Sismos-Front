import React from 'react';
import { Link } from 'react-router-dom';
import { EstadoBadge, PrioridadBadge } from './EstadoBadge';
import { formatearClave, formatearFecha } from '../../utils/formato';

/**
 * Table of events returned by any query (pending, magnitude, depth/date,
 * archive history). Each id links to "Consultar evento".
 * mostrarPersistencia: also show activo/archivado/retirado.
 */
export const TablaEventos = ({ eventos = [], isDark, vacio = 'Sin resultados.', mostrarPersistencia = false }) => {
  if (!eventos.length) {
    return <p className={`py-8 text-center text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{vacio}</p>;
  }
  const th = `px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`;
  const td = 'px-3 py-2 text-xs font-semibold whitespace-nowrap';
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-zinc-500/15">
            <th className={th}>#</th>
            <th className={th}>Evento</th>
            <th className={th}>Clave K</th>
            <th className={th}>Prioridad</th>
            <th className={th}>Magnitud</th>
            <th className={th}>Prof.</th>
            <th className={th}>Ocurrencia</th>
            <th className={th}>Atención</th>
            {mostrarPersistencia && <th className={th}>Estado</th>}
          </tr>
        </thead>
        <tbody>
          {eventos.map((e, i) => (
            <tr key={`${e.id}-${i}`} className={`border-b border-zinc-500/10 last:border-0 ${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-orange-50/50'}`}>
              <td className={`${td} text-zinc-500`}>{i + 1}</td>
              <td className={td}>
                <Link to={`/observatorio/consultar?id=${e.id}`} className="text-orange-500 hover:underline font-black">
                  {e.formatted_id ?? `#${e.id}`}
                </Link>
              </td>
              <td className={`${td} font-mono`}>{formatearClave(e.clave)}</td>
              <td className={td}><PrioridadBadge prioridad={e.prioridad} /></td>
              <td className={td}>M {e.magnitude}</td>
              <td className={td}>{e.depth} km</td>
              <td className={td}>{formatearFecha(e.timestamp)}</td>
              <td className={td}><EstadoBadge estado={e.status} /></td>
              {mostrarPersistencia && <td className={td}><EstadoBadge estado={e.estado_persistencia} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
