import React, { useState } from 'react';
import { Download, Save } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { escenarioService } from '../../services/escenarioService';

const nombreArchivo = () => {
  const ahora = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
  return `sismolab-escenario-${ahora}.json`;
};

/** Hands a JSON object to the browser as a file download. */
const descargarJson = (datos, nombre) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
};

/**
 * Structural save: downloads the complete operating scenario
 * (real topology, events, history, retired ids, queue, clock, zones,
 * parameters, references and counters). The file can be loaded again with
 * "Carga por topología".
 */
export const ExportarEscenario = ({ isDark }) => {
  const [trabajando, setTrabajando] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  const exportar = async () => {
    try {
      setTrabajando(true);
      setError(null);
      const escenario = await escenarioService.exportar();
      const nombre = nombreArchivo();
      descargarJson(escenario, nombre);
      setResumen({
        nombre,
        eventos: escenario.sismos?.length ?? 0,
        historico: escenario.historico?.length ?? 0,
        cola: escenario.cola?.length ?? 0,
        estres: escenario.arbol?.modoEstres,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <Panel
      isDark={isDark}
      icono={Save}
      titulo="Exportar escenario"
      //subtitulo="Guarda en un archivo JSON todo el estado: topología real del AVL, eventos, histórico, retirados, cola, reloj, zonas, parámetros, asociaciones y contadores."
    >
      <Boton icono={Download} cargando={trabajando} onClick={exportar}>Descargar JSON</Boton>
      <div className="mt-3 space-y-2">
        {error && <Aviso tipo="error">{error}</Aviso>}
        {resumen && (
          <Aviso tipo="exito" titulo="Escenario exportado" onCerrar={() => setResumen(null)}>
            {resumen.nombre}: {resumen.eventos} eventos activos, {resumen.historico} en el histórico y {resumen.cola} reportes en cola
            {resumen.estres ? ' (árbol en modo estrés)' : ''}. Se carga de nuevo con «Carga por topología».
          </Aviso>
        )}
      </div>
    </Panel>
  );
};
