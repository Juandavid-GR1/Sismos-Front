export interface Referencia {
    id: number;
    distancia: number;
    magnitud: number;
}

export interface ReferenciaSismo {
    sismo_id: number;
    referencia_id: number;
    distancia: number;
    fecha_creacion: string;
}

export interface ReferenciasSismoResponse {
    sismo_id: number;
    referencias: Referencia[];
}