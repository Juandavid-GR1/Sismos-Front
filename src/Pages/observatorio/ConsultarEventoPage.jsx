import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Link2, XCircle, Pencil, CheckCheck, Archive, Trash2 } from 'lucide-react';

import { Navbar } from '../../components/Navbar';
import { Aviso } from '../../components/ui/Aviso';
import { Boton } from '../../components/ui/Boton';
import { EstadoBadge, PrioridadBadge } from '../../components/ui/EstadoBadge';
import { FichaEvento, Seccion } from '../../components/consulta/FichaEvento';
import { AsociacionesEvento } from '../../components/consulta/AsociacionesEvento';
import { EditSismoModal } from '../../components/modals/EditSismoModal';
import { useTema } from '../../hooks/useTema';
import { useCarga } from '../../hooks/useCarga';
import { consultasService } from '../../services/consultasService';
import { sismosService } from '../../services/SismosServices';
import { notificarCambioDeEstado } from '../../services/historialService';

const NOTA_ESTADO = {
  archivado: 'El evento salió del árbol activo al archivar su rama. Un reporte nuevo para este id lo confirma o lo reactiva.',
  retirado: 'El evento fue retirado del árbol activo.',
};

/**
 * Section 6: locate an event by its id, whatever happened to it.
 * The answer says whether it is active, archived, retired or deleted.
 * Active events can be marked as reviewed or corrected from here.
 * The id can also come in the URL (?id=123) from tables and the tree.
 */
export const ConsultarEventoPage = () => {
  const { theme, isDark, alternarTema } = useTema();
  const [params, setParams] = useSearchParams();
  const idUrl = params.get('id') ?? '';
  const [idBusqueda, setIdBusqueda] = useState(idUrl);
  const [invalido, setInvalido] = useState(null);
  // Copy of the event being corrected: the page reloads the event after
  // the correction, but the modal must keep showing its report.
  const [editando, setEditando] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [marcando, setMarcando] = useState(false);

  const { datos: evento, cargando, error, recargar, sincronizar } = useCarga(consultasService.evento, { inmediato: false });

  // Search again whenever the id in the URL changes
  useEffect(() => {
    if (idUrl) sincronizar(Number(idUrl));
  }, [idUrl, sincronizar]);

  const buscarEvento = (e) => {
    e.preventDefault();
    const id = Number(idBusqueda);
    if (!Number.isInteger(id) || id <= 0) {
      setInvalido('Ingresa un identificador numérico válido (entero positivo).');
      return;
    }
    setInvalido(null);
    setAviso(null);
    if (String(id) === idUrl) recargar(id);
    else setParams({ id: String(id) });
  };

  const marcarRevisado = async () => {
    try {
      setMarcando(true);
      const r = await sismosService.marcarRevisado(evento.id);
      notificarCambioDeEstado();
      setAviso({ tipo: 'exito', texto: r?.message || 'Evento marcado como revisado.' });
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setMarcando(false);
    }
  };

  const alCorregir = useCallback(() => {
    notificarCambioDeEstado();
  }, []);

  const estado = evento?.estado;
  const conDatos = evento && estado !== 'eliminado';

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <Navbar theme={theme} onToggleTheme={alternarTema} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-500" />
            Consultar evento
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Localiza un evento por su identificador, aunque su prioridad o magnitud hayan cambiado o ya no esté activo.
          </p>
        </div>

        <form onSubmit={buscarEvento} className="flex gap-2 max-w-2xl">
          <input
            type="number" min="1" step="1"
            value={idBusqueda}
            onChange={(e) => setIdBusqueda(e.target.value)}
            placeholder="Identificador del evento (ej: 3)"
            aria-label="Identificador del evento"
            className={`flex-1 min-w-0 px-4 py-3 rounded-2xl border outline-none text-sm font-bold transition-all ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-orange-500' : 'bg-white border-zinc-200 text-zinc-800 focus:border-orange-400'
            }`}
          />
          <Boton type="submit" icono={Search} cargando={cargando}>Buscar</Boton>
        </form>

        {invalido && <Aviso tipo="aviso">{invalido}</Aviso>}
        {error && <Aviso tipo="error">{error}</Aviso>}
        {aviso && <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso>}

        {!error && estado === 'eliminado' && (
          <div className={`p-5 rounded-2xl border max-w-2xl ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
            <div className="flex items-center gap-2 text-zinc-400 font-black text-sm uppercase mb-2">
              <XCircle className="w-4 h-4" /> Identificador retirado
            </div>
            <p className="text-sm">{evento.mensaje}</p>
            <p className={`text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              ID: {evento.id} · No puede reutilizarse ni reactivarse mediante un reporte.
            </p>
          </div>
        )}

        {!error && conDatos && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-black">{evento.formatted_id ?? `#${evento.id}`}</span>
              <EstadoBadge estado={estado} />
              {evento.status && <EstadoBadge estado={evento.status} />}
              {evento.prioridad && <PrioridadBadge prioridad={evento.prioridad} />}
              {estado === 'activo' && (
                <div className="flex gap-2 ml-auto">
                  {evento.status === 'Pendiente' && (
                    <Boton variante="secundario" isDark={isDark} icono={CheckCheck} cargando={marcando} onClick={marcarRevisado}>
                      Marcar revisado
                    </Boton>
                  )}
                  <Boton icono={Pencil} onClick={() => setEditando(evento)}>Corregir</Boton>
                </div>
              )}
            </div>

            {NOTA_ESTADO[estado] && (
              <Aviso tipo="info" titulo={estado === 'archivado' ? 'Evento archivado' : 'Evento retirado'}>
                <span className="flex items-center gap-1.5">
                  {estado === 'archivado' ? <Archive className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {NOTA_ESTADO[estado]}
                </span>
              </Aviso>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <FichaEvento evento={evento} isDark={isDark} />
              <Seccion titulo="Asociaciones (posibles réplicas)" icon={Link2} isDark={isDark}>
                <div className="pt-2">
                  <AsociacionesEvento sismoId={evento.id} isDark={isDark} />
                </div>
              </Seccion>
            </div>
          </div>
        )}

        {!evento && !error && !cargando && !idUrl && (
          <div className={`py-16 text-center text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Escribe un identificador y presiona Buscar.
          </div>
        )}
      </main>

      <EditSismoModal
        isOpen={editando !== null}
        sismo={editando}
        isDark={isDark}
        onClose={() => setEditando(null)}
        onSave={alCorregir}
      />
    </div>
  );
};
