import { StatusSismo, type SeismicEvent } from '../models/Sismos';

const API_URL = import.meta.env.VITE_API_URL;
const ENDPOINT = `${API_URL}/sismos`;

// Tipo helper para omitir la 'id' en creaciones (el backend suele asignarla)
export type CreateSeismicEventInput = Omit<SeismicEvent, 'id'> & {
  id?: number;
  /** Station that originates the record (optional) */
  initial_station_id?: string | null;
};

export const sismosService = {
  // GET: Obtener todos los eventos sísmicos
  getAll: async (): Promise<SeismicEvent[]> => {
    const response = await fetch(ENDPOINT);
    if (!response.ok) throw new Error('Error al obtener la lista de sismos');
    return response.json();
  },

  // GET por ID: Obtener un sismo específico
  getById: async (id: number): Promise<SeismicEvent> => {
    const response = await fetch(`${ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener el sismo #${id}`);
    return response.json();
  },

  // POST: Crear/Reportar un nuevo evento sísmico
  create: async (sismoData: CreateSeismicEventInput): Promise<SeismicEvent> => {
    // Normalizar reporting_stations para enviar un Array JSON limpio
    const stationsArray = sismoData.reporting_stations instanceof Set
      ? Array.from(sismoData.reporting_stations)
      : sismoData.reporting_stations ?? [];

    const bodyPayload = {
      ...sismoData,
      revision: sismoData.revision ?? 1,
      status: sismoData.status ?? StatusSismo.PENDIENTE,
      reporting_stations: stationsArray,
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      // Show the backend reason (duplicated/retired id, out of range, ...)
      const detalle = await response.json().catch(() => null);
      throw new Error(detalle?.message || detalle?.error || 'Error al registrar el sismo');
    }
    return response.json();
  },

  // PUT: Actualizar un evento sísmico existente
  update: async (id: number, sismoData: Partial<SeismicEvent>): Promise<SeismicEvent> => {
    const payload = {
      ...sismoData,
      reporting_stations: sismoData.reporting_stations instanceof Set
        ? Array.from(sismoData.reporting_stations)
        : sismoData.reporting_stations,
    };

    const response = await fetch(`${ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detalle = await response.json().catch(() => null);
      throw new Error(detalle?.message || detalle?.error || `Error al actualizar el sismo #${id}`);
    }
    return response.json();
  },

  // PATCH: mark an active event as reviewed. Same key, no
  // reinsertion; undoable from the "Deshacer" button.
  marcarRevisado: async (id: number) => {
    const response = await fetch(`${ENDPOINT}/${id}/audit`, { method: 'PATCH' });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `No se pudo marcar el sismo #${id} como revisado`);
    }
    return data;
  },

  // DELETE: Eliminar un sismo por su ID
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error al eliminar el sismo #${id}`);
  },
};