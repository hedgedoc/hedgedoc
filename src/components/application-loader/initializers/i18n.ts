import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import moment from 'moment'
import 'moment/locale/ar'
import 'moment/locale/ca'
import 'moment/locale/cs'
import 'moment/locale/da'
import 'moment/locale/de'
import 'moment/locale/el'
import 'moment/locale/eo'
import 'moment/locale/es'
import 'moment/locale/fr'
import 'moment/locale/hi'
import 'moment/locale/hr'
import 'moment/locale/id'
import 'moment/locale/it'
import 'moment/locale/ja'
import 'moment/locale/ko'
import 'moment/locale/nl'
import 'moment/locale/pl'
import 'moment/locale/pt'
import 'moment/locale/ru'
import 'moment/locale/sk'
import 'moment/locale/sr'
import 'moment/locale/sv'
import 'moment/locale/tr'
import 'moment/locale/uk'
import 'moment/locale/vi'
import 'moment/locale/zh-cn'
import 'moment/locale/zh-tw'
import { initReactI18next } from 'react-i18next'

export const setUpI18n = async (): Promise<void> => {
  await i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: true,
      backend: {
        loadPath: '/locales/{{lng}}.json'
      },

      interpolation: {
        escapeValue: false // not needed for react as it escapes by default
      }
    })

  moment.locale(i18n.language)
}
