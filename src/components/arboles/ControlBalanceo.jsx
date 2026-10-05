import React, { useState } from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { arbolService } from '../../services/arbolService';

/**
 * Stress mode and global
 * balance recovery. Leaving stress mode is refused while the tree is
 * unbalanced; the backend explains why.
 */
export const ControlBalanceo = ({ modoEstres, cantidadNodos, isDark }) => {
  const [trabajando, setTrabajando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const ejecutar = async (cual, accion) => {
    try {
      setTrabajando(cual);
      setMensaje(null);
      setMensaje({ tipo: 'exito', texto: await accion() });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setTrabajando(null);
    }
  };

  const alternar = () => ejecutar('estres', async () => {
    await arbolService.modoEstres(!modoEstres);
    return modoEstres ? 'Modo estrés desactivado.' : 'Modo estrés activado: las inserciones no rotan hasta recuperar el balance.';
  });

  const recuperar = () => ejecutar('recuperar', async () => {
    const r = await arbolService.recuperarBalance();
    return `Recuperación global: ${r.rotacionesAplicadas ?? 0} caso(s) de rotación aplicados.`;
  });

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Balanceo diferido</span>
      <Boton
        className="w-full"
        variante={modoEstres ? 'peligro' : 'secundario'}
        isDark={isDark}
        icono={Zap}
        cargando={trabajando === 'estres'}
        disabled={trabajando !== null}
        onClick={alternar}
      >
        {modoEstres ? 'Desactivar modo estrés' : 'Activar modo estrés'}
      </Boton>
      <Boton
        className="w-full"
        variante="secundario"
        isDark={isDark}
        icono={ShieldCheck}
        cargando={trabajando === 'recuperar'}
        disabled={trabajando !== null || cantidadNodos === 0}
        onClick={recuperar}
      >
        Recuperar balance
      </Boton>
      {mensaje && <Aviso tipo={mensaje.tipo} onCerrar={() => setMensaje(null)}>{mensaje.texto}</Aviso>}
    </div>
  );
};
