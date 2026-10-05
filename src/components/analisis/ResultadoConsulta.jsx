import React from 'react';
import { Aviso } from '../ui/Aviso';
import { TablaEventos } from '../ui/TablaEventos';

/**
 * Common result block of the section 11 queries: error, the criterion the
 * backend used to walk the AVL, and the events table.
 */
export const ResultadoConsulta = ({ datos, error, isDark }) => {
  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!datos) return null;
  const eventos = datos.eventos ?? [];
  return (
    <div className="space-y-3 mt-4">
      {datos.criterio && (
        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <strong className="text-orange-500">Recorrido:</strong> {datos.criterio}
          {typeof datos.nodos_visitados === 'number' && ` · ${datos.nodos_visitados} nodos visitados`}
          {` · ${eventos.length} resultado${eventos.length === 1 ? '' : 's'}`}
        </p>
      )}
      <TablaEventos eventos={eventos} isDark={isDark} vacio="Ningún evento activo cumple el criterio." />
    </div>
  );
};
