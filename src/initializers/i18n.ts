import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import moment from "moment";
import "moment/locale/ar";
import "moment/locale/ca";
import "moment/locale/cs";
import "moment/locale/da";
import "moment/locale/de";
import "moment/locale/el";
import "moment/locale/eo";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/hi";
import "moment/locale/hr";
import "moment/locale/id";
import "moment/locale/it";
import "moment/locale/ja";
import "moment/locale/ko";
import "moment/locale/nl";
import "moment/locale/pl";
import "moment/locale/pt";
import "moment/locale/ru";
import "moment/locale/sk";
import "moment/locale/sr";
import "moment/locale/sv";
import "moment/locale/tr";
import "moment/locale/uk";
import "moment/locale/vi";
import "moment/locale/zh-cn";
import "moment/locale/zh-tw";

export function setUpI18n() {
    return i18n
        // load translation using http -> see /public/locales
        // learn more: https://github.com/i18next/i18next-http-backend
        .use(Backend)
        // detect user language
        // learn more: https://github.com/i18next/i18next-browser-languageDetector
        .use(LanguageDetector)
        // pass the i18n instance to react-i18next.
        .use(initReactI18next)
        // init i18next
        // for all options read: https://www.i18next.com/overview/configuration-options
        .init({
            fallbackLng: 'en',
            debug: true,
            backend: {
                loadPath: '/locales/{{lng}}.json',
            },

            interpolation: {
                escapeValue: false, // not needed for react as it escapes by default
            },
        }).then(() => {
            moment.locale(i18n.language);
        })
}


