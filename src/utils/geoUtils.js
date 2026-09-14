// Esquinas aproximadas del plano 0-1000 km proyectadas sobre Colombia
const BOUNDS = {
  minLat: 0.0,   // 0 km Lat
  maxLat: 9.0,   // 1000 km Lat
  minLon: -79.0, // 0 km Lon
  maxLon: -70.0  // 1000 km Lon
};

// Convierte coordenadas planas (x: 0-1000 km, y: 0-1000 km) a Lat/Lon para Mapbox
export const flatToGeo = (x, y) => {
  const lat = BOUNDS.minLat + (y / 1000) * (BOUNDS.maxLat - BOUNDS.minLat);
  const lon = BOUNDS.minLon + (x / 1000) * (BOUNDS.maxLon - BOUNDS.minLon);
  return { lat, lon };
};

// Evalúa si un punto (x, y) está dentro o en el borde de un rectángulo [xMin, yMin, xMax, yMax]
export const isPointInBounds = (x, y, bounds) => {
  const [xMin, yMin, xMax, yMax] = bounds;
  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
};

// Clasifica el evento según la regla de bordes y zonas
export const classifyEpicenter = (x, y, zones) => {
  const matchingZones = zones.filter(zone => isPointInBounds(x, y, zone.bounds));
  
  // Regla: Si está en el borde de 2 zonas, es poblada si al menos una lo es
  const isPopulated = matchingZones.some(zone => zone.isPopulated);
  
  return {
    matchingZones,
    isPopulatedStatus: isPopulated ? 'ZONA POBLADA' : 'ZONA NO POBLADA'
  };
};