import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { SeismicMap } from '../../components/earthquakes/SeismicMap';
import { SimulationClock } from '../../components/clock/SimulationClock';
import { useSimulationClock } from '../../hooks/SimulationClock';
import { initialStations } from '../../data/mockStations';
import { initialZones } from '../../data/mockZones';
import { ShieldAlert } from 'lucide-react';

export const EstacionesPage = () => {
  const [theme, setTheme] = useState('dark');
  const [stations, setStations] = useState(initialStations);
  const [zones] = useState(initialZones);
  const [selectedStation, setSelectedStation] = useState(null);

  // Hook personalizado para controlar el tiempo real/simulación
  const { time, isRunning, setIsRunning } = useSimulationClock();

  // Lista de eventos sísmicos (soporta coordenadas planas X,Y o Lat,Lon)
  const [events] = useState([
    { id: 'EVT-01', x: 500, y: 500, lat: 6.832, lon: -73.125, magnitude: 5.2, name: 'Sismo Bucaramanga' },
    { id: 'EVT-02', x: 400, y: 300, lat: 4.142, lon: -74.912, magnitude: 3.8, name: 'Sismo Tolima' }
  ]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-500 selection:bg-orange-500/30 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-amber-50/20 text-zinc-900'
    }`}>
      {/* Navbar con Theme Toggle */}
      <Navbar 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onOpenCreateModal={() => console.log('Crear estación modal')} 
      />

      {/* Área Central */}
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar
          theme={theme}
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={(st) => setSelectedStation(st)}
          onEditStation={(st) => console.log('Editar', st)}
          onDeleteStation={(id) => setStations(stations.filter(s => s.id !== id))}
        />

        {/* Viewport del Mapa Interactivo */}
        <main className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* Reloj de Simulación (Esquina Superior Derecha) */}
          <SimulationClock
            theme={theme}
            time={time}
            isRunning={isRunning}
            onTogglePlay={() => setIsRunning(!isRunning)}
          />

          {/* Componente Mapbox GL */}
          <SeismicMap
            theme={theme}
            stations={stations}
            events={events}
            zones={zones}
            selectedStation={selectedStation}
            onSelectStation={(st) => setSelectedStation(st)}
          />

          {/* Leyenda Flotante */}
          <div className={`absolute bottom-6 right-6 z-10 border p-4 rounded-2xl shadow-2xl text-xs space-y-2.5 min-w-[210px] backdrop-blur-xl transition-all duration-500 ${
            isDark 
              ? 'bg-zinc-900/80 border-zinc-800/80 text-zinc-300' 
              : 'bg-white/90 border-amber-200 text-zinc-700'
          }`}>
            <div className={`flex items-center space-x-2 pb-2 border-b font-extrabold ${isDark ? 'border-zinc-800 text-zinc-200' : 'border-amber-100 text-zinc-800'}`}>
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              <span>Leyenda de Mapa</span>
            </div>
            
            <div className="space-y-2 text-[11px] font-medium">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span>Estación Activa</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse" />
                  <span className="font-bold text-red-500">Inactiva (Alerta)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  <span>Evento Sísmico</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/40 pt-1.5">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500/30 border border-orange-500" />
                  <span>Zona Poblada</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded bg-zinc-600/30 border border-zinc-500" />
                  <span>Zona No Poblada</span>
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};  