import React, { useState } from 'react';
import { CircleDot, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { TreeSVG, LeyendaArbol } from './TreeSVG';

const BotonZoom = ({ isDark, onClick, titulo, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={titulo}
    aria-label={titulo}
    className={`p-1.5 rounded-lg border ${isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'}`}
  >
    {children}
  </button>
);

/**
 * Canvas of the tree page: header (title + zoom), dotted background, the
 * SVG drawing and a footer with the legend and short metrics.
 */
export const LienzoArbol = ({ titulo, raiz, isDark, cargando, error, pie, onSeleccionar, conAcceso = true, vacio }) => {
  const [zoom, setZoom] = useState(100);

  return (
    <section
      className={`rounded-3xl border min-h-[550px] flex flex-col overflow-hidden relative transition-all ${
        isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-sm'
      }`}
    >
      <div className={`px-6 py-3 border-b flex items-center justify-between gap-3 backdrop-blur-md z-10 ${
        isDark ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-zinc-200/80 bg-zinc-50/50'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <CircleDot className={`w-3.5 h-3.5 shrink-0 ${error ? 'text-rose-500' : 'text-emerald-500'}`} />
          <span className="text-xs font-black uppercase tracking-wider truncate">{titulo}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-1 rounded-lg border text-[11px] font-mono mr-1 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>
            {zoom}%
          </span>
          <BotonZoom isDark={isDark} titulo="Acercar" onClick={() => setZoom((z) => Math.min(z + 10, 150))}><ZoomIn className="w-3.5 h-3.5" /></BotonZoom>
          <BotonZoom isDark={isDark} titulo="Alejar" onClick={() => setZoom((z) => Math.max(z - 10, 50))}><ZoomOut className="w-3.5 h-3.5" /></BotonZoom>
          <BotonZoom isDark={isDark} titulo="Tamaño original" onClick={() => setZoom(100)}><Maximize2 className="w-3.5 h-3.5" /></BotonZoom>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto flex items-center justify-center p-8">
        <div className={`absolute inset-0 pointer-events-none opacity-15 ${
          isDark ? 'bg-[radial-gradient(#f97316_1px,transparent_1px)]' : 'bg-[radial-gradient(#d4d4d8_1px,transparent_1px)]'
        } [background-size:24px_24px]`} />

        {cargando && !raiz && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <span className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-xl text-xs font-bold ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" /> Obteniendo nodos...
            </span>
          </div>
        )}

        {!error && (
          <div className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}>
            <TreeSVG raiz={raiz} isDark={isDark} onSeleccionar={onSeleccionar} vacio={vacio} />
          </div>
        )}
      </div>

      <div className={`px-6 py-2.5 border-t flex flex-wrap items-center justify-between gap-2 ${
        isDark ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-zinc-200/80 bg-zinc-50/50'
      }`}>
        <LeyendaArbol isDark={isDark} conAcceso={conAcceso} />
        {pie && <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-4">{pie}</div>}
      </div>
    </section>
  );
};
