import React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import { Radio, Activity } from 'lucide-react';
import { flatToGeo } from '../../utils/geoUtils';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const SeismicMap = ({ theme, stations, events, zones, selectedStation, onSelectStation }) => {
  const isDark = theme === 'dark';

  // 1. Convertir Zonas (0-1000km) a polígonos GeoJSON
  const zonesGeoJSON = {
    type: 'FeatureCollection',
    features: zones.map((zone) => {
      const p1 = flatToGeo(zone.bounds[0], zone.bounds[1]); // xMin, yMin
      const p2 = flatToGeo(zone.bounds[2], zone.bounds[1]); // xMax, yMin
      const p3 = flatToGeo(zone.bounds[2], zone.bounds[3]); // xMax, yMax
      const p4 = flatToGeo(zone.bounds[0], zone.bounds[3]); // xMin, yMax

      return {
        type: 'Feature',
        properties: {
          id: zone.id,
          name: zone.name,
          isPopulated: zone.isPopulated,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [p1.lon, p1.lat],
            [p2.lon, p2.lat],
            [p3.lon, p3.lat],
            [p4.lon, p4.lat],
            [p1.lon, p1.lat]
          ]]
        }
      };
    })
  };

  // 2. Cobertura de Estaciones (Buffer en GeoJSON)
  const coverageGeoJSON = {
    type: 'FeatureCollection',
    features: stations.map((st) => ({
      type: 'Feature',
      properties: { id: st.id, status: st.status },
      geometry: {
        type: 'Point',
        coordinates: [st.lon, st.lat]
      }
    }))
  };

  return (
    <div className="w-full h-full relative">
      <Map
        initialViewState={{
          longitude: -74.5,
          latitude: 4.5,
          zoom: 5.8
        }}
        mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {/* CAPA 1: Zonas Pobladas y No Pobladas */}
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

        {/* CAPA 2: Cobertura de las Estaciones (Círculos de Alcance) */}
        <Source id="coverage-data" type="geojson" data={coverageGeoJSON}>
          <Layer
            id="coverage-radius"
            type="circle"
            paint={{
              'circle-radius': 60, // Radio de cobertura de la estación
              'circle-color': ['case', ['==', ['get', 'status'], 'activa'], '#10b981', '#ef4444'],
              'circle-opacity': 0.08,
              'circle-stroke-width': 1,
              'circle-stroke-color': ['case', ['==', ['get', 'status'], 'activa'], '#10b981', '#ef4444'],
            }}
          />
        </Source>

        {/* MARCADORES: Estaciones */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            longitude={station.lon}
            latitude={station.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectStation(station);
            }}
          >
            <div className={`p-2 rounded-xl cursor-pointer transition-transform hover:scale-125 ${
              station.status === 'activa'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
            }`}>
              <Radio className="w-4 h-4 stroke-[2.5]" />
            </div>
          </Marker>
        ))}

        {/* MARCADORES: Epicentros de Eventos (Convertidos de plano X,Y a Mapbox) */}
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
};