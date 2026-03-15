import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SettingsContext = createContext(null);

const DEFAULT_CURRENCIES = [
  { code: 'USD', symbol: '$',    name: 'US Dollar',     rate: 1,     isDefault: true  },
  { code: 'EUR', symbol: '€',    name: 'Euro',           rate: 0.92,  isDefault: false },
  { code: 'GBP', symbol: '£',    name: 'British Pound',  rate: 0.79,  isDefault: false },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',   rate: 83.5,  isDefault: false },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',     rate: 3.67,  isDefault: false },
];
const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English',   flag: '🇺🇸', dir: 'ltr', isDefault: true  },
  { code: 'fr', name: 'Français',  flag: '🇫🇷', dir: 'ltr', isDefault: false },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪', dir: 'ltr', isDefault: false },
  { code: 'ar', name: 'العربية',  flag: '🇸🇦', dir: 'rtl', isDefault: false },
  { code: 'es', name: 'Español',   flag: '🇪🇸', dir: 'ltr', isDefault: false },
];

const getSaved = (key, fallback) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings]   = useState({ siteName: 'ShopVerse', logo: null, freeShippingThreshold: 50, taxRate: 10 });
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [languages,  setLanguages]  = useState(DEFAULT_LANGUAGES);
  const [currency, setCurrencyState] = useState(() => getSaved('sv_currency', DEFAULT_CURRENCIES[0]));
  const [language, setLanguageState] = useState(() => getSaved('sv_language', DEFAULT_LANGUAGES[0]));

  useEffect(() => {
    api.get('/settings').then(r => {
      const data = r.data.data;
      setSettings(data);
      if (data.currencies?.length) setCurrencies(data.currencies);
      if (data.languages?.length)  setLanguages(data.languages);
      if (!localStorage.getItem('sv_currency')) {
        const def = data.currencies?.find(c => c.isDefault) || data.currencies?.[0];
        if (def) setCurrency(def);
      }
      if (!localStorage.getItem('sv_language')) {
        const def = data.languages?.find(l => l.isDefault) || data.languages?.[0];
        if (def) setLanguage(def);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dir  = language.dir  || 'ltr';
    document.documentElement.lang = language.code || 'en';
  }, [language]);

  const setCurrency = (c) => { setCurrencyState(c); localStorage.setItem('sv_currency', JSON.stringify(c)); };
  const setLanguage = (l) => { setLanguageState(l); localStorage.setItem('sv_language', JSON.stringify(l)); };

  const formatPrice = (usdPrice) => {
    if (usdPrice == null) return '';
    const val = Number(usdPrice) * (currency.rate || 1);
    try {
      return new Intl.NumberFormat(language.code === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency', currency: currency.code,
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(val);
    } catch {
      return `${currency.symbol}${val.toFixed(2)}`;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, currencies, languages, currency, language, setCurrency, setLanguage, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
