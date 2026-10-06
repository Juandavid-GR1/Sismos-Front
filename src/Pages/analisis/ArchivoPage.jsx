import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { RamaElegible } from '../../components/analisis/RamaElegible';
import { ArchivoManual } from '../../components/analisis/ArchivoManual';
import { HistoricoEventos } from '../../components/analisis/HistoricoEventos';

/** Automatic and manual branch archive, plus the history. */
export const ArchivoPage = () => {
  const { isDark } = useOutletContext();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-5 items-start">
        <RamaElegible isDark={isDark} />
        <ArchivoManual isDark={isDark} />
      </div>
      <HistoricoEventos isDark={isDark} />
    </div>
  );
};
