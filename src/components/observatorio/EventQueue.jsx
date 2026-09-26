import React from 'react';

const URGENCY_CONFIG = {
  high: {
    label: 'Alta',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    borderLeft: 'border-l-rose-500',
    pulse: true,
  },
  medium: {
    label: 'Media',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderLeft: 'border-l-amber-500',
    pulse: false,
  },
  low: {
    label: 'Baja',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderLeft: 'border-l-emerald-500',
    pulse: false,
  },
};

export const EventQueue = ({
  events = [],
  selectedEvent,
  isDark,
  onSelectEvent,
  stressMode = false,
}) => {
  return (
    <aside
      className={`
        w-80 lg:w-96 flex flex-col shrink-0 border-r transition-colors duration-300
        ${isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white/80 border-zinc-200'}
        ${stressMode ? 'ring-1 ring-rose-500/30' : ''}
      `}
    >
      {/* Encabezado de la lista */}
      <div
        className={`
          px-4 py-3 border-b flex items-center justify-between
          ${isDark ? 'border-zinc-800/80 bg-zinc-900/80' : 'border-zinc-200 bg-zinc-50'}
        `}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-80">
            Cola de Reportes
          </h2>
          <span
            className={`
              px-2 py-0.5 text-xs font-semibold rounded-full border
              ${
                isDark
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  : 'bg-zinc-200 text-zinc-700 border-zinc-300'
              }
            `}
          >
            {events.length}
          </span>
        </div>

        {stressMode && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Estrés
          </span>
        )}
      </div>

      {/* Lista scrolleable de eventos */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-50">
            <svg
              className="w-10 h-10 mb-2 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs font-medium">Sin eventos pendientes</p>
          </div>
        ) : (
          events.map((event) => {
            const isSelected = selectedEvent?.id === event.id;
            const urgency = URGENCY_CONFIG[event.urgency] || URGENCY_CONFIG.low;

            return (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={`
                  w-full text-left p-3.5 rounded-xl border border-l-4 transition-all duration-200 group relative
                  ${urgency.borderLeft}
                  ${
                    isSelected
                      ? isDark
                        ? 'bg-zinc-800/90 border-zinc-600 shadow-lg shadow-black/20'
                        : 'bg-white border-zinc-400 shadow-md ring-1 ring-zinc-300'
                      : isDark
                      ? 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-800/40 hover:border-zinc-700'
                      : 'bg-white/60 border-zinc-200 hover:bg-white hover:border-zinc-300'
                  }
                `}
              >
                {/* Header Tarjeta */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold tracking-tight opacity-90">
                    {event.id}
                  </span>
                  <span
                    className={`
                      px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border
                      ${urgency.badgeClass}
                    `}
                  >
                    {urgency.label}
                  </span>
                </div>

                {/* Métricas del Sismo */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider opacity-50">
                      Magnitud
                    </span>
                    <span className="text-base font-extrabold text-amber-500">
                      {event.magnitude} <span className="text-xs font-normal">Mw</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider opacity-50">
                      Profundidad
                    </span>
                    <span className="text-sm font-semibold opacity-90">
                      {event.depthKm} <span className="text-xs font-normal">km</span>
                    </span>
                  </div>
                </div>

                {/* Footer Tarjeta */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-500/10 text-[11px] opacity-70">
                  <span className="truncate max-w-[170px]" title={event.location}>
                    📍 {event.location}
                  </span>
                  <time className="font-mono text-[10px] shrink-0">
                    {event.timestamp}
                  </time>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};