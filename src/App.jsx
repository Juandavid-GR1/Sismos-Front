import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './Pages/welcome/WelcomePage';
import { EstacionesPage } from './Pages/stations/StationsPage';
import { ObservatorioPage } from './Pages/observatorio/ObservatorioPage';
import { ArbolesPage } from './Pages/arboles/ArbolesPage';
import { ConsultarEventoPage } from './Pages/observatorio/ConsultarEventoPage';
import { AnalisisLayout } from './Pages/analisis/AnalisisLayout';
import { IndicadoresPage } from './Pages/analisis/IndicadoresPage';
import { ConsultasPage } from './Pages/analisis/ConsultasPage';
import { ArchivoPage } from './Pages/analisis/ArchivoPage';
import { AsociacionesPage } from './Pages/analisis/AsociacionesPage';
import { ParametrosPage } from './Pages/analisis/ParametrosPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        {/* Estaciones y mapa de eventos */}
        <Route path="/estaciones" element={<EstacionesPage />} />

        {/* Observatorio: cola de reportes, árbol AVL y consulta por id */}
        <Route path="/observatorio" element={<ObservatorioPage />} />
        <Route path="/observatorio/arboles" element={<ArbolesPage />} />
        <Route path="/observatorio/consultar" element={<ConsultarEventoPage />} />

        {/* Análisis: indicadores, consultas, archivo, asociaciones y parámetros */}
        <Route path="/analisis" element={<AnalisisLayout />}>
          <Route index element={<Navigate to="indicadores" replace />} />
          <Route path="indicadores" element={<IndicadoresPage />} />
          <Route path="consultas" element={<ConsultasPage />} />
          <Route path="archivo" element={<ArchivoPage />} />
          <Route path="asociaciones" element={<AsociacionesPage />} />
          <Route path="parametros" element={<ParametrosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
