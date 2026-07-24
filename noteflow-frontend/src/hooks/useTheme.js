import { useEffect, useState } from 'react';

const STORAGE_KEY = 'noteflow_theme';

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  // Light is the product's default theme (matches the reference design),
  // not the OS preference - a person can still switch to dark and it'll
  // persist via localStorage above.
  return 'light';
}

// Single source of truth for the dark/light toggle - persisted so a reload
// doesn't flash back to the wrong theme.
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
