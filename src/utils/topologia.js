// Helpers over the nested topology sent by the backend
// ({ clave, profundidad, hijoIzquierdo, hijoDerecho }). No React here.

/** Root key, maximum depth and number of nodes of a nested tree. */
export const resumenTopologia = (raiz) => {
  if (!raiz) return { raiz: null, profundidadMaxima: null, nodos: 0 };
  let profundidadMaxima = 0;
  let nodos = 0;
  const pila = [[raiz, 0]];
  while (pila.length) {
    const [nodo, profundidad] = pila.pop();
    nodos += 1;
    profundidadMaxima = Math.max(profundidadMaxima, profundidad);
    if (nodo.hijoIzquierdo) pila.push([nodo.hijoIzquierdo, profundidad + 1]);
    if (nodo.hijoDerecho) pila.push([nodo.hijoDerecho, profundidad + 1]);
  }
  return { raiz: raiz.clave, profundidadMaxima, nodos };
};
