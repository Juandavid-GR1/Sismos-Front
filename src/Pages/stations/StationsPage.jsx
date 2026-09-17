import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { SeismicMap } from '../../components/earthquakes/SeismicMap';
import { StationDetailPanel } from '../../components/modals/StationDetailPanel';
import { SimulationClock } from '../../components/clock/SimulationClock';
import { CreateStationModal } from '../../components/modals/CreateStationModal';
import { EditStationModal } from '../../components/modals/EditStationModal';
import { useSimulationClock } from '../../hooks/SimulationClock';
import { estacionesService } from '../../services/StationsServices';
import { initialZones } from '../../data/mockZones';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { CreateSeismicEventModal } from '../../components/modals/CreateSeismicEventModal';

export const EstacionesPage = () => {
  const [theme, setTheme] = useState('dark');
  const [stations, setStations] = useState([]);
  const [zones] = useState(initialZones);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { time, isRunning, setIsRunning } = useSimulationClock();

  const [events] = useState([
    { id: 'EVT-01', x: 500, y: 500, lat: 6.832, lon: -73.125, magnitude: 5.2, name: 'Sismo Bucaramanga' },
    { id: 'EVT-02', x: 400, y: 300, lat: 4.142, lon: -74.912, magnitude: 3.8, name: 'Sismo Tolima' }
  ]);

  // Cargar datos al inicio
  useEffect(() => {
    let isMounted = true;
    const fetchStations = async () => {
      try {
        setLoading(true);
        const data = await estacionesService.getAll();
        if (isMounted) setStations(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Error al conectar con la API');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStations();
    return () => { isMounted = false; };
  }, []);

  // Callbacks memoizados
  const handleStationCreated = useCallback((newStation) => {
    setStations((prev) => [...prev, newStation]);
  }, []);

  const handleOpenEditModal = useCallback((station) => {
    setEditingStation(station);
    setIsEditModalOpen(true);
  }, []);

  const handleStationUpdated = useCallback((updatedStation) => {
    setStations((prev) => prev.map((s) => (s.id === updatedStation.id ? updatedStation : s)));
    setSelectedStation((prev) => (prev?.id === updatedStation.id ? updatedStation : prev));
  }, []);

  const handleDeleteSuccess = useCallback((deletedId) => {
    setStations((prev) => prev.filter((s) => s.id !== deletedId));
    setSelectedStation((prev) => (prev?.id === deletedId ? null : prev));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleReportSeism = useCallback((station) => {
    alert(`Reportar sismo detectado en la estación: ${station.name}`);
  }, []);

const handleEventCreated = (newEvent) => {
  setEvents((prev) => [...prev, newEvent]);
};


  // Memoizar el filtro de búsqueda
  const filteredStations = useMemo(() => {
    if (!searchTerm.trim()) return stations;
    const term = searchTerm.toLowerCase();
    return stations.filter(
      (st) =>
        st.name?.toLowerCase().includes(term) ||
        st.dept?.toLowerCase().includes(term)
    );
  }, [stations, searchTerm]);

  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-300 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-amber-50/20 text-zinc-900'
    }`}>
      <Navbar 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar
          theme={theme}
          stations={filteredStations}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
          onEditStation={handleOpenEditModal}
          onDeleteSuccess={handleDeleteSuccess}
          onCreateEvent={() => setIsCreateEventModalOpen(true)} // Abre el modal desde el botón +
          onEventsDeletedSuccess={() => setEvents([])}
        />

        <main className="flex-1 relative overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="absolute z-30 flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900/80 text-orange-400 border border-zinc-800 backdrop-blur-md shadow-2xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">Cargando estaciones...</span>
            </div>
          )}

          {error && (
            <div className="absolute top-4 z-30 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold backdrop-blur-md">
              {error}
            </div>
          )}

          <SimulationClock
            theme={theme}
            time={time}
            isRunning={isRunning}
            onTogglePlay={() => setIsRunning(!isRunning)}
          />

          <SeismicMap
            theme={theme}
            stations={filteredStations}
            events={events}
            zones={zones}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />
        
          {/* Leyenda */}
          <div className={`absolute bottom-6 right-6 z-10 border p-4 rounded-2xl shadow-2xl text-xs space-y-2.5 min-w-[210px] backdrop-blur-xl transition-all duration-300 ${
            selectedStation ? 'mr-80 sm:mr-96' : ''
          } ${
            isDark ? 'bg-zinc-900/80 border-zinc-800/80 text-zinc-300' : 'bg-white/90 border-amber-200 text-zinc-700'
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
            </div>
          </div>

          {/* Panel Lateral de Detalle de Estación */}
          <StationDetailPanel
            station={selectedStation}
            theme={theme}
            onClose={() => setSelectedStation(null)}
            onReportSeism={handleReportSeism}
          />
        </main>
      </div>

      <CreateStationModal
        isOpen={isCreateModalOpen}
        theme={theme}
        onClose={() => setIsCreateModalOpen(false)}
        onStationCreated={handleStationCreated}
      />
      
      <CreateSeismicEventModal
        isOpen={isCreateEventModalOpen}
        theme={theme}
        onClose={() => setIsCreateEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <EditStationModal
        isOpen={isEditModalOpen}
        station={editingStation}
        theme={theme}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStation(null);
        }}
        onStationUpdated={handleStationUpdated}
      />
    </div>
  );
};