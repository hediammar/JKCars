import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '@/locales/en.json';
import frTranslations from '@/locales/fr.json';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Safely load translations with fallback
let translations: Record<Language, any> = {
  en: {},
  fr: {},
};

try {
  if (enTranslations && typeof enTranslations === 'object') {
    translations.en = enTranslations;
  }
  if (frTranslations && typeof frTranslations === 'object') {
    translations.fr = frTranslations;
  }
} catch (error) {
  console.error('Failed to load translations:', error);
  // Keep default empty objects
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      // Get language from localStorage or default to English
      const saved = localStorage.getItem('language') as Language;
      return saved && (saved === 'en' || saved === 'fr') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    try {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
      // Update HTML lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    } catch (error) {
      console.error('Error setting document language:', error);
    }
  }, [language]);

  const t = (key: string): string => {
    try {
      if (!translations || !translations[language]) {
        console.warn(`Translations not loaded for language "${language}"`);
        return key;
      }
      
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value === null || value === undefined) {
          console.warn(`Translation key "${key}" not found for language "${language}"`);
          return key;
        }
        value = value[k];
      }
      
      if (value === undefined || value === null) {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        return key;
      }
      
      return String(value) || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  // Always provide a valid context value
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

