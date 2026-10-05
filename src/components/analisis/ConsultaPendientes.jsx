import React, { useState } from 'react';
import { ListOrdered, Search } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { CampoFormulario } from '../ui/CampoFormulario';
import { ResultadoConsulta } from './ResultadoConsulta';
import { useCarga } from '../../hooks/useCarga';
import { consultasService } from '../../services/consultasService';

/** Section 11: the k most important pending events (reverse in-order). */
export const ConsultaPendientes = ({ isDark }) => {
  const [k, setK] = useState('5');
  const { datos, cargando, error, recargar } = useCarga(consultasService.pendientes, { inmediato: false });

  const enviar = (e) => {
    e.preventDefault();
    recargar(Number(k));
  };

  return (
    <Panel
      isDark={isDark}
      icono={ListOrdered}
      titulo="k pendientes más importantes"
      //subtitulo="Recorre el AVL de mayor a menor clave K=(P, M, I) y se detiene al reunir k eventos pendientes."
    >
      <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
        <CampoFormulario
          etiqueta="k"
          isDark={isDark}
          type="number" min="1" step="1" required
          value={k} onChange={(e) => setK(e.target.value)}
          className="w-28"
        />
        <Boton type="submit" icono={Search} cargando={cargando}>Consultar</Boton>
      </form>
      <ResultadoConsulta datos={datos} error={error} isDark={isDark} />
    </Panel>
  );
};
