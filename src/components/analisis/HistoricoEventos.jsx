import React, { useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Aviso } from '../ui/Aviso';
import { TablaEventos } from '../ui/TablaEventos';
import { useCarga } from '../../hooks/useCarga';
import { archivoService } from '../../services/archivoService';

const FILTROS = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'archivado', etiqueta: 'Archivados' },
  { valor: 'retirado', etiqueta: 'Retirados' },
];

/** Events that left the active tree: archived branches and deleted events. */
export const HistoricoEventos = ({ isDark }) => {
  const { datos, error } = useCarga(archivoService.historico);
  const [filtro, setFiltro] = useState('todos');

  const eventos = useMemo(
    () => (datos ?? []).filter((e) => filtro === 'todos' || e.estado_persistencia === filtro),
    [datos, filtro]
  );

  return (
    <Panel
      isDark={isDark}
      icono={History}
      titulo="Histórico"
      subtitulo="Eventos fuera del árbol activo. Un reporte que llegue para un evento archivado lo confirma o lo reactiva."
      acciones={
        <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                filtro === f.valor ? 'bg-orange-500 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
      }
    >
      {error ? <Aviso tipo="error">{error}</Aviso> : (
        <TablaEventos eventos={eventos} isDark={isDark} mostrarPersistencia vacio="El histórico está vacío." />
      )}
    </Panel>
  );
};
