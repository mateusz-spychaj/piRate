import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { getLanguage, setLanguage, getAvailableLanguages, type Language } from '../../i18n';

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLang(getLanguage());
  }, []);

  const languages = getAvailableLanguages();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={16} />
        <span className="uppercase font-medium">{currentLang}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-border shadow-lg z-50 animate-fade-in" role="listbox">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition-colors first:rounded-t-xl last:rounded-b-xl ${
                currentLang === lang.code ? 'text-primary font-semibold' : 'text-text-primary'
              }`}
              role="option"
              aria-selected={currentLang === lang.code}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
