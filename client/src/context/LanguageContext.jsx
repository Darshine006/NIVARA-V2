import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, availableLanguages } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('nivara_language') || 'en';
  });

  const setLanguage = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('nivara_language', newLang);
  };

  const t = (key, params) => {
    return getTranslation(lang, key, params);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
