import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ConsultaPendientes } from '../../components/analisis/ConsultaPendientes';
import { ConsultaMagnitud } from '../../components/analisis/ConsultaMagnitud';
import { ConsultaProfundidadFecha } from '../../components/analisis/ConsultaProfundidadFecha';
import { ConsultaAccesoCostoso } from '../../components/analisis/ConsultaAccesoCostoso';

/** The queries over the active catalog. */
export const ConsultasPage = () => {
  const { isDark } = useOutletContext();
  return (
    <div className="space-y-5">
      <ConsultaPendientes isDark={isDark} />
      <ConsultaMagnitud isDark={isDark} />
      <ConsultaProfundidadFecha isDark={isDark} />
      <ConsultaAccesoCostoso isDark={isDark} />
    </div>
  );
};
