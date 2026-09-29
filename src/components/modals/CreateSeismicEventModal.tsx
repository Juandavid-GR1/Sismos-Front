import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Gauge, Layers, Radio, Hash, Clock } from 'lucide-react';
import { sismosService, type CreateSeismicEventInput } from '../../services/SismosServices';
import { StatusSismo, type SeismicEvent } from '../../models/Sismos';

interface CreateSeismicEventModalProps {
  isOpen: boolean;
  theme: 'dark' | 'light';
  onClose: () => void;
  onEventCreated: (newEvent: SeismicEvent) => void;
}

export const CreateSeismicEventModal: React.FC<CreateSeismicEventModalProps> = ({
  isOpen,
  theme,
  onClose,
  onEventCreated,
}) => {
  const isDark = theme === 'dark';

  // Local "now" formatted for <input type="datetime-local" step="1">
  const ahoraLocal = () => {
    const ahora = new Date();
    return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  };

  const [formData, setFormData] = useState({
    id: '' as number | '',
    occurredAt: ahoraLocal(),
    magnitude: 4.5,
    depth: 15.0,
    latitude: 4.5709,
    longitude: -74.2973,
    stationId: '', // Opcional por defecto
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const roundToDecimals = (num: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'stationId' || name === 'occurredAt' ? value : value === '' ? '' : parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const mag = roundToDecimals(Number(formData.magnitude), 1);
    const depth = roundToDecimals(Number(formData.depth), 1);
    const lat = roundToDecimals(Number(formData.latitude), 6);
    const lon = roundToDecimals(Number(formData.longitude), 6);
    const station = formData.stationId.trim();
    const id = Number(formData.id);

    // Section 3: integer id between 1 and 999999, entered by the user
    if (!Number.isInteger(id) || id < 1 || id > 999999) {
      setError('El identificador debe ser un entero entre 1 y 999999.');
      setLoading(false);
      return;
    }

    const occurred = new Date(formData.occurredAt);
    if (isNaN(occurred.getTime())) {
      setError('La fecha y hora de ocurrencia no es válida.');
      setLoading(false);
      return;
    }

    if (isNaN(mag) || mag < -2.0 || mag > 10.0) {
      setError('La magnitud M debe estar entre -2.0 y 10.0.');
      setLoading(false);
      return;
    }

    if (isNaN(depth) || depth < 0.0 || depth > 700.0) {
      setError('La profundidad H debe estar entre 0.0 y 700.0 km.');
      setLoading(false);
      return;
    }

    if (isNaN(lat) || lat < -90.0 || lat > 90.0) {
      setError('La latitud debe estar entre -90.0° y 90.0°.');
      setLoading(false);
      return;
    }

    if (isNaN(lon) || lon < -180.0 || lon > 180.0) {
      setError('La longitud debe estar entre -180.0° y 180.0°.');
      setLoading(false);
      return;
    }

    try {
      const payload: CreateSeismicEventInput = {
        id,
        magnitude: mag,
        depth: depth,
        epicenter_x: lon,
        epicenter_y: lat,
        // UTC with second precision, e.g. 2026-09-07T10:00:00Z
        timestamp: occurred.toISOString().replace(/\.\d{3}Z$/, 'Z'),
        initial_station_id: station ? station : null, // Envía null si no hay estación
        revision: 1,
        reporting_stations: station ? [station] : [],
        status: StatusSismo.PENDIENTE,
      };

      const createdEvent = await sismosService.create(payload);
      onEventCreated(createdEvent);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el evento sísmico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-white border-amber-200/80 text-zinc-800'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-amber-100 bg-amber-50/50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide uppercase">REGISTRAR EVENTO SÍSMICO</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Coordenadas geográficas y parámetros del epicentro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
              {error}
            </div>
          )}

          {/* Identificador y fecha/hora de ocurrencia (sección 3 y 6) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-orange-500" /> Identificador (1 a 999999)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="999999"
                name="id"
                placeholder="Ej: 10 → SIS-000010"
                required
                value={formData.id}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> Fecha y hora de ocurrencia
              </label>
              <input
                type="datetime-local"
                step="1"
                name="occurredAt"
                required
                value={formData.occurredAt}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              />
            </div>
          </div>

          {/* Magnitud M y Profundidad H */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-orange-500" /> Magnitud M (-2.0 a 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="-2.0"
                max="10.0"
                name="magnitude"
                required
                value={formData.magnitude}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-orange-500" /> Profundidad (0 a 700 km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="700.0"
                name="depth"
                required
                value={formData.depth}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              />
            </div>
          </div>

          {/* Coordenadas Geográficas: Latitud y Longitud */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Latitud (-90° a 90°)
              </label>
              <input
                type="number"
                step="any"
                min="-90.0"
                max="90.0"
                name="latitude"
                placeholder="Ej: 4.5709"
                required
                value={formData.latitude}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Longitud (-180° a 180°)
              </label>
              <input
                type="number"
                step="any"
                min="-180.0"
                max="180.0"
                name="longitude"
                placeholder="Ej: -74.2973"
                required
                value={formData.longitude}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              />
            </div>
          </div>

          {/* Estación que origina el registro */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-orange-500" /> Estación emisora (id)
            </label>
            <input
              type="text"
              name="stationId"
              placeholder="Ej: 1"
              value={formData.stationId}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 shadow-md shadow-red-500/20 active:scale-95 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? 'Registrando...' : 'Registrar Sismo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};