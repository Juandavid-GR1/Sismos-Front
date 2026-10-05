// Undo stack of the backend (section 13).
const API_URL = import.meta.env.VITE_API_URL?.trim() || 'http://127.0.0.1:5000';
const ENDPOINT = `${API_URL}/historial`;

export interface AccionHistorial {
  numero: number;
  descripcion: string;
  hora: string;
}

// Browser event used to tell every page that the scenario changed
// (an action was undone, an event was marked as reviewed, ...), so they
// reload their data from the backend.
export const EVENTO_ESTADO_CAMBIADO = 'sismolab:estado-cambiado';

export const notificarCambioDeEstado = (): void => {
  window.dispatchEvent(new Event(EVENTO_ESTADO_CAMBIADO));
};

// Lighter event: an action was recorded in the backend (create, correct,
// process a report...). The page that did it already updated itself, so
// only the undo counter needs to reload. This replaces polling /historial
// every 3 seconds.
export const EVENTO_ACCION_REGISTRADA = 'sismolab:accion-registrada';

export const notificarAccionRegistrada = (): void => {
  window.dispatchEvent(new Event(EVENTO_ACCION_REGISTRADA));
};

export const historialService = {
  listar: async (): Promise<AccionHistorial[]> => {
    const response = await fetch(ENDPOINT);
    if (!response.ok) throw new Error('No se pudo obtener el historial de acciones.');
    const data = await response.json();
    return data.acciones ?? [];
  },

  deshacer: async (): Promise<{ mensaje: string; accion: AccionHistorial }> => {
    const response = await fetch(`${ENDPOINT}/deshacer`, { method: 'POST' });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || 'No se pudo deshacer la acción.');
    notificarCambioDeEstado();
    return data;
  },
};