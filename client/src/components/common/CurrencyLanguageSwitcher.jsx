import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function CurrencyLanguageSwitcher() {
  const { currencies, languages, currency, language, setCurrency, setLanguage } = useSettings();
  const [openCurrency, setOpenCurrency] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const currRef = useRef(); const langRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (currRef.current && !currRef.current.contains(e.target)) setOpenCurrency(false);
      if (langRef.current && !langRef.current.contains(e.target)) setOpenLanguage(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex items-center gap-1">
      {/* Currency Switcher */}
      <div ref={currRef} className="relative">
        <button
          onClick={() => { setOpenCurrency(!openCurrency); setOpenLanguage(false); }}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-sm">{currency.symbol}</span>
          <span>{currency.code}</span>
          <ChevronDown size={11} className={`transition-transform ${openCurrency ? 'rotate-180' : ''}`} />
        </button>
        {openCurrency && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1.5 animate-slide-down">
            <p className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Currency</p>
            {currencies.map(c => (
              <button key={c.code} onClick={() => { setCurrency(c); setOpenCurrency(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-gray-400 w-6 text-xs">{c.symbol}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-800 text-xs">{c.code}</p>
                    <p className="text-gray-400 text-[10px]">{c.name}</p>
                  </div>
                </div>
                {currency.code === c.code && <Check size={13} className="text-primary-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language Switcher */}
      <div ref={langRef} className="relative">
        <button
          onClick={() => { setOpenLanguage(!openLanguage); setOpenCurrency(false); }}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Globe size={13} />
          <span>{language.flag || language.code.toUpperCase()}</span>
          <span className="hidden sm:block">{language.code.toUpperCase()}</span>
          <ChevronDown size={11} className={`transition-transform ${openLanguage ? 'rotate-180' : ''}`} />
        </button>
        {openLanguage && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1.5 animate-slide-down">
            <p className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Language</p>
            {languages.map(l => (
              <button key={l.code} onClick={() => { setLanguage(l); setOpenLanguage(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  {l.flag && <span className="text-base">{l.flag}</span>}
                  <span className={`font-medium text-gray-800 text-sm ${l.dir === 'rtl' ? 'text-right' : ''}`}>{l.name}</span>
                </div>
                {language.code === l.code && <Check size={13} className="text-primary-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
