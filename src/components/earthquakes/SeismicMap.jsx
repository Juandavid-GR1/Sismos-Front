import React, { useRef, useEffect, useMemo, memo } from 'react';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/mapbox';
import { Radio, Activity, MapPin, RadioTower } from 'lucide-react';
import circle from '@turf/circle';
import { flatToGeo } from '../../utils/geoUtils';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StationPopupCard } from '../modals/StationPopupCard';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const SeismicMap = memo(({
  theme,
  stations = [],
  events = [],
  zones = [],
  selectedStation,
  onSelectStation
}) => {
  const isDark = theme === 'dark';
  const mapRef = useRef(null);

  // 1. Animación suave sin re-renderizar componentes innecesarios
  useEffect(() => {
    if (selectedStation && mapRef.current) {
      const lat = Number(selectedStation.lat);
      const lon = Number(selectedStation.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        mapRef.current.flyTo({
          center: [lon, lat],
          zoom: 9,
          duration: 1200,
          essential: true
        });
      }
    }
  }, [selectedStation]);

  // 2. MEMOIZAR GeoJSON de Zonas (Solo se recalcula si cambia 'zones')
  const zonesGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: zones.map((zone) => {
      const p1 = flatToGeo(zone.bounds[0], zone.bounds[1]);
      const p2 = flatToGeo(zone.bounds[2], zone.bounds[1]);
      const p3 = flatToGeo(zone.bounds[2], zone.bounds[3]);
      const p4 = flatToGeo(zone.bounds[0], zone.bounds[3]);

      return {
        type: 'Feature',
        properties: { id: zone.id, name: zone.name, isPopulated: zone.isPopulated },
        geometry: {
          type: 'Polygon',
          coordinates: [[[p1.lon, p1.lat], [p2.lon, p2.lat], [p3.lon, p3.lat], [p4.lon, p4.lat], [p1.lon, p1.lat]]]
        }
      };
    })
  }), [zones]);

  // 3. MEMOIZAR GeoJSON de Cobertura (Solo recalcula Turf al cambiar 'stations')
  const coverageGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: stations.map((st) => {
      const center = [Number(st.lon), Number(st.lat)];
      const radiusInKm = Number(st.coverage) || 50;
      return circle(center, radiusInKm, {
        units: 'kilometers',
        properties: { id: st.id, status: st.status, coverage: radiusInKm }
      });
    })
  }), [stations]);

  // Estilos visuales memoizados según el tema
  const mapStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -74.5, latitude: 4.5, zoom: 5.8 }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        reuseMaps // 🚀 REUTILIZA EL CANVAS WEBGL ENTRE NAVEGACIONES
      >
        {/* CAPA 1: Zonas */}
        <Source id="zones-data" type="geojson" data={zonesGeoJSON}>
          <Layer
            id="zones-fill"
            type="fill"
            paint={{
              'fill-color': ['case', ['get', 'isPopulated'], '#f97316', '#52525b'],
              'fill-opacity': isDark ? 0.18 : 0.25,
            }}
          />
          <Layer
            id="zones-border"
            type="line"
            paint={{
              'line-color': ['case', ['get', 'isPopulated'], '#ea580c', '#3f3f46'],
              'line-width': 1.5,
              'line-dasharray': [2, 1]
            }}
          />
        </Source>

        {/* CAPA 2: Cobertura */}
        <Source id="coverage-data" type="geojson" data={coverageGeoJSON}>
          <Layer
            id="coverage-fill"
            type="fill"
            paint={{
              'fill-color': ['case', ['==', ['get', 'status'], 'activa'], '#10b981', '#ef4444'],
              'fill-opacity': 0.12,
            }}
          />
          <Layer
            id="coverage-border"
            type="line"
            paint={{
              'line-color': ['case', ['==', ['get', 'status'], 'activa'], '#10b981', '#ef4444'],
              'line-width': 1.5,
            }}
          />
        </Source>

        {/* MARCADORES: Estaciones */}
        {stations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const isActive = station.status === 'activa';

          return (
            <Marker
              key={station.id ?? `${station.lat}-${station.lon}`}
              longitude={Number(station.lon)}
              latitude={Number(station.lat)}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelectStation(station);
              }}
            >
              <div className={`p-2 rounded-xl cursor-pointer transition-transform hover:scale-125 ${
                isSelected ? 'ring-2 ring-orange-500 scale-125 z-20' : ''
              } ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
              }`}>
                <Radio className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Marker>
          );
        })}

        {/* POPUP: Estación Seleccionada */}
        {selectedStation && (
          <Popup
            longitude={Number(selectedStation.lon)}
            latitude={Number(selectedStation.lat)}
            anchor="bottom"
            onClose={() => onSelectStation(null)}
            closeOnClick={false}
            className="z-30"
            offset={15}
          >
            <StationPopupCard
              station={selectedStation}
              isDark={isDark}
              onClose={() => onSelectStation(null)}
            />
          </Popup>
        )} 

        {/* MARCADORES: Eventos */}
        {events.map((evt) => {
          const geoCoords = flatToGeo(evt.x, evt.y);
          return (
            <Marker key={evt.id} longitude={geoCoords.lon} latitude={geoCoords.lat}>
              <div className="relative flex items-center justify-center group cursor-pointer">
                <span 
                  className="animate-ping absolute inline-flex rounded-full bg-orange-500 opacity-75"
                  style={{ width: `${evt.magnitude * 8}px`, height: `${evt.magnitude * 8}px` }}
                />
                <div className="relative p-2 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
});