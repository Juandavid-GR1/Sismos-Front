
import { API_URL } from './api';

const ENDPOINT = `${API_URL}/zonas`;

export const obtenerZonas = async () => {

    const response = await fetch(
        ENDPOINT
    );

    if (!response.ok) {

        throw new Error(
            "No se pudieron obtener las zonas."
        );

    }

    return await response.json();
};

