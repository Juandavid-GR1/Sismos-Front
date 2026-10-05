// Small formatting helpers shared by the pages (no React here).

export const formatearClave = (clave) =>
  Array.isArray(clave) ? `(${clave.join(', ')})` : '—';

export const formatearFecha = (iso) => {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

export const formatearNumero = (valor, decimales = 2) =>
  typeof valor === 'number' && Number.isFinite(valor)
    ? Number(valor.toFixed(decimales)).toString()
    : '—';

/**
 * Value for <input type="datetime-local" step="1"> from an ISO date
 * (local time, with seconds).
 */
export const aInputFecha = (iso) => {
  const fecha = iso ? new Date(iso) : new Date();
  if (Number.isNaN(fecha.getTime())) return '';
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 19);
};

/** datetime-local value -> ISO in UTC without milliseconds. */
export const deInputFecha = (valor) =>
  valor ? new Date(valor).toISOString().replace(/\.\d{3}Z$/, 'Z') : undefined;

export const ETIQUETA_PRIORIDAD = { 1: 'Baja', 2: 'Media', 3: 'Alta' };

export const ETIQUETA_ESTADO = {
  activo: 'Activo',
  archivado: 'Archivado',
  retirado: 'Retirado',
  eliminado: 'Eliminado',
};

/**
 * Text for the rotations of one step: { casos: {LL,RR,LR,RL}, giros:
 * {izquierda, derecha} } -> "LL ×1, RL ×1 (3 giros)" or '' when none.
 */
export const describirRotaciones = (rotaciones) => {
  if (!rotaciones?.casos) return '';
  const casos = Object.entries(rotaciones.casos).filter(([, n]) => n > 0);
  if (casos.length === 0) return '';
  const giros = (rotaciones.giros?.izquierda ?? 0) + (rotaciones.giros?.derecha ?? 0);
  return `${casos.map(([c, n]) => `${c} ×${n}`).join(', ')} (${giros} giro${giros === 1 ? '' : 's'})`;
};
