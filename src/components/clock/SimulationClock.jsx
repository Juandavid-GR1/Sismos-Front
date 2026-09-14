import React from 'react';
import { Clock, Play, Pause } from 'lucide-react';

export const SimulationClock = ({ time, isRunning, onTogglePlay, theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`absolute top-4 right-4 z-20 flex items-center space-x-3 px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 ${
      isDark 
        ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-100' 
        : 'bg-white/90 border-amber-200 text-zinc-800'
    }`}>
      <div className="flex items-center space-x-2 text-orange-500 font-mono font-black text-sm tracking-wider">
        <Clock className="w-4 h-4 animate-spin-slow" />
        <span>{time.toLocaleTimeString()}</span>
      </div>

      <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        {time.toLocaleDateString()}
      </span>

      <button
        onClick={onTogglePlay}
        className={`p-1.5 rounded-lg transition-colors ${
          isRunning 
            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
        }`}
      >
        {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};