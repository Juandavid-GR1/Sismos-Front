import React from 'react';
import { Activity, ArrowDown, CheckCircle2, XCircle } from 'lucide-react';
import { DepthClassifier } from './DepthClassifier';

export const EventAnalyzer = ({ event, isDark, onApprove, onReject }) => {
  if (!event) {
    return (
      <div className={`h-full flex items-center justify-center text-sm font-medium ${
        isDark ? 'text-zinc-500' : 'text-zinc-400'
      }`}>
        Selecciona un reporte de la cola para analizar.
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className={`p-6 rounded-3xl border transition-all duration-500 backdrop-blur-xl ${
          isDark 
            ? 'bg-zinc-900/60 border-zinc-800/80' 
            : 'bg-white/90 border-amber-200/80 shadow-md shadow-orange-500/5'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-500">ANALIZADOR HIPOCENTRAL</span>
              <h1 className={`text-xl font-black ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{event.location}</h1>
              <p className={`text-xs font-mono mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>ID: {event.id} • Arribo: {event.timestamp}</p>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => onReject(event.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 active:scale-95 ${
                  isDark 
                    ? 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
                    : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Descartar Ruido</span>
              </button>

              <button 
                onClick={() => onApprove(event.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 transition-all flex items-center space-x-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Validar y Emitir Reporte</span>
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${isDark ? 'border-zinc-800/60' : 'border-amber-100'}`}>
            {/* Magnitud */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-zinc-950/60 border-zinc-800/60' : 'bg-amber-50/50 border-amber-200/60'
            }`}>
              <div>
                <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Magnitud Calculada</span>
                <p className="text-2xl font-black text-amber-500">{event.magnitude} <span className="text-xs font-normal text-zinc-400">M_L</span></p>
              </div>
              <Activity className="w-8 h-8 text-amber-500/40" />
            </div>

            {/* Profundidad */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-zinc-950/60 border-zinc-800/60' : 'bg-amber-50/50 border-amber-200/60'
            }`}>
              <div>
                <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Profundidad del Hipocentro</span>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-500">{event.depthKm} <span className="text-xs font-normal text-zinc-400">km</span></p>
              </div>
              <ArrowDown className="w-8 h-8 text-orange-500/40" />
            </div>
          </div>
        </div>

        <DepthClassifier depthKm={event.depthKm} isDark={isDark} />
      </div>
    </main>
  );
};