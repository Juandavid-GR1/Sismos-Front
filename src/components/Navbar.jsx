import React from 'react';
import { Activity, Search, User, Plus } from 'lucide-react';
import { ThemeToggle } from './buttons/ThemeToggle';

export const Navbar = ({
  theme,
  onToggleTheme,
  onOpenCreateModal,
  searchTerm = '',
  onSearchChange
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`h-16 border-b px-6 flex items-center justify-between z-30 sticky top-0 transition-colors duration-500 backdrop-blur-xl ${
      isDark 
        ? 'bg-zinc-950/80 border-zinc-800/60 text-zinc-100' 
        : 'bg-white/80 border-amber-100 text-zinc-800 shadow-sm'
    }`}>
      {/* Logo & Marca */}
      <div className="flex items-center space-x-3 cursor-pointer group">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
          <Activity className="h-5 w-5 text-white stroke-[2.5]" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
        <div>
          <h1 className="font-black text-sm tracking-wider flex items-center gap-2">
            RED SÍSMICA
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20">
              COLOMBIA
            </span>
          </h1>
          <p className={`text-[11px] font-medium tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            OBSERVATORIO NACIONAL
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative w-96 hidden md:block">
        <Search className={`absolute left-3.5 top-2.5 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar estación por nombre o departamento..."
          className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
            isDark 
              ? 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 placeholder-zinc-500 focus:border-orange-500/60' 
              : 'bg-zinc-50 border border-amber-200/60 text-zinc-800 placeholder-zinc-400 focus:border-orange-400'
          }`}
        />
      </div>

      {/* Acciones & Botón de Tema */}
      <div className="flex items-center space-x-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        <button 
          onClick={onOpenCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-95 transition-all duration-300"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Nueva Estación</span>
        </button>

        <div className={`flex items-center space-x-3 pl-3 border-l ${isDark ? 'border-zinc-800' : 'border-amber-200/60'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-400 to-amber-400 p-0.5 shadow-sm">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDark ? 'bg-zinc-900 text-orange-400' : 'bg-white text-orange-500'}`}>
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};