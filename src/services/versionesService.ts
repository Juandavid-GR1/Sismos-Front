// Section 13: named versions saved on disk (they survive a restart)
import { apiEnviar, apiGet, apiMutar } from './api';

export interface Version {
  nombre: string;
  fecha: string;
}

const ruta = (nombre: string) => `/versiones/${encodeURIComponent(nombre)}`;

export const versionesService = {
  listar: async (): Promise<Version[]> => (await apiGet<{ versiones: Version[] }>('/versiones')).versiones ?? [],
  guardar: (nombre: string) => apiEnviar<Version>('/versiones', 'POST', { nombre }),
  obtener: (nombre: string) => apiGet(ruta(nombre)),
  // Restoring is an undoable action in the backend
  restaurar: (nombre: string) => apiMutar(`${ruta(nombre)}/restaurar`, 'POST'),
  eliminar: (nombre: string) => apiEnviar(ruta(nombre), 'DELETE'),
};
