import React, { useState } from 'react';
import { Radar, Save } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { CampoFormulario } from '../ui/CampoFormulario';
import { useCarga } from '../../hooks/useCarga';
import { referenciasService } from '../../services/referenciasService';

/** Section 7 parameters: time window W (hours) and radius R (km). */
export const ConfigAsociaciones = ({ isDark }) => {
  const { datos, error } = useCarga(referenciasService.configuracion);
  // null = not edited: the input shows the value saved in the backend
  const [wEditado, setW] = useState(null);
  const [rEditado, setR] = useState(null);
  const w = wEditado ?? (datos ? String(datos.ventana_horas) : '');
  const r = rEditado ?? (datos ? String(datos.radio_km) : '');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const guardar = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await referenciasService.configurar(Number(w), Number(r));
      setW(null);
      setR(null);
      setMensaje({ tipo: 'exito', texto: 'Parámetros guardados: las referencias de todos los eventos se recalcularon.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Panel
      isDark={isDark}
      icono={Radar}
      titulo="Asociaciones · W y R"
      subtitulo="Un evento anterior es candidato a referencia si ocurrió dentro de las W horas previas y a menos de R km."
    >
      {error && <Aviso tipo="error">{error}</Aviso>}
      <form onSubmit={guardar} className="flex flex-wrap items-end gap-3">
        <CampoFormulario etiqueta="W (horas)" isDark={isDark} type="number" min="0.01" step="0.01" required
          value={w} onChange={(e) => setW(e.target.value)} className="w-32" />
        <CampoFormulario etiqueta="R (km)" isDark={isDark} type="number" min="0.01" step="0.01" required
          value={r} onChange={(e) => setR(e.target.value)} className="w-32" />
        <Boton type="submit" icono={Save} cargando={guardando} disabled={!datos}>Guardar</Boton>
      </form>
      {mensaje && <div className="mt-3"><Aviso tipo={mensaje.tipo} onCerrar={() => setMensaje(null)}>{mensaje.texto}</Aviso></div>}
    </Panel>
  );
};
