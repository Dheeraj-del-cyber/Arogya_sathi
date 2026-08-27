import React, { createContext, useContext, useState, useCallback } from 'react';
import { t as translate } from './strings.js';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('arogya_lang') || 'en');

  const changeLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem('arogya_lang', code);
  }, []);

  const t = useCallback((key) => translate(key, lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
