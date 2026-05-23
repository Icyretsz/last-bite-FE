import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import i18n from '@/services/i18n';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = storage.getLanguage();
    if (savedLanguage) {
      setLanguageState(savedLanguage as Language);
      i18n.changeLanguage(savedLanguage);
    } else {
      // Set default to Vietnamese
      i18n.changeLanguage('vi');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    storage.setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
