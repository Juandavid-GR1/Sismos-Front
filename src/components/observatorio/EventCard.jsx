import React from 'react';
import { Radio, ChevronRight } from 'lucide-react';

export const EventCard = ({ event, isSelected, isDark, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(event)}
      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative group overflow-hidden ${
        isSelected
          ? isDark 
            ? 'bg-zinc-900 border-orange-500/80 shadow-lg shadow-orange-500/10' 
            : 'bg-gradient-to-r from-amber-100/90 to-orange-50/90 border-orange-400 shadow-md shadow-orange-500/10'
          : isDark
            ? 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/70'
            : 'bg-white/80 border-amber-200/60 hover:border-amber-300 hover:bg-amber-50/50 shadow-sm'
      }`}
    >
      {/* Indicador lateral del seleccionado */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-r-full" />
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-500">{event.id}</span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{event.timestamp}</span>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
          event.urgency === 'high' 
            ? isDark 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : 'bg-red-100 text-red-700 border-red-200'
            : isDark 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
              : 'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          Mag {event.magnitude} M_L
        </span>
      </div>

      <p className={`font-bold text-xs mb-2.5 transition-colors ${
        isDark ? 'text-zinc-200 group-hover:text-amber-300' : 'text-zinc-800 group-hover:text-orange-600'
      }`}>
        {event.location}
      </p>

      {/* Estaciones de Origen */}
      <div className={`pt-2.5 border-t flex flex-wrap gap-1 ${isDark ? 'border-zinc-800/40' : 'border-amber-100'}`}>
        <span className={`text-[10px] w-full mb-1 font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Reportado por:</span>
        {event.detectedBy.map((st, idx) => (
          <span key={idx} className={`text-[9px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${
            isDark 
              ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50' 
              : 'bg-amber-50 text-amber-900 border-amber-200/80 font-semibold'
          }`}>
            <Radio className="w-2.5 h-2.5 text-emerald-500" />
            {st}
          </span>
        ))}
      </div>
    </div>
  );
};