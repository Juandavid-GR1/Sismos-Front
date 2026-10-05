import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Target, Users } from 'lucide-react';
import { Aviso } from '../ui/Aviso';
import { EstadoBadge } from '../ui/EstadoBadge';
import { useCarga } from '../../hooks/useCarga';
import { referenciasService } from '../../services/referenciasService';
import { formatearNumero } from '../../utils/formato';

const EnlaceEvento = ({ id }) => (
  <Link to={`/observatorio/consultar?id=${id}`} className="text-orange-500 font-black hover:underline">#{id}</Link>
);

const Bloque = ({ icono: Icono, titulo, isDark, children }) => (
  <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'}`}>
    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
      <Icono className="w-3.5 h-3.5 text-orange-500" /> {titulo}
    </h4>
    {children}
  </div>
);

/**
 * Section 7 for one event: the reference it points to (possible main
 * shock), every candidate inside the window W and radius R, and the
 * events that use it as their reference. Reloads after any change.
 */
export const AsociacionesEvento = ({ sismoId, isDark }) => {
  const cargar = useCallback(() => referenciasService.detalle(sismoId), [sismoId]);
  const { datos, cargando, error, sincronizar } = useCarga(cargar, { inmediato: false });

  useEffect(() => {
    if (sismoId) sincronizar();
  }, [sismoId, sincronizar]);

  if (!sismoId) return null;
  if (error) return <Aviso tipo="aviso">{error}</Aviso>;
  if (!datos) {
    return <p className="text-xs text-zinc-500">{cargando ? 'Cargando asociaciones…' : ''}</p>;
  }

  const { referencia, candidatos = [], configuracion } = datos;
  // The older backend sends this key with a space ("lo usan")
  const receptores = datos.eventos_que_lo_usan_como_referencia ?? datos['eventos_que_lo usan_como_referencia'] ?? [];
  const texto = isDark ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <div className="space-y-3">
      {configuracion && (
        <p className={`text-[11px] ${texto}`}>
          Ventana W = <strong>{configuracion.ventana_horas} h</strong> · Radio R = <strong>{configuracion.radio_km} km</strong>
        </p>
      )}

      <Bloque icono={Target} titulo="Referencia vigente" isDark={isDark}>
        {referencia ? (
          <p className="text-sm font-semibold flex flex-wrap items-center gap-2">
            <EnlaceEvento id={referencia.referencia_id} />
            <span className={texto}>a {formatearNumero(referencia.distancia)} km</span>
            {referencia.estado && <EstadoBadge estado={referencia.estado} />}
          </p>
        ) : (
          <p className={`text-xs ${texto}`}>Sin referencia: ningún evento cumple W y R.</p>
        )}
      </Bloque>

      <Bloque icono={Link2} titulo={`Candidatos (${candidatos.length})`} isDark={isDark}>
        {candidatos.length === 0 ? (
          <p className={`text-xs ${texto}`}>No hay candidatos dentro de la ventana y el radio.</p>
        ) : (
          <ul className="space-y-1">
            {candidatos.map((c, i) => (
              <li key={c.id} className="text-xs font-semibold flex flex-wrap items-center gap-2">
                <span className="text-zinc-500 w-4">{i + 1}.</span>
                <EnlaceEvento id={c.id} />
                <span>M {c.magnitud}</span>
                <span className={texto}>· {formatearNumero(c.distancia)} km</span>
                {c.estado && <EstadoBadge estado={c.estado} />}
                {referencia?.referencia_id === c.id && <span className="text-[10px] font-black text-orange-500">ELEGIDO</span>}
              </li>
            ))}
          </ul>
        )}
      </Bloque>

      <Bloque icono={Users} titulo={`Lo usan como referencia (${receptores.length})`} isDark={isDark}>
        {receptores.length === 0 ? (
          <p className={`text-xs ${texto}`}>Ningún evento lo usa como referencia.</p>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs">
            {receptores.map((r) => (
              <span key={r.id} className="flex items-center gap-1"><EnlaceEvento id={r.id} /> <EstadoBadge estado={r.estado} /></span>
            ))}
          </div>
        )}
      </Bloque>
    </div>
  );
};
