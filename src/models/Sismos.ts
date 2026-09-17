// Estado de atención del evento sísmico
export enum StatusSismo {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  CONFIRMADO = 'CONFIRMADO',
  RECHAZADO = 'RECHAZADO',
}

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
}