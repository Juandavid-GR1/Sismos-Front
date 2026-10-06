import React, { useState } from 'react';
import { Archive, Eye, RefreshCw } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { Indicador } from '../ui/Indicador';
import { useCarga } from '../../hooks/useCarga';
import { archivoService } from '../../services/archivoService';
import { formatearNumero } from '../../utils/formato';

/**
 * Section 10: preview of the branch chosen by the automatic rules
 * (low priority, every event older than T, largest branch) and the
 * button that archives it as one single undoable action.
 */
export const RamaElegible = ({ isDark }) => {
  const { datos, cargando, error, recargar } = useCarga(archivoService.previsualizarElegible);
  const [archivando, setArchivando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState(null);

  const archivar = async () => {
    if (!window.confirm(`¿Archivar la rama con raíz #${datos.raiz} (${datos.cantidad} eventos)?`)) return;
    try {
      setArchivando(true);
      setErrorArchivo(null);
      setResultado(await archivoService.archivarElegible());
    } catch (err) {
      setErrorArchivo(err.message);
    } finally {
      setArchivando(false);
    }
  };

  const elegible = datos?.elegible;

  return (
    <Panel
      isDark={isDark}
      icono={Eye}
      titulo="Rama elegible para archivo"
      subtitulo="Subárbol de prioridad baja cuyos eventos superan T horas de antigüedad según el reloj del escenario. Si hay varias, se elige la de más nodos."
      acciones={<Boton variante="secundario" isDark={isDark} icono={RefreshCw} cargando={cargando} onClick={() => recargar()}>Revisar</Boton>}
    >
      {error && <Aviso tipo="error">{error}</Aviso>}
      {datos && !elegible && <Aviso tipo="info">{datos.mensaje || 'No existe una rama elegible para archivo.'}</Aviso>}

      {elegible && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Indicador isDark={isDark} etiqueta="Raíz" valor={`#${datos.raiz}`} resaltado />
            <Indicador isDark={isDark} etiqueta="Eventos" valor={datos.cantidad} />
            <Indicador isDark={isDark} etiqueta="Profundidad raíz" valor={datos.profundidad_raiz} />
            <Indicador isDark={isDark} etiqueta="Antigüedad mín." valor={`${formatearNumero(datos.antiguedad_minima_horas, 1)} h`} detalle={`T = ${datos.T} h`} />
          </div>
          <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <strong className="text-orange-500">Eventos de la rama:</strong> {datos.ids.join(', ')}
            <br />
            <strong className="text-orange-500">Justificación:</strong> {datos.justificacion}
          </p>
          {datos.candidatos?.length > 1 && (
            <div className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Otras ramas elegibles:{' '}
              {datos.candidatos
                .filter((c) => c.raiz !== datos.raiz)
                .map((c) => `#${c.raiz} (${c.cantidad} nodos, prof. ${c.profundidad_raiz})`)
                .join(' · ')}
            </div>
          )}
          <Boton icono={Archive} cargando={archivando} onClick={archivar}>Archivar esta rama</Boton>
        </div>
      )}

      {errorArchivo && <div className="mt-3"><Aviso tipo="error">{errorArchivo}</Aviso></div>}
      {resultado && (
        <div className="mt-3">
          <Aviso tipo="exito" titulo="Rama archivada" onCerrar={() => setResultado(null)}>
            Se archivaron {resultado.cantidad} evento(s): {(resultado.eventos_archivados ?? resultado.ids_eliminados ?? []).join(', ')}. Puedes revertirlo con «Deshacer».
          </Aviso>
        </div>
      )}
    </Panel>
  );
};
