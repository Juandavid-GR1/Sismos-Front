import React, { useEffect, useState } from 'react';

export const ModoAutomaticoModal = ({
  isDark,
  abierto,
  intervaloActual = 3,
  onClose,
  onActivar,
}) => {
  const [intervalo, setIntervalo] = useState(intervaloActual);

  useEffect(() => {
    if (abierto) {
      setIntervalo(intervaloActual);
    }
  }, [abierto, intervaloActual]);

  if (!abierto) {
    return null;
  }

  const opciones = [1, 3, 5, 10, 15, 30];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Modo automático
              </h2>

              <p
                className={`text-xs mt-1 ${
                  isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-500'
                }`}
              >
                Configura cada cuánto tiempo se revisará
                automáticamente la cola.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDark
                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <label
            className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${
              isDark
                ? 'text-zinc-400'
                : 'text-zinc-600'
            }`}
          >
            Intervalo de revisión
          </label>

          <div className="grid grid-cols-3 gap-3">
            {opciones.map((opcion) => {
              const seleccionado =
                intervalo === opcion;

              return (
                <button
                  key={opcion}
                  type="button"
                  onClick={() =>
                    setIntervalo(opcion)
                  }
                  className={`relative rounded-xl border px-4 py-4 transition-all ${
                    seleccionado
                      ? isDark
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/30'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : isDark
                      ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-lg font-bold">
                    {opcion}s
                  </div>

                  <div
                    className={`text-[10px] mt-1 ${
                      seleccionado
                        ? 'opacity-80'
                        : 'opacity-60'
                    }`}
                  >
                    cada {opcion} segundos
                  </div>

                  {seleccionado && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Información */}
          <div
            className={`mt-5 rounded-xl p-4 border ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800'
                : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                ⚡
              </div>

              <div>
                <p className="text-xs font-semibold">
                  Revisión automática
                </p>

                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isDark
                      ? 'text-zinc-400'
                      : 'text-zinc-500'
                  }`}
                >
                  Cada {intervalo} segundos el sistema
                  intentará procesar automáticamente el
                  siguiente reporte pendiente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex justify-end gap-3 ${
            isDark
              ? 'border-zinc-800 bg-zinc-900/80'
              : 'border-zinc-200 bg-zinc-50/80'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                : 'bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700'
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => onActivar(intervalo)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/30 transition-all"
          >
            Activar modo automático
          </button>
        </div>
      </div>
    </div>
  );
};