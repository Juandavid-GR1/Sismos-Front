import React, { useRef, useState } from 'react';
import { FileUp, Upload } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { ComparacionCarga } from './ComparacionCarga';
import { escenarioService } from '../../services/escenarioService';
import { arbolService } from '../../services/arbolService';

const TIPOS = [
  {
    valor: 'inserciones',
    etiqueta: 'Carga por inserciones',
    //detalle: 'Arreglo "eventos" con ids únicos. Se insertan en ese orden en el AVL (con balanceo) y en un BST.',
  },
  {
    valor: 'topologia',
    etiqueta: 'Carga por topología',
    //detalle: 'Archivo exportado: recupera la forma exacta del árbol, la cola, el reloj y el resto del estado.',
  },
];


export const CargarEscenario = ({ isDark }) => {
  const entrada = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [tipo, setTipo] = useState('topologia');
  const [trabajando, setTrabajando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [comparacion, setComparacion] = useState(null);
  const [error, setError] = useState(null);

  const cargar = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    try {
      setTrabajando(true);
      setError(null);
      setResultado(null);
      setComparacion(null);
      const respuesta = await escenarioService.cargar(archivo, tipo);
      setResultado(respuesta);
      if (respuesta.tipo_carga === 'inserciones' && respuesta.cantidad_eventos > 0) {
        const datos = await arbolService.comparacion('original');
        setComparacion(datos?.resultados?.[0] ?? null);
      }
      setArchivo(null);
      if (entrada.current) entrada.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setTrabajando(false);
    }
  };

  const opcion = (activo) => `flex-1 min-w-[220px] text-left p-3 rounded-2xl border transition-colors ${
    activo
      ? isDark ? 'border-orange-500/50 bg-orange-500/10' : 'border-orange-300 bg-orange-50'
      : isDark ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-200 hover:border-zinc-300'
  }`;

  return (
    <Panel
      isDark={isDark}
      icono={FileUp}
      titulo="Cargar escenario"
      subtitulo="Selecciona un archivo JSON y el modo de carga."
    >
      <form onSubmit={cargar} className="space-y-4">
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Modo de carga">
          {TIPOS.map((t) => (
            <button key={t.valor} type="button" role="radio" aria-checked={tipo === t.valor}
              onClick={() => setTipo(t.valor)} className={opcion(tipo === t.valor)}>
              <span className={`block text-xs font-black ${tipo === t.valor ? 'text-orange-500' : ''}`}>{t.etiqueta}</span>
              <span className={`block text-[11px] mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.detalle}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={entrada}
            type="file"
            accept=".json,application/json"
            aria-label="Archivo JSON del escenario"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className={`text-xs font-semibold file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:text-xs file:font-bold ${
              isDark ? 'text-zinc-300 file:bg-zinc-800 file:text-zinc-200' : 'text-zinc-700 file:bg-zinc-100 file:text-zinc-700'
            }`}
          />
          <Boton type="submit" icono={Upload} cargando={trabajando} disabled={!archivo}>Cargar</Boton>
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {error && (
          <Aviso tipo="error" titulo="Carga rechazada" onCerrar={() => setError(null)}>
            {error} Se conservó el escenario anterior.
          </Aviso>
        )}
        {resultado && (
          <Aviso tipo={resultado.modo_estres ? 'aviso' : 'exito'} titulo={resultado.mensaje} onCerrar={() => setResultado(null)}>
            {resultado.cantidad_eventos} eventos activos cargados por {resultado.tipo_carga}.
            {resultado.modo_estres && ' La topología está desbalanceada: quedó cargada en modo estrés.'}
            {' '}La carga se puede revertir con «Deshacer».
          </Aviso>
        )}
        <ComparacionCarga resultado={comparacion} isDark={isDark} />
      </div>
    </Panel>
  );
};
