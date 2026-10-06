// Real AVL, structure audit and AVL vs BST comparison
import { apiGet, apiMutar } from './api';

export type OrdenInsercion = 'original' | 'ascendente' | 'descendente';

export const arbolService = {
  metricas: () => apiGet('/arbol/metricas'),
  topologia: () => apiGet('/arbol/topologia'),
  auditoria: () => apiGet('/arbol/auditoria'),
  comparacion: (orden: OrdenInsercion) => apiGet('/arbol/comparacion', { orden, topologia: 1 }),
  modoEstres: (activo: boolean) => apiMutar('/arbol/modo-estres', 'POST', { activo }),
  recuperarBalance: () => apiMutar('/arbol/recuperar-balance', 'POST'),
};
