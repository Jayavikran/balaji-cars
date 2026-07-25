import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark'; // what's actually applied, after resolving 'system'
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

const STORAGE_KEY = 'BALAJI CARS_theme';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemPreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    mode === 'system' ? getSystemPreference() : mode
  );

  useEffect(() => {
    const theme = mode === 'system' ? getSystemPreference() : mode;
    setResolvedTheme(theme);
    applyThemeClass(theme);
  }, [mode]);

  // Live-update when the OS theme changes, but only while following "system".
  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      const theme = getSystemPreference();
      setResolvedTheme(theme);
      applyThemeClass(theme);
    };
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  const cycleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
  }, [mode, setMode]);

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
