import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/* ── Preference Types ── */
export interface Preferences {
  darkMode: boolean;
  compactSidebar: boolean;
  emailBookingConfirm: boolean;
  emailStatusUpdates: boolean;
  emailPromotions: boolean;
  autoRefreshInterval: number;          // seconds, 0 = off
  language: 'en' | 'ta' | 'hi';
}

const defaults: Preferences = {
  darkMode: false,
  compactSidebar: false,
  emailBookingConfirm: true,
  emailStatusUpdates: true,
  emailPromotions: false,
  autoRefreshInterval: 30,
  language: 'en',
};

interface ThemeCtx {
  prefs: Preferences;
  update: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  reset: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  prefs: defaults,
  update: () => {},
  reset: () => {},
});

const STORAGE_KEY = 'garage_prefs';

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...defaults };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);

  // Apply dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [prefs.darkMode]);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  const reset = () => setPrefs({ ...defaults });

  return (
    <ThemeContext.Provider value={{ prefs, update, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
