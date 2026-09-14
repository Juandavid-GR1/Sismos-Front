import React from 'react';
import { Clock } from 'lucide-react';
import { EventCard } from './EventCard';

export const EventQueue = ({ events, selectedEvent, isDark, onSelectEvent }) => {
  return (
    <aside className={`w-2/5 border-r flex flex-col h-full transition-colors duration-500 ${
      isDark ? 'border-zinc-800/60 bg-zinc-950/50' : 'border-amber-200/60 bg-gradient-to-b from-amber-50/40 to-orange-50/20'
    }`}>
      <div className={`p-4 border-b flex justify-between items-center ${
        isDark ? 'border-zinc-800/40 bg-zinc-900/20' : 'border-amber-200/60 bg-amber-100/30'
      }`}>
        <h2 className="font-black text-xs uppercase tracking-wider text-orange-600 dark:text-orange-500 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Cola de Eventos Pendientes
        </h2>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
          isDark 
            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
            : 'bg-red-100 text-red-700 border-red-200'
        }`}>
          {events.length} Sin Revisar
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {events.length === 0 ? (
          <div className={`text-center py-12 text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            No hay eventos pendientes de revisión.
          </div>
        ) : (
          events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isSelected={selectedEvent?.id === evt.id}
              isDark={isDark}
              onSelect={onSelectEvent}
            />
          ))
        )}
      </div>
    </aside>
  );
};