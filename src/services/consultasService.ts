// Section 6 (one event by id) and section 11 queries over the active catalog
import { apiGet } from './api';

export const consultasService = {
  // Active, archived, retired or deleted: the answer says which (estado)
  evento: (id: number) => apiGet(`/sismos/${id}`),
  pendientes: (k: number) => apiGet('/sismos/consultas/pendientes', { k }),
  porMagnitud: (min: number, max: number) => apiGet('/sismos/consultas/magnitud', { min, max }),
  porProfundidadYFecha: (profundidadMax: number, desde: string, hasta: string) =>
    apiGet('/sismos/consultas/profundidad-fecha', {
      profundidad_max: profundidadMax,
      fecha_desde: desde,
      fecha_hasta: hasta,
    }),
};
