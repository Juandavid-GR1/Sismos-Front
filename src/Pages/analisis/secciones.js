import { BarChart3, Search, Archive, Link2, Settings2 } from 'lucide-react';

// Tabs of the "Análisis" section. Used by the router (App.jsx), the
// Navbar sub-menu and the layout header: one single list to maintain.
export const SECCIONES_ANALISIS = [
  {
    ruta: 'indicadores',
    etiqueta: 'Indicadores',
    icono: BarChart3,
    descripcion: 'Estado del catálogo, contadores acumulados y métricas del árbol.',
  },
  {
    ruta: 'consultas',
    etiqueta: 'Consultas',
    icono: Search,
    descripcion: 'Consultas sobre el catálogo activo.',
  },
  {
    ruta: 'archivo',
    etiqueta: 'Archivo',
    icono: Archive,
    descripcion: 'Archivo de ramas antiguas de prioridad baja e histórico.',
  },
  {
    ruta: 'asociaciones',
    etiqueta: 'Asociaciones',
    icono: Link2,
    descripcion: 'Posibles réplicas: referencia, candidatos y parámetros W y R.',
  },
  {
    ruta: 'parametros',
    etiqueta: 'Parámetros',
    icono: Settings2,
    descripcion: 'Reloj del escenario y parámetros L, T, W y R.',
  },
];
