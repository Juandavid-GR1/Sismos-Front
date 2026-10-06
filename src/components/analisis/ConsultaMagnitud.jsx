import React, { useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { CampoFormulario } from '../ui/CampoFormulario';
import { Aviso } from '../ui/Aviso';
import { ResultadoConsulta } from './ResultadoConsulta';
import { useCarga } from '../../hooks/useCarga';
import { consultasService } from '../../services/consultasService';

/** Section 11: active events with magnitude in [min, max]. */
export const ConsultaMagnitud = ({ isDark }) => {
  const [min, setMin] = useState('3');
  const [max, setMax] = useState('6');
  const [invalido, setInvalido] = useState(null);
  const { datos, cargando, error, recargar } = useCarga(consultasService.porMagnitud, { inmediato: false });

  const enviar = (e) => {
    e.preventDefault();
    if (Number(min) > Number(max)) {
      setInvalido('La magnitud mínima no puede ser mayor que la máxima.');
      return;
    }
    setInvalido(null);
    recargar(Number(min), Number(max));
  };

  return (
    <Panel
      isDark={isDark}
      icono={Activity}
      titulo="Rango de magnitud"
      subtitulo="Eventos activos con magnitud entre un mínimo y un máximo."
    >
      <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
        <CampoFormulario etiqueta="Mínima" isDark={isDark} type="number" step="0.1" min="0" max="10" required
          value={min} onChange={(e) => setMin(e.target.value)} className="w-28" />
        <CampoFormulario etiqueta="Máxima" isDark={isDark} type="number" step="0.1" min="0" max="10" required
          value={max} onChange={(e) => setMax(e.target.value)} className="w-28" />
        <Boton type="submit" icono={Search} cargando={cargando}>Consultar</Boton>
      </form>
      {invalido && <div className="mt-3"><Aviso tipo="aviso">{invalido}</Aviso></div>}
      <ResultadoConsulta datos={datos} error={error} isDark={isDark} />
    </Panel>
  );
};
