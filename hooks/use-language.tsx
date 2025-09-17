import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locales } from '@/constants/locales';

type Language = 'en' | 'zh';

// Get the structure of the English locales, assuming both languages have the same structure
type LocaleStructure = typeof locales.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <T extends keyof LocaleStructure, K extends keyof LocaleStructure[T]>(scope: T, key: K) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Failed to load language from storage', error);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language to storage', error);
    }
  };

  const t: LanguageContextType['t'] = (scope, key) => {
    // We can safely assume that if a key exists in one locale, it exists in the other.
    const translation = locales[language][scope][key];
    return String(translation || key); // Ensure the output is always a string
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
