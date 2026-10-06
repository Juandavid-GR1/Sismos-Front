import React, { useState } from 'react';
import { GitBranch, Archive } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { CampoFormulario } from '../ui/CampoFormulario';
import { archivoService } from '../../services/archivoService';

/** Section 10: archive the whole AVL subtree rooted at a chosen event. */
export const ArchivoManual = ({ isDark }) => {
  const [raiz, setRaiz] = useState('');
  const [trabajando, setTrabajando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    const id = Number(raiz);
    if (!window.confirm(`Se archivará el subárbol completo con raíz #${id}. ¿Continuar?`)) return;
    try {
      setTrabajando(true);
      setError(null);
      setResultado(await archivoService.archivarRama(id));
      setRaiz('');
    } catch (err) {
      setError(err.message);
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <Panel
      isDark={isDark}
      icono={GitBranch}
      titulo="Archivar rama por raíz"
      subtitulo="Retira del árbol activo el subárbol completo cuyo nodo raíz es el evento indicado. Los eventos pasan al histórico como archivados."
    >
      <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
        <CampoFormulario etiqueta="Id del evento raíz" isDark={isDark} type="number" min="1" step="1" required
          value={raiz} onChange={(e) => setRaiz(e.target.value)} className="w-48" />
        <Boton type="submit" icono={Archive} cargando={trabajando}>Archivar</Boton>
      </form>
      <div className="mt-3 space-y-2">
        {error && <Aviso tipo="error">{error}</Aviso>}
        {resultado && (
          <Aviso tipo="exito" titulo="Rama archivada" onCerrar={() => setResultado(null)}>
            {resultado.cantidad} evento(s) archivados: {(resultado.eventos_archivados ?? resultado.ids_eliminados ?? []).join(', ')}.
          </Aviso>
        )}
      </div>
    </Panel>
  );
};
