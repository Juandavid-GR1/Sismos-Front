// Section 10: archive of old low-priority branches and the history
import { apiGet, apiMutar } from './api';

export const archivoService = {
  previsualizarElegible: () => apiGet('/sismos/archivo-rama/elegible'),
  archivarElegible: () => apiMutar('/sismos/archivo-rama/elegible', 'POST'),
  archivarRama: (raizId: number) => apiMutar(`/sismos/${raizId}/archivar`, 'POST'),
  historico: () => apiGet<any[]>('/sismos/historico'),
};
