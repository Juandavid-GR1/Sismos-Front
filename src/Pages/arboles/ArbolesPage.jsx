import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  GitBranch, Network, RefreshCw, Activity, Database, Layers, SlidersHorizontal,
  Workflow, AlertTriangle, RotateCw, Scale, Cpu,
} from 'lucide-react';

import { Navbar } from '../../components/Navbar';
import { Aviso } from '../../components/ui/Aviso';
import { Indicador } from '../../components/ui/Indicador';
import { LienzoArbol } from '../../components/arboles/LienzoArbol';
import { ControlBalanceo } from '../../components/arboles/ControlBalanceo';
import { AuditoriaPanel } from '../../components/arboles/AuditoriaPanel';
import { RecorridosPanel } from '../../components/arboles/RecorridosPanel';
import { ComparacionArboles, SelectorDibujo } from '../../components/arboles/ComparacionArboles';
import { useTema } from '../../hooks/useTema';
import { useCarga } from '../../hooks/useCarga';
import { arbolService } from '../../services/arbolService';

const cargarArbol = async () => {
  const [metricas, topologia] = await Promise.all([arbolService.metricas(), arbolService.topologia()]);
  return { metricas, topologia };
};

// Only the original insertion order (arrival order of the events)
const cargarComparacion = () => arbolService.comparacion('original');

const VISTAS = [
  { valor: 'avl', etiqueta: 'AVL activo', icono: Network },
  { valor: 'bst', etiqueta: 'AVL vs BST', icono: GitBranch },
];

/**
 * Tree page.
 *  - "AVL activo": the real tree of the catalog (/arbol/topologia) with
 *    metrics, traversals, stress mode / recovery and the audit.
 *  - "AVL vs BST": the same keys, in their original order, inserted into
 *    an AVL and into a plain BST (/arbol/comparacion) to compare them
 *    (section 15).
 */
export const ArbolesPage = () => {
  const { theme, isDark, alternarTema } = useTema();
  const navigate = useNavigate();
  // ?vista=bst opens the comparison directly (link shown after a load by insertions)
  const [parametros] = useSearchParams();
  const [vistaInicial] = useState(() => (parametros.get('vista') === 'bst' ? 'bst' : 'avl'));
  const [vista, setVista] = useState(vistaInicial);
  const [verArbol, setVerArbol] = useState('bst');

  const arbol = useCarga(cargarArbol);
  const comparacion = useCarga(cargarComparacion, { inmediato: vistaInicial === 'bst' });

  const cambiarVista = (nueva) => {
    setVista(nueva);
    if (nueva === 'bst') comparacion.recargar();
  };

  const metricas = arbol.datos?.metricas;
  const resultado = comparacion.datos?.resultados?.[0];
  const error = vista === 'avl' ? arbol.error : comparacion.error;
  const abrirEvento = (id) => navigate(`/observatorio/consultar?id=${id}`);

  const casos = metricas?.contadores?.casos ?? {};
  const giros = metricas?.contadores?.giros ?? {};

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <Navbar theme={theme} onToggleTheme={alternarTema} />

      {/* Sub-barra: vista y sincronizar */}
      <div className={`border-b px-6 py-3 backdrop-blur-xl ${isDark ? 'border-zinc-800/80 bg-zinc-950/60' : 'border-zinc-200/80 bg-white/60'}`}>
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
              <Workflow className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight">Visualizador de Estructuras</h1>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Haz clic en un nodo para consultar el evento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
              {VISTAS.map(({ valor, etiqueta, icono: Icono }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => cambiarVista(valor)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    vista === valor ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Icono className="w-3.5 h-3.5" /> {etiqueta}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => (vista === 'avl' ? arbol.recargar() : comparacion.recargar())}
              title="Sincronizar"
              aria-label="Sincronizar"
              className={`p-2 rounded-xl border transition-all active:scale-95 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-orange-400' : 'bg-white border-zinc-200 text-zinc-700 hover:text-orange-600'}`}
            >
              <RefreshCw className={`w-4 h-4 ${arbol.cargando || comparacion.cargando ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-[1700px] w-full mx-auto px-6 pt-4">
          <Aviso tipo="error">{error}</Aviso>
        </div>
      )}

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className={`p-5 rounded-3xl border space-y-4 h-fit ${isDark ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-500/10">
            <Database className="w-4 h-4 text-orange-500" />
            <h2 className="text-xs font-black uppercase tracking-wider">
              {vista === 'avl' ? 'Métricas del AVL' : 'Comparación AVL vs BST'}
            </h2>
          </div>

          {vista === 'avl' && metricas && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Indicador isDark={isDark} icono={Layers} etiqueta="Nodos" valor={metricas.cantidadNodos} />
                <Indicador isDark={isDark} icono={Activity} etiqueta="Altura" valor={metricas.altura} />
                <Indicador isDark={isDark} icono={Layers} etiqueta="Hojas" valor={metricas.hojas} />
                <Indicador isDark={isDark} icono={SlidersHorizontal} etiqueta="Balance raíz" valor={metricas.balance} resaltado />
              </div>
              <Indicador isDark={isDark} icono={RotateCw} etiqueta="Casos LL / RR / LR / RL"
                valor={['LL', 'RR', 'LR', 'RL'].map((c) => casos[c] ?? 0).join(' / ')}
                detalle={`Giros izquierda / derecha: ${giros.izquierda ?? 0} / ${giros.derecha ?? 0}`} />
              <Indicador isDark={isDark} icono={Cpu} etiqueta={`Acceso costoso (L = ${metricas.limiteL ?? '—'})`}
                valor={(metricas.accesoCostoso ?? []).length}
                detalle={`Profundidad máxima: ${metricas.profundidadMaxima ?? 0}`} />
              {metricas.modoEstres && <Indicador isDark={isDark} icono={AlertTriangle} etiqueta="Modo estrés" valor="ACTIVO" resaltado />}
              <div className="pt-3 border-t border-zinc-500/10">
                <ControlBalanceo isDark={isDark} modoEstres={metricas.modoEstres} cantidadNodos={metricas.cantidadNodos} />
              </div>
              <div className="pt-3 border-t border-zinc-500/10">
                <AuditoriaPanel isDark={isDark} />
              </div>
              <div className="pt-3 border-t border-zinc-500/10">
                <RecorridosPanel isDark={isDark} recorridos={metricas.recorridos} />
              </div>
            </>
          )}

          {vista === 'bst' && (
            <>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Árbol en el lienzo</span>
                <SelectorDibujo valor={verArbol} onCambiar={setVerArbol} isDark={isDark} />
              </div>
              <ComparacionArboles resultado={resultado} isDark={isDark} />
              <div className={`p-3 rounded-2xl border flex gap-2 items-start text-[11px] leading-relaxed ${isDark ? 'bg-orange-500/5 border-orange-500/15 text-zinc-400' : 'bg-orange-50/60 border-orange-200/60 text-zinc-600'}`}>
                <Scale className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                Mismas claves y mismo orden de llegada en los dos árboles: el BST queda con la forma que dicte ese orden, mientras que el AVL rota para conservar una altura logarítmica.
              </div>
            </>
          )}
        </aside>

        {vista === 'avl' ? (
          <LienzoArbol
            titulo={`AVL activo${metricas?.actualizadoEn ? ` · sync ${metricas.actualizadoEn}` : ''}`}
            raiz={arbol.datos?.topologia?.raiz}
            isDark={isDark}
            cargando={arbol.cargando}
            error={arbol.error}
            onSeleccionar={abrirEvento}
            pie={metricas && <><span>Nodos: <strong>{metricas.cantidadNodos}</strong></span><span>Altura: <strong>{metricas.altura}</strong></span></>}
          />
        ) : (
          <LienzoArbol
            titulo={`${verArbol.toUpperCase()} · orden original`}
            raiz={resultado?.topologia?.[verArbol]}
            isDark={isDark}
            cargando={comparacion.cargando}
            error={comparacion.error}
            onSeleccionar={abrirEvento}
            conAcceso={false}
            vacio={resultado && !resultado.topologia
              ? 'El backend no envía la forma de los árboles comparados (falta topologia=1 en /arbol/comparacion). La tabla de la izquierda sí es válida.'
              : undefined}
            pie={resultado && <span>Altura: <strong>{resultado[verArbol]?.altura}</strong></span>}
          />
        )}
      </main>
    </div>
  );
};

