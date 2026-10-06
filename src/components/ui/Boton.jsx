import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button with the app style.
 * variante: primario (orange gradient) | secundario | peligro
 */
export const Boton = ({
  children, icono: Icono, cargando = false, variante = 'primario', isDark,
  type = 'button', disabled, className = '', ...resto
}) => {
  const estilos = {
    primario: 'text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/20',
    secundario: isDark
      ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-orange-500/40 hover:text-orange-400'
      : 'bg-white border border-zinc-200 text-zinc-700 hover:border-orange-300 hover:text-orange-600',
    peligro: 'text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20',
  };
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${estilos[variante] ?? estilos.primario} ${className}`}
      {...resto}
    >
      {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : Icono && <Icono className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
};
