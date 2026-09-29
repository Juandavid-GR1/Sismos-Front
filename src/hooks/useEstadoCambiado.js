import { useEffect, useRef } from 'react';
import { EVENTO_ESTADO_CAMBIADO } from '../services/historialService';

/**
 * Runs `callback` every time the scenario changes somewhere else in the
 * app (undo, mark as reviewed, ...). Pages use it to reload their data.
 */
export const useEstadoCambiado = (callback) => {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    const manejar = () => ref.current?.();
    window.addEventListener(EVENTO_ESTADO_CAMBIADO, manejar);
    return () => window.removeEventListener(EVENTO_ESTADO_CAMBIADO, manejar);
  }, []);
};