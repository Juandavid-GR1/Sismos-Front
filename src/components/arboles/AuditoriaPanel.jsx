import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { useCarga } from '../../hooks/useCarga';
import { arbolService } from '../../services/arbolService';

/**
 * Structural audit of the AVL: order of K, heights, balance factors and
 * the id -> node index. Lists every problem found.
 */
export const AuditoriaPanel = ({ isDark }) => {
  const { datos, cargando, error, recargar } = useCarga(arbolService.auditoria);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-zinc-500">Auditoría estructural</span>
        <Boton variante="secundario" isDark={isDark} icono={ClipboardCheck} cargando={cargando} onClick={() => recargar()}>
          Auditar
        </Boton>
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {datos && datos.valido && (
        <Aviso tipo="exito">Estructura válida: orden, alturas, balance e índice por id correctos.</Aviso>
      )}
      {datos && !datos.valido && (
        <Aviso tipo={datos.modoEstres ? 'aviso' : 'error'} titulo={`${datos.problemas.length} problema(s)${datos.modoEstres ? ' · esperado en modo estrés' : ''}`}>
          <ul className="list-disc pl-4 space-y-0.5 max-h-40 overflow-y-auto">
            {datos.problemas.map((p, i) => (
              <li key={i}>
                <strong>{p.tipo}</strong>
                {p.clave && <span className="font-mono"> ({p.clave.join(', ')})</span>}: {p.detalle}
              </li>
            ))}
          </ul>
        </Aviso>
      )}
    </div>
  );
};
