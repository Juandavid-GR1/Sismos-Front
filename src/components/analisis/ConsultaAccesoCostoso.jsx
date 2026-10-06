import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, RefreshCw } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { useCarga } from '../../hooks/useCarga';
import { arbolService } from '../../services/arbolService';
import { formatearClave } from '../../utils/formato';

/**
 * High priority events with costly access. For each one: depth
 * of its node, the limit L and the nodes visited by its search by key.
 */
export const ConsultaAccesoCostoso = ({ isDark }) => {
  const { datos, cargando, error, recargar } = useCarga(arbolService.metricas);
  const eventos = datos?.accesoCostoso ?? [];
  const th = 'px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-zinc-500';
  const td = 'px-3 py-2 text-xs font-semibold whitespace-nowrap';

  return (
    <Panel
      isDark={isDark}
      icono={Cpu}
      titulo="Prioridad alta con acceso costoso"
      subtitulo="Eventos de prioridad alta cuyo nodo está a una profundidad mayor que el límite L."
      acciones={<Boton variante="secundario" isDark={isDark} icono={RefreshCw} cargando={cargando} onClick={() => recargar()}>Consultar</Boton>}
    >
      {error && <Aviso tipo="error">{error}</Aviso>}
      {datos && (
        <div className="space-y-3">
          <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <strong className="text-orange-500">Límite L:</strong> {datos.limiteL ?? '—'}
            {' · '}Profundidad máxima del árbol: {datos.profundidadMaxima ?? '—'}
            {` · ${eventos.length} evento${eventos.length === 1 ? '' : 's'}`}
          </p>
          {eventos.length ? (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-zinc-500/15">
                    <th className={th}>Evento</th>
                    <th className={th}>Clave K</th>
                    <th className={th}>Profundidad</th>
                    <th className={th}>Límite L</th>
                    <th className={th}>Nodos visitados</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((e) => (
                    <tr key={e.clave?.join('-')} className="border-b border-zinc-500/10 last:border-0">
                      <td className={td}>
                        <Link to={`/observatorio/consultar?id=${e.clave?.[2]}`} className="text-orange-500 hover:underline font-black">
                          #{e.clave?.[2]}
                        </Link>
                      </td>
                      <td className={`${td} font-mono`}>{formatearClave(e.clave)}</td>
                      <td className={td}>{e.profundidad}</td>
                      <td className={td}>{datos.limiteL}</td>
                      <td className={td}>{e.visitados}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={`py-6 text-center text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Ningún evento de prioridad alta supera la profundidad L.
            </p>
          )}
        </div>
      )}
    </Panel>
  );
};
