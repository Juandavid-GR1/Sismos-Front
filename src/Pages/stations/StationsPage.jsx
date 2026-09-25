import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';

// Componentes UI
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { SeismicMap } from '../../components/earthquakes/SeismicMap';
import { StationDetailPanel } from '../../components/modals/StationDetailPanel';
import { SimulationClock } from '../../components/clock/SimulationClock';

// Modales
import { CreateStationModal } from '../../components/modals/CreateStationModal';
import { EditStationModal } from '../../components/modals/EditStationModal';
import { CreateSeismicEventModal } from '../../components/modals/CreateSeismicEventModal';
import { EditSismoModal } from '../../components/modals/EditSismoModal';

// Hooks y Servicios
import { useSimulationClock } from '../../hooks/SimulationClock';
import { estacionesService } from '../../services/StationsServices';
import { sismosService } from '../../services/SismosServices';
import { obtenerZonas } from '../../services/ZonasServices';

export const EstacionesPage = () => {
  const [theme, setTheme] = useState('dark');
  const [stations, setStations] = useState([]);
  const [zones, setZones] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // MODALES DE ESTACIONES
  // ============================================================
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ============================================================
  // MODALES DE SISMOS
  // ============================================================
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

  // ============================================================
  // RELOJ DE SIMULACIÓN
  // ============================================================
  const { time, isRunning, setIsRunning } = useSimulationClock();

  // ============================================================
  // EVENTOS SÍSMICOS
  // ============================================================
  const [events, setEvents] = useState([]);

  // ============================================================
  // FORMATEAR SISMOS DEL BACKEND
  // ============================================================
  const formatEvent = (e) => ({
    ...e,
    id: e.formatted_id || e.id || `EVT-${e.id}`,
    name: e.name || `Sismo M${e.magnitude}`,
    lat: e.lat ?? e.epicenter_y,
    lon: e.lon ?? e.epicenter_x,
    x: e.x ?? e.epicenter_x,
    y: e.y ?? e.epicenter_y
  });

  // ============================================================
  // CARGAR DATOS DESDE EL BACKEND
  // ============================================================
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [stationsData, eventsData, zonesData] = await Promise.all([
          estacionesService.getAll(),
          sismosService.getAll(),
          obtenerZonas()
        ]);

        if (isMounted) {
          setStations(stationsData || []);
          setEvents((eventsData || []).map(formatEvent));
          setZones(zonesData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al conectar con la API');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // CALLBACKS DE ESTACIONES
  // ============================================================
  const handleStationCreated = useCallback((newStation) => {
    setStations((prev) => [...prev, newStation]);
  }, []);

  const handleOpenEditModal = useCallback((station) => {
    setEditingStation(station);
    setIsEditModalOpen(true);
  }, []);

  const handleStationUpdated = useCallback((updatedStation) => {
    setStations((prev) =>
      prev.map((s) => (s.id === updatedStation.id ? updatedStation : s))
    );
    setSelectedStation((prev) =>
      prev?.id === updatedStation.id ? updatedStation : prev
    );
  }, []);

  const handleDeleteSuccess = useCallback((deletedId) => {
    setStations((prev) => prev.filter((s) => s.id !== deletedId));
    setSelectedStation((prev) => (prev?.id === deletedId ? null : prev));
  }, []);

  // ============================================================
  // CALLBACKS DE SISMOS
  // ============================================================
  const handleEventCreated = useCallback((newEvent) => {
    setEvents((prev) => [...prev, formatEvent(newEvent)]);
  }, []);

  const handleOpenEditEventModal = useCallback((event) => {
    setEditingEvent(event);
    setIsEditEventModalOpen(true);
  }, []);

  const handleEventUpdated = useCallback((updatedEvent) => {
    const formatted = formatEvent(updatedEvent);
    setEvents((prev) =>
      prev.map((e) =>
        e.id === formatted.id || e.id === updatedEvent.id ? formatted : e
      )
    );
  }, []);

  const handleEventDeletedSuccess = useCallback((deletedId) => {
    const numericDeletedId =
      typeof deletedId === 'string'
        ? parseInt(deletedId.replace(/\D/g, ''), 10)
        : deletedId;

    setEvents((prev) =>
      prev.filter((event) => {
        const eventNumericId =
          typeof event.id === 'string'
            ? parseInt(event.id.replace(/\D/g, ''), 10)
            : event.id;

        return (
          event.id !== deletedId &&
          event.formatted_id !== deletedId &&
          eventNumericId !== numericDeletedId
        );
      })
    );
  }, []);

  // ============================================================
  // CAMBIO DE TEMA
  // ============================================================
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // ============================================================
  // REPORTAR SISMO
  // ============================================================
  const handleReportSeism = useCallback((station) => {
    alert(`Reportar sismo detectado en la estación: ${station.name}`);
  }, []);

  // ============================================================
  // FILTRO DE ESTACIONES
  // ============================================================
  const filteredStations = useMemo(() => {
    if (!searchTerm.trim()) {
      return stations;
    }

    const term = searchTerm.toLowerCase();

    return stations.filter(
      (st) =>
        st.name?.toLowerCase().includes(term) ||
        st.dept?.toLowerCase().includes(term)
    );
  }, [stations, searchTerm]);

  const isDark = theme === 'dark';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-amber-50/20 text-zinc-900'
      }`}
    >
      {/* NAVBAR */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar
          theme={theme}
          events={events}
          stations={filteredStations}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
          onEditStation={handleOpenEditModal}
          onDeleteSuccess={handleDeleteSuccess}
          onCreateEvent={() => setIsCreateEventModalOpen(true)}
          onEditEvent={handleOpenEditEventModal}
          onEventDeletedSuccess={handleEventDeletedSuccess}
          onEventsDeletedSuccess={() => setEvents([])}
        />

        {/* MAPA Y CONTENIDOS CENTRALES */}
        <main className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* LOADING */}
          {loading && (
            <div className="absolute z-30 flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900/80 text-orange-400 border border-zinc-800 backdrop-blur-md shadow-2xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">Cargando datos...</span>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="absolute top-4 z-30 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold backdrop-blur-md">
              {error}
            </div>
          )}

          {/* RELOJ */}
          <SimulationClock
            theme={theme}
            time={time}
            isRunning={isRunning}
            onTogglePlay={() => setIsRunning(!isRunning)}
          />

          {/* MAPA */}
          <SeismicMap
            theme={theme}
            stations={filteredStations}
            events={events}
            zones={zones}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />

          {/* LEYENDA */}
          <div
            className={`absolute bottom-6 right-6 z-10 border p-4 rounded-2xl shadow-2xl text-xs space-y-2.5 min-w-[210px] backdrop-blur-xl transition-all duration-300 ${
              selectedStation ? 'mr-80 sm:mr-96' : ''
            } ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800/80 text-zinc-300'
                : 'bg-white/90 border-amber-200 text-zinc-700'
            }`}
          >
            <div
              className={`flex items-center space-x-2 pb-2 border-b font-extrabold ${
                isDark
                  ? 'border-zinc-800 text-zinc-200'
                  : 'border-amber-100 text-zinc-800'
              }`}
            >
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

          {/* PANEL LATERAL DE DETALLE DE ESTACIÓN */}
          <StationDetailPanel
            station={selectedStation}
            theme={theme}
            onClose={() => setSelectedStation(null)}
            onReportSeism={handleReportSeism}
          />
        </main>
      </div>

      {/* MODALES DE ESTACIONES */}
      <CreateStationModal
        isOpen={isCreateModalOpen}
        theme={theme}
        onClose={() => setIsCreateModalOpen(false)}
        onStationCreated={handleStationCreated}
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

      {/* MODALES DE SISMOS */}
      <CreateSeismicEventModal
        isOpen={isCreateEventModalOpen}
        theme={theme}
        onClose={() => setIsCreateEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <EditSismoModal
        isOpen={isEditEventModalOpen}
        sismo={editingEvent}
        theme={theme}
        onClose={() => {
          setIsEditEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleEventUpdated}
      />
    </div>
  );
};