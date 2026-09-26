
import React from 'react';

const URGENCY_CONFIG = {
  high: {
    label: 'Alta',
    badgeClass:
      'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20',
    borderLeft: 'border-l-rose-500',
    pulse: true,
  },

  medium: {
    label: 'Media',
    badgeClass:
      'bg-amber-500/10 text-amber-400 border-amber-500/30 ring-1 ring-amber-500/20',
    borderLeft: 'border-l-amber-500',
    pulse: false,
  },

  low: {
    label: 'Baja',
    badgeClass:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20',
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
      className={`w-80 lg:w-96 flex flex-col shrink-0 border-r backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? 'bg-zinc-900/40 border-zinc-800/80'
          : 'bg-white/60 border-zinc-200'
      } ${
        stressMode
          ? 'ring-1 ring-rose-500/40 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]'
          : ''
      }`}
    >
      {/* Encabezado */}
      <div
        className={`px-5 py-4 border-b flex items-center justify-between backdrop-blur-md ${
          isDark
            ? 'border-zinc-800/80 bg-zinc-900/60'
            : 'border-zinc-200/80 bg-slate-100/60'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Cola de Reportes
          </h2>

          <span
            className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border shadow-sm ${
              isDark
                ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80'
                : 'bg-zinc-200 text-zinc-700 border-zinc-300'
            }`}
          >
            {events.length}
          </span>
        </div>

        {stressMode && (
          <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            Estrés
          </span>
        )}
      </div>

      {/* Lista scrolleable */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-40">
            <svg
              className="w-12 h-12 mb-3 stroke-current text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <p className="text-xs font-semibold tracking-wider uppercase">
              Sin reportes pendientes
            </p>

            <p className="text-[10px] mt-1 tracking-wide normal-case">
              La cola está actualizada
            </p>
          </div>
        ) : (
          events.map((event) => {
            const isSelected = selectedEvent?.id === event.id;

            const urgency =
              URGENCY_CONFIG[event.urgency] || URGENCY_CONFIG.low;

            const eventId =
              event.formatted_id ||
              `SIS-${String(event.sismo_id).padStart(6, '0')}`;

            const station =
              event.station_id ||
              event.stationId ||
              'N/A';

            const revision = event.revision ?? 'N/A';

            return (
              <button
                type="button"
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={`w-full text-left p-4 rounded-2xl border border-l-4 transition-all duration-200 group relative ${
                  urgency.borderLeft
                } ${
                  isSelected
                    ? isDark
                      ? 'bg-zinc-800/90 border-zinc-600 shadow-xl shadow-black/40 ring-1 ring-amber-500/30'
                      : 'bg-white border-zinc-400 shadow-lg ring-2 ring-amber-500/20'
                    : isDark
                    ? 'bg-zinc-950/40 border-zinc-800/70 hover:bg-zinc-800/50 hover:border-zinc-700'
                    : 'bg-white/70 border-zinc-200/90 hover:bg-white hover:border-zinc-300 shadow-sm'
                }`}
              >
                {/* Header Tarjeta */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono font-bold tracking-tight opacity-90 group-hover:text-amber-500 transition-colors">
                    {eventId}
                  </span>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${urgency.badgeClass}`}
                  >
                    {urgency.label}
                  </span>
                </div>

                {/* Meta Info */}
                <div
                  className={`grid grid-cols-2 gap-x-3 gap-y-1 mb-3 text-[10px] ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  <div>
                    <span className="block uppercase tracking-widest text-[9px] opacity-60 font-semibold">
                      Estación
                    </span>

                    <span
                      className={`font-mono font-bold ${
                        isDark
                          ? 'text-zinc-200'
                          : 'text-zinc-800'
                      }`}
                    >
                      {station}
                    </span>
                  </div>

                  <div>
                    <span className="block uppercase tracking-widest text-[9px] opacity-60 font-semibold">
                      Revisión
                    </span>

                    <span
                      className={`font-mono font-bold ${
                        isDark
                          ? 'text-amber-400'
                          : 'text-orange-600'
                      }`}
                    >
                      #{revision}
                    </span>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-2 mb-3 bg-zinc-500/5 p-2 rounded-xl border border-zinc-500/10">
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest opacity-60 font-semibold">
                      Magnitud
                    </span>

                    <span className="text-base font-black text-amber-500 tracking-tight">
                      {event.magnitude}{' '}
                      <span className="text-[10px] font-normal opacity-70">
                        Mw
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase tracking-widest opacity-60 font-semibold">
                      Profundidad
                    </span>

                    <span className="text-sm font-bold opacity-90 tracking-tight">
                      {event.depthKm}{' '}
                      <span className="text-[10px] font-normal opacity-70">
                        km
                      </span>
                    </span>
                  </div>
                </div>

                {/* Footer Tarjeta */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-500/10 text-[11px] opacity-70">
                  <span
                    className="truncate max-w-[170px] font-medium"
                    title={event.location}
                  >
                    📍 {event.location}
                  </span>

                  <time className="font-mono text-[10px] shrink-0 font-semibold">
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

