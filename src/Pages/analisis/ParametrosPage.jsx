import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { SimulationClock } from '../../components/clock/SimulationClock';
import { ConfigArbol } from '../../components/analisis/ConfigArbol';
import { ConfigAsociaciones } from '../../components/analisis/ConfigAsociaciones';

/** Scenario parameters: simulation clock, L, T, W and R. */
export const ParametrosPage = () => {
  const { isDark } = useOutletContext();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <Panel
        isDark={isDark}
        icono={Clock}
        titulo="Reloj del escenario"
        className="lg:col-span-2 overflow-visible"
      >
        <SimulationClock theme={isDark ? 'dark' : 'light'} flotante={false} />
      </Panel>
      <ConfigArbol isDark={isDark} />
      <ConfigAsociaciones isDark={isDark} />
    </div>
  );
};
