const path = require('path');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'es'],
    supportedLngs: ['en', 'es'],
    backend: {
      loadPath: path.join(__dirname, '..', 'locales', '{{lng}}', 'translation.json')
    },
    detection: {
      order: ['header', 'querystring'],
      lookupHeader: 'x-language',
      lookupQuerystring: 'lang'
    },
    interpolation: {
      escapeValue: false
    }
  });

module.exports = { i18next, i18nMiddleware: middleware.handle(i18next) };
