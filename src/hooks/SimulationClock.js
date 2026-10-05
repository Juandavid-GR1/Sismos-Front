import { useCallback, useState } from 'react';
import { relojService } from '../services/relojService';
import { useCarga } from './useCarga';

/**
 * Scenario clock of the BACKEND (section 3): explicit, saved with the
 * scenario and moved only by a user action. Event times cannot be later
 * than this clock and it decides the age used by the archive (T).
 *
 * Before, this hook was a local realtime clock unrelated to the backend.
 */
export const useSimulationClock = () => {
  const { datos, cargando, error, setError, recargar } = useCarga(relojService.obtener);
  const [avanzando, setAvanzando] = useState(false);

  const ejecutar = useCallback(async (accion) => {
    try {
      setAvanzando(true);
      setError(null);
      await accion();
      await recargar();
      return true;
    } catch (err) {
      setError(err?.message || 'No se pudo mover el reloj.');
      return false;
    } finally {
      setAvanzando(false);
    }
  }, [recargar, setError]);

  const avanzarHoras = useCallback((horas) => ejecutar(() => relojService.avanzarHoras(horas)), [ejecutar]);
  const avanzarA = useCallback((fechaIso) => ejecutar(() => relojService.avanzarA(fechaIso)), [ejecutar]);

  return {
    time: datos?.reloj_actual ? new Date(datos.reloj_actual) : null,
    // The UTC backend answers with an offset (+00:00). An older backend
    // sends local time without offset: then it is shown as local time.
    esUtc: /([zZ]|[+-]\d{2}:\d{2})$/.test(datos?.reloj_actual ?? ''),
    cargando,
    avanzando,
    error,
    avanzarHoras,
    avanzarA,
    recargar,
  };
};
