const API_URL = import.meta.env.VITE_API_URL;

const ENDPOINT = `${API_URL}/reportes/cola`;


export const obtenerColaReportes = async () => {

    const response = await fetch(ENDPOINT);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || 'Error al obtener la cola de reportes.'
        );
    }

    return data.cola;
};


export const descartarReporte = async () => {

    const response = await fetch(
        `${ENDPOINT}/descartar`,
        {
            method: 'POST'
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || 'Error al descartar el reporte.'
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

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            'Error al validar y emitir el reporte.'
        );
    }

    return data;
};