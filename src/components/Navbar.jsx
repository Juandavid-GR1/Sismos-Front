import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  User, 
  Plus, 
  Radio, 
  Eye, 
  FileText, 
  GitFork,
  Command 
} from 'lucide-react';
import { useNavbar } from '../hooks/useNavbar';
import { ThemeToggle } from './buttons/ThemeToggle';

export const Navbar = ({
  theme,
  onToggleTheme,
  onOpenCreateModal,
  searchTerm = '',
  onSearchChange
}) => {
  const isDark = theme === 'dark';
  const { isObservatorio, isEstaciones, isReportes, isArboles } = useNavbar();

  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between z-40 sticky top-0 transition-all duration-500 backdrop-blur-2xl ${
        isDark
          ? 'bg-zinc-950/70 border-zinc-800/50 text-zinc-100 shadow-2xl shadow-black/40'
          : 'bg-white/70 border-amber-200/50 text-zinc-800 shadow-lg shadow-orange-500/5'
      }`}
    >
      {/* 1. BRAND & LOGO CON GLOW Y NAVEGACIÓN PRINCIPAL */}
      <div className="flex items-center space-x-6">
        <Link 
          to="/" 
          className="flex items-center space-x-3 group outline-none"
        >
          {/* Contenedor del Ícono con resplandor suave */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/30 group-hover:scale-105 group-hover:shadow-orange-500/50 transition-all duration-300">
            <Activity className="h-5 w-5 text-white stroke-[2.5] group-hover:rotate-12 transition-transform duration-300" />
            
            {/* Ping de estado en vivo */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-zinc-950" />
            </span>
          </div>

          <div>
            <h1 className="font-extrabold text-xs tracking-widest flex items-center gap-2">
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-red-400 transition-all duration-300">
                RED SÍSMICA
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 backdrop-blur-sm">
                COL
              </span>
            </h1>
            <p className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${
              isDark ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'
            }`}>
              Observatorio Nacional
            </p>
          </div>
        </Link>

        {/* Selector Modular de Secciones Principales */}
        <nav className="hidden lg:flex items-center space-x-1 pl-6 border-l border-zinc-500/15">
          <Link
            to="/estaciones"
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
              isEstaciones
                ? 'text-orange-500 bg-orange-500/10 border border-orange-500/25 shadow-sm shadow-orange-500/10'
                : isDark
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 transition-transform duration-300 ${isEstaciones ? 'scale-110' : ''}`} />
            <span>Estaciones</span>
          </Link>

          <Link
            to="/observatorio"
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
              isObservatorio
                ? 'text-orange-500 bg-orange-500/10 border border-orange-500/25 shadow-sm shadow-orange-500/10'
                : isDark
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
            }`}
          >
            <Eye className={`w-3.5 h-3.5 transition-transform duration-300 ${isObservatorio ? 'scale-110' : ''}`} />
            <span>Observatorio</span>
          </Link>
        </nav>
      </div>

      {/* 2. ÁREA CENTRAL INTERACTIVA */}

      {/* Opción A: Modo Estaciones -> Buscador Estilizado */}
      {isEstaciones && (
        <div className="relative w-80 lg:w-96 hidden md:block group">
          <Search className={`absolute left-3.5 top-2.5 h-4 w-4 transition-colors duration-300 ${
            isDark ? 'text-zinc-500 group-focus-within:text-orange-400' : 'text-zinc-400 group-focus-within:text-orange-500'
          }`} />
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Buscar estación o departamento..."
            className={`w-full rounded-2xl pl-10 pr-10 py-2 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-zinc-900/50 border border-zinc-800/80 text-zinc-100 placeholder-zinc-500 focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-zinc-900/90'
                : 'bg-zinc-100/80 border border-amber-200/50 text-zinc-800 placeholder-zinc-400 focus:border-orange-400 focus:ring-orange-400/20 focus:bg-white'
            }`}
          />

          <kbd className={`absolute right-3 top-2.5 px-1.5 py-0.5 text-[9px] font-mono rounded border flex items-center gap-0.5 ${
            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-zinc-200 border-zinc-300 text-zinc-500'
          }`}>
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>
      )}

      {/* Opción B: Modo Observatorio -> Sub-Navbar Animado (Reportes vs Árboles) */}
      {isObservatorio && (
        <div className={`flex items-center p-1 rounded-2xl border transition-all duration-300 ${
          isDark 
            ? 'bg-zinc-900/70 border-zinc-800/80 shadow-inner' 
            : 'bg-zinc-100/80 border-zinc-200 shadow-inner'
        }`}>
          {/* Botón Reportes */}
          <Link
            to="/observatorio "
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
              isReportes
                ? isDark
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                : isDark
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 transition-transform duration-300 ${isReportes ? 'rotate-[-6deg]' : ''}`} />
            <span>Reportes</span>
          </Link>

          {/* Botón Árboles */}
          <Link
            to="/observatorio/arboles"
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
              isArboles
                ? isDark
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                : isDark
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <GitFork className={`w-3.5 h-3.5 transition-transform duration-300 ${isArboles ? 'rotate-[90deg]' : ''}`} />
            <span>Árboles</span>
          </Link>
        </div>
      )}

      {/* 3. ACCIONES Y ACCESOS DEL USUARIO */}
      <div className="flex items-center space-x-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        {/* Botón de Creación Acción Primaria */}
        {isEstaciones && (
          <button
            onClick={onOpenCreateModal}
            className="relative inline-flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 active:scale-95 transition-all duration-300 group overflow-hidden"
          >
            {/* Destello de brillo hover */}
            <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <Plus className="h-4 w-4 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            <span className="tracking-wide">Nueva Estación</span>
          </button>
        )}

        {/* Profile Avatar */}
        <div className={`flex items-center pl-3 border-l ${isDark ? 'border-zinc-800' : 'border-amber-200/60'}`}>
          <button className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 hover:scale-105 transition-transform duration-300 focus:outline-none">
            <div className={`w-8 h-8 rounded-[14px] flex items-center justify-center ${
              isDark ? 'bg-zinc-950 text-orange-400' : 'bg-white text-orange-500'
            }`}>
              <User className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};