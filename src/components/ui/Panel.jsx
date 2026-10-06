import React from 'react';

/**
 * Card used by every analysis page: title with icon, optional subtitle,
 * optional actions on the right and free content.
 */
export const Panel = ({ titulo, subtitulo, icono: Icono, acciones, isDark, acento = false, children, className = '' }) => (
  <section
    className={`rounded-3xl border p-5 transition-colors ${
      acento
        ? isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50/60 border-orange-200/70'
        : isDark ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-sm'
    } ${className}`}
  >
    {(titulo || acciones) && (
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-zinc-500/10">
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            {Icono && <Icono className="w-4 h-4 text-orange-500 shrink-0" />}
            {titulo}
          </h2>
          {subtitulo && (
            <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {subtitulo}
            </p>
          )}
        </div>
        {acciones && <div className="flex items-center gap-2 shrink-0">{acciones}</div>}
      </header>
    )}
    {children}
  </section>
);
