import { useEffect, useRef } from 'react';
import { EVENTO_ACCION_REGISTRADA, EVENTO_ESTADO_CAMBIADO } from '../services/historialService';

// Subscribes `callback` to window events while the component is mounted.
const useEventosVentana = (eventos, callback) => {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    const manejar = () => ref.current?.();
    eventos.forEach((e) => window.addEventListener(e, manejar));
    return () => eventos.forEach((e) => window.removeEventListener(e, manejar));
    // the list of events is fixed for each hook below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const SOLO_ESTADO = [EVENTO_ESTADO_CAMBIADO];
const ESTADO_Y_ACCIONES = [EVENTO_ESTADO_CAMBIADO, EVENTO_ACCION_REGISTRADA];

/**
 * Runs `callback` every time the scenario changes somewhere else in the
 * app (undo, mark as reviewed, ...). Pages use it to reload their data.
 */
export const useEstadoCambiado = (callback) => useEventosVentana(SOLO_ESTADO, callback);

/**
 * Same, but also after ANY action recorded in the backend (create,
 * correct, process a report...). Used by components that show data
 * every action can change, such as the undo counter. No polling needed.
 */
export const useAccionRegistrada = (callback) => useEventosVentana(ESTADO_Y_ACCIONES, callback);
