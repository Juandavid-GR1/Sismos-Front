export const StatusSismo = {
  PENDIENTE: 'Pendiente',
  REVISADO: 'Revisado',
} as const;

export type StatusSismo = (typeof StatusSismo)[keyof typeof StatusSismo];

// Interfaz principal para el Evento Sísmico
export interface SeismicEvent {
  /** Identificador numérico único e inmutable */
  id: number;

  /** Parámetros físicos del evento sísmico */
  magnitude: number;
  depth: number;
  epicenter_x: number;
  epicenter_y: number;
  
  /** Timestamp en ISO String o Date */
  timestamp: Date | string;

  /** Control de versión */
  revision?: number;

  /** Conjunto o lista de IDs de estaciones que reportaron el evento */
  reporting_stations?: Set<string> | string[];

  /** Estado del evento */
  status?: StatusSismo;

  /** Derived by the backend: priority P and key K = (P, M, I) */
  prioridad?: 1 | 2 | 3;
  clave?: [number, number, number];
}