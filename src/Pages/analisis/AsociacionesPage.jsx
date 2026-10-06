import React, { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Link2, Search } from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Boton } from '../../components/ui/Boton';
import { CampoFormulario } from '../../components/ui/CampoFormulario';
import { AsociacionesEvento } from '../../components/consulta/AsociacionesEvento';
import { ConfigAsociaciones } from '../../components/analisis/ConfigAsociaciones';

/** Associations of one event and the W / R parameters. */
export const AsociacionesPage = () => {
  const { isDark } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const sismoId = Number(params.get('id')) || null;
  const [texto, setTexto] = useState(sismoId ? String(sismoId) : '');

  const buscar = (e) => {
    e.preventDefault();
    setParams(texto ? { id: texto } : {});
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-5 items-start">
      <Panel
        isDark={isDark}
        icono={Link2}
        titulo="Asociaciones de un evento"
      >
        <form onSubmit={buscar} className="flex flex-wrap items-end gap-3 mb-4">
          <CampoFormulario etiqueta="Id del evento" isDark={isDark} type="number" min="1" step="1" required
            value={texto} onChange={(e) => setTexto(e.target.value)} className="w-48" />
          <Boton type="submit" icono={Search}>Ver asociaciones</Boton>
        </form>
        {sismoId
          ? <AsociacionesEvento sismoId={sismoId} isDark={isDark} />
          : <p className={`py-6 text-center text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Escribe el identificador de un evento.</p>}
      </Panel>
      <ConfigAsociaciones isDark={isDark} />
    </div>
  );
};
