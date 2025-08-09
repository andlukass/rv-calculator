import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Static resources bundled at build time
import enCommon from '@/locales/en/common.json';
import ptCommon from '@/locales/pt/common.json';

const resources = {
  en: { common: enCommon },
  pt: { common: ptCommon },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    // We'll control language from the route; default to Portuguese
    lng: 'pt',
    fallbackLng: 'pt',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
      document.title = i18n.t('app.pageTitle');
    }
  });

// Keep <html lang> in sync when language changes dynamically
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.title = i18n.t('app.pageTitle', { lng });
  }
});

export default i18n;
