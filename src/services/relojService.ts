// Explicit simulation clock (section 3): it only moves by a user action
import { apiGet, apiMutar } from './api';

export const relojService = {
  obtener: () => apiGet<{ reloj_actual: string }>('/reloj'),
  avanzarHoras: (horas: number) => apiMutar('/reloj/avanzar', 'POST', { horas }),
  avanzarA: (fechaHora: string) => apiMutar('/reloj/avanzar', 'POST', { fecha_hora: fechaHora }),
};
