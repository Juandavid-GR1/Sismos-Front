import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-stone-100 overflow-hidden p-6 font-sans select-none">
      
      {/* Animaciones CSS integradas */}
      <style>{`
        @keyframes earthEntrance {
          0% {
            transform: translate(-50%, -50%) scale(0.3) rotate(-30deg);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 0.35;
          }
        }

        @keyframes bgDiagonalShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-earth-2d {
          animation: earthEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-bg-diagonal {
          background-size: 200% 200%;
          animation: bgDiagonalShift 10s ease infinite;
        }
      `}</style>

      {/* ==========================================================
          1. FONDO DIAGONAL DIFUMINADO Y FLUIDO
          ========================================================== */}
      <div className="absolute -top-[30%] -left-[20%] w-[140%] h-[110%] -rotate-12 pointer-events-none z-0">
        <div 
          className="w-full h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 opacity-90 animate-bg-diagonal blur-2xl transform-gpu" 
          style={{ 
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)', 
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)' 
          }}
        />
      </div>

      {/* Halo de acento cálido */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-b from-amber-400/30 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* ==========================================================
          2. DISEÑO DE LA TIERRA 2D (DETRÁS DEL CONTENEDOR)
          ========================================================== */}
      <div className="absolute z-10 top-1/2 left-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] pointer-events-none animate-earth-2d">
        <svg viewBox="0 0 200 200" className="w-full h-full text-slate-800">
          {/* Circunferencias de la Tierra 2D */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
          <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          
          {/* Líneas de Latitud y Longitud 2D */}
          <ellipse cx="100" cy="100" rx="90" ry="32" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
          <ellipse cx="100" cy="100" rx="90" ry="64" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <ellipse cx="100" cy="100" rx="32" ry="90" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
          <ellipse cx="100" cy="100" rx="64" ry="90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />

          {/* Continentes minimalistas planos */}
          <path d="M 55 65 Q 75 45 95 55 Q 115 65 105 85 Q 85 95 65 85 Z" fill="currentColor" opacity="0.35" />
          <path d="M 115 105 Q 135 95 145 115 Q 125 135 105 125 Z" fill="currentColor" opacity="0.35" />
          <path d="M 45 115 Q 65 105 75 125 Q 55 145 35 125 Z" fill="currentColor" opacity="0.35" />
          
          {/* Ejes 2D */}
          <line x1="100" y1="5" x2="100" y2="195" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <line x1="5" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        </svg>
      </div>

      {/* ==========================================================
          3. TARJETA CENTRAL TRANSPARENTE
          ========================================================== */}
      <div className="relative z-20 w-full max-w-sm bg-white/40 backdrop-blur-md border border-white/60 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-orange-950/15 text-center">
        
        {/* Encabezado Actualizado */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-orange-300/50 text-orange-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            ✦ Monitoreo en Tiempo Real
          </span>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-snug mb-2">
            Bienvenido al Sistema de Observación Sísmica
          </h1>
          <h2 className="text-xl font-extrabold text-orange-950 mb-1">
            ¿Qué quieres ver?
          </h2>
          <p className="text-xs text-slate-700 font-medium">
            Selecciona una opción para acceder al panel
          </p>
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col gap-4">
          
          {/* Botón Estaciones */}
          <button 
            onClick={() => navigate('/estaciones')}
            className="group flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 text-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                📡
              </span>
              <span>Estaciones</span>
            </div>
            <span className="text-xl opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              →
            </span>
          </button>

          {/* Botón Observatorio */}
          <button 
            onClick={() => navigate('/observatorio')}
            className="group flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 text-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                🔭
              </span>
              <span>Observatorio</span>
            </div>
            <span className="text-xl opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              →
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}