import { useState, useEffect, useRef } from 'react';

export const useSimulationClock = (speed = 1) => {
  const [time, setTime] = useState(new Date());
  const [isRunning, setIsRunning] = useState(true);
  const requestRef = useRef();
  const lastTimeRef = useRef();

  useEffect(() => {
    const animate = (now) => {
      if (lastTimeRef.current && isRunning) {
        const delta = now - lastTimeRef.current;
        // Avanza el tiempo según la velocidad seleccionada (1x real, 10x, etc.)
        setTime((prev) => new Date(prev.getTime() + delta * speed));
      }
      lastTimeRef.current = now;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, speed]);

  return { time, isRunning, setIsRunning };
};