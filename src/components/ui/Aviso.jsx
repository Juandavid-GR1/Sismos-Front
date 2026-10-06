import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const ESTILOS = {
  error: { clase: 'border-rose-500/30 bg-rose-500/10 text-rose-400', Icono: XCircle },
  aviso: { clase: 'border-amber-500/30 bg-amber-500/10 text-amber-500', Icono: AlertTriangle },
  exito: { clase: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500', Icono: CheckCircle2 },
  info: { clase: 'border-sky-500/30 bg-sky-500/10 text-sky-400', Icono: Info },
};

/** Coloured message box: tipo = error | aviso | exito | info. */
export const Aviso = ({ tipo = 'info', titulo, children, onCerrar }) => {
  if (!children && !titulo) return null;
  const { clase, Icono } = ESTILOS[tipo] ?? ESTILOS.info;
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs font-semibold ${clase}`}>
      <Icono className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 leading-relaxed">
        {titulo && <p className="font-black mb-0.5">{titulo}</p>}
        {children}
      </div>
      {onCerrar && (
        <button type="button" onClick={onCerrar} className="opacity-70 hover:opacity-100" aria-label="Cerrar">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
