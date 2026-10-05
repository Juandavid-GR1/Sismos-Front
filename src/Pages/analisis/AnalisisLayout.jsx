import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useTema } from '../../hooks/useTema';
import { SECCIONES_ANALISIS } from './secciones';

/**
 * Shell of the "Análisis" section: navbar (with the sub-tabs), the title
 * of the current tab and the page itself (<Outlet />). Pages receive
 * { isDark } through useOutletContext().
 */
export const AnalisisLayout = () => {
  const { theme, isDark, alternarTema } = useTema();
  const { pathname } = useLocation();
  const seccion = SECCIONES_ANALISIS.find((s) => pathname.endsWith(`/${s.ruta}`)) ?? SECCIONES_ANALISIS[0];
  const Icono = seccion.icono;

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <Navbar theme={theme} onToggleTheme={alternarTema} />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
            <Icono className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{seccion.etiqueta}</h1>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{seccion.descripcion}</p>
          </div>
        </div>
        <Outlet context={{ isDark }} />
      </main>
    </div>
  );
};
