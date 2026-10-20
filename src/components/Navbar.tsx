import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES, type SupportedLanguage, getLocalizedPath } from '../i18n/utils';
import { 
  Sun, 
  Moon, 
  Heart, 
  Globe, 
  Check, 
  ChevronDown, 
  Laptop, 
  Smartphone 
} from 'lucide-react';

interface NavbarProps {
  currentLang: SupportedLanguage;
  currentPath: string;
  translations: {
    nav: {
      brandTitle: string;
      brandTagline: string;
      supportDeveloper: string;
      toggleTheme: string;
      selectLanguage: string;
    };
  };
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, currentPath, translations }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme from document or localStorage
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
      localStorage.getItem('theme') === 'dark';

    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur border-b border-gray-200 dark:border-[#334155] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <a 
          href={currentLang === 'en' ? '/' : `/${currentLang}/`}
          aria-label="ResponsiveViewer Home"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F709C] rounded-lg"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#213555] dark:bg-[#4F709C] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <div className="relative">
              <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <Smartphone className="w-2.5 h-2.5 text-[#E5D283] absolute -bottom-1 -right-1 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#213555] dark:text-white flex items-center gap-1.5">
              <span>Responsive</span>
              <span className="text-[#4F709C] dark:text-[#E5D283]">Viewer</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400 hidden lg:inline">
              {translations.nav.brandTagline}
            </span>
          </div>
        </a>

        {/* Right Action Controls: 7-Language Selector, Dark Mode Toggle, Support CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* 7-Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#0F172A] hover:bg-gray-200 dark:hover:bg-[#334155] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F709C]"
              aria-expanded={isLangMenuOpen}
              aria-label={translations.nav.selectLanguage}
              title={translations.nav.selectLanguage}
            >
              <Globe className="w-4 h-4 text-[#4F709C] dark:text-[#E5D283] shrink-0" />
              <span className="px-1 py-0.5 text-[10px] sm:text-xs font-mono font-bold bg-[#213555] text-white dark:bg-[#E5D283] dark:text-[#213555] rounded">
                {activeLangObj.badge}
              </span>
              <span className="hidden md:inline">{activeLangObj.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 py-1.5 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-gray-200 dark:border-[#334155] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  {translations.nav.selectLanguage}
                </div>
                {LANGUAGES.map((lang) => {
                  const isCurrent = lang.code === currentLang;
                  const targetHref = getLocalizedPath(lang.code, currentPath);

                  return (
                    <a
                      key={lang.code}
                      href={targetHref}
                      onClick={() => setIsLangMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-xs sm:text-sm transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-[#213555] dark:text-[#E5D283] font-bold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-gray-200 dark:bg-[#334155] text-gray-800 dark:text-gray-200">
                          {lang.badge}
                        </span>
                        <span>{lang.label}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#4F709C] dark:text-[#E5D283]" />}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Light / Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#0F172A] hover:bg-gray-200 dark:hover:bg-[#334155] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F709C]"
            aria-label={translations.nav.toggleTheme}
            title={translations.nav.toggleTheme}
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#E5D283] transition-transform rotate-0 scale-100" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#213555] transition-transform rotate-0 scale-100" />
            )}
          </button>

          {/* Support the Developer CTA Button (#E5D283 background with #213555 text) */}
          <a
            href="https://ko-fi.com/kishara"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support the developer on Ko-fi (opens in new window)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#E5D283] text-[#213555] hover:bg-[#d4c172] active:scale-95 rounded-lg shadow-sm border border-[#d6c478] transition-all focus:outline-none focus:ring-2 focus:ring-[#E5D283]"
            title={translations.nav.supportDeveloper}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#213555] stroke-[#213555]" />
            {/* Strictly collapse to icons only on mobile/tablet breakpoints */}
            <span className="hidden lg:inline whitespace-nowrap">
              {translations.nav.supportDeveloper}
            </span>
          </a>

        </div>
      </div>
    </header>
  );
};
