// Section 7: associations (possible aftershocks) and parameters W, R
import { apiGet, apiMutar } from './api';

export interface ConfigReferencias { ventana_horas: number; radio_km: number }

export const referenciasService = {
  detalle: (sismoId: number) => apiGet(`/referencias-sismo/${sismoId}/detalle`),
  configuracion: () => apiGet<ConfigReferencias>('/referencias-sismo/configuracion'),
  configurar: (ventanaHoras: number, radioKm: number) =>
    apiMutar<ConfigReferencias>('/referencias-sismo/configuracion', 'PUT', {
      ventana_horas: ventanaHoras,
      radio_km: radioKm,
    }),
};
