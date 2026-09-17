import React, { useState, useEffect } from 'react';
import { X, Radio, MapPin, Compass, Shield, Building } from 'lucide-react';
import { estacionesService } from '../../services/StationsServices';

export const CreateStationModal = ({
  isOpen,
  theme,
  onClose,
  onStationCreated,
}) => {
  const isDark = theme === 'dark';

  // Usamos strings en lat y lon para permitir borrar, copiar y pegar libremente
  const initialFormState = {
    name: '',
    lat: '4.5709',
    lon: '-74.2973',
    status: 'activa',
    dept: 'Caldas',
    coverage: 60,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reiniciar el formulario cada vez que se abra o cierre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'range' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar y convertir lat y lon a número flotante
    const latNum = Number(formData.lat);
    const lonNum = Number(formData.lon);

    if (isNaN(latNum) || formData.lat.trim() === '') {
      setError('La latitud ingresada no es válida.');
      setLoading(false);
      return;
    }

    if (isNaN(lonNum) || formData.lon.trim() === '') {
      setError('La longitud ingresada no es válida.');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      lat: latNum, // Permite 0 sin problemas
      lon: lonNum, // Permite 0 sin problemas
      coverage: Number(formData.coverage),
    };

    try {
      const createdStation = await estacionesService.create(payload);
      onStationCreated(createdStation);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la estación');
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
        {/* Cabecera del Modal */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-amber-100 bg-amber-50/50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Radio className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide">NUEVA ESTACIÓN SÍSMICA</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Ingresa las coordenadas y metadatos operativos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* Nombre de la estación */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Nombre de la Estación
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ej: Estación Volcán Nevado"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                isDark
                  ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-orange-500'
                  : 'bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-orange-400'
              }`}
            />
          </div>

          {/* Departamento y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Departamento
              </label>
              <input
                type="text"
                name="dept"
                required
                placeholder="Ej: Caldas"
                value={formData.dept}
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
                <Shield className="w-3.5 h-3.5" /> Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Coordenadas (Latitud & Longitud) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Latitud
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="lat"
                required
                placeholder="0.00"
                value={formData.lat}
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
                <Compass className="w-3.5 h-3.5" /> Longitud
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="lon"
                required
                placeholder="0.00"
                value={formData.lon}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:border-orange-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:border-orange-400'
                }`}
              />
            </div>
          </div>

          {/* Cobertura en Km */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Cobertura de Radio (km): <span className="text-orange-500 font-bold">{formData.coverage} km</span>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              name="coverage"
              value={formData.coverage}
              onChange={handleChange}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Pie con acciones */}
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? 'Guardando...' : 'Registrar Estación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};