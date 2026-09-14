import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './Pages/welcome/WelcomePage';
import { EstacionesPage } from './Pages/stations/StationsPage';
import { ObservatorioPage } from './Pages/observatorio/ObservatorioPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        
      
        {/* Ruta principal de gestión de estaciones */}
        <Route path="/estaciones" 
        element={<EstacionesPage />} 
         />

        <Route 
          path="/observatorio" 
          element={<ObservatorioPage />} 
        />
      </Routes>
    </BrowserRouter>
  );
}