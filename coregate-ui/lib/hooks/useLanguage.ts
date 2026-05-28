'use client';

import { useState, useEffect } from 'react';
import { Language, TranslationKey, getTranslation } from '@/lib/i18n/translations';

const STORAGE_KEY = 'coregate_language';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'en' || stored === 'vi')) {
        setLanguage(stored as Language);
      } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'vi') {
          setLanguage('vi');
        } else {
          setLanguage('en');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  return {
    language,
    setLanguage: changeLanguage,
    t,
    loading,
  };
}
