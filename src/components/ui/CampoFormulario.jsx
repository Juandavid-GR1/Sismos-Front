import React from 'react';

/** Labeled input with the app style. Any extra prop goes to <input>. */
export const CampoFormulario = ({ etiqueta, ayuda, isDark, id, className = '', ...input }) => {
  const idCampo = id || `campo-${etiqueta?.toString().toLowerCase().replace(/\W+/g, '-')}`;
  return (
    <label htmlFor={idCampo} className={`block ${className}`}>
      <span className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {etiqueta}
      </span>
      <input
        id={idCampo}
        className={`w-full px-3 py-2 rounded-xl border outline-none text-sm font-semibold transition-all ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-orange-500'
            : 'bg-white border-zinc-200 text-zinc-800 focus:border-orange-400'
        }`}
        {...input}
      />
      {ayuda && <span className={`block text-[10px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{ayuda}</span>}
    </label>
  );
};
