import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { MetricBar } from '../../components/observatorio/MetricBar';
import { EventQueue } from '../../components/observatorio/EventQueue';
import { EventAnalyzer } from '../../components/observatorio/EventAnalyzer';

export const ObservatorioPage = () => {
  const [theme, setTheme] = useState('dark');
  const isDark = theme === 'dark';

  const [pendingEvents, setPendingEvents] = useState([
    {
      id: 'EVT-2026-089',
      magnitude: 5.4,
      depthKm: 148,
      location: 'Mesa de Los Santos, Santander',
      timestamp: '11:30:12 AM',
      detectedBy: ['EST-04 (Bucaramanga)', 'EST-01 (Bogotá)', 'EST-05 (Cúcuta)'],
      urgency: 'high'
    },
    {
      id: 'EVT-2026-088',
      magnitude: 3.2,
      depthKm: 12,
      location: 'Dabeiba, Antioquia',
      timestamp: '11:12:05 AM',
      detectedBy: ['EST-02 (Medellín)'],
      urgency: 'medium'
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState(pendingEvents[0]);

  const handleApprove = (id) => {
    const updated = pendingEvents.filter(e => e.id !== id);
    setPendingEvents(updated);
    setSelectedEvent(updated[0] || null);
    alert(`Evento ${id} validado y emitido a la red de alertas.`);
  };

  const handleReject = (id) => {
    const updated = pendingEvents.filter(e => e.id !== id);
    setPendingEvents(updated);
    setSelectedEvent(updated[0] || null);
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-500 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-amber-50/20 text-zinc-900'
    }`}>
      <Navbar theme={theme} onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />

      <MetricBar 
        isDark={isDark} 
        networkStatus="OPERATIVA (98%)" 
        todayEventsCount={14} 
        pendingCount={pendingEvents.length} 
      />

      <div className="flex flex-1 relative overflow-hidden">
        <EventQueue 
          events={pendingEvents} 
          selectedEvent={selectedEvent} 
          isDark={isDark} 
          onSelectEvent={setSelectedEvent} 
        />

        <EventAnalyzer 
          event={selectedEvent} 
          isDark={isDark} 
          onApprove={handleApprove} 
          onReject={handleReject} 
        />
      </div>
    </div>
  );
};