import { useState, useEffect } from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { getLanguage, setLanguage, type Language } from '../../i18n';

export default function HeaderControls() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentLang, setCurrentLang] = useState<Language>('pl');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pirate-theme');
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
        document.documentElement.classList.toggle('dark', stored === 'dark');
      }
    } catch {}
    setCurrentLang(getLanguage());
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try { localStorage.setItem('pirate-theme', next); } catch {}
  };

  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <button
          onClick={toggleTheme}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface cursor-pointer"
          aria-label={theme === 'light' ? 'Włącz tryb ciemny' : 'Włącz tryb jasny'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface cursor-pointer"
          aria-label="Change language"
          aria-expanded={dropdownOpen}
        >
          <Globe size={16} />
          <span className="uppercase font-semibold">{currentLang}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl border border-border shadow-lg z-50 overflow-hidden">
            {[
              { code: 'pl' as const, label: 'Polski' },
              { code: 'en' as const, label: 'English' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  window.location.reload();
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition-colors cursor-pointer ${
                  currentLang === l.code ? 'text-primary font-semibold' : 'text-text-primary'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
