// Shared HTTP helper for every service: one base URL, JSON in/out and a
// readable error message taken from the backend response.
import { notificarCambioDeEstado } from './historialService';

export const API_URL: string = import.meta.env.VITE_API_URL?.trim() || 'http://127.0.0.1:5000';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Opciones = { method?: string; body?: unknown; params?: Record<string, string | number | boolean | undefined> };

function construirUrl(ruta: string, params?: Opciones['params']): string {
  const url = new URL(`${API_URL}${ruta}`);
  Object.entries(params ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== '') url.searchParams.set(clave, String(valor));
  });
  return url.toString();
}

export async function apiGet<T = any>(ruta: string, params?: Opciones['params']): Promise<T> {
  return pedir<T>(ruta, { params });
}

// Requests that change the scenario: after success every page is told to
// reload (they are also recorded as undoable actions by the backend).
export async function apiMutar<T = any>(ruta: string, method: string, body?: unknown): Promise<T> {
  const data = await pedir<T>(ruta, { method, body });
  notificarCambioDeEstado();
  return data;
}

async function pedir<T>(ruta: string, { method = 'GET', body, params }: Opciones): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(construirUrl(ruta, params), {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`No se pudo conectar con el backend (${API_URL}). ¿Está corriendo Flask?`, 0, null);
  }
  const data = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const mensaje = data?.message || data?.error || data?.detalle_decision || data?.mensaje
      || `Error ${respuesta.status} en ${ruta}`;
    throw new ApiError(mensaje, respuesta.status, data);
  }
  return data as T;
}
