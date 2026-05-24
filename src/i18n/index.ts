import pl from './translations/pl.json';
import en from './translations/en.json';

export type Language = 'pl' | 'en';

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = { pl, en };

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('pirate-lang') as Language | null;
    if (stored && translations[stored]) return stored;
  } catch {
    // storage unavailable
  }
  try {
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('pl') ? 'pl' : 'en';
  } catch {
    return 'en';
  }
}

export function setLanguage(lang: Language): void {
  try {
    localStorage.setItem('pirate-lang', lang);
    document.cookie = `pirate-lang=${lang};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    // storage unavailable
  }
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
