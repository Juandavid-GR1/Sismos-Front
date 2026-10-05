import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity, Archive, CheckCircle2, Database, GitBranch, History, Layers, Leaf,
  RefreshCw, RotateCw, ShieldAlert, Trash2, XCircle, Zap,
} from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Boton } from '../../components/ui/Boton';
import { Aviso } from '../../components/ui/Aviso';
import { Indicador } from '../../components/ui/Indicador';
import { BarrasPrioridad } from '../../components/analisis/BarrasPrioridad';
import { useCarga } from '../../hooks/useCarga';
import { metricasService } from '../../services/metricasService';
import { formatearClave } from '../../utils/formato';

const CONTADORES = [
  { clave: 'correcciones_aceptadas', etiqueta: 'Correcciones aceptadas', icono: CheckCircle2 },
  { clave: 'reportes_descartados', etiqueta: 'Reportes descartados', icono: Trash2 },
  { clave: 'conflictos', etiqueta: 'Conflictos', icono: XCircle },
  { clave: 'archivos_masivos', etiqueta: 'Archivos masivos', icono: Archive },
  { clave: 'eventos_archivados', etiqueta: 'Eventos archivados', icono: History },
];

/** Section 14: every indicator in one place (GET /metricas). */
export const IndicadoresPage = () => {
  const { isDark } = useOutletContext();
  const { datos, cargando, error, recargar } = useCarga(metricasService.indicadores);

  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!datos) return <p className="text-sm text-zinc-500">Cargando indicadores…</p>;

  const { eventos, contadores, arbol } = datos;
  const casos = arbol.contadores?.casos ?? {};
  const giros = arbol.contadores?.giros ?? {};

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Boton variante="secundario" isDark={isDark} icono={RefreshCw} cargando={cargando} onClick={() => recargar()}>Actualizar</Boton>
      </div>

      <Panel isDark={isDark} icono={Database} titulo="Eventos">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Indicador isDark={isDark} etiqueta="Activos" valor={eventos.activos} icono={Activity} resaltado />
          <Indicador isDark={isDark} etiqueta="Pendientes de atención" valor={arbol.pendientes ?? 0} icono={ShieldAlert} />
          <Indicador isDark={isDark} etiqueta="Archivados" valor={eventos.archivados} icono={Archive} />
          <Indicador isDark={isDark} etiqueta="Retirados (eliminados)" valor={eventos.retirados} icono={Trash2} />
        </div>
      </Panel>

      <Panel isDark={isDark} icono={History} titulo="Contadores acumulados" subtitulo="Se restauran al deshacer, igual que el resto del escenario.">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CONTADORES.map((c) => (
            <Indicador key={c.clave} isDark={isDark} etiqueta={c.etiqueta} valor={contadores[c.clave] ?? 0} icono={c.icono} />
          ))}
        </div>
      </Panel>

    </div>
  );
};
