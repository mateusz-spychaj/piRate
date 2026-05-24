import pl from './translations/pl.json';
import en from './translations/en.json';

export type Language = 'pl' | 'en';

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = { pl, en };

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('pirate-lang') as Language | null;
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('pl') ? 'pl' : 'en';
}

export function setLanguage(lang: Language): void {
  localStorage.setItem('pirate-lang', lang);
}

export function t(key: string, lang?: Language): string {
  const l = lang ?? getLanguage();
  const dict = translations[l] || translations.en;
  return dict[key] ?? key;
}

export function getAvailableLanguages(): { code: Language; label: string }[] {
  return [
    { code: 'pl', label: t('language.pl', 'pl') },
    { code: 'en', label: t('language.en', 'en') },
  ];
}
