import { useCallback, useEffect, useRef, useState } from 'react';
import { useEstadoCambiado } from './useEstadoCambiado';

/**
 * Loads data from a service function and keeps { datos, cargando, error }.
 * It reloads by itself when the scenario changes anywhere in the app
 * (undo, archive, correction...), so pages never show stale data.
 *
 *   const { datos, cargando, error, recargar } = useCarga(metricasService.indicadores);
 *
 * Pass { inmediato: false } to load only when recargar() / sincronizar() is called.
 */
export const useCarga = (funcion, { inmediato = true, alCambiarEstado = true } = {}) => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(inmediato);
  const [error, setError] = useState(null);
  const ref = useRef(funcion);
  const yaCargo = useRef(false);
  // Arguments of the last call: a query (k, min/max...) is repeated with
  // the same values when the scenario changes.
  const ultimosArgs = useRef([]);

  useEffect(() => {
    ref.current = funcion;
  }, [funcion]);

  // State is only set AFTER the request answers (safe inside effects)
  const ejecutar = useCallback(async (args) => {
    ultimosArgs.current = args;
    try {
      const resultado = await ref.current(...args);
      setDatos(resultado);
      setError(null);
      yaCargo.current = true;
      return resultado;
    } catch (err) {
      setError(err?.message || 'Error al cargar los datos.');
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  const recargar = useCallback((...args) => {
    setCargando(true);
    return ejecutar(args);
  }, [ejecutar]);

  useEffect(() => {
    if (inmediato) ejecutar([]);
  }, [inmediato, ejecutar]);

  useEstadoCambiado(() => {
    if (alCambiarEstado && (inmediato || yaCargo.current)) recargar(...ultimosArgs.current);
  });

  // Same as recargar but without switching `cargando` on first: meant for
  // effects that react to a prop / URL change (no synchronous setState).
  const sincronizar = useCallback((...args) => ejecutar(args), [ejecutar]);

  return { datos, setDatos, cargando, error, setError, recargar, sincronizar };
};
