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
  AlertTriangle,
  SlidersHorizontal,
  Workflow,
  Zap,
  ShieldCheck,
  Loader2
} from 'lucide-react';

// Importación del Navbar Centralizado
import { Navbar } from '../../components/Navbar';

// ============================================================
// API CONNECTION: same backend as the rest of the app (VITE_API_URL in
// .env). The old hardcoded 127.0.0.1 URL broke on any other machine.
// ============================================================
const ARBOL_API_URL = import.meta.env.VITE_API_URL?.trim() || 'http://127.0.0.1:5000';

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

// ============================================================
// RENDERIZADOR DINÁMICO DEL ÁRBOL
// Reemplaza a MockTreeSVG: calcula posiciones a partir de la
// topología real que devuelve GET /arbol/topologia, en vez de usar
// 7 nodos fijos.
// ============================================================

const ESPACIO_HORIZONTAL = 90;
const ESPACIO_VERTICAL = 110;
const RADIO_NODO = 28;
// Empty space around the drawing so the first/last node and the root are
// never cut in half by the edge of the viewBox.
const MARGEN = RADIO_NODO + 22;

/**
 * Recorre la topología (recursiva, hijoIzquierdo/hijoDerecho anidados)
 * y le asigna a cada nodo una posición (x, y):
 *  - x: según su posición en el recorrido INORDEN (izquierda a
 *    derecha), igual que se ve un árbol dibujado a mano.
 *  - y: según su profundidad (nivel).
 * Se apoya en un contador compartido (posicionInorden) que avanza
 * cada vez que se "visita" un nodo en el recorrido, exactamente como
 * el inorden que ya construiste en Python.
 */
function calcularPosiciones(nodo, profundidad, contador, resultado) {
  if (!nodo) return;

  calcularPosiciones(nodo.hijoIzquierdo, profundidad + 1, contador, resultado);

  const x = MARGEN + contador.valor * ESPACIO_HORIZONTAL;
  const y = MARGEN + profundidad * ESPACIO_VERTICAL;
  contador.valor += 1;

  resultado.push({
    x,
    y,
    clave: nodo.clave,
    altura: nodo.altura,
    factorBalance: nodo.factorBalance,
    balanceado: nodo.balanceado,
    hijoIzquierdo: nodo.hijoIzquierdo,
    hijoDerecho: nodo.hijoDerecho,
    _idInterno: `${nodo.clave.join('-')}`
  });

  calcularPosiciones(nodo.hijoDerecho, profundidad + 1, contador, resultado);
}

/**
 * Junta las posiciones calculadas con las líneas padre-hijo, para
 * poder dibujar ambas cosas en el SVG.
 */
function construirGrafo(raiz) {
  if (!raiz) return { nodos: [], enlaces: [], ancho: 0, alto: 0 };

  const nodos = [];
  calcularPosiciones(raiz, 0, { valor: 0 }, nodos);

  // mapa rápido de clave -> posición, para poder trazar las líneas
  const posicionPorClave = new Map(
    nodos.map((n) => [n._idInterno, { x: n.x, y: n.y }])
  );

  const enlaces = [];
  nodos.forEach((n) => {
    if (n.hijoIzquierdo) {
      const hijoId = n.hijoIzquierdo.clave.join('-');
      const posHijo = posicionPorClave.get(hijoId);
      if (posHijo) enlaces.push({ x1: n.x, y1: n.y, x2: posHijo.x, y2: posHijo.y });
    }
    if (n.hijoDerecho) {
      const hijoId = n.hijoDerecho.clave.join('-');
      const posHijo = posicionPorClave.get(hijoId);
      if (posHijo) enlaces.push({ x1: n.x, y1: n.y, x2: posHijo.x, y2: posHijo.y });
    }
  });

  // Real size of the drawing (plus margin on every side)
  const ancho = nodos.length > 0 ? Math.max(...nodos.map((n) => n.x)) + MARGEN : 400;
  const alto = nodos.length > 0 ? Math.max(...nodos.map((n) => n.y)) + MARGEN : 300;

  return { nodos, enlaces, ancho, alto };
}

const DynamicTreeSVG = ({ topologia, isDark }) => {
  const { nodos, enlaces, ancho, alto } = useMemo(
    () => construirGrafo(topologia?.raiz),
    [topologia]
  );

  if (!topologia || topologia.vacio || nodos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm font-bold">
        El árbol está vacío -- inserta eventos para verlo aquí.
      </div>
    );
  }

  return (
    // Natural pixel size: a small tree is NOT blown up to fill the whole
    // panel (that made a single node gigantic and cut in half); a big tree
    // shrinks to fit thanks to max-width / max-height.
    <svg
      width={ancho}
      height={alto}
      viewBox={`0 0 ${ancho} ${alto}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id="treeLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Enlaces padre-hijo */}
      <g stroke="url(#treeLineGrad)" strokeWidth="2" strokeDasharray="4 3">
        {enlaces.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
        ))}
      </g>

      {/* Nodos */}
      {nodos.map((n) => {
        const [prioridad, magnitud, id] = n.clave;
        const desbalanceado = !n.balanceado;

        return (
          <g key={n._idInterno} className="cursor-pointer group">
            <circle
              cx={n.x}
              cy={n.y}
              r={RADIO_NODO}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              className={`transition-transform duration-200 group-hover:scale-110 ${
                desbalanceado
                  ? 'fill-rose-500 stroke-rose-300 stroke-2'
                  : isDark
                    ? 'fill-zinc-900 stroke-orange-500/70 stroke-2 group-hover:stroke-orange-400 group-hover:fill-zinc-800'
                    : 'fill-white stroke-orange-500 stroke-2 group-hover:stroke-orange-600 group-hover:fill-orange-50'
              }`}
            />
            <text
              x={n.x}
              y={n.y - 2}
              textAnchor="middle"
              className={`text-[11px] font-black select-none pointer-events-none ${
                desbalanceado ? 'fill-white' : isDark ? 'fill-zinc-100' : 'fill-zinc-900'
              }`}
            >
              M{magnitud}
            </text>
            <text
              x={n.x}
              y={n.y + 11}
              textAnchor="middle"
              className={`text-[9px] font-bold select-none pointer-events-none ${
                desbalanceado ? 'fill-rose-100' : 'fill-zinc-500'
              }`}
            >
              id:{id} fb:{n.factorBalance}
            </text>
          </g>
        );
      })}
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
  const [topologia, setTopologia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Estado propio del control de modo estrés / recuperación
  const [cambiandoModoEstres, setCambiandoModoEstres] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [ultimaRecuperacion, setUltimaRecuperacion] = useState(null);

  const isDark = theme === 'dark';

  const loadTreeState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Se piden las métricas y la topología en paralelo -- son dos
      // endpoints separados según el contrato ya acordado.
      const [respuestaMetricas, respuestaTopologia] = await Promise.all([
        fetch(`${ARBOL_API_URL}/arbol/metricas`),
        fetch(`${ARBOL_API_URL}/arbol/topologia`)
      ]);

      if (!respuestaMetricas.ok || !respuestaTopologia.ok) {
        throw new Error('El servidor de estructuras respondió con un error.');
      }

      const metricas = await respuestaMetricas.json();
      const nuevaTopologia = await respuestaTopologia.json();

      setTreeState({
        cantidadNodos: metricas.cantidadNodos,
        altura: metricas.altura,
        balance: metricas.balance,
        modoEstres: metricas.modoEstres,
        hojas: metricas.hojas,
        contadores: metricas.contadores,
        actualizadoEn: metricas.actualizadoEn
      });
      setTopologia(nuevaTopologia);
    } catch (err) {
      console.error('Error obteniendo estado del árbol:', err);
      setError(
        err?.message ||
        `No se pudo conectar con el backend (${ARBOL_API_URL}). ¿Está corriendo Flask?`
      );
      setTreeState(null);
      setTopologia(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTreeState();
  }, [loadTreeState]);

  const refreshTree = useCallback(() => {
    loadTreeState();
  }, [loadTreeState]);

  // ==========================================================
  // CONTROL DE MODO ESTRÉS (sección 8 del enunciado)
  // ==========================================================

  const modoEstresActivo = treeState?.modoEstres ?? false;

  const alternarModoEstres = useCallback(async () => {
    try {
      setCambiandoModoEstres(true);
      setError(null);

      const respuesta = await fetch(`${ARBOL_API_URL}/arbol/modo-estres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !modoEstresActivo })
      });

      if (!respuesta.ok) {
        // 409: the backend refuses to leave stress mode while the tree
        // is unbalanced (section 8) and explains why.
        const detalle = await respuesta.json().catch(() => null);
        throw new Error(detalle?.error || 'No se pudo cambiar el modo estrés.');
      }

      // Al desactivar el modo estrés, el árbol NO se recupera solo
      // -- eso requiere pedir explícitamente recuperarBalanceGlobal()
      // (regla del enunciado: "al solicitar la recuperación global,
      // se pausa el procesamiento... el retorno al modo normal solo
      // se completa cuando la auditoría confirma el equilibrio").
      setUltimaRecuperacion(null);
      await loadTreeState();
    } catch (err) {
      console.error('Error cambiando modo estrés:', err);
      setError(err?.message || 'No se pudo cambiar el modo estrés.');
    } finally {
      setCambiandoModoEstres(false);
    }
  }, [modoEstresActivo, loadTreeState]);

  const recuperarBalance = useCallback(async () => {
    try {
      setRecuperando(true);
      setError(null);

      const respuesta = await fetch(`${ARBOL_API_URL}/arbol/recuperar-balance`, {
        method: 'POST'
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo ejecutar la recuperación de balance.');
      }

      const data = await respuesta.json();
      setUltimaRecuperacion({
        rotaciones: data.rotacionesAplicadas,
        hora: new Date().toLocaleTimeString()
      });

      await loadTreeState();
    } catch (err) {
      console.error('Error en recuperación de balance:', err);
      setError(err?.message || 'No se pudo ejecutar la recuperación de balance.');
    } finally {
      setRecuperando(false);
    }
  }, [loadTreeState]);

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

      {/* Aviso si no hay conexión con el servidor de estructuras */}
      {error && (
        <div className="max-w-[1700px] w-full mx-auto px-6 pt-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}

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
              <MetricItem icon={Layers} label="Hojas" value={treeState?.hojas ?? 0} isDark={isDark} />
              {activeTree === 'avl' && treeState?.contadores && (
                <MetricItem
                  icon={Activity}
                  label="Casos LL / RR / LR / RL · giros izq / der"
                  value={`${['LL', 'RR', 'LR', 'RL'].map((c) => treeState.contadores.casos[c]).join(' / ')} · ${treeState.contadores.giros.izquierda} / ${treeState.contadores.giros.derecha}`}
                  isDark={isDark}
                />
              )}
              {activeTree === 'avl' && (
                <MetricItem
                  icon={SlidersHorizontal}
                  label="Factor de Balance"
                  value={balance}
                  isDark={isDark}
                  highlight
                />
              )}
              {modoEstresActivo && (
                <MetricItem
                  icon={AlertTriangle}
                  label="Modo Estrés"
                  value="ACTIVO"
                  isDark={isDark}
                  highlight
                />
              )}
            </div>

            {/* ============================================
                CONTROLES DE MODO ESTRÉS Y RECUPERACIÓN
                (sección 8 del enunciado)
               ============================================ */}
            <div className="mt-4 pt-4 border-t border-zinc-500/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                Balanceo diferido
              </span>

              <button
                type="button"
                onClick={alternarModoEstres}
                disabled={cambiandoModoEstres}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                  modoEstresActivo
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 hover:bg-rose-600'
                    : isDark
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-rose-500/40 hover:text-rose-400'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:border-rose-300 hover:text-rose-600'
                }`}
              >
                {cambiandoModoEstres ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>{modoEstresActivo ? 'Desactivar Modo Estrés' : 'Activar Modo Estrés'}</span>
              </button>

              <button
                type="button"
                onClick={recuperarBalance}
                disabled={recuperando || nodeCount === 0}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                  isDark
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-400'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {recuperando ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Recuperar Balance</span>
              </button>

              {ultimaRecuperacion && (
                <p className={`text-[10px] text-center pt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Última recuperación ({ultimaRecuperacion.hora}):{' '}
                  <strong className="text-emerald-500">
                    {ultimaRecuperacion.rotaciones} rotación(es) aplicada(s)
                  </strong>
                </p>
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
              <CircleDot className={`w-3.5 h-3.5 ${error ? 'text-rose-500' : 'text-emerald-500'}`} />
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
                <DynamicTreeSVG topologia={topologia} isDark={isDark} />
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
            <div className={`flex items-center gap-1.5 font-sans font-bold ${error ? 'text-rose-500' : 'text-emerald-500'}`}>
              {error ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Sin conexión</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conectado</span>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
