import React from 'react';
import { Bell, Activity, Radio } from 'lucide-react';

export const MetricBar = ({ isDark, networkStatus, activeEventsCount, pendingCount }) => {
  return (
    <section className={`px-6 py-3 border-b flex items-center justify-between text-xs font-mono transition-colors duration-500 backdrop-blur-xl ${
      isDark 
        ? 'border-zinc-800/60 bg-zinc-950/80 text-zinc-100' 
        : 'border-amber-200/60 bg-amber-50/80 text-zinc-800 shadow-sm'
    }`}>
      <div className="flex items-center space-x-6">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
          isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Estado Red:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{networkStatus}</span>
        </div>

        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
          isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200'
        }`}>
          <Activity className="w-3.5 h-3.5 text-orange-500" />
          <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Eventos activos:</span>
          <span className="font-bold text-orange-600 dark:text-orange-500">{activeEventsCount}</span>
        </div>
      </div>

      <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full font-bold border transition-all ${
        isDark 
          ? 'bg-red-500/10 border-red-500/20 text-red-400' 
          : 'bg-red-50 border-red-200 text-red-600 shadow-sm'
      }`}>
        <Bell className="w-3.5 h-3.5 animate-bounce text-red-500" />
        <span>Reportes en cola: {pendingCount}</span>
      </div>
    </section>
  );
};