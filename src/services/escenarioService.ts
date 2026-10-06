// Section 12: export and load of the whole scenario
import { apiEnviarFormulario, apiGet } from './api';

export type TipoCarga = 'inserciones' | 'topologia';

export interface ResultadoCarga {
  tipo_carga: TipoCarga;
  mensaje: string;
  cantidad_eventos: number;
  modo_estres: boolean;
}

export const escenarioService = {
  // Full operating state: tree topology, events, history, queue, clock,
  // zones, parameters, references and counters
  exportar: () => apiGet('/arbol/escenario/exportar'),

  // The backend validates everything first: the load is complete or it is
  // not applied (the previous scenario is kept)
  cargar: (archivo: File, tipo: TipoCarga) => {
    const formulario = new FormData();
    formulario.append('archivo', archivo);
    formulario.append('tipo_carga', tipo);
    return apiEnviarFormulario<ResultadoCarga>('/arbol/escenario/cargar', formulario);
  },
};
