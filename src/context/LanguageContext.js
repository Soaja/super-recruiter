import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Translations } from '../constants/Translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en'); // default to English
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelectedLanguage();
  }, []);

  const loadSelectedLanguage = async () => {
    try {
      const storedLang = await AsyncStorage.getItem('@selected_language');
      const validLangs = ['en', 'sr', 'ne', 'sw', 'uz', 'ru', 'hi', 'id', 'ar', 'de', 'hr', 'sq', 'si', 'tl', 'bn', 'ur', 'vi', 'th', 'ro', 'pl', 'tr'];
      if (storedLang && validLangs.includes(storedLang)) {
        setLocale(storedLang);
      }
    } catch (e) {
      console.log('Error loading language:', e);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (newLang) => {
    const validLangs = ['en', 'sr', 'ne', 'sw', 'uz', 'ru', 'hi', 'id', 'ar', 'de', 'hr', 'sq', 'si', 'tl', 'bn', 'ur', 'vi', 'th', 'ro', 'pl', 'tr'];
    if (validLangs.includes(newLang)) {
      try {
        setLocale(newLang);
        await AsyncStorage.setItem('@selected_language', newLang);
      } catch (e) {
        console.log('Error saving language:', e);
      }
    }
  };

  // Translation helper function
  const t = (key) => {
    const translationSet = Translations[locale] || Translations['en'];
    return translationSet[key] || Translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t, loading }}>
      {!loading && children}
    </LanguageContext.Provider>
  );
};
