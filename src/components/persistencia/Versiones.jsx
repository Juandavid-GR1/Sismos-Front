import React, { useState } from 'react';
import { History, RefreshCw, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Boton } from '../ui/Boton';
import { Aviso } from '../ui/Aviso';
import { CampoFormulario } from '../ui/CampoFormulario';
import { useCarga } from '../../hooks/useCarga';
import { versionesService } from '../../services/versionesService';
import { formatearFecha } from '../../utils/formato';

// Same rule the backend applies to the name
const NOMBRE_VALIDO = /^[A-Za-z0-9._-]{1,80}$/;

/**
 * Named versions, they are saved on disk (they survive a
 * restart of the backend) with the same operating state as the export.
 * Restoring one is an action that can be undone.
 */
export const Versiones = ({ isDark }) => {
  // The list only changes when a version is saved or deleted here
  const { datos: versiones, cargando, error, recargar } = useCarga(versionesService.listar, { alCambiarEstado: false });
  const [nombre, setNombre] = useState('');
  const [trabajando, setTrabajando] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [fallo, setFallo] = useState(null);

  const ejecutar = async (clave, accion, exito) => {
    try {
      setTrabajando(clave);
      setFallo(null);
      setMensaje(null);
      await accion();
      setMensaje(exito);
      await recargar();
      return true;
    } catch (err) {
      setFallo(err.message);
      return false;
    } finally {
      setTrabajando(null);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const limpio = nombre.trim();
    if (!NOMBRE_VALIDO.test(limpio)) {
      setFallo('Usa entre 1 y 80 caracteres: letras, números, punto, guion o guion bajo (sin espacios).');
      return;
    }
    if (versiones?.some((v) => v.nombre === limpio)
      && !window.confirm(`Ya existe la versión «${limpio}». ¿Reemplazarla con el estado actual?`)) return;
    if (await ejecutar('guardar', () => versionesService.guardar(limpio), `Versión «${limpio}» guardada.`)) setNombre('');
  };

  const restaurar = (v) => {
    if (!window.confirm(`¿Restaurar la versión «${v.nombre}»? El escenario actual se reemplaza (se puede deshacer).`)) return;
    ejecutar(`r-${v.nombre}`, () => versionesService.restaurar(v.nombre), `Versión «${v.nombre}» restaurada. Puedes volver atrás con «Deshacer».`);
  };

  const eliminar = (v) => {
    if (!window.confirm(`¿Eliminar la versión «${v.nombre}»? Esto no se puede deshacer.`)) return;
    ejecutar(`e-${v.nombre}`, () => versionesService.eliminar(v.nombre), `Versión «${v.nombre}» eliminada.`);
  };

  return (
    <Panel
      isDark={isDark}
      icono={History}
      titulo="Versiones con nombre"
      //subtitulo="Guarda el estado actual con un nombre y restáuralo cuando quieras, incluso después de reiniciar el backend."
      acciones={<Boton variante="secundario" isDark={isDark} icono={RefreshCw} cargando={cargando} onClick={() => recargar()}>Actualizar</Boton>}
    >
      <form onSubmit={guardar} className="flex flex-wrap items-end gap-3">
        <CampoFormulario etiqueta="Nombre de la versión" isDark={isDark} maxLength={80}
          value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-64" />
        <Boton type="submit" icono={Save} cargando={trabajando === 'guardar'} disabled={!nombre.trim()}>Guardar versión</Boton>
      </form>

      <div className="mt-3 space-y-2">
        {error && <Aviso tipo="error">{error}</Aviso>}
        {fallo && <Aviso tipo="error" onCerrar={() => setFallo(null)}>{fallo}</Aviso>}
        {mensaje && <Aviso tipo="exito" onCerrar={() => setMensaje(null)}>{mensaje}</Aviso>}
      </div>

      <ul className="mt-4 divide-y divide-zinc-500/10">
        {(versiones ?? []).map((v) => (
          <li key={v.nombre} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black truncate">{v.nombre}</p>
              <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Guardada el {formatearFecha(v.fecha)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Boton variante="secundario" isDark={isDark} icono={RotateCcw} cargando={trabajando === `r-${v.nombre}`}
                disabled={!!trabajando} onClick={() => restaurar(v)}>Restaurar</Boton>
              <Boton variante="peligro" icono={Trash2} cargando={trabajando === `e-${v.nombre}`}
                disabled={!!trabajando} onClick={() => eliminar(v)} aria-label={`Eliminar ${v.nombre}`} />
            </div>
          </li>
        ))}
      </ul>
      {versiones && !versiones.length && (
        <p className={`py-6 text-center text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Aún no hay versiones guardadas.</p>
      )}
    </Panel>
  );
};
