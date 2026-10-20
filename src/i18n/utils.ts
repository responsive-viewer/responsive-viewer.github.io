import en from './en.json';
import es from './es.json';
import pt from './pt.json';
import de from './de.json';
import fr from './fr.json';
import ja from './ja.json';
import zh from './zh.json';

export const LANGUAGES = [
  { code: 'en', badge: 'US', label: 'English' },
  { code: 'es', badge: 'ES', label: 'Español' },
  { code: 'pt', badge: 'BR', label: 'Português' },
  { code: 'de', badge: 'DE', label: 'Deutsch' },
  { code: 'fr', badge: 'FR', label: 'Français' },
  { code: 'ja', badge: 'JP', label: '日本語' },
  { code: 'zh', badge: 'CN', label: '简体中文' }
] as const;

export type SupportedLanguage = (typeof LANGUAGES)[number]['code'];

export const defaultLang: SupportedLanguage = 'en';

export const translations: Record<SupportedLanguage, typeof en> = {
  en,
  es,
  pt,
  de,
  fr,
  ja,
  zh
};

export function getLangFromUrl(url: URL): SupportedLanguage {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in translations) {
    return lang as SupportedLanguage;
  }
  return defaultLang;
}

export function useTranslations(lang: SupportedLanguage = defaultLang) {
  return translations[lang] || translations[defaultLang];
}

export function getLocalizedPath(targetLang: SupportedLanguage, currentPathname: string = '/'): string {
  // Strip existing lang prefix if present
  const segments = currentPathname.split('/').filter(Boolean);
  const first = segments[0];
  const isExistingLang = first && LANGUAGES.some(l => l.code === first);
  const remaining = isExistingLang ? segments.slice(1) : segments;
  const path = remaining.join('/');

  if (targetLang === defaultLang) {
    return path ? `/${path}/` : '/';
  }
  return path ? `/${targetLang}/${path}/` : `/${targetLang}/`;
}
