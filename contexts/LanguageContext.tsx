import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

export type Language = 'pt' | 'en' | 'es';

type Translations = Record<string, string>;

// Use a simple cache to avoid re-fetching
const translationsCache: Partial<Record<Language, Translations>> = {};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: (string | number)[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('galactic_annihilator_lang') as Language;
      return savedLang && ['pt', 'en', 'es'].includes(savedLang) ? savedLang : 'pt';
    } catch {
      return 'pt';
    }
  });

  const [translations, setTranslations] = useState<Translations | null>(translationsCache[language] || null);

  useEffect(() => {
    const fetchTranslations = async () => {
      // If translations are in cache, use them
      if (translationsCache[language]) {
        setTranslations(translationsCache[language]!);
        return;
      }

      // Fetch from network
      try {
        // Use an absolute path from the web root
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Translations = await response.json();
        translationsCache[language] = data; // Cache the fetched data
        setTranslations(data);
      } catch (error) {
        console.error(`Failed to load translation file for "${language}":`, error);
        setTranslations({}); // Set empty translations to avoid app crash
      }
    };

    fetchTranslations();
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('galactic_annihilator_lang', language);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  }, [language]);

  const t = useCallback((key: string, ...args: (string | number)[]) => {
    if (!translations) {
      return key; // Return key if translations are not loaded yet
    }
    let translation = translations[key] || key;
    if (args.length > 0) {
      args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, String(arg));
      });
    }
    return translation;
  }, [translations]);

  // Don't render the app until the initial translations are loaded to prevent flicker
  if (!translations) {
    return null; // Or a loading spinner component
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
