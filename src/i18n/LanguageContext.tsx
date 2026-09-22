import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number | null | undefined, includeSuffix?: boolean) => string;
  formatMonth: (monthStr: string) => string;
  formatDate: (dateStr: string) => string;
  strings: Translations;
}

const STORAGE_KEY = 'moliya_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'uz' || saved === 'ru' || saved === 'en')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'uz';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const currentStrings = translations[language] || translations.uz;

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const val = currentStrings[key];
    if (typeof val !== 'string') {
      return (translations.uz[key] as string) || String(key);
    }
    if (!params) return val;
    let res = val;
    Object.keys(params).forEach((paramKey) => {
      res = res.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
    });
    return res;
  };

  const formatCurrency = (amount: number | null | undefined, includeSuffix = true): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `0${includeSuffix ? (language === 'en' ? ' UZS' : language === 'ru' ? ' сум' : " so'm") : ''}`;
    }
    const rounded = Math.round(amount);
    const isNegative = rounded < 0;
    const absVal = Math.abs(rounded);
    const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const prefix = isNegative ? '-' : '';
    let suffix = '';
    if (includeSuffix) {
      if (language === 'en') suffix = ' UZS';
      else if (language === 'ru') suffix = ' сум';
      else suffix = " so'm";
    }
    return `${prefix}${formatted}${suffix}`;
  };

  const formatMonth = (monthStr: string): string => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const idx = parseInt(month, 10) - 1;
    const monthName = currentStrings.months[idx] || month;
    return `${monthName} ${year}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const monthName = currentStrings.months[monthIdx] || parts[1];
    if (language === 'en') {
      return `${monthName} ${parseInt(day, 10)}, ${year}`;
    }
    return `${parseInt(day, 10)}-${monthName.toLowerCase()}, ${year}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatMonth,
        formatDate,
        strings: currentStrings,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
