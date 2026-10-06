// Section 14 indicators
import { apiGet, ApiError } from './api';

// Backends without GET /metricas (before MetricasController existed):
// the same information is built from the endpoints that already exist.
async function indicadoresCompuestos() {
  const [arbol, contadores, historico] = await Promise.all([
    apiGet('/arbol/metricas'),
    apiGet('/sismos/metricas'),
    apiGet<any[]>('/sismos/historico'),
  ]);
  const archivados = historico.filter((e) => e.estado_persistencia === 'archivado').length;
  return {
    eventos: {
      activos: arbol?.cantidadNodos ?? 0,
      historicos: historico.length,
      archivados,
      retirados: historico.length - archivados,
    },
    contadores: contadores ?? {},
    arbol,
  };
}

// Does the backend have GET /metricas? Asked ONCE and shared by every
// caller (also by the double effect of React StrictMode in development).
let sondaMetricas: Promise<any> | null = null;
let sinEndpointMetricas = false;

export const metricasService = {
  indicadores: async () => {
    if (sinEndpointMetricas) return indicadoresCompuestos();
    if (!sondaMetricas) {
      sondaMetricas = apiGet('/metricas').finally(() => { sondaMetricas = null; });
    }
    try {
      return await sondaMetricas;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        sinEndpointMetricas = true;
        return indicadoresCompuestos();
      }
      throw err;
    }
  },
};
