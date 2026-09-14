import React from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      type="button"
      title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      className={`relative inline-flex items-center justify-between w-16 h-8 p-1 rounded-full transition-colors duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-md ${
        isDark 
          ? 'bg-zinc-800 border border-zinc-700/80' 
          : 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200'
      }`}
    >
      {/* Iconos de fondo */}
      <Sun className={`w-4 h-4 text-amber-500 z-0 transition-opacity duration-300 ml-1 ${isDark ? 'opacity-40' : 'opacity-100'}`} />
      <Moon className={`w-4 h-4 text-orange-400 z-0 transition-opacity duration-300 mr-1 ${isDark ? 'opacity-100' : 'opacity-40'}`} />

      {/* Switch Deslizable Animado */}
      <div
        className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transform transition-transform duration-500 ease-spring flex items-center justify-center ${
          isDark
            ? 'translate-x-8 bg-gradient-to-tr from-amber-400 to-orange-500 text-zinc-950 shadow-orange-500/30'
            : 'translate-x-0 bg-white text-amber-500 shadow-amber-500/20'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
        )}
      </div>
    </button>
  );
};