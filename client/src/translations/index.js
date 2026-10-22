import { en } from './en';
import { ta } from './ta';
import { hi } from './hi';

export const translations = {
  en,
  ta,
  hi,
};

export const availableLanguages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
];

export const getTranslation = (lang = 'en', key = '', params = {}) => {
  const currentDict = translations[lang] || translations.en;
  let text = currentDict[key] || translations.en[key] || key;

  // Replace {param} placeholders if any
  if (params && typeof params === 'object') {
    Object.keys(params).forEach((pKey) => {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), params[pKey]);
    });
  }

  return text;
};
