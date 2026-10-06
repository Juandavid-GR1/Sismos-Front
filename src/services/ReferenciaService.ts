import type {
    Referencia,
    ReferenciaSismo,
} from '../models/Referencia';

const API_URL = import.meta.env.VITE_API_URL;

export interface ReferenciasSismoResponse {
    sismo_id: number;
    referencias: Referencia[];
}

export interface ReferenciaActualResponse {
    sismo_id: number;
    referencia: ReferenciaSismo | null;
}


/**
 * Obtiene los candidatos que pueden ser referencia
 * del sismo indicado.
 */
export const obtenerReferenciasSismo = async (
    sismoId: number
): Promise<ReferenciasSismoResponse> => {

    console.log(
        '🔎 Obteniendo referencias para sismo:',
        sismoId
    );

    console.log(
        '🌐 URL:',
        `${API_URL}/referencias-sismo/${sismoId}`
    );

    const response = await fetch(
        `${API_URL}/referencias-sismo/${sismoId}`
    );

    console.log(
        '📡 Status:',
        response.status
    );

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {

        console.error(
            '❌ Error del backend:',
            data
        );

        throw new Error(
            data.error ||
            'No se pudieron obtener las referencias del sismo'
        );
    }

    console.log(
        '📦 Respuesta recibida:',
        data
    );

    console.log(
        '📚 Referencias:',
        data.referencias
    );

    return data;
};


/**
 * Obtiene la referencia actualmente asignada
 * al sismo indicado.
 *
 * Retorna null si el sismo todavía
 * no tiene una referencia.
 */
export const obtenerReferenciaActual = async (
    sismoId: number
): Promise<ReferenciaSismo | null> => {

    console.log(
        '🔎 Obteniendo referencia actual del sismo:',
        sismoId
    );

    console.log(
        '🌐 URL:',
        `${API_URL}/referencias-sismo/${sismoId}/actual`
    );

    const response = await fetch(
        `${API_URL}/referencias-sismo/${sismoId}/actual`
    );

    console.log(
        '📡 Status referencia actual:',
        response.status
    );

    const data: ReferenciaActualResponse = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {

        console.error(
            '❌ Error obteniendo referencia actual:',
            data
        );

        throw new Error(
            data.error ||
            'No se pudo obtener la referencia actual'
        );
    }

    console.log(
        '📌 Referencia actual:',
        data.referencia
    );

    return data.referencia ?? null;
};


/**
 * Guarda o cambia la referencia seleccionada
 * para un sismo.
 *
 * Un sismo solamente puede tener una
 * referencia activa.
 */
export const guardarReferenciaSismo = async (
    sismoId: number,
    referenciaId: number
): Promise<ReferenciaSismo> => {

    console.log(
        '💾 Guardando/cambiando referencia:',
        {
            sismoId,
            referenciaId,
        }
    );

    const response = await fetch(
        `${API_URL}/referencias-sismo`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                sismo_id: sismoId,
                referencia_id: referenciaId,
            }),
        }
    );

    console.log(
        '📡 Status guardando referencia:',
        response.status
    );

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {

        console.error(
            '❌ Error guardando referencia:',
            data
        );

        throw new Error(
            data.error ||
            'No se pudo guardar la referencia del sismo'
        );
    }

    console.log(
        '✅ Referencia guardada/cambiada:',
        data
    );

    return data.referencia;
};