import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const THEME_STORAGE_KEY = 'portfolio-theme';

const getInitialTheme = (): Theme => {
  if (globalThis.window === undefined) return 'light';

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark' || stored === 'matrix' || stored === 'demon-slayer') {
    return stored;
  }
  return 'light';
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultTheme }) => {
  const [theme, setThemeState] = useReducer(
    (_previous: Theme, next: Theme) => next,
    defaultTheme ?? getInitialTheme()
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'matrix-theme', 'demon-slayer-theme');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'matrix') {
      root.classList.add('matrix-theme');
    } else if (theme === 'demon-slayer') {
      root.classList.add('demon-slayer-theme');
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    }
  }, [theme, setTheme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
