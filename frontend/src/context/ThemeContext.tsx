import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light';
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

const STORAGE_KEY = 'BALAJI CARS_theme';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeClass() {
  const root = document.documentElement;
  root.classList.remove('dark');
  root.style.colorScheme = 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored === 'light' ? stored : 'light';
  });

  const [resolvedTheme] = useState<'light'>('light');

  useEffect(() => {
    applyThemeClass();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, 'light');
    setModeState('light');
  }, []);

  const cycleMode = useCallback(() => {
    setMode('light');
  }, [setMode]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode, cycleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
