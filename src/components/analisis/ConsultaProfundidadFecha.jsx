import React, { useState } from 'react';
import { CalendarRange, Search } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { CampoFormulario } from '../ui/CampoFormulario';
import { Aviso } from '../ui/Aviso';
import { ResultadoConsulta } from './ResultadoConsulta';
import { useCarga } from '../../hooks/useCarga';
import { consultasService } from '../../services/consultasService';
import { aInputFecha, deInputFecha } from '../../utils/formato';

const hace = (dias) => aInputFecha(new Date(Date.now() - dias * 86400000).toISOString());

/** Section 11: shallow events (depth <= max) inside a date interval. */
export const ConsultaProfundidadFecha = ({ isDark }) => {
  const [profundidad, setProfundidad] = useState('70');
  const [desde, setDesde] = useState(hace(365));
  const [hasta, setHasta] = useState(hace(-1));
  const [invalido, setInvalido] = useState(null);
  const { datos, cargando, error, recargar } = useCarga(consultasService.porProfundidadYFecha, { inmediato: false });

  const enviar = (e) => {
    e.preventDefault();
    if (new Date(desde) > new Date(hasta)) {
      setInvalido('La fecha inicial no puede ser posterior a la final.');
      return;
    }
    setInvalido(null);
    recargar(Number(profundidad), deInputFecha(desde), deInputFecha(hasta));
  };

  return (
    <Panel
      isDark={isDark}
      icono={CalendarRange}
      titulo="Profundidad máxima e intervalo de fechas"
    >
      <form onSubmit={enviar} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_auto] items-end gap-3">
        <CampoFormulario etiqueta="Prof. máx (km)" isDark={isDark} type="number" step="0.1" min="0" required
          value={profundidad} onChange={(e) => setProfundidad(e.target.value)} />
        <CampoFormulario etiqueta="Desde" isDark={isDark} type="datetime-local" step="1" required
          value={desde} onChange={(e) => setDesde(e.target.value)} />
        <CampoFormulario etiqueta="Hasta" isDark={isDark} type="datetime-local" step="1" required
          value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <Boton type="submit" icono={Search} cargando={cargando}>Consultar</Boton>
      </form>
      {invalido && <div className="mt-3"><Aviso tipo="aviso">{invalido}</Aviso></div>}
      <ResultadoConsulta datos={datos} error={error} isDark={isDark} />
    </Panel>
  );
};
