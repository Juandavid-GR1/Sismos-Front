import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  GitBranch,
  Network,
  RefreshCw,
  Activity,
  Database,
  Layers,
  Info,
  CircleDot,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cpu,
  CheckCircle2,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';

// Importación del Navbar Centralizado
import { Navbar } from '../../components/Navbar';

// ============================================================
// COMPONENTES SECUNDARIOS DE UI
// ============================================================

const MetricItem = ({ icon: Icon, label, value, isDark, highlight }) => (
  <div
    className={`p-3.5 rounded-2xl border transition-colors duration-200 relative overflow-hidden group ${
      highlight
        ? isDark
          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
          : 'bg-orange-50 border-orange-200 text-orange-700'
        : isDark
          ? 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
          : 'bg-zinc-50/80 border-zinc-200/80 hover:border-zinc-300'
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500">
        {label}
      </span>
      <Icon className={`w-4 h-4 ${highlight ? 'text-orange-500' : 'text-zinc-500 group-hover:text-orange-500'} transition-colors`} />
    </div>
    <div className="mt-2 text-xl font-black tracking-tight">{value}</div>
  </div>
);

// Renderizador SVG corregido (Puntos de origen estables para hover)
const MockTreeSVG = ({ isDark }) => {
  const nodes = [
    { x: 400, y: 70, val: '5.4', label: 'Raíz', root: true },
    { x: 250, y: 160, val: '3.2', label: 'Izq' },
    { x: 550, y: 160, val: '6.1', label: 'Der' },
    { x: 160, y: 270, val: '2.1', label: 'Hoja' },
    { x: 340, y: 270, val: '4.0', label: 'Hoja' },
    { x: 460, y: 270, val: '5.8', label: 'Hoja' },
    { x: 640, y: 270, val: '7.2', label: 'Hoja' }
  ];

  return (
    <svg className="w-full h-full min-h-[420px]" viewBox="0 0 800 380">
      <defs>
        <linearGradient id="treeLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Enlaces de Aristas (Estables sin parpadeos) */}
      <g stroke="url(#treeLineGrad)" strokeWidth="2" strokeDasharray="4 3">
        <line x1="400" y1="70" x2="250" y2="160" />
        <line x1="400" y1="70" x2="550" y2="160" />
        <line x1="250" y1="160" x2="160" y2="270" />
        <line x1="250" y1="160" x2="340" y2="270" />
        <line x1="550" y1="160" x2="460" y2="270" />
        <line x1="550" y1="160" x2="640" y2="270" />
      </g>

      {/* Nodos con transformOrigin explícito para evitar saltos */}
      {nodes.map((node, i) => (
        <g key={i} className="cursor-pointer group">
          <circle
            cx={node.x}
            cy={node.y}
            r={node.root ? 26 : 22}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            className={`transition-transform duration-200 group-hover:scale-110 ${
              node.root
                ? 'fill-orange-500 stroke-amber-300 stroke-2'
                : isDark
                  ? 'fill-zinc-900 stroke-orange-500/70 stroke-2 group-hover:stroke-orange-400 group-hover:fill-zinc-800'
                  : 'fill-white stroke-orange-500 stroke-2 group-hover:stroke-orange-600 group-hover:fill-orange-50'
            }`}
          />
          <text
            x={node.x}
            y={node.y + 4}
            textAnchor="middle"
            className={`text-xs font-black select-none pointer-events-none transition-colors ${
              node.root ? 'fill-white' : isDark ? 'fill-zinc-100' : 'fill-zinc-900'
            }`}
          >
            {node.val}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ============================================================
// PAGE: VISUALIZACIÓN DE ÁRBOLES
// ============================================================

export const ArbolesPage = () => {
  const [theme, setTheme] = useState('dark');
  const [activeTree, setActiveTree] = useState('bst');
  const [treeState, setTreeState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const isDark = theme === 'dark';

  const loadTreeState = useCallback(async (treeType) => {
    try {
      setLoading(true);
      setError(null);

      // Simulación de respuesta diferida del servidor
      await new Promise((resolve) => setTimeout(resolve, 400));

      setTreeState({
        cantidadNodos: 7,
        altura: 3,
        balance: treeType === 'avl' ? 0 : 2,
        actualizadoEn: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.error('Error obteniendo estado del árbol:', err);
      setError(err?.message || 'No se pudo obtener el estado actual del árbol.');
      setTreeState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTreeState(activeTree);
  }, [activeTree, loadTreeState]);

  const refreshTree = useCallback(() => {
    loadTreeState(activeTree);
  }, [activeTree, loadTreeState]);

  const treeName = useMemo(
    () => (activeTree === 'bst' ? 'Binary Search Tree (BST)' : 'AVL Auto-Balancing Tree'),
    [activeTree]
  );

  const treeDescription = useMemo(
    () =>
      activeTree === 'bst'
        ? 'Estructura jerárquica con búsqueda binaria directa de eventos.'
        : 'Árbol auto-balanceado con rotaciones automáticas en tiempo real.',
    [activeTree]
  );

  const nodeCount = treeState?.cantidadNodos ?? 0;
  const treeHeight = treeState?.altura ?? 0;
  const balance = treeState?.balance ?? 0;

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
      }`}
    >
      {/* 1. NAVBAR CENTRAL GENERAL */}
      <Navbar theme={theme} onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />

      {/* 2. SUB-BARRA DE CONTROL DEL VISUALIZADOR */}
      <div
        className={`border-b px-6 py-3 transition-colors duration-300 backdrop-blur-xl ${
          isDark ? 'border-zinc-800/80 bg-zinc-950/60' : 'border-zinc-200/80 bg-white/60'
        }`}
      >
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'
              }`}
            >
              <Workflow className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight">Visualizador de Estructuras</h1>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Estado y topología sincronizada en tiempo real
              </p>
            </div>
          </div>

          {/* Selector de Árbol BST / AVL */}
          <div className="flex items-center gap-3">
            <div
              className={`flex p-1 rounded-xl border ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTree('bst')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTree === 'bst'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : isDark
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>BST</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTree('avl')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTree === 'avl'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : isDark
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>AVL</span>
              </button>
            </div>

            <button
              type="button"
              onClick={refreshTree}
              disabled={loading}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-orange-500/40 hover:text-orange-400'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-orange-300 hover:text-orange-600'
              }`}
              title="Sincronizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL Y LIENZO */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* PANEL LATERAL DE MÉTRICAS */}
        <aside className="space-y-4">
          <div
            className={`p-5 rounded-3xl border transition-all ${
              isDark ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-500/10">
              <Database className="w-4 h-4 text-orange-500" />
              <h2 className="text-xs font-black uppercase tracking-wider">Métricas de Árbol</h2>
            </div>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase text-zinc-500">Modelo en Pantalla</span>
              <h3 className="text-base font-black text-orange-500 flex items-center gap-1.5 mt-0.5">
                {treeName}
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {treeDescription}
              </p>
            </div>

            <div className="space-y-3">
              <MetricItem icon={Layers} label="Nodos Registrados" value={nodeCount} isDark={isDark} />
              <MetricItem icon={Activity} label="Altura Máxima" value={treeHeight} isDark={isDark} />
              {activeTree === 'avl' && (
                <MetricItem
                  icon={SlidersHorizontal}
                  label="Factor de Balance"
                  value={balance}
                  isDark={isDark}
                  highlight
                />
              )}
            </div>

            <div
              className={`mt-5 p-3.5 rounded-2xl border flex gap-3 items-start ${
                isDark
                  ? 'bg-orange-500/5 border-orange-500/15 text-zinc-400'
                  : 'bg-orange-50/60 border-orange-200/60 text-zinc-600'
              }`}
            >
              <Cpu className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Operaciones de <strong>inserción</strong>, <strong>eliminación</strong> y{' '}
                <strong>rotación</strong> son calculadas únicamente por el servidor.
              </p>
            </div>
          </div>
        </aside>

        {/* CANVA VISUALIZADOR DE ÁRBOLES */}
        <section
          className={`rounded-3xl border min-h-[550px] flex flex-col overflow-hidden relative transition-all ${
            isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          {/* BARRA SUPERIOR DEL LIENZO */}
          <div
            className={`px-6 py-3 border-b flex items-center justify-between backdrop-blur-md z-10 ${
              isDark ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-zinc-200/80 bg-zinc-50/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <CircleDot className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-wider">
                {activeTree.toUpperCase()} Viewport
              </span>
              {treeState?.actualizadoEn && (
                <span className={`text-[10px] ml-2 font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Sync: {treeState.actualizadoEn}
                </span>
              )}
            </div>

            {/* Controles de Zoom */}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center px-2 py-1 rounded-lg border text-[11px] font-mono mr-1 ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                }`}
              >
                <span>{zoomLevel}%</span>
              </div>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                className={`p-1.5 rounded-lg border ${
                  isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 50))}
                className={`p-1.5 rounded-lg border ${
                  isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className={`p-1.5 rounded-lg border ${
                  isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ÁREA DE GRAFO DEL ÁRBOL */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
            {/* Cuadrícula de fondo */}
            <div
              className={`absolute inset-0 pointer-events-none opacity-15 ${
                isDark
                  ? 'bg-[radial-gradient(#f97316_1px,transparent_1px)]'
                  : 'bg-[radial-gradient(#d4d4d8_1px,transparent_1px)]'
              } [background-size:24px_24px]`}
            />

            {/* Indicador de Carga */}
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-zinc-950/20">
                <div
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-xl ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                  <span className="text-xs font-bold">Obteniendo nodos...</span>
                </div>
              </div>
            )}

            {/* Render del Árbol con transformación de zoom centrada */}
            {!loading && !error && (
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
              >
                <MockTreeSVG isDark={isDark} />
              </div>
            )}
          </div>

          {/* FOOTER DEL LIENZO */}
          <div
            className={`px-6 py-2.5 border-t flex items-center justify-between text-[11px] font-mono ${
              isDark ? 'border-zinc-800/80 text-zinc-500 bg-zinc-950/40' : 'border-zinc-200/80 text-zinc-500 bg-zinc-50/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span>Estructura: <strong className="text-orange-500">{activeTree.toUpperCase()}</strong></span>
              <span>Nodos: <strong>{nodeCount}</strong></span>
              <span>Altura: <strong>{treeHeight}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500 font-sans font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Conectado</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};