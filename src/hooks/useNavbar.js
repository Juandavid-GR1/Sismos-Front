import { useLocation } from 'react-router-dom';

export const useNavbar = () => {
  const location = useLocation();
  const path = location.pathname;

  const isObservatorio = path.startsWith('/observatorio');
  const isEstaciones = path.startsWith('/estaciones') || path === '/';
  const isAnalisis = path.startsWith('/analisis');

  // Sub-secciones dentro del Observatorio
  const isArboles = path.includes('/arboles');
  const isConsultar = path.includes('/consultar');
  const isReportes = isObservatorio && !isArboles && !isConsultar;

  return {
    currentPath: path,
    isObservatorio,
    isEstaciones,
    isAnalisis,
    isReportes,
    isArboles,
    isConsultar
  };
};
