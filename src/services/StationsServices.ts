import type { Location } from '../models/estaciones';

import { API_URL } from './api';
import { notificarAccionRegistrada } from './historialService';
const ENDPOINT = `${API_URL}/estaciones`;

export const estacionesService = {
  // GET: Obtener todas las estaciones
  getAll: async (): Promise<Location[]> => {
    const response = await fetch(ENDPOINT);
    if (!response.ok) throw new Error('Error al obtener las estaciones');
    return response.json();
  },

  // GET por ID: Obtener una estación específica
  getById: async (id: string): Promise<Location> => {
    const response = await fetch(`${ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener la estación con id ${id}`);
    return response.json();
  },

  // POST: Crear una nueva estación
  create: async (data: Omit<Location, 'id'>): Promise<Location> => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear la estación');
    notificarAccionRegistrada();
    return response.json();
  },

  // PUT: Actualizar una estación existente
  update: async (id: string, data: Partial<Location>): Promise<Location> => {
    const response = await fetch(`${ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error al actualizar la estación con id ${id}`);
    notificarAccionRegistrada();
    return response.json();
  },

  // DELETE: Eliminar una estación
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error al eliminar la estación con id ${id}`);
    notificarAccionRegistrada();
  },
};