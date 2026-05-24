import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('pirate-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // storage unavailable
  }
  return 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const t = getStoredTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem('pirate-theme', next);
    } catch {
      // storage unavailable
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface cursor-pointer"
      aria-label={theme === 'light' ? 'Włącz tryb ciemny' : 'Włącz tryb jasny'}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
