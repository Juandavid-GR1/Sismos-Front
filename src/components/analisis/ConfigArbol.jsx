import React, { useState } from 'react';
import { SlidersHorizontal, Save } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { CampoFormulario } from '../ui/CampoFormulario';
import { useCarga } from '../../hooks/useCarga';
import { configuracionService } from '../../services/configuracionService';

/**
 * Scenario parameters of the tree:
 *  - L: depth limit; nodes deeper than L are marked as costly access.
 *  - T: minimum age (hours) for a low-priority branch to be archived.
 */
export const ConfigArbol = ({ isDark }) => {
  const { datos, error } = useCarga(configuracionService.obtener);
  // null = not edited: the input shows the value saved in the backend
  const [limiteEditado, setLimite] = useState(null);
  const [antiguedadEditado, setAntiguedad] = useState(null);
  const limite = limiteEditado ?? (datos ? String(datos.limite_profundidad) : '');
  const antiguedad = antiguedadEditado ?? (datos ? String(datos.antiguedad_archivo_horas) : '');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const guardar = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await configuracionService.guardar(Number(limite), Number(antiguedad));
      setLimite(null);
      setAntiguedad(null);
      setMensaje({ tipo: 'exito', texto: 'Parámetros guardados: las marcas de acceso costoso se recalcularon.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Panel
      isDark={isDark}
      icono={SlidersHorizontal}
      titulo="Árbol · L y T"
      subtitulo="L: profundidad máxima de acceso normal (los nodos más profundos se marcan como acceso costoso). T: antigüedad mínima, en horas, para archivar una rama."
    >
      {error && <Aviso tipo="error">{error}</Aviso>}
      <form onSubmit={guardar} className="flex flex-wrap items-end gap-3">
        <CampoFormulario etiqueta="L (niveles)" isDark={isDark} type="number" min="0" step="1" required
          value={limite} onChange={(e) => setLimite(e.target.value)} className="w-32" />
        <CampoFormulario etiqueta="T (horas)" isDark={isDark} type="number" min="0" step="0.5" required
          value={antiguedad} onChange={(e) => setAntiguedad(e.target.value)} className="w-32" />
        <Boton type="submit" icono={Save} cargando={guardando} disabled={!datos}>Guardar</Boton>
      </form>
      {mensaje && <div className="mt-3"><Aviso tipo={mensaje.tipo} onCerrar={() => setMensaje(null)}>{mensaje.texto}</Aviso></div>}
    </Panel>
  );
};
