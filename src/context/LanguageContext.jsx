import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LANG_STORAGE_KEY = 'cubedex_lang_v1';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'zh') return saved;
      const navLang = typeof navigator !== 'undefined' ? (navigator.language || '') : '';
      return navLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    } catch {
      return 'zh';
    }
  });

  const toggleLang = () => {
    setLang(prev => (prev === 'zh' ? 'en' : 'zh'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      if (lang === 'en') {
        document.title = 'CubeDex — Speedcubing Algorithm Reference (CFOP · ZBLL 472 · Roux CMLL 42)';
      } else {
        document.title = 'CubeDex — 三阶速拧全谱速查 (CFOP · ZBLL 472 · Roux CMLL 42)';
      }
    }
  }, [lang]);

  const t = (key, params = {}) => {
    const dict = translations[lang] || translations.zh;
    let text = dict[key] !== undefined ? dict[key] : (translations.zh[key] || key);
    if (typeof text === 'string' && params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      lang: 'zh',
      setLang: () => {},
      toggleLang: () => {},
      t: (key) => translations.zh[key] || key
    };
  }
  return context;
}
