import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Activity,
  MapPin,
  Layers,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Lock
} from 'lucide-react';
import { sismosService } from '../../services/SismosServices';

// Helper: format a date for <input type="datetime-local" step="1">
// (YYYY-MM-DDTHH:mm:ss). Seconds are kept: the model has second precision
// and dropping them would turn every correction into a time change.
const formatDateForInput = (rawDate) => {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 19);
  } catch (e) {
    console.error('Error al formatear fecha:', e);
    return '';
  }
};

// Helper: Extraer ID numérico válido
const parseSismoId = (sismo) => {
  let sismoId = sismo?.numericId ?? sismo?.id;
  if (typeof sismoId === 'string') {
    const match = sismoId.match(/\d+/);
    if (match) sismoId = Number(match[0]);
  }
  return Number(sismoId);
};

export const EditSismoModal = ({
  isOpen,
  onClose,
  onSave,
  sismo,
  isDark = true
}) => {
  const [formData, setFormData] = useState({
    id: '',
    location: '',
    magnitude: '',
    depth: '',
    lat: '',
    lon: '',
    timestamp: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Report returned by the backend after a correction (section 6)
  const [resultado, setResultado] = useState(null);

  // Carga e inicialización de los datos del sismo
  useEffect(() => {
    if (sismo) {
      const rawDate = sismo.timestamp || sismo.date || sismo.created_at;
      
      setFormData({
        id: sismo.id ?? sismo.numericId ?? sismo.formatted_id ?? '',
        location: sismo.location ?? sismo.epicenter ?? sismo.name ?? '',
        magnitude: sismo.magnitude ?? '',
        depth: sismo.depth ?? '',
        lat: sismo.lat ?? sismo.latitude ?? sismo.epicenter_y ?? sismo.y ?? '',
        lon: sismo.lon ?? sismo.longitude ?? sismo.epicenter_x ?? sismo.x ?? '',
        timestamp: formatDateForInput(rawDate)
      });
      setError(null);
      setResultado(null);
    }
  }, [sismo, isOpen]);

  if (!isOpen || !sismo) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const magnitude = Number(formData.magnitude);
    const depth = Number(formData.depth);
    const latitude = Number(formData.lat);
    const longitude = Number(formData.lon);

    // Validaciones
    if (formData.magnitude === '' || isNaN(magnitude)) {
      setError('Ingrese una magnitud válida.');
      return;
    }

    if (formData.depth === '' || isNaN(depth)) {
      setError('Ingrese una profundidad válida.');
      return;
    }

    if (formData.lat === '' || isNaN(latitude) || latitude < -90 || latitude > 90) {
      setError('La latitud debe estar entre -90 y 90 grados.');
      return;
    }

    if (formData.lon === '' || isNaN(longitude) || longitude < -180 || longitude > 180) {
      setError('La longitud debe estar entre -180 y 180 grados.');
      return;
    }

    const sismoId = parseSismoId(sismo);
    if (!Number.isInteger(sismoId) || sismoId <= 0) {
      setError('No se pudo determinar el ID numérico del sismo.');
      return;
    }

    // The id is NOT sent: it is immutable. If the date is left empty the
    // current one is kept (the backend accepts partial corrections).
    const payload = {
      magnitude,
      depth,
      epicenter_x: longitude,
      epicenter_y: latitude,
      ...(formData.timestamp
        ? { timestamp: new Date(formData.timestamp).toISOString().replace(/\.\d{3}Z$/, 'Z') }
        : {})
    };

    try {
      setLoading(true);
      const response = await sismosService.update(sismoId, payload);

      // Refresh list / map right away; the modal stays open to explain
      // what the correction did (revision, key, tree action).
      if (onSave) {
        await onSave(response?.sismo ?? response);
      }
      setResultado(response?.correccion ?? null);
      if (!response?.correccion) onClose();
    } catch (err) {
      console.error('Error actualizando sismo:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el sismo');
    } finally {
      setLoading(false);
    }
  };

  // Clases dinámicas reutilizables según tema
  const labelClass = `block text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`;
  const inputClass = `w-full py-2 text-xs rounded-xl border outline-none transition-all ${
    isDark
      ? 'bg-zinc-800/60 border-zinc-700/80 focus:border-orange-500 text-white placeholder-zinc-500'
      : 'bg-zinc-50 border-zinc-200 focus:border-orange-500 text-zinc-900 placeholder-zinc-400'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl transition-all overflow-hidden ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-orange-950/20'
            : 'bg-white border-amber-100 text-zinc-800 shadow-xl'
        }`}
      >
        {/* Encabezado */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-zinc-100 bg-amber-50/50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Editar Evento Sísmico</h2>
              <p className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Lock className="w-3 h-3" /> ID: #{formData.id || 'N/A'} (inmutable)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resultado ? (
          <ResultadoCorreccion resultado={resultado} isDark={isDark} onClose={onClose} />
        ) : (
        /* Formulario */
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ubicación / Epicentro */}
          <div className="space-y-1">
            <label htmlFor="edit-sismo-location" className={labelClass}>
              Ubicación / Epicentro
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                id="edit-sismo-location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej. Mesa de Los Santos, Santander"
                className={`${inputClass} pl-9 pr-3`}
              />
            </div>
          </div>

          {/* Magnitud y Profundidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="edit-sismo-magnitude" className={labelClass}>
                Magnitud (M)
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="number"
                  step="0.1"
                  min="-2"
                  max="10"
                  id="edit-sismo-magnitude"
                  name="magnitude"
                  value={formData.magnitude}
                  onChange={handleChange}
                  placeholder="Ej. 4.5"
                  className={`${inputClass} pl-9 pr-3`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-sismo-depth" className={labelClass}>
                Profundidad (km)
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="700"
                  id="edit-sismo-depth"
                  name="depth"
                  value={formData.depth}
                  onChange={handleChange}
                  placeholder="Ej. 150"
                  className={`${inputClass} pl-9 pr-3`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Latitud y Longitud */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="edit-sismo-lat" className={labelClass}>
                Latitud
              </label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                id="edit-sismo-lat"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="Ej. 6.82"
                className={`${inputClass} px-3`}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-sismo-lon" className={labelClass}>
                Longitud
              </label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                id="edit-sismo-lon"
                name="lon"
                value={formData.lon}
                onChange={handleChange}
                placeholder="Ej. -73.12"
                className={`${inputClass} px-3`}
                required
              />
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-1">
            <label htmlFor="edit-sismo-timestamp" className={labelClass}>
              Fecha y Hora del Evento
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="datetime-local"
                step="1"
                id="edit-sismo-timestamp"
                name="timestamp"
                value={formData.timestamp}
                onChange={handleChange}
                className={`${inputClass} pl-9 pr-3 ${isDark ? '[color-scheme:dark]' : ''}`}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div
            className={`pt-4 border-t flex justify-end space-x-2 ${
              isDark ? 'border-zinc-800' : 'border-zinc-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center space-x-1.5 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Correction report (section 6: "the interface must communicate which
// operation happened and why it produced that result")
// ============================================================
const formatoClave = (clave) => (clave ? `(${clave.join(', ')})` : '—');

const NOMBRES_CAMPO = {
  magnitude: 'magnitud',
  depth: 'profundidad',
  epicenter_x: 'longitud',
  epicenter_y: 'latitud',
  timestamp: 'fecha/hora'
};

const ResultadoCorreccion = ({ resultado, isDark, onClose }) => {
  const arbol = resultado.arbol;
  const giros = arbol ? arbol.rotaciones.giros.izquierda + arbol.rotaciones.giros.derecha : 0;
  const casos = arbol
    ? Object.entries(arbol.rotaciones.casos).filter(([, n]) => n > 0).map(([c, n]) => `${c}×${n}`)
    : [];
  const fila = `flex justify-between gap-3 py-1.5 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`;
  const etiqueta = isDark ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div className="p-6 space-y-4 text-xs">
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{resultado.explicacion}</span>
      </div>

      <div>
        <div className={fila}>
          <span className={etiqueta}>Revisión</span>
          <span className="font-bold">{resultado.revision_anterior} → {resultado.revision_nueva}</span>
        </div>
        <div className={fila}>
          <span className={etiqueta}>Datos modificados</span>
          <span className="font-bold text-right">
            {resultado.campos_modificados.length
              ? resultado.campos_modificados.map((c) => NOMBRES_CAMPO[c] ?? c).join(', ')
              : 'ninguno (igual se genera nueva revisión)'}
          </span>
        </div>
        <div className={fila}>
          <span className={etiqueta}>Zona poblada</span>
          <span className="font-bold">{resultado.zona_poblada == null ? '—' : resultado.zona_poblada ? 'Sí' : 'No'}</span>
        </div>
        <div className={fila}>
          <span className={etiqueta}>Prioridad</span>
          <span className="font-bold">{resultado.prioridad_anterior} → {resultado.prioridad_nueva}</span>
        </div>
        <div className={fila}>
          <span className={etiqueta}>Clave K = (P, M, I)</span>
          <span className="font-mono font-bold">
            {formatoClave(resultado.clave_anterior)} → {formatoClave(resultado.clave_nueva)}
          </span>
        </div>
        <div className={fila}>
          <span className={etiqueta}>Estado</span>
          <span className="font-bold">{resultado.estado_anterior} → {resultado.estado_nuevo}</span>
        </div>
      </div>

      {arbol && (
        <div className={`p-3 rounded-xl border space-y-1.5 ${isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-zinc-200 bg-zinc-50'}`}>
          <div className="flex items-center gap-1.5 font-bold text-orange-500">
            <GitBranch className="w-3.5 h-3.5" />
            {arbol.accion_arbol === 'reinsercion'
              ? 'Retirado con la clave anterior y reinsertado con la nueva'
              : 'Sin eliminar ni reinsertar (misma clave)'}
            {arbol.modo_estres && <span className="ml-1 text-amber-500">· modo estrés</span>}
          </div>
          <div className={etiqueta}>
            Profundidad del nodo: {arbol.profundidad_antes} → {arbol.profundidad_despues} ·
            Rotaciones: {giros === 0 ? 'ninguna' : `${casos.join(', ')} (${giros} giro${giros === 1 ? '' : 's'})`}
          </div>
          <div className={etiqueta}>
            Orden verificado con sus vecinos en inorden:{' '}
            {arbol.verificacion_orden.predecesor ? `${formatoClave(arbol.verificacion_orden.predecesor)} < ` : '(es el menor) '}
            <b>{formatoClave(arbol.verificacion_orden.clave)}</b>
            {arbol.verificacion_orden.sucesor ? ` < ${formatoClave(arbol.verificacion_orden.sucesor)}` : ' (es el mayor)'}{' '}
            {arbol.verificacion_orden.valido ? '✓' : '✗'}
          </div>
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
