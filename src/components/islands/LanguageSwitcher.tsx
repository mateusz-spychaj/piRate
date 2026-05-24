import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { getLanguage, setLanguage, type Language } from '../../i18n';

function getLangs(): { code: Language; label: string }[] {
  return [
    { code: 'pl', label: 'Polski' },
    { code: 'en', label: 'English' },
  ];
}

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('pl');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrentLang(getLanguage());
  }, []);

  const langs = getLangs();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface cursor-pointer"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe size={16} />
        <span className="uppercase font-semibold">{currentLang}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl border border-border shadow-lg z-50 overflow-hidden">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setCurrentLang(l.code);
                setOpen(false);
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
  );
}
