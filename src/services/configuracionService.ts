// Parameters L (costly access depth limit) and T (archive age, hours)
import { apiGet, apiMutar } from './api';

export interface ConfigArbol { limite_profundidad: number; antiguedad_archivo_horas: number }

export const configuracionService = {
  obtener: () => apiGet<ConfigArbol>('/arbol/configuracion'),
  guardar: (limite: number, antiguedad: number) =>
    apiMutar<ConfigArbol>('/arbol/configuracion', 'PUT', {
      limite_profundidad: limite,
      antiguedad_archivo_horas: antiguedad,
    }),
};
