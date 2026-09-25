import React, { useRef, useEffect, memo } from 'react';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/mapbox';
import { Radio, Activity } from 'lucide-react';
import circle from '@turf/circle';
import { StationPopupCard } from '../modals/StationPopupCard';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const SeismicMap = memo(({
  theme,
  stations = [],
  events = [],
  zones = null,
  selectedStation,
  onSelectStation
}) => {
  const isDark = theme === 'dark';
  const mapRef = useRef(null);

  // ============================================================
  // ANIMACIÓN HACIA ESTACIÓN SELECCIONADA
  // ============================================================
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

  // ============================================================
  // GEOJSON DE COBERTURA DE ESTACIONES
  // ============================================================
  const coverageGeoJSON = React.useMemo(
    () => ({
      type: 'FeatureCollection',
      features: stations.map((st) => {
        const center = [Number(st.lon), Number(st.lat)];
        const radiusInKm = Number(st.coverage) || 50;

        return circle(center, radiusInKm, {
          units: 'kilometers',
          properties: {
            id: st.id,
            status: st.status,
            coverage: radiusInKm
          }
        });
      })
    }),
    [stations]
  );

  // ============================================================
  // ESTILO DEL MAPA
  // ============================================================
  const mapStyle = isDark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -74.5,
          latitude: 4.5,
          zoom: 5.8
        }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{
          width: '100%',
          height: '100%'
        }}
        reuseMaps
      >
        {/* =====================================================
            CAPA 1: ZONAS DEL BACKEND
            ===================================================== */}
        {zones && (
          <Source id="zones-data" type="geojson" data={zones}>
            {/* -------------------------------------------------
                RELLENO DE ZONAS
                ------------------------------------------------- */}
            <Layer
              id="zones-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'case',
                  ['==', ['get', 'poblada'], true],
                  '#f97316',
                  '#52525b'
                ],
                'fill-opacity': isDark ? 0.18 : 0.25
              }}
            />

            {/* -------------------------------------------------
                BORDE DE ZONAS
                ------------------------------------------------- */}
            <Layer
              id="zones-border"
              type="line"
              paint={{
                'line-color': [
                  'case',
                  ['==', ['get', 'poblada'], true],
                  '#ea580c',
                  '#3f3f46'
                ],
                'line-width': 1.5,
                'line-dasharray': [2, 1]
              }}
            />
          </Source>
        )}

        {/* =====================================================
            CAPA 2: COBERTURA DE ESTACIONES
            ===================================================== */}
        <Source id="coverage-data" type="geojson" data={coverageGeoJSON}>
          <Layer
            id="coverage-fill"
            type="fill"
            paint={{
              'fill-color': [
                'case',
                ['==', ['get', 'status'], 'activa'],
                '#10b981',
                '#ef4444'
              ],
              'fill-opacity': 0.12
            }}
          />

          <Layer
            id="coverage-border"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'status'], 'activa'],
                '#10b981',
                '#ef4444'
              ],
              'line-width': 1.5
            }}
          />
        </Source>

        {/* =====================================================
            MARCADORES: ESTACIONES
            ===================================================== */}
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
              <div
                className={`p-2 rounded-xl cursor-pointer transition-transform hover:scale-125 ${
                  isSelected ? 'ring-2 ring-orange-500 scale-125 z-20' : ''
                } ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                }`}
              >
                <Radio className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Marker>
          );
        })}

        {/* =====================================================
            POPUP: ESTACIÓN SELECCIONADA
            ===================================================== */}
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

        {/* =====================================================
            MARCADORES: EVENTOS SÍSMICOS
            ===================================================== */}
        {events.map((evt) => {
          /*
           * IMPORTANTE:
           *
           * Las coordenadas del backend
           * ya están en formato geográfico:
           *
           * epicenter_x = LONGITUD
           * epicenter_y = LATITUD
           *
           * Por eso NO usamos flatToGeo().
           */

          const longitude = Number(
            evt.lon ?? evt.epicenter_x ?? evt.x
          );

          const latitude = Number(
            evt.lat ?? evt.epicenter_y ?? evt.y
          );

          // Evitar dibujar eventos con coordenadas inválidas.
          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return null;
          }

          return (
            <Marker
              key={evt.id}
              longitude={longitude}
              latitude={latitude}
            >
              <div className="relative flex items-center justify-center group cursor-pointer">
                <span
                  className="animate-ping absolute inline-flex rounded-full bg-orange-500 opacity-75"
                  style={{
                    width: `${evt.magnitude * 8}px`,
                    height: `${evt.magnitude * 8}px`
                  }}
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