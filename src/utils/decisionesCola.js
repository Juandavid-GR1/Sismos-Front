// Messages for the decisions the backend takes on each queue step
// (section 8). Used by the Observatorio page (manual and automatic mode).
import { describirRotaciones } from './formato';

const MENSAJES = {
  alta: {
    titulo: 'Evento nuevo registrado',
    mensaje: 'El identificador era desconocido: se registró un evento nuevo a partir del reporte.',
    tipo: 'success',
  },
  correccion: {
    titulo: 'Reporte procesado correctamente',
    mensaje: 'Se aplicó una corrección al evento sísmico.',
    tipo: 'success',
  },
  confirmacion: {
    titulo: 'Reporte confirmado',
    mensaje: 'El reporte confirma la información existente del evento.',
    tipo: 'success',
  },
  confirmacion_archivado: {
    titulo: 'Evento archivado confirmado',
    mensaje: 'El reporte coincide con un evento archivado: se registró la estación y el evento sigue en el histórico.',
    tipo: 'success',
  },
  reactivacion: {
    titulo: 'Evento reactivado',
    mensaje: 'El reporte trae una revisión nueva de un evento archivado: volvió al árbol activo con los datos corregidos.',
    tipo: 'success',
  },
  reporte_antiguo: {
    titulo: 'Reporte desactualizado',
    mensaje: 'El reporte corresponde a una revisión anterior y fue rechazado.',
    tipo: 'warning',
  },
  conflicto: {
    titulo: 'Reporte en conflicto',
    mensaje: 'El reporte entra en conflicto con la información registrada para esta revisión.',
    tipo: 'warning',
  },
  identificador_retirado: {
    titulo: 'Identificador retirado',
    mensaje: 'Este identificador fue eliminado y está retirado: no puede reactivarse mediante un reporte.',
    tipo: 'warning',
  },
  datos_invalidos: {
    titulo: 'Reporte rechazado por datos inválidos',
    mensaje: 'El reporte contenía datos fuera de rango y fue retirado de la cola.',
    tipo: 'warning',
  },
  ruido: {
    titulo: 'Reporte descartado',
    mensaje: 'El reporte fue descartado como ruido instrumental.',
    tipo: 'warning',
  },
  cola_vacia: {
    titulo: 'Cola vacía',
    mensaje: 'No hay reportes pendientes por procesar.',
    tipo: 'info',
  },
};

/**
 * Converts a backend decision into { titulo, mensaje, tipo } for the UI.
 * `detalle` replaces the default text; `rotaciones` (LL/RR/LR/RL of the
 * step) is appended when the step rotated the tree.
 */
export const obtenerMensajeDecision = (decision, detalle, rotaciones) => {
  const base = MENSAJES[decision] ?? {
    titulo: 'Reporte procesado',
    mensaje: 'El reporte fue procesado por el sistema.',
    tipo: 'info',
  };
  const giros = describirRotaciones(rotaciones);
  return {
    ...base,
    mensaje: `${detalle || base.mensaje}${giros ? ` Rotaciones del AVL en este paso: ${giros}.` : ''}`,
  };
};

/** State object used by EventAnalyzer from any step result. */
export const construirDecision = (resultado) => {
  const formateada = obtenerMensajeDecision(
    resultado.decision,
    resultado.detalle_decision || resultado.mensaje,
    resultado.rotaciones
  );
  return {
    tipo: resultado.decision,
    titulo: formateada.titulo,
    mensaje: formateada.mensaje,
    tipoVisual: formateada.tipo,
  };
};
