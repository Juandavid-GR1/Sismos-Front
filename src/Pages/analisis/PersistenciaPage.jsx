import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ExportarEscenario } from '../../components/persistencia/ExportarEscenario';
import { CargarEscenario } from '../../components/persistencia/CargarEscenario';
import { Versiones } from '../../components/persistencia/Versiones';

export const PersistenciaPage = () => {
  const { isDark } = useOutletContext();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <div className="lg:col-span-2">
        <CargarEscenario isDark={isDark} />
      </div>
      <ExportarEscenario isDark={isDark} />
      <Versiones isDark={isDark} />
    </div>
  );
};
