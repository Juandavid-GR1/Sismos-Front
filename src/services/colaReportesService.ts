
const API_URL = import.meta.env.VITE_API_URL;

const ENDPOINT = `${API_URL}/reportes/cola`;

interface RespuestaError {
    error?: string;
    mensaje?: string;
    decision?: string;
    detalle_decision?: string;
}

interface ErrorReporte extends Error {
    decision?: string;
    detalle_decision?: string;
    mensaje?: string;
}

export const obtenerColaReportes = async () => {
    const response = await fetch(ENDPOINT);

    const data: RespuestaError & {
        cola?: unknown[];
    } = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            'Error al obtener la cola de reportes.'
        );
    }

    return data.cola || [];
};

export const descartarReporte = async () => {
    const response = await fetch(
        `${ENDPOINT}/descartar`,
        {
            method: 'POST'
        }
    );

    const data: RespuestaError & {
        reporte?: unknown;
    } = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            'Error al descartar el reporte.'
        );
    }

    return data;
};

export const validarYEmitirReporte = async () => {
    const response = await fetch(
        `${ENDPOINT}/validar`,
        {
            method: 'POST'
        }
    );

    const data: RespuestaError & {
        reporte?: unknown;
        sismo?: unknown;
    } = await response.json();

    if (!response.ok) {
        const error = new Error(
            data.detalle_decision ||
            data.mensaje ||
            data.error ||
            'Error al validar y emitir el reporte.'
        ) as ErrorReporte;

        // Conservamos la decisión enviada por Flask
        error.decision = data.decision;
        error.detalle_decision = data.detalle_decision;
        error.mensaje = data.mensaje;

        throw error;
    }

    return data;
};


