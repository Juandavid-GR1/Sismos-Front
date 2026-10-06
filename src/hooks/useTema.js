import { useCallback, useState } from 'react';

const CLAVE = 'sismolab:tema';

const leer = () => {
  try {
    return localStorage.getItem(CLAVE) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

/**
 * Light / dark theme remembered between pages (before, every page started
 * in dark mode again). Returns { theme, isDark, alternarTema }.
 */
export const useTema = () => {
  const [theme, setTheme] = useState(leer);

  const alternarTema = useCallback(() => {
    setTheme((actual) => {
      const nuevo = actual === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(CLAVE, nuevo);
      } catch {
        // private mode: the theme is simply not remembered
      }
      return nuevo;
    });
  }, []);

  return { theme, isDark: theme === 'dark', alternarTema };
};
